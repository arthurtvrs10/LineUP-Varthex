package com.backend.billing;

import com.backend.commercial.*;
import com.backend.barbers.BarberRepository;
import com.backend.tenants.Tenant;
import com.backend.users.*;
import jakarta.persistence.*;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.function.Function;
import static com.backend.billing.BillingService.*;

@Service
public class BillingChanges {
    private final BillingTermsRepository terms;
    private final BillingAccountRepository accounts;
    private final BillingChargeRepository charges;
    private final PlanRepository plans;
    private final BillingAddonRepository addons;
    private final BarberRepository barbers;
    private final UserRepository users;
    private final AsaasClient asaas;
    private final EntityManager em;
    private final TransactionTemplate tx;
    private final AuditEventRepository audit;
    public BillingChanges(BillingTermsRepository terms,BillingAccountRepository accounts,BillingChargeRepository charges,
            PlanRepository plans,BillingAddonRepository addons,BarberRepository barbers,UserRepository users,
            AsaasClient asaas,EntityManager em,PlatformTransactionManager tm,AuditEventRepository audit) {
        this.terms=terms;this.accounts=accounts;this.charges=charges;this.plans=plans;this.addons=addons;this.barbers=barbers;
        this.users=users;this.asaas=asaas;this.em=em;this.tx=new TransactionTemplate(tm);this.audit=audit;
    }
    public record Selection(UUID planId, UUID addonId, int addonQuantity, String method) {}
    public record Confirmation(UUID quoteId, BillingService.CardInput card) {
        @Override public String toString(){return "Confirmation[REDACTED]";}
    }
    private <T> T locked(UUID tenant,Function<BillingAccount,T> work) {
        return tx.execute(status->{
            if(em.find(Tenant.class,tenant,LockModeType.PESSIMISTIC_WRITE)==null) fail(HttpStatus.NOT_FOUND,"Barbearia não encontrada");
            var a=accounts.findByTenantId(tenant).orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"Contrate e pague uma assinatura antes de alterá-la"));
            em.lock(a,LockModeType.PESSIMISTIC_WRITE);
            if(!Objects.equals(a.environment,asaas.environment())) fail(HttpStatus.CONFLICT,"Ambiente de cobrança divergente");
            return work.apply(a);
        });
    }
    public BillingTerms baseline(BillingAccount a) {
        var existing=terms.findAllByAccountIdOrderByEffectiveOnDescCreatedAtDesc(a.id).stream().filter(t->"BASE".equals(t.state)).findFirst();
        if(existing.isPresent()) return existing.get();
        var p=plans.findById(a.planId).orElseThrow();
        var t=new BillingTerms();t.accountId=a.id;t.planId=a.planId;t.planName=p.name;t.basePrice=a.basePrice==null?a.monthlyPrice:a.basePrice;
        t.addonId=a.addonId;t.addonName=a.addonName;t.addonQuantity=a.addonQuantity;t.addonUnitPrice=a.addonUnitPrice;
        t.monthlyPrice=a.monthlyPrice;t.method=a.method;t.barberLimit=a.contractedBarberLimit==null?p.barberLimit:a.contractedBarberLimit;
        t.effectiveOn=LocalDate.of(1900,1,1);t.state="BASE";return terms.saveAndFlush(t);
    }
    public BillingTerms at(BillingAccount a,LocalDate due) {
        if(due==null) return null;
        return terms.findAllByAccountIdOrderByEffectiveOnDescCreatedAtDesc(a.id).stream()
                .filter(t->Set.of("BASE","APPLIED").contains(t.state)&&!t.effectiveOn.isAfter(due)).findFirst().orElse(null);
    }
    public BillingTerms chargeTerms(BillingAccount a,BillingCharge c) {
        return c.termsId==null?at(a,c.dueDate):terms.findById(c.termsId).orElse(null);
    }
    public List<BillingTerms> history(UUID account) {return terms.findAllByAccountIdOrderByEffectiveOnDescCreatedAtDesc(account).stream().filter(t->!Set.of("BASE","DRAFT").contains(t.state)).toList();}
    public int professionals(UUID tenant){return barbers.findAllByUnit_Tenant_Id(tenant).size();}
    private void mutable(BillingAccount a) {
        check(a.providerSubscriptionId!=null&&!a.cancelRequested,"Assinatura sem renovação ativa");
        check("ACTIVE".equals(a.state),"Regularize os pagamentos antes de alterar a assinatura");
        check(pending(a)==null,"Já existe uma alteração programada ou aguardando conciliação");
    }
    public BillingTerms pending(BillingAccount a) {
        var latest=history(a.id).stream().filter(t->Set.of("APPLYING","UNCERTAIN","APPLIED").contains(t.state)).findFirst().orElse(null);
        if(latest==null)return null;
        return !"APPLIED".equals(latest.state)||latest.effectiveOn.isAfter(LocalDate.now())
                ||!latest.planId.equals(a.planId)||!latest.method.equals(a.method)||latest.addonQuantity!=a.addonQuantity
                ||latest.monthlyPrice.compareTo(a.monthlyPrice)!=0 ? latest:null;
    }
    private JsonNode provider(BillingAccount a) {
        var p=asaas.get("/subscriptions/"+AsaasClient.safeId(a.providerSubscriptionId));
        check(Objects.equals(a.customerId,text(p,"customer"))&&"MONTHLY".equals(text(p,"cycle"))&&"ACTIVE".equals(text(p,"status")),"Assinatura externa divergente ou inativa");
        return p;
    }
    private LocalDate effective(BillingAccount a,JsonNode provider) {
        LocalDate next=date(provider,"nextDueDate");
        check(next!=null&&next.isAfter(LocalDate.now()),"Aguarde a emissão do ciclo atual antes de alterar a assinatura");
        boolean alreadyIssued=charges.findAllByAccountIdOrderByDueDateDesc(a.id).stream().anyMatch(c->c.dueDate!=null&&!c.dueDate.isBefore(next)&&!"DELETED".equals(c.status));
        check(!alreadyIssued,"O próximo ciclo já foi emitido. Atualize os pagamentos para recalcular a data da alteração");
        return next;
    }
    public BillingTerms quote(UUID tenant,Selection input) {
        asaas.requireConfigured();
        check(input!=null&&input.planId()!=null&&Set.of("PIX","CREDIT_CARD").contains(input.method()==null?"":input.method()),"Escolha plano e forma de pagamento");
        check(input.addonQuantity()>=0&&input.addonQuantity()<=20&&((input.addonId()==null)==(input.addonQuantity()==0)),"Adicional inválido");
        return locked(tenant,a->{
            mutable(a);baseline(a);
            var p=plans.findById(input.planId()).filter(v->Boolean.TRUE.equals(v.active)&&v.monthlyPrice.signum()>0).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Plano indisponível"));
            var t=new BillingTerms();t.accountId=a.id;t.planId=p.id;t.planName=p.name;t.basePrice=p.monthlyPrice;t.monthlyPrice=p.monthlyPrice;t.barberLimit=p.barberLimit;t.method=input.method();
            if(input.addonQuantity()>0){
                var extra=addons.findById(input.addonId()).filter(v->v.active&&p.id.equals(v.planId)&&"BARBER_SEAT".equals(v.code)&&input.addonQuantity()<=v.maxQuantity).orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Adicional indisponível"));
                t.addonId=extra.id;t.addonName=extra.name;t.addonUnitPrice=extra.monthlyPrice;t.addonQuantity=input.addonQuantity();
                t.monthlyPrice=t.monthlyPrice.add(extra.monthlyPrice.multiply(BigDecimal.valueOf(t.addonQuantity)));t.barberLimit+=t.addonQuantity;
            }
            check(professionals(tenant)<=t.barberLimit,"O novo limite é menor que o número de profissionais cadastrados, incluindo inativos. Ajuste a equipe antes de reduzir o plano");
            check(!Objects.equals(t.planId,a.planId)||t.addonQuantity!=a.addonQuantity||!t.method.equals(a.method)||t.monthlyPrice.compareTo(a.monthlyPrice)!=0,"A assinatura já possui essas condições");
            t.effectiveOn=effective(a,provider(a));t.state="DRAFT";t.expiresAt=LocalDateTime.now().plusMinutes(10);
            return terms.save(t);
        });
    }
    public void confirm(UUID tenant,UUID actor,Confirmation input,String remoteIp,boolean secure) {
        asaas.requireConfigured();check(input!=null&&input.quoteId()!=null,"Revise a alteração antes de confirmar");
        var owner=users.findById(actor).filter(u->tenant.equals(u.getTenantId())&&u.getRole()==Role.ADMIN).orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Administrador inválido"));
        boolean[] send={false};
        BillingTerms reserved=locked(tenant,a->{
            var t=terms.findById(input.quoteId()).filter(v->v.accountId.equals(a.id)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Prévia não encontrada"));
            if("APPLIED".equals(t.state)) return t;
            check("DRAFT".equals(t.state),"Alteração aguardando conciliação. Atualize a assinatura antes de tentar novamente");
            mutable(a);check(t.expiresAt.isAfter(LocalDateTime.now()),"Prévia expirada. Revise novamente");
            check(professionals(tenant)<=t.barberLimit,"A equipe excede o novo limite. Revise os profissionais");
            check(t.effectiveOn.equals(effective(a,provider(a))),"A data do próximo ciclo mudou. Revise novamente");
            if("CREDIT_CARD".equals(t.method)&&!t.method.equals(a.method)) validateCard(input.card(),secure);
            t.state="APPLYING";terms.saveAndFlush(t);send[0]=true;return t;
        });
        if(!send[0])return;
        boolean[] mutationStarted={false};
        try {
            locked(tenant,a->{
                check(!a.cancelRequested,"A renovação foi cancelada; atualize a assinatura");
                check(reserved.effectiveOn.equals(effective(a,provider(a))),"O ciclo mudou durante a confirmação. Revise novamente");
                Map<String,Object> body=new LinkedHashMap<>();body.put("value",reserved.monthlyPrice);body.put("billingType",reserved.method);
                body.put("updatePendingPayments",false);body.put("externalReference",reserved.id.toString());
                body.put("description","LineUp — "+reserved.planName+" + "+reserved.addonQuantity+" profissional(is) extra(s)");
                if("CREDIT_CARD".equals(reserved.method)&&!reserved.method.equals(a.method)) {
                    Map<String,Object> tokenBody=cardPayload(input.card(),owner,remoteIp);tokenBody.put("customer",a.customerId);
                    String token=text(asaas.post("/creditCard/tokenizeCreditCard",tokenBody),"creditCardToken");
                    check(token!=null&&!token.isBlank(),"Não foi possível validar o cartão");body.put("creditCardToken",token);body.put("remoteIp",remoteIp);
                }
                mutationStarted[0]=true;
                asaas.put("/subscriptions/"+AsaasClient.safeId(a.providerSubscriptionId),body);
                var snapshot=provider(a);
                if(!matches(reserved,snapshot)) fail(HttpStatus.CONFLICT,"Alteração aguardando confirmação do provedor");
                var t=terms.findById(reserved.id).orElseThrow();t.state="APPLIED";terms.save(t);
                var event=new AuditEvent();event.tenantId=tenant;event.actorId=actor;event.action="BILLING_CHANGE_SCHEDULED";event.targetId=t.id;event.createdAt=LocalDateTime.now();audit.save(event);
                return null;
            });
        } catch(RuntimeException ex) {
            locked(tenant,a->{var t=terms.findById(reserved.id).orElseThrow();t.state=(!mutationStarted[0]||ex instanceof AsaasClient.Rejected)?"FAILED":"UNCERTAIN";terms.save(t);return null;});
            throw ex;
        }
    }
    private boolean matches(BillingTerms t,JsonNode p){return decimal(p,"value")!=null&&t.monthlyPrice.compareTo(decimal(p,"value"))==0&&t.method.equals(text(p,"billingType"))&&t.id.toString().equals(text(p,"externalReference"));}
    public void resolve(BillingAccount a,JsonNode p){
        for(var t:history(a.id)) if(Set.of("APPLYING","UNCERTAIN").contains(t.state)&&matches(t,p)){t.state="APPLIED";terms.save(t);}
    }
    public void requireSettled(BillingAccount a){check(history(a.id).stream().noneMatch(t->Set.of("APPLYING","UNCERTAIN").contains(t.state)),"Concilie a alteração de assinatura antes de continuar");}
    public static Map<String,Object> cardPayload(BillingService.CardInput c,User owner,String remoteIp){
        Map<String,Object> body=new LinkedHashMap<>();
        body.put("creditCard",Map.of("holderName",c.holderName(),"number",c.number(),"expiryMonth",c.expiryMonth(),"expiryYear",c.expiryYear(),"ccv",c.ccv()));
        body.put("creditCardHolderInfo",Map.of("name",c.holderName(),"email",owner.getEmail(),"cpfCnpj",c.cpfCnpj(),"postalCode",c.postalCode(),"addressNumber",c.addressNumber(),"phone",c.phone()));
        body.put("remoteIp",remoteIp);return body;
    }
    private void validateCard(BillingService.CardInput c,boolean secure){
        if(asaas.production()&&!secure)fail(HttpStatus.BAD_REQUEST,"Dados de cartão exigem HTTPS");
        check(c!=null&&c.holderName()!=null&&!c.holderName().isBlank()&&c.holderName().length()<=120
                &&c.number()!=null&&c.number().matches("\\d{13,19}")&&c.ccv()!=null&&c.ccv().matches("\\d{3,4}")
                &&c.expiryMonth()!=null&&c.expiryMonth().matches("0[1-9]|1[0-2]")&&c.expiryYear()!=null&&c.expiryYear().matches("\\d{4}")
                &&c.cpfCnpj()!=null&&c.cpfCnpj().matches("\\d{11}|\\d{14}")&&c.postalCode()!=null&&c.postalCode().matches("\\d{8}")
                &&c.addressNumber()!=null&&!c.addressNumber().isBlank()&&c.addressNumber().length()<=30&&c.phone()!=null&&c.phone().matches("\\d{10,13}"),"Confira os dados do cartão e titular");
        check(!YearMonth.of(Integer.parseInt(c.expiryYear()),Integer.parseInt(c.expiryMonth())).isBefore(YearMonth.now()),"Cartão vencido");
    }
}
