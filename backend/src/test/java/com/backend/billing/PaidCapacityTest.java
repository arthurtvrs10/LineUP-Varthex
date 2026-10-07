package com.backend.billing;

import com.backend.barbers.*;
import com.backend.commercial.*;
import com.backend.tenants.Tenant;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

class PaidCapacityTest {
    @Test void extraSeatsAreUsableOnlyWithinPaidCapacity() {
        var em=mock(EntityManager.class);var subscriptions=mock(SubscriptionRepository.class);
        var plans=mock(PlanRepository.class);var barbers=mock(BarberRepository.class);
        UUID tenant=UUID.randomUUID();var s=new Subscription();s.planId=UUID.randomUUID();s.status="ACTIVE";
        s.startsOn=LocalDate.now();s.endsOn=LocalDate.now().plusMonths(1);s.barberLimit=3;
        var plan=new Plan();plan.barberLimit=1;
        when(em.find(Tenant.class,tenant,LockModeType.PESSIMISTIC_WRITE)).thenReturn(mock(Tenant.class));
        when(subscriptions.findAllByTenantId(tenant)).thenReturn(List.of(s));when(plans.findById(s.planId)).thenReturn(Optional.of(plan));
        @SuppressWarnings("unchecked") var query=(TypedQuery<BillingTerms>)mock(TypedQuery.class);
        when(em.createQuery(anyString(),eq(BillingTerms.class))).thenReturn(query);
        when(query.setParameter(anyString(),any())).thenReturn(query);when(query.setMaxResults(1)).thenReturn(query);
        when(query.getResultList()).thenReturn(List.of());
        var service=new EntitlementService(em,subscriptions,plans,barbers);
        when(barbers.findAllByUnit_Tenant_Id(tenant)).thenReturn(List.of(mock(BarberProfile.class),mock(BarberProfile.class)));
        assertDoesNotThrow(()->service.requireBarberCapacity(tenant));
        when(barbers.findAllByUnit_Tenant_Id(tenant)).thenReturn(List.of(mock(BarberProfile.class),mock(BarberProfile.class),mock(BarberProfile.class)));
        assertThrows(ResponseStatusException.class,()->service.requireBarberCapacity(tenant));
        var scheduled=new BillingTerms();scheduled.barberLimit=2;
        when(query.getResultList()).thenReturn(List.of(scheduled));
        when(barbers.findAllByUnit_Tenant_Id(tenant)).thenReturn(List.of(mock(BarberProfile.class),mock(BarberProfile.class)));
        assertThrows(ResponseStatusException.class,()->service.requireBarberCapacity(tenant));
        s.status="SUSPENDED";when(barbers.findAllByUnit_Tenant_Id(tenant)).thenReturn(List.of());
        assertThrows(ResponseStatusException.class,()->service.requireBarberCapacity(tenant));
    }
}
