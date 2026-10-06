package com.backend.commercial;

import com.backend.barbers.BarberRepository;
import com.backend.tenants.Tenant;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class EntitlementService {
    private final EntityManager em;private final SubscriptionRepository subscriptions;private final PlanRepository plans;private final BarberRepository barbers;
    public EntitlementService(EntityManager em,SubscriptionRepository subscriptions,PlanRepository plans,BarberRepository barbers){this.em=em;this.subscriptions=subscriptions;this.plans=plans;this.barbers=barbers;}
    @Transactional
    public void requireBarberCapacity(UUID tenantId){
        if(em.find(Tenant.class,tenantId,LockModeType.PESSIMISTIC_WRITE)==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Barbearia não encontrada");
        subscriptions.findAllByTenantId(tenantId).stream().findFirst().ifPresent(s->{
            if(!("ACTIVE".equals(s.status)||"TRIAL".equals(s.status))||s.startsOn.isAfter(LocalDate.now())||s.endsOn.isBefore(LocalDate.now()))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Assinatura sem vigência ativa");
            Plan p=plans.findById(s.planId).orElseThrow(()->new ResponseStatusException(HttpStatus.CONFLICT,"Plano não encontrado"));
            int limit=s.barberLimit==null?p.barberLimit:s.barberLimit;
            if(barbers.findAllByUnit_Tenant_Id(tenantId).size()>=limit)throw new ResponseStatusException(HttpStatus.CONFLICT,"Limite de profissionais do plano atingido");
        });
    }
}
