package com.backend.commercial;

import com.backend.tenants.TenantRepository;
import com.backend.users.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class PlatformService {
    private final PlanRepository plans; private final SubscriptionRepository subscriptions;
    private final AuditEventRepository audit; private final TenantRepository tenants; private final UserRepository users;
    private final CommercialService commercial;
    public PlatformService(PlanRepository plans,SubscriptionRepository subscriptions,AuditEventRepository audit,TenantRepository tenants,UserRepository users,CommercialService commercial){this.plans=plans;this.subscriptions=subscriptions;this.audit=audit;this.tenants=tenants;this.users=users;this.commercial=commercial;}
    public List<Plan> plans(){return plans.findAll();}
    public List<Subscription> subscriptions(){return subscriptions.findAll();}
    public List<AuditEvent> audit(){return audit.findAll().stream().sorted(Comparator.comparing((AuditEvent a)->a.createdAt).reversed()).limit(500).toList();}
    public record PlanInput(String name,BigDecimal monthlyPrice,Integer barberLimit) {}
    public Plan plan(UUID actor,PlanInput input){CommercialService.require(input.barberLimit()!=null&&input.barberLimit()>0,"Limite de profissionais inválido");Plan p=new Plan();p.name=CommercialService.text(input.name(),"Nome");p.monthlyPrice=CommercialService.money(input.monthlyPrice(),false);p.barberLimit=input.barberLimit();p.active=true;p.createdAt=LocalDateTime.now();plans.save(p);commercial.event(null,actor,"PLAN_CREATE",p.id);return p;}
    public record SubscriptionInput(UUID tenantId,UUID planId,String status,LocalDate startsOn,LocalDate endsOn,String reason,Long version) {}
    public record PlanStatus(Boolean active, Long version) {}
    public Plan planStatus(UUID actor,UUID id,PlanStatus input) {
        Plan plan=plans.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Plano não encontrado"));
        CommercialService.require(input.active()!=null,"Informe o estado do plano");
        if(!Objects.equals(plan.version,input.version()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Plano alterado por outra pessoa; recarregue");
        plan.active=input.active();plans.save(plan);commercial.event(null,actor,plan.active?"PLAN_ACTIVATE":"PLAN_ARCHIVE",id);return plan;
    }
    public Subscription subscribe(UUID actor,SubscriptionInput input){
        commercial.lock(input.tenantId());
        Subscription s=subscriptions.findAllByTenantId(input.tenantId()).stream().findFirst().orElseGet(Subscription::new);
        if(!Objects.equals(s.version,input.version()))throw new ResponseStatusException(HttpStatus.CONFLICT,"Assinatura alterada por outra pessoa; recarregue");
        CommercialService.require(input.planId()!=null&&plans.findById(input.planId()).filter(p->p.active||p.id.equals(s.planId)).isPresent(),"Plano inválido");
        CommercialService.require(Set.of("TRIAL","ACTIVE","SUSPENDED","CANCELED").contains(input.status()==null?"":input.status()),"Estado inválido");
        CommercialService.require(input.startsOn()!=null&&input.endsOn()!=null&&!input.endsOn().isBefore(input.startsOn()),"Período inválido");
        s.tenantId=input.tenantId();s.planId=input.planId();s.status=input.status();s.startsOn=input.startsOn();s.endsOn=input.endsOn();s.reason=CommercialService.text(input.reason(),"Motivo da alteração manual");subscriptions.save(s);
        AuditEvent e=new AuditEvent();e.tenantId=s.tenantId;e.actorId=actor;e.action="SUBSCRIPTION_"+s.status;e.targetId=s.id;e.createdAt=LocalDateTime.now();e.detail="Plano: "+s.planId+"; estado: "+s.status+"; vigência: "+s.startsOn+" até "+s.endsOn+"; motivo: "+s.reason;audit.save(e);return s;
    }
    public Map<String,Object> metrics(){
        List<Subscription> current=subscriptions.findAll().stream().filter(s->"ACTIVE".equals(s.status)&&!s.startsOn.isAfter(LocalDate.now())&&!s.endsOn.isBefore(LocalDate.now())).toList();
        Map<UUID,Plan> catalog=new HashMap<>();plans.findAll().forEach(p->catalog.put(p.id,p));
        BigDecimal contracted=current.stream().map(s->catalog.get(s.planId)).filter(Objects::nonNull).map(p->p.monthlyPrice).reduce(BigDecimal.ZERO,BigDecimal::add);
        return Map.of("tenants",tenants.count(),"users",users.count(),"activeSubscriptions",current.size(),"contractedMonthlyAmount",contracted,"billingMode","MANUAL");
    }
    public Map<String,Object> health(){long start=System.nanoTime();tenants.count();return Map.of("database","OK","databaseLatencyMs",(System.nanoTime()-start)/1000000,"checkedAt",LocalDateTime.now(),"uptimeSeconds",java.lang.management.ManagementFactory.getRuntimeMXBean().getUptime()/1000,"externalIntegrations","NOT_CONFIGURED");}
}
