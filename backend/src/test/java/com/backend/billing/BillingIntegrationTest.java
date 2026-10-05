package com.backend.billing;

import com.backend.auth.jwt.JwtService;
import com.backend.commercial.*;
import com.backend.tenants.*;
import com.backend.users.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"asaas.enabled=true","asaas.worker-enabled=false","spring.flyway.enabled=false",
        "app.frontend-url=http://localhost:3000","spring.jpa.show-sql=false",
        "asaas.webhook-token=test-webhook-token-with-more-than-32-characters"})
@AutoConfigureMockMvc
class BillingIntegrationTest {
    @Autowired BillingService billing;
    @Autowired BillingWorker worker;
    @Autowired BillingAccountRepository accounts;
    @Autowired BillingChargeRepository charges;
    @Autowired BillingEventRepository events;
    @Autowired PlanRepository plans;
    @Autowired SubscriptionRepository subscriptions;
    @Autowired TenantRepository tenants;
    @Autowired UserRepository users;
    @Autowired JwtService jwt;
    @Autowired ObjectMapper json;
    @Autowired MockMvc mvc;
    @MockitoBean AsaasClient asaas;
    UUID tenant,actor;Plan plan;String token,customer,sub;
    JsonNode node(Object value) { return json.valueToTree(value); }
    @BeforeEach void seed() {
        when(asaas.configured()).thenReturn(true);
        tenant=tenants.save(new Tenant(null,"Billing test",null,null,"America/Sao_Paulo","pt-BR","BRL",null,null)).getId();
        var owner=users.save(new User(null,"Owner",UUID.randomUUID()+"@example.com","{noop}password123",Role.ADMIN,UserStatus.ACTIVE,tenant,null,null,null));
        actor=owner.getId();token=jwt.generateTokemn(owner);
        plan=new Plan();plan.name="Mensal";plan.monthlyPrice=new BigDecimal("99.00");plan.barberLimit=1;plan.active=true;plan.createdAt=LocalDateTime.now();plan=plans.save(plan);
        customer="cus_"+UUID.randomUUID().toString().replace("-","");sub="sub_"+UUID.randomUUID().toString().replace("-","");
    }
    BillingAccount account() {
        var a=new BillingAccount();a.tenantId=tenant;a.actorId=actor;a.planId=plan.id;a.monthlyPrice=plan.monthlyPrice;
        a.customerId=customer;a.providerSubscriptionId=sub;a.method="PIX";a.state="PENDING";return accounts.save(a);
    }
    JsonNode payment(String id,String status,LocalDate due) {
        return node(Map.of("id",id,"customer",customer,"subscription",sub,"value",99,"netValue",97.01,
                "dueDate",due.toString(),"status",status,"invoiceUrl","https://sandbox.asaas.com/i/test"));
    }
    JsonNode providerSubscription(String status) {
        return node(Map.of("id",sub,"customer",customer,"value",99,"cycle","MONTHLY","status",status));
    }
    Subscription current() { return subscriptions.findAllByTenantId(tenant).getFirst(); }

    @Test void cardCheckoutUsesCatalogPriceAndDoesNotActivateAccess() {
        when(asaas.post(eq("/customers"),any())).thenReturn(node(Map.of("id",customer)));
        when(asaas.post(eq("/checkouts"),any())).thenAnswer(invocation->{
            Map<?,?> payload=invocation.getArgument(1);
            Map<?,?> item=(Map<?,?>)((List<?>)payload.get("items")).getFirst();
            assertEquals(plan.monthlyPrice,item.get("value"));
            assertFalse(payload.containsKey("creditCard"));
            return node(Map.of("id","checkout_test","link","https://sandbox.asaas.com/checkoutSession/show?id=checkout_test"));
        });
        var input=new BillingService.CheckoutInput(plan.id,"CREDIT_CARD","12345678909","same_request_123");
        billing.checkout(tenant,actor,input);billing.checkout(tenant,actor,input);
        assertEquals("PENDING",accounts.findByTenantId(tenant).orElseThrow().state);
        assertTrue(subscriptions.findAllByTenantId(tenant).isEmpty());
        verify(asaas,times(1)).post(eq("/checkouts"),any());
    }
    @Test void checkoutTimeoutDoesNotCreateAnotherRequestOnRetry() {
        when(asaas.post(eq("/customers"),any())).thenReturn(node(Map.of("id",customer)));
        when(asaas.post(eq("/checkouts"),any())).thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.BAD_GATEWAY));
        var input=new BillingService.CheckoutInput(plan.id,"CREDIT_CARD","12345678909","request_timeout");
        assertThrows(ResponseStatusException.class,()->billing.checkout(tenant,actor,input));
        assertEquals("UNCERTAIN",accounts.findByTenantId(tenant).orElseThrow().state);
        assertThrows(ResponseStatusException.class,()->billing.checkout(tenant,actor,input));
        assertThrows(ResponseStatusException.class,()->billing.checkout(tenant,actor,new BillingService.CheckoutInput(plan.id,"CREDIT_CARD","12345678909","new_request_123")));
        verify(asaas,times(1)).post(eq("/checkouts"),any());
    }
    @Test void paidPaymentActivatesAndRepeatedSnapshotDoesNotExtendPeriodTwice() {
        account();JsonNode paid=payment("pay_"+UUID.randomUUID(),"RECEIVED",LocalDate.now());
        billing.syncPayment(tenant,paid);billing.syncPayment(tenant,paid);
        assertEquals("ACTIVE",current().status);assertEquals(LocalDate.now().plusMonths(1).minusDays(1),current().endsOn);
        assertEquals(1,charges.findAllByAccountIdOrderByDueDateDesc(accounts.findByTenantId(tenant).orElseThrow().id).size());
    }
    @Test void nextCyclePaymentExtendsEntitlement() {
        account();billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"RECEIVED",LocalDate.now().minusMonths(1)));
        billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"CONFIRMED",LocalDate.now()));
        assertEquals(LocalDate.now().plusMonths(1).minusDays(1),current().endsOn);
    }
    @Test void unpaidFirstCycleDoesNotGrantGrace() {
        account();billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"OVERDUE",LocalDate.now().minusDays(1)));
        assertEquals("SUSPENDED",current().status);
    }
    @Test void renewalGraceExpiresAndCancellationNeverExtendsGrace() {
        var a=account();LocalDate renewal=LocalDate.now().minusDays(1);
        billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"RECEIVED",renewal.minusMonths(1)));
        billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"OVERDUE",renewal));
        assertEquals("ACTIVE",current().status);assertEquals("PAST_DUE",accounts.findById(a.id).orElseThrow().state);
        when(asaas.put(eq("/subscriptions/"+sub),any())).thenReturn(providerSubscription("INACTIVE"));
        billing.cancel(tenant,actor);assertEquals("SUSPENDED",current().status);
    }
    @Test void mismatchedCustomerAndAmountNeverGrantAccess() {
        account();var wrong=(tools.jackson.databind.node.ObjectNode)payment("pay_"+UUID.randomUUID(),"RECEIVED",LocalDate.now());
        wrong.put("customer","cus_other");assertThrows(ResponseStatusException.class,()->billing.syncPayment(tenant,wrong));
        var wrongAmount=(tools.jackson.databind.node.ObjectNode)payment("pay_"+UUID.randomUUID(),"RECEIVED",LocalDate.now());wrongAmount.put("value",1);
        billing.syncPayment(tenant,wrongAmount);assertEquals("SUSPENDED",current().status);
    }
    @Test void refundRequestIsPendingUntilProviderConfirmsAndIsIdempotent() {
        var a=account();String id="pay_"+UUID.randomUUID();JsonNode paid=payment(id,"RECEIVED",LocalDate.now());billing.syncPayment(tenant,paid);
        when(asaas.post(eq("/payments/"+id+"/refund"),any())).thenReturn(node(Map.of("status","PENDING")));
        when(asaas.get("/payments/"+id)).thenReturn(paid);
        var c=charges.findByProviderId(id).orElseThrow();var input=new BillingService.RefundInput(new BigDecimal("20.00"),"Solicitação do cliente","refund_request_123");
        billing.refund(c.id,actor,input);billing.refund(c.id,actor,input);
        assertEquals("PENDING",charges.findById(c.id).orElseThrow().refundState);assertEquals(BigDecimal.ZERO.setScale(2),charges.findById(c.id).orElseThrow().refunded);
        var partial=(tools.jackson.databind.node.ObjectNode)payment(id,"RECEIVED",LocalDate.now());partial.set("refunds",node(List.of(Map.of("value",20,"status","DONE"))));
        billing.syncPayment(tenant,partial);assertEquals("DONE",charges.findById(c.id).orElseThrow().refundState);assertEquals("ACTIVE",current().status);
        verify(asaas,times(1)).post(eq("/payments/"+id+"/refund"),any());
    }
    @Test void fullRefundRevokesPaidPeriodAndHistoryRemains() {
        var a=account();String id="pay_"+UUID.randomUUID();billing.syncPayment(tenant,payment(id,"RECEIVED",LocalDate.now()));
        billing.syncPayment(tenant,payment(id,"REFUNDED",LocalDate.now()));assertEquals("SUSPENDED",current().status);
        assertEquals(1,charges.findAllByAccountIdOrderByDueDateDesc(a.id).size());
    }
    @Test void cancelKeepsAlreadyPaidAccessAndDoesNotCallRefund() {
        account();billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"RECEIVED",LocalDate.now()));
        when(asaas.put(eq("/subscriptions/"+sub),any())).thenReturn(providerSubscription("INACTIVE"));
        billing.cancel(tenant,actor);billing.cancel(tenant,actor);
        assertEquals("ACTIVE",current().status);verify(asaas,times(1)).put(eq("/subscriptions/"+sub),any());verify(asaas,never()).post(contains("refund"),any());
    }
    @Test void suspendedTenantCanPayButCannotReadCommercialDataAndClientCannotManageBilling() throws Exception {
        var s=new Subscription();s.tenantId=tenant;s.planId=plan.id;s.status="SUSPENDED";s.startsOn=LocalDate.now();s.endsOn=LocalDate.now().minusDays(1);subscriptions.save(s);
        mvc.perform(get("/billing/subscription").header("Authorization","Bearer "+token)).andExpect(status().isOk());
        mvc.perform(get("/commercial/finance").header("Authorization","Bearer "+token)).andExpect(status().isForbidden());
        var client=users.save(new User(null,"Client",UUID.randomUUID()+"@example.com","{noop}password123",Role.CLIENT,UserStatus.ACTIVE,tenant,null,null,null));
        mvc.perform(get("/billing/subscription").header("Authorization","Bearer "+jwt.generateTokemn(client))).andExpect(status().isForbidden());
    }
    @Test void webhookRejectsBadTokenAndDeduplicatesWithoutStoringRawPayload() throws Exception {
        account();String id="evt_"+UUID.randomUUID();var body=Map.of("id",id,"event","PAYMENT_RECEIVED","payment",Map.of("id","pay_test","customer",customer,"card","must-not-store"));
        mvc.perform(post("/billing/webhook").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isUnauthorized());
        for(int i=0;i<2;i++) mvc.perform(post("/billing/webhook").header("asaas-access-token","test-webhook-token-with-more-than-32-characters").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isOk());
        assertTrue(events.existsById(id));assertEquals("pay_test",events.findById(id).orElseThrow().resourceId);
    }
    @Test void otherTenantCannotSeeChargesAndAdministratorCannotRefund() throws Exception {
        account();billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"RECEIVED",LocalDate.now()));
        UUID other=tenants.save(new Tenant(null,"Other",null,null,"UTC","pt-BR","BRL",null,null)).getId();
        var owner=users.save(new User(null,"Other",UUID.randomUUID()+"@example.com","{noop}password123",Role.ADMIN,UserStatus.ACTIVE,other,null,null,null));
        mvc.perform(get("/billing/subscription").header("Authorization","Bearer "+jwt.generateTokemn(owner))).andExpect(jsonPath("$.charges.length()").value(0));
        mvc.perform(post("/platform/billing/charges/"+UUID.randomUUID()+"/refund").header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content("{}")).andExpect(status().isForbidden());
    }
    @Test void cardUpdateTargetsExistingSubscriptionAndDoesNotPersistOrReturnCard() {
        var a=account();a.method="CREDIT_CARD";accounts.save(a);
        var card=new BillingService.CardInput("Test holder","4444444444444444","12","2035","123","12345678909","01001000","1","11999999999");
        when(asaas.put(eq("/subscriptions/"+sub+"/creditCard"),any())).thenReturn(node(Map.of("creditCardToken","secret-token")));
        var result=billing.updateCard(tenant,actor,card,"127.0.0.1",true);
        String response=json.writeValueAsString(result);
        assertFalse(response.contains(card.number()));assertFalse(response.contains("secret-token"));assertEquals("CardInput[REDACTED]",card.toString());
        verify(asaas,times(1)).put(eq("/subscriptions/"+sub+"/creditCard"),any());verify(asaas,never()).post(anyString(),any());
    }
    @Test void productionCardUpdateRequiresHttps() {
        account();when(asaas.production()).thenReturn(true);
        var card=new BillingService.CardInput("Test holder","4444444444444444","12","2035","123","12345678909","01001000","1","11999999999");
        assertThrows(ResponseStatusException.class,()->billing.updateCard(tenant,actor,card,"127.0.0.1",false));
        verify(asaas,never()).put(anyString(),any());
    }
    @Test void prepaidNextCycleDoesNotSuspendCurrentPaidAccess() {
        account();billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"RECEIVED",LocalDate.now()));
        billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"RECEIVED",LocalDate.now().plusMonths(1)));
        assertEquals("ACTIVE",current().status);assertEquals(LocalDate.now().plusMonths(1).minusDays(1),current().endsOn);
    }
    @Test void pixSubscriptionCreatesHostedInvoiceAndActivatesOnlyAfterConfirmedPayment() {
        when(asaas.post(eq("/customers"),any())).thenReturn(node(Map.of("id",customer)));
        when(asaas.post(eq("/subscriptions"),any())).thenReturn(providerSubscription("ACTIVE"));
        when(asaas.getOptional("/subscriptions/"+sub)).thenReturn(providerSubscription("ACTIVE"));
        String paymentId="pay_"+UUID.randomUUID();
        String paymentsPath="/subscriptions/"+sub+"/payments?limit=100&offset=0";
        when(asaas.get(paymentsPath)).thenReturn(node(Map.of("data",List.of(payment(paymentId,"PENDING",LocalDate.now())),"hasMore",false)));
        var input=new BillingService.CheckoutInput(plan.id,"PIX","12345678909","pix_request_123");
        billing.checkout(tenant,actor,input);assertEquals("SUSPENDED",current().status);
        assertNotNull(charges.findByProviderId(paymentId).orElseThrow().invoiceUrl);
        billing.checkout(tenant,actor,input);verify(asaas,times(1)).post(eq("/subscriptions"),any());
        when(asaas.get(paymentsPath)).thenReturn(node(Map.of("data",List.of(payment(paymentId,"RECEIVED",LocalDate.now())),"hasMore",false)));
        billing.reconcile(tenant);assertEquals("ACTIVE",current().status);
    }
    @Test void newPublicRegistrationRequiresPaymentWhenBillingIsEnabled() throws Exception {
        String email=UUID.randomUUID()+"@example.com";
        var body=Map.of("tradeName","New shop","defaultTimeZone","America/Sao_Paulo","locale","pt-BR","currency","BRL",
                "initialUnit",Map.of("name","Principal","timeZone","America/Sao_Paulo","active",true),
                "admin",Map.of("fullName","New owner","email",email,"password","password123","role","ADMIN"));
        mvc.perform(post("/tenants").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isCreated());
        var owner=users.findAll().stream().filter(u->email.equals(u.getEmail())).findFirst().orElseThrow();
        var subscription=subscriptions.findAllByTenantId(owner.getTenantId()).getFirst();
        assertEquals("SUSPENDED",subscription.status);assertEquals("ASAAS",subscription.reason);
        mvc.perform(get("/billing/subscription").header("Authorization","Bearer "+jwt.generateTokemn(owner))).andExpect(status().isOk());
        mvc.perform(get("/commercial/finance").header("Authorization","Bearer "+jwt.generateTokemn(owner))).andExpect(status().isForbidden());
    }
    @Test void graceAfterFourOverdueDaysDoesNotKeepAccess() {
        account();LocalDate renewal=LocalDate.now().minusDays(4);
        billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"RECEIVED",renewal.minusMonths(1)));
        billing.syncPayment(tenant,payment("pay_"+UUID.randomUUID(),"OVERDUE",renewal));
        assertEquals("SUSPENDED",current().status);
    }
}
