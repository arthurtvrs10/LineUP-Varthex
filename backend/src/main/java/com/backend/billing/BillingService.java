package com.backend.billing;

import com.backend.commercial.*;
import com.backend.tenants.*;
import com.backend.users.*;
import jakarta.persistence.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import java.util.function.Function;

@Service
public class BillingService {
    private final BillingAccountRepository accounts;
    private final BillingChargeRepository charges;
    private final SubscriptionRepository subscriptions;
    private final PlanRepository plans;
    private final UserRepository users;
    private final AuditEventRepository audit;
    private final EntityManager em;
    private final AsaasClient asaas;
    private final TransactionTemplate tx;
    private final String frontendUrl;
    private final int graceDays;

    public BillingService(BillingAccountRepository accounts, BillingChargeRepository charges,
            SubscriptionRepository subscriptions, PlanRepository plans, UserRepository users,
            AuditEventRepository audit, EntityManager em, AsaasClient asaas, PlatformTransactionManager tm,
            @Value("${app.frontend-url:http://localhost:3000}") String frontendUrl,
            @Value("${asaas.grace-days:3}") int graceDays) {
        this.accounts=accounts; this.charges=charges; this.subscriptions=subscriptions; this.plans=plans;
        this.users=users; this.audit=audit; this.em=em; this.asaas=asaas; this.tx=new TransactionTemplate(tm);
        this.frontendUrl=frontendUrl.replaceAll("/+$", ""); this.graceDays=Math.max(0, Math.min(graceDays, 30));
    }
    public record CheckoutInput(UUID planId, String method, String cpfCnpj, String requestKey) {}
    public record RefundInput(BigDecimal amount, String reason, String requestKey) {}
    public record CardInput(String holderName,String number,String expiryMonth,String expiryYear,String ccv,
            String cpfCnpj,String postalCode,String addressNumber,String phone) {
        @Override public String toString() { return "CardInput[REDACTED]"; }
    }
    public record Catalog(boolean available, int graceDays, List<Plan> plans) {}
    public Catalog catalog() {
        return new Catalog(asaas.configured(), graceDays, plans.findAll().stream()
                .filter(p -> Boolean.TRUE.equals(p.active) && p.monthlyPrice != null && p.monthlyPrice.signum()>0).toList());
    }
    public Map<String,Object> summary(UUID tenant) {
        Map<String,Object> result=new LinkedHashMap<>();
        result.put("available", asaas.configured()); result.put("graceDays", graceDays);
        result.put("subscription", subscriptions.findAllByTenantId(tenant).stream().findFirst().orElse(null));
        var account=accounts.findByTenantId(tenant).orElse(null);
        result.put("account", account);
        result.put("charges", account==null ? List.of() : charges.findAllByAccountIdOrderByDueDateDesc(account.id));
        return result;
    }
    private <T> T locked(UUID tenant, Function<BillingAccount,T> work) {
        return tx.execute(status -> {
            BillingAccount account=em.createQuery("select a from BillingAccount a where a.tenantId=:tenant",BillingAccount.class)
                    .setParameter("tenant",tenant).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultStream().findFirst().orElse(null);
            if(account==null) {
                // No account row yet: serialize its creation through the tenant, then check again.
                if(em.find(Tenant.class,tenant,LockModeType.PESSIMISTIC_WRITE)==null) fail(HttpStatus.NOT_FOUND,"Barbearia não encontrada");
                account=em.createQuery("select a from BillingAccount a where a.tenantId=:tenant",BillingAccount.class)
                        .setParameter("tenant",tenant).setLockMode(LockModeType.PESSIMISTIC_WRITE).getResultStream().findFirst().orElse(null);
            }
            return work.apply(account);
        });
    }
    public Map<String,Object> checkout(UUID tenant, UUID actor, CheckoutInput input) {
        asaas.requireConfigured();
        check(input!=null && input.planId()!=null && Set.of("PIX","CREDIT_CARD").contains(input.method()==null?"":input.method()),"Escolha plano e forma de pagamento");
        key(input.requestKey());
        String document=input.cpfCnpj()==null?"":input.cpfCnpj().replaceAll("[. /-]", "");
        check(document.matches("\\d{11}|\\d{14}"),"Informe CPF ou CNPJ do contratante");
        String fingerprint;
        try { fingerprint=HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest((input.planId()+":"+input.method()+":"+document).getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
        catch(java.security.NoSuchAlgorithmException ex) { throw new IllegalStateException(ex); }
        User owner=users.findById(actor).filter(u -> tenant.equals(u.getTenantId()) && u.getRole()==Role.ADMIN)
                .orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Somente o administrador pode contratar"));
        boolean[] start={false};
        BillingAccount reservation=locked(tenant, existing -> {
            if(existing!=null && existing.requestKey!=null && existing.requestKey.equals(input.requestKey())) {
                check(existing.planId.equals(input.planId()) && existing.method.equals(input.method()),"Chave já usada para outra contratação");
                check(Objects.equals(existing.requestFingerprint,fingerprint),"Chave já usada com outros dados");
                return existing;
            }
            if(existing!=null && (existing.providerSubscriptionId!=null || (existing.checkoutId!=null && !Set.of("CANCELED","EXPIRED").contains(existing.state))
                    || Set.of("STARTING","UNCERTAIN").contains(existing.state==null?"":existing.state)))
                fail(HttpStatus.CONFLICT,"Existe uma contratação em andamento. Atualize a assinatura antes de criar outra.");
            Plan plan=plans.findById(input.planId()).filter(p->Boolean.TRUE.equals(p.active) && p.monthlyPrice.signum()>0)
                    .orElseThrow(()->new ResponseStatusException(HttpStatus.BAD_REQUEST,"Plano indisponível"));
            var account=existing==null?new BillingAccount():existing;
            account.tenantId=tenant; account.actorId=actor; account.planId=plan.id; account.monthlyPrice=plan.monthlyPrice;
            account.method=input.method(); account.state="STARTING"; account.requestKey=input.requestKey(); account.issue=null;
            account.requestFingerprint=fingerprint;
            account.checkoutId=null;account.checkoutUrl=null;account.cancelRequested=false;
            accounts.saveAndFlush(account); start[0]=true;
            audit(tenant,actor,"BILLING_CHECKOUT_REQUESTED",account.id);
            return account;
        });
        if(!start[0]) {
            if(reservation.checkoutUrl==null && reservation.providerSubscriptionId==null)
                fail(HttpStatus.CONFLICT,"Contratação aguardando conciliação; não repita a cobrança.");
            return summary(tenant);
        }
        try {
            if(reservation.customerId==null) {
                JsonNode customer=asaas.post("/customers",Map.of("name",owner.getName(),"email",owner.getEmail(),
                        "cpfCnpj",document,"externalReference",reservation.id.toString(),"notificationDisabled",true));
                String id=AsaasClient.safeId(text(customer,"id"));
                locked(tenant,a->{a.customerId=id;accounts.save(a);return null;}); reservation.customerId=id;
            }
            if(input.method().equals("PIX")) {
                JsonNode subscription=asaas.post("/subscriptions",Map.of("customer",reservation.customerId,
                        "billingType","PIX","value",reservation.monthlyPrice,"cycle","MONTHLY",
                        "nextDueDate",LocalDate.now().toString(),"description","LineUp — assinatura mensal",
                        "externalReference",reservation.id.toString()));
                bindSubscription(tenant,subscription);
                reconcile(tenant);
            } else {
                String callback=frontendUrl+"/admin/assinatura";
                JsonNode checkout=asaas.post("/checkouts",Map.of("customer",reservation.customerId,
                        "externalReference",reservation.id.toString(),"billingTypes",List.of("CREDIT_CARD"),
                        "chargeTypes",List.of("RECURRENT"),"minutesToExpire",60,
                        "callback",Map.of("successUrl",callback,"cancelUrl",callback,"expiredUrl",callback),
                        "items",List.of(Map.of("name","LineUp — assinatura mensal","quantity",1,"value",reservation.monthlyPrice)),
                        "subscription",Map.of("cycle","MONTHLY","nextDueDate",LocalDate.now()+" 00:00:00")));
                String id=AsaasClient.safeId(text(checkout,"id"));
                String link=AsaasClient.safeUrl(text(checkout,"link"));
                locked(tenant,a->{a.checkoutId=id;a.checkoutUrl=link==null?asaas.checkoutUrl(id):link;a.checkoutExpiresAt=LocalDateTime.now().plusHours(1);a.state="PENDING";accounts.save(a);return null;});
            }
        } catch(AsaasClient.Rejected ex) {
            locked(tenant,a->{a.state="FAILED";a.issue="Dados recusados pelo Asaas. Confira os dados e tente novamente.";accounts.save(a);return null;});
            throw ex;
        } catch(RuntimeException ex) {
            locked(tenant,a->{a.state="UNCERTAIN";a.issue="Operação aguardando conciliação com o Asaas; não criar nova cobrança.";accounts.save(a);return null;});
            throw ex;
        }
        return summary(tenant);
    }
    public void bindSubscription(UUID tenant, JsonNode provider) {
        locked(tenant,a->{
            if(a==null || !Objects.equals(a.customerId,text(provider,"customer"))) fail(HttpStatus.CONFLICT,"Recebedor da assinatura não corresponde à conta");
            BigDecimal value=decimal(provider,"value");
            if(value==null || a.monthlyPrice.compareTo(value)!=0 || !"MONTHLY".equals(text(provider,"cycle")))
                fail(HttpStatus.CONFLICT,"Condições da assinatura divergentes do plano contratado");
            String id=AsaasClient.safeId(text(provider,"id"));
            if(a.providerSubscriptionId!=null && !a.providerSubscriptionId.equals(id)) fail(HttpStatus.CONFLICT,"Mais de uma assinatura externa encontrada");
            a.providerSubscriptionId=id; a.state="PENDING"; accounts.save(a); return null;
        });
    }
    public void reconcile(UUID tenant) {
        // Serialize provider reads and writes across instances; a stale concurrent snapshot cannot overwrite a newer one.
        locked(tenant,a->{reconcileLocked(tenant);return null;});
    }
    private void reconcileLocked(UUID tenant) {
        asaas.requireConfigured();
        var account=accounts.findByTenantId(tenant).orElse(null);
        if(account==null) return;
        if(account.customerId==null) {
            JsonNode list=asaas.get("/customers?externalReference="+account.id+"&limit=100");
            if(list.path("data").size()==1) {
                String id=AsaasClient.safeId(text(list.path("data").get(0),"id"));
                locked(tenant,a->{a.customerId=id;accounts.save(a);return null;});account.customerId=id;
            } else return; // Unknown POST outcome must never cause an automatic second POST.
        }
        if(account.providerSubscriptionId==null) {
            JsonNode list=asaas.get("/subscriptions?customer="+AsaasClient.safeId(account.customerId)+"&limit=100");
            if(list.path("data").size()>1) fail(HttpStatus.CONFLICT,"Mais de uma assinatura externa; conciliação manual necessária");
            if(list.path("data").size()==1) bindSubscription(tenant,list.path("data").get(0));
            account=accounts.findByTenantId(tenant).orElseThrow();
        }
        if(account.providerSubscriptionId==null) return;
        JsonNode subscription=asaas.getOptional("/subscriptions/"+AsaasClient.safeId(account.providerSubscriptionId));
        if(subscription==null) {
            locked(tenant,a->{a.cancelRequested=true;accounts.save(a);return null;});
            for(var charge:charges.findAllByAccountIdOrderByDueDateDesc(account.id)) {
                JsonNode payment=asaas.getOptional("/payments/"+AsaasClient.safeId(charge.providerId));
                if(payment!=null) syncPayment(tenant,payment);
                else locked(tenant,a->{var c=charges.findById(charge.id).orElseThrow();c.status="DELETED";charges.save(c);return null;});
            }
            locked(tenant,a->{refreshEntitlement(a);accounts.save(a);return null;});return;
        }
        if(!Objects.equals(account.customerId,text(subscription,"customer"))) fail(HttpStatus.CONFLICT,"Cliente externo divergente");
        if("INACTIVE".equals(text(subscription,"status"))) locked(tenant,a->{a.cancelRequested=true;accounts.save(a);return null;});
        for(int offset=0; offset<10000; offset+=100) {
            JsonNode page=asaas.get("/subscriptions/"+AsaasClient.safeId(account.providerSubscriptionId)+"/payments?limit=100&offset="+offset);
            for(JsonNode payment:page.path("data")) syncPayment(tenant,payment);
            if(!page.path("hasMore").asBoolean()) break;
            if(offset==9900) fail(HttpStatus.CONFLICT,"Limite de conciliação excedido");
        }
        locked(tenant,a->{a.syncedAt=LocalDateTime.now();
            a.issue=charges.findAllByAccountIdOrderByDueDateDesc(a.id).stream().anyMatch(c->c.gross==null || c.gross.compareTo(a.monthlyPrice)!=0)
                    ?"Cobrança com valor divergente; revisão necessária.":null;
            refreshEntitlement(a);accounts.save(a);return null;});
    }
    public void syncPayment(UUID tenant, JsonNode payment) {
        locked(tenant,a->{
            if(a==null || !Objects.equals(a.customerId,text(payment,"customer"))
                    || !Objects.equals(a.providerSubscriptionId,text(payment,"subscription")))
                fail(HttpStatus.CONFLICT,"Cobrança não pertence à assinatura");
            String id=AsaasClient.safeId(text(payment,"id"));
            var charge=charges.findByProviderId(id).orElseGet(BillingCharge::new);
            if(charge.accountId!=null && !charge.accountId.equals(a.id)) fail(HttpStatus.CONFLICT,"Cobrança vinculada a outra conta");
            charge.accountId=a.id;charge.providerId=id;charge.status=text(payment,"status");
            if(Set.of("CONFIRMED","RECEIVED","REFUNDED").contains(charge.status==null?"":charge.status)) charge.failureCode=null;
            charge.dueDate=date(payment,"dueDate");charge.paymentDate=date(payment,"paymentDate");
            charge.availableOn=date(payment,"creditDate");charge.gross=decimal(payment,"value");charge.net=decimal(payment,"netValue");
            charge.invoiceUrl=AsaasClient.safeUrl(text(payment,"invoiceUrl"));charge.updatedAt=LocalDateTime.now();
            BigDecimal returned=BigDecimal.ZERO;
            for(JsonNode refund:payment.path("refunds")) if("DONE".equals(text(refund,"status"))) {
                BigDecimal amount=decimal(refund,"value"); if(amount!=null) returned=returned.add(amount);
            }
            if("REFUNDED".equals(charge.status) && charge.gross!=null) returned=charge.gross;
            charge.refunded=charge.refunded==null?returned:charge.refunded.max(returned);
            if(charge.refundAmount!=null && charge.refundBaseline!=null
                    && charge.refunded.compareTo(charge.refundBaseline.add(charge.refundAmount))>=0) charge.refundState="DONE";
            charges.saveAndFlush(charge);refreshEntitlement(a);accounts.save(a);return null;
        });
    }
    private void refreshEntitlement(BillingAccount account) {
        var history=charges.findAllByAccountIdOrderByDueDateDesc(account.id);
        LocalDate start=null,end=null;
        for(var charge:history) {
            if(charge.gross==null || charge.dueDate==null || charge.gross.compareTo(account.monthlyPrice)!=0) continue;
            if(charge.dueDate.isAfter(LocalDate.now())) continue;
            if(!Set.of("CONFIRMED","RECEIVED","REFUND_REQUESTED","REFUND_IN_PROGRESS").contains(charge.status==null?"":charge.status)
                    || charge.refunded.compareTo(charge.gross)>=0) continue;
            LocalDate periodEnd=charge.dueDate.plusMonths(1).minusDays(1);
            if(end==null || periodEnd.isAfter(end)) { start=charge.dueDate;end=periodEnd; }
        }
        Subscription local=subscriptions.findAllByTenantId(account.tenantId).stream().findFirst().orElseGet(Subscription::new);
        // Preserve manually granted legacy access until the first integrated payment.
        if(end==null && local.planId!=null && !"ASAAS".equals(local.reason)) { account.state="PENDING"; return; }
        local.tenantId=account.tenantId;local.planId=account.planId;local.reason="ASAAS";
        LocalDate today=LocalDate.now();
        local.startsOn=start==null?today:start; local.endsOn=end==null?today.minusDays(1):end;
        LocalDate paidEnd=end;
        boolean grace=end!=null && !account.cancelRequested && history.stream().anyMatch(c->
                c.dueDate!=null && c.dueDate.equals(paidEnd.plusDays(1))
                        && Set.of("PENDING","OVERDUE").contains(c.status==null?"":c.status));
        if(grace && today.isAfter(local.endsOn) && !today.isAfter(local.endsOn.plusDays(graceDays))) {
            local.endsOn=local.endsOn.plusDays(graceDays); local.status="ACTIVE";account.state="PAST_DUE";
        } else if(end!=null && !today.isBefore(start) && !today.isAfter(end)) {
            local.status="ACTIVE";account.state=account.cancelRequested?"CANCELED":"ACTIVE";
        } else { local.status="SUSPENDED";account.state=end==null?"PENDING":"SUSPENDED"; }
        subscriptions.save(local);
    }
    public Map<String,Object> cancel(UUID tenant, UUID actor) {
        var account=accounts.findByTenantId(tenant).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Assinatura não encontrada"));
        if(account.cancelRequested) return summary(tenant);
        if(account.providerSubscriptionId==null) {
            if(account.checkoutId==null) fail(HttpStatus.CONFLICT,"Aguarde a conciliação da contratação antes de cancelar");
            asaas.post("/checkouts/"+AsaasClient.safeId(account.checkoutId)+"/cancel",Map.of());
            locked(tenant,a->{a.state="CANCELED";a.checkoutUrl=null;accounts.save(a);audit(tenant,actor,"BILLING_CHECKOUT_CANCEL",a.id);return null;});
            return summary(tenant);
        }
        // Setting INACTIVE is idempotent and does not refund past payments.
        asaas.put("/subscriptions/"+AsaasClient.safeId(account.providerSubscriptionId),Map.of("status","INACTIVE"));
        locked(tenant,a->{a.cancelRequested=true;refreshEntitlement(a);accounts.save(a);audit(tenant,actor,"BILLING_CANCEL",a.id);return null;});
        return summary(tenant);
    }
    public Map<String,Object> updateCard(UUID tenant,UUID actor,CardInput input,String remoteIp,boolean secure) {
        asaas.requireConfigured();
        if(asaas.production() && !secure) fail(HttpStatus.BAD_REQUEST,"Atualização de cartão exige conexão HTTPS");
        check(input!=null && input.holderName()!=null && !input.holderName().isBlank() && input.holderName().length()<=120
                && input.number()!=null && input.number().matches("\\d{13,19}")
                && input.expiryMonth()!=null && input.expiryMonth().matches("0[1-9]|1[0-2]")
                && input.expiryYear()!=null && input.expiryYear().matches("\\d{4}")
                && input.ccv()!=null && input.ccv().matches("\\d{3,4}")
                && input.cpfCnpj()!=null && input.cpfCnpj().matches("\\d{11}|\\d{14}")
                && input.postalCode()!=null && input.postalCode().matches("\\d{8}")
                && input.addressNumber()!=null && !input.addressNumber().isBlank() && input.addressNumber().length()<=30
                && input.phone()!=null && input.phone().matches("\\d{10,13}"),"Confira os dados do cartão e do titular");
        check(!YearMonth.of(Integer.parseInt(input.expiryYear()),Integer.parseInt(input.expiryMonth())).isBefore(YearMonth.now()),"Cartão vencido");
        var account=accounts.findByTenantId(tenant).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Assinatura não encontrada"));
        check(account.providerSubscriptionId!=null && "CREDIT_CARD".equals(account.method) && !account.cancelRequested,"Assinatura não possui cartão recorrente ativo");
        var owner=users.findById(actor).filter(u->tenant.equals(u.getTenantId()) && u.getRole()==Role.ADMIN)
                .orElseThrow(()->new ResponseStatusException(HttpStatus.FORBIDDEN,"Administrador inválido"));
        // Transient only: never persist card/CVV, return provider payloads, or audit the submitted data.
        asaas.put("/subscriptions/"+AsaasClient.safeId(account.providerSubscriptionId)+"/creditCard",Map.of(
                "creditCard",Map.of("holderName",input.holderName(),"number",input.number(),"expiryMonth",input.expiryMonth(),"expiryYear",input.expiryYear(),"ccv",input.ccv()),
                "creditCardHolderInfo",Map.of("name",input.holderName(),"email",owner.getEmail(),"cpfCnpj",input.cpfCnpj(),"postalCode",input.postalCode(),"addressNumber",input.addressNumber(),"phone",input.phone()),
                "remoteIp",remoteIp));
        locked(tenant,a->{audit(tenant,actor,"BILLING_CARD_UPDATED",a.id);return null;});
        return summary(tenant);
    }
    public void refund(UUID chargeId, UUID actor, RefundInput input) {
        check(input!=null && input.amount()!=null && input.amount().signum()>0 && input.amount().scale()<=2,"Valor de reembolso inválido");
        check(input.reason()!=null && !input.reason().isBlank() && input.reason().length()<=1000,"Informe o motivo");key(input.requestKey());
        BillingCharge initial=charges.findById(chargeId).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Cobrança não encontrada"));
        var account=accounts.findById(initial.accountId).orElseThrow();
        boolean[] send={false};
        BillingCharge reserved=locked(account.tenantId,a->{
            var charge=charges.findById(chargeId).orElseThrow();
            if(Objects.equals(charge.refundKey,input.requestKey())) {
                check(input.amount().compareTo(charge.refundAmount)==0 && input.reason().equals(charge.refundReason),"Chave usada com outro conteúdo");return charge;
            }
            check(charge.refundState==null || Set.of("DONE","FAILED").contains(charge.refundState),"Existe reembolso em processamento");
            check(Set.of("CONFIRMED","RECEIVED").contains(charge.status==null?"":charge.status)
                    && input.amount().compareTo(charge.gross.subtract(charge.refunded))<=0,"Valor excede o saldo reembolsável");
            charge.refundState="PENDING";charge.refundKey=input.requestKey();charge.refundAmount=input.amount();
            charge.refundBaseline=charge.refunded;charge.refundReason=input.reason();charges.saveAndFlush(charge);send[0]=true;
            audit(account.tenantId,actor,"BILLING_REFUND_REQUESTED",charge.id);return charge;
        });
        if(send[0]) {
            try {
                asaas.post("/payments/"+AsaasClient.safeId(reserved.providerId)+"/refund",Map.of("value",input.amount(),"description",input.reason()));
                syncPayment(account.tenantId,asaas.get("/payments/"+AsaasClient.safeId(reserved.providerId)));
            } catch(AsaasClient.Rejected ex) {
                locked(account.tenantId,a->{var c=charges.findById(chargeId).orElseThrow();c.refundState="FAILED";charges.save(c);return null;});throw ex;
            } catch(RuntimeException ex) {
                locked(account.tenantId,a->{var c=charges.findById(chargeId).orElseThrow();c.refundState="UNCERTAIN";charges.save(c);return null;});throw ex;
            }
        }
    }
    public Map<String,Object> platform() {
        return Map.of("accounts",accounts.findAll(),"charges",charges.findAll());
    }
    public void recordCardFailure(String providerId) {
        var charge=charges.findByProviderId(providerId).orElse(null);
        if(charge==null) return;
        var account=accounts.findById(charge.accountId).orElseThrow();
        locked(account.tenantId,a->{var current=charges.findById(charge.id).orElseThrow();
            if(Set.of("PENDING","OVERDUE").contains(current.status==null?"":current.status)) {current.failureCode="CARD_REFUSED";charges.save(current);}return null;});
    }
    private void audit(UUID tenant,UUID actor,String action,UUID target) {
        var event=new AuditEvent();event.tenantId=tenant;event.actorId=actor;event.action=action;event.targetId=target;
        event.createdAt=LocalDateTime.now();audit.save(event);
    }
    static void check(boolean ok,String message) { if(!ok) fail(HttpStatus.BAD_REQUEST,message); }
    static void fail(HttpStatus status,String message) { throw new ResponseStatusException(status,message); }
    static void key(String key) { check(key!=null && key.matches("[A-Za-z0-9_-]{8,100}"),"Chave da operação inválida"); }
    static String text(JsonNode node,String field) { return node!=null && node.hasNonNull(field)?node.get(field).asText():null; }
    static BigDecimal decimal(JsonNode node,String field) { return node.hasNonNull(field)?new BigDecimal(node.get(field).asText()):null; }
    static LocalDate date(JsonNode node,String field) { String s=text(node,field);return s==null?null:LocalDate.parse(s.substring(0,10)); }
}
