package com.backend.commercial;

import com.backend.auth.jwt.JwtService;
import com.backend.customers.Customer;
import com.backend.customers.CustomerRepository;
import com.backend.scheduling.*;
import com.backend.tenants.*;
import com.backend.users.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CommercialControllerTest {
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired JwtService jwt;
    @Autowired jakarta.persistence.EntityManager entityManager;
    @Autowired TenantRepository tenants; @Autowired UserRepository users;
    @Autowired CustomerRepository customers; @Autowired AppointmentRepository appointments;
    @Autowired PaymentRepository payments; @Autowired LoyaltyMovementRepository loyalty;
    @Autowired com.backend.barbers.BarberRepository barbers;
    @Autowired com.backend.units.UnitRepository units;
    @Autowired com.backend.services.ServiceOfferingRepository services;
    UUID tenant, customer, appointment, barberId, unitId, serviceId; String adminToken, otherToken, clientToken, platformToken;
    User user(Role role, UUID tenant) {return users.save(new User(null,"Teste",UUID.randomUUID()+"@example.com","{noop}password123",role,UserStatus.ACTIVE,tenant,null,null,null));}
    @BeforeEach void seed(){
        tenant=tenants.save(new Tenant(null,"Empresa Exemplo",null,null,"America/Sao_Paulo","pt-BR","BRL",null,null)).getId();
        UUID other=tenants.save(new Tenant(null,"Outra Empresa",null,null,"America/Sao_Paulo","pt-BR","BRL",null,null)).getId();
        adminToken=jwt.generateTokemn(user(Role.ADMIN,tenant));otherToken=jwt.generateTokemn(user(Role.ADMIN,other));platformToken=jwt.generateTokemn(user(Role.SUPER_ADMIN,null));
        User client=user(Role.CLIENT,tenant);clientToken=jwt.generateTokemn(client);
        Customer c=new Customer(null,tenant,"Cliente Exemplo","client@example.com",null,null,null);c.setUserId(client.getId());customer=customers.save(c).getId();
        var unit=units.save(new com.backend.units.Unit(null,tenants.findById(tenant).orElseThrow(),"Principal","America/Sao_Paulo",true));unitId=unit.getId();
        var barber=new com.backend.barbers.BarberProfile();barber.setUser(user(Role.BARBER,tenant));barber.setUnit(unit);barber.setDisplayName("Profissional");barber.setDefaultCommissionPercent(40);barber.setStatus(com.backend.barbers.BarberStatus.ACTIVE);barberId=barbers.save(barber).getId();
        serviceId=services.save(new com.backend.services.ServiceOffering(null,tenant,null,null,com.backend.services.ServiceType.SERVICE,"Corte",null,30,0,0,new BigDecimal("100.00"),0,true)).getId();
        Appointment a=new Appointment(tenant,unitId,customer,barberId,AppointmentChannel.CLIENT_WEB,LocalDateTime.now().minusHours(2),LocalDateTime.now().minusHours(1),null);a.setStatus(AppointmentStatus.COMPLETED);a.addItem(new AppointmentItem(serviceId,"Serviço",60,new BigDecimal("100.00")));appointment=appointments.save(a).getId();
    }
    String postJson(String path,String token,Object body,int status)throws Exception{return mvc.perform(post(path).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().is(status)).andReturn().getResponse().getContentAsString();}
    void open()throws Exception{postJson("/commercial/cash/open",adminToken,Map.of("amount",0),200);}
    Map<String,Object> payment(String key,String amount){return Map.of("appointmentId",appointment,"amount",amount,"method","CASH","kind","PAYMENT","reason","Recebimento","requestKey",key);}
    @Test void tenantCannotReadOrReverseOtherTenantPayment()throws Exception{
        open();String result=postJson("/commercial/payments",adminToken,payment("one","40.00"),200);UUID id=UUID.fromString(json.readTree(result).get("id").asText());
        mvc.perform(get("/commercial/finance").header("Authorization","Bearer "+otherToken)).andExpect(status().isOk()).andExpect(jsonPath("$.payments.length()").value(0));
        postJson("/commercial/payments/"+id+"/reverse",otherToken,Map.of("reason","Teste"),404);
    }
    @Test void repeatedPaymentDoesNotDuplicateMoneyOrPointsAndRejectsOverpayment()throws Exception{
        open();postJson("/commercial/payments",adminToken,payment("one","60.00"),200);postJson("/commercial/payments",adminToken,payment("one","60.00"),200);
        assertEquals(1,payments.findAllByTenantId(tenant).size());assertEquals(60,loyalty.findAllByTenantId(tenant).stream().mapToInt(l->l.points).sum());
        postJson("/commercial/payments",adminToken,payment("two","50.00"),400);
        postJson("/commercial/payments",adminToken,payment("two","40.00"),200);
    }
    @Test void closeCashFreezesExpectedAmountAndRejectsNewPayment()throws Exception{
        open();postJson("/commercial/payments",adminToken,payment("one","40.00"),200);
        String result=postJson("/commercial/cash/close",adminToken,Map.of("amount",35,"reason","Diferença conferida"),200);
        assertEquals(40,json.readTree(result).get("expectedAmount").asInt());
        postJson("/commercial/payments",adminToken,payment("two","10.00"),409);
    }
    @Test void reversalPreservesHistoryAndRevertsLoyalty()throws Exception{
        open();String paid=postJson("/commercial/payments",adminToken,payment("one","40.00"),200);String id=json.readTree(paid).get("id").asText();
        postJson("/commercial/payments/"+id+"/reverse",adminToken,Map.of("reason","Pagamento duplicado no caixa"),200);
        assertEquals(2,payments.findAllByTenantId(tenant).size());assertEquals(0,loyalty.findAllByTenantId(tenant).stream().mapToInt(l->l.points).sum());
        postJson("/commercial/payments/"+id+"/reverse",adminToken,Map.of("reason","Repetição"),400);
    }
    @Test void stockIsScopedAndCannotBecomeNegative()throws Exception{
        String created=postJson("/commercial/products",adminToken,Map.of("name","Pomada","sku","P1","category","Finalização","supplier","Exemplo","cost",10,"price",30,"minimumStock",2),200);
        String id=json.readTree(created).get("id").asText();
        Map<String,Object> entry=Map.of("productId",id,"quantity",3,"kind","ENTRY","reason","Compra","requestKey","entry");
        postJson("/commercial/stock",adminToken,entry,200);postJson("/commercial/stock",adminToken,entry,200);
        postJson("/commercial/stock",otherToken,entry,400);
        postJson("/commercial/stock",adminToken,Map.of("productId",id,"quantity",4,"kind","LOSS","reason","Avaria","requestKey","loss"),400);
        mvc.perform(get("/commercial/inventory").header("Authorization","Bearer "+adminToken)).andExpect(jsonPath("$.movements.length()").value(1));
    }
    @Test void redeemRequiresSufficientBalance()throws Exception{
        postJson("/commercial/loyalty/redeem",adminToken,Map.of("customerId",customer,"points",10,"reason","Brinde","requestKey","reward"),400);
    }
    @Test void customerOnlyReviewsOwnCompletedAppointmentOnce()throws Exception{
        postJson("/commercial/reviews",clientToken,Map.of("appointmentId",appointment,"rating",5,"comment","Ótimo atendimento"),200);
        postJson("/commercial/reviews",clientToken,Map.of("appointmentId",appointment,"rating",4,"comment","Segunda tentativa"),400);
        mvc.perform(get("/commercial/finance").header("Authorization","Bearer "+clientToken)).andExpect(status().isForbidden());
        mvc.perform(get("/platform/plans").header("Authorization","Bearer "+adminToken)).andExpect(status().isForbidden());
        mvc.perform(get("/platform/metrics").header("Authorization","Bearer "+platformToken)).andExpect(status().isOk());
    }
    @Test void pendingReviewsPersistUntilSubmittedAndAreScoped() throws Exception {
        for (int attempt=0;attempt<2;attempt++) {
            mvc.perform(get("/commercial/reviews/pending").header("Authorization","Bearer "+clientToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].appointmentId").value(appointment.toString()))
                .andExpect(jsonPath("$[0].barberId").value(barberId.toString()));
        }
        String stranger=jwt.generateTokemn(user(Role.CLIENT,tenant));
        mvc.perform(get("/commercial/reviews/pending").header("Authorization","Bearer "+stranger))
            .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        postJson("/commercial/reviews",stranger,Map.of("appointmentId",appointment,"rating",5),403);
        postJson("/commercial/reviews",clientToken,Map.of("appointmentId",appointment,"rating",5),200);
        mvc.perform(get("/commercial/reviews/pending").header("Authorization","Bearer "+clientToken)).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/commercial/reviews").header("Authorization","Bearer "+adminToken))
            .andExpect(jsonPath("$[0].barberName").value("Profissional"))
            .andExpect(jsonPath("$[0].customerName").value("Cliente Exemplo"));
        String list=mvc.perform(get("/commercial/reviews").header("Authorization","Bearer "+adminToken)).andReturn().getResponse().getContentAsString();
        String reviewId=json.readTree(list).get(0).get("id").asText();
        mvc.perform(get("/commercial/reviews").header("Authorization","Bearer "+otherToken)).andExpect(jsonPath("$.length()").value(0));
        postJson("/commercial/reviews/"+reviewId+"/reply",otherToken,Map.of("reason","Resposta"),404);
        mvc.perform(get("/commercial/reviews").header("Authorization","Bearer "+clientToken)).andExpect(status().isForbidden());
    }

    @Test void unfinishedAppointmentsAndInvalidRatingsCannotBeReviewed() throws Exception {
        var a=appointments.findById(appointment).orElseThrow();a.setStatus(AppointmentStatus.CONFIRMED);appointments.save(a);
        mvc.perform(get("/commercial/reviews/pending").header("Authorization","Bearer "+clientToken)).andExpect(jsonPath("$.length()").value(0));
        postJson("/commercial/reviews",clientToken,Map.of("appointmentId",appointment,"rating",5),400);
        a.setStatus(AppointmentStatus.COMPLETED);appointments.save(a);
        postJson("/commercial/reviews",clientToken,Map.of("appointmentId",appointment,"rating",0),400);
        postJson("/commercial/reviews",clientToken,Map.of("appointmentId",appointment,"rating",6),400);
        postJson("/commercial/reviews",clientToken,Map.of("appointmentId",appointment,"rating",5,"comment","x".repeat(1001)),400);
    }
    @Test void invalidMoneyAndDuplicateOpenAreRejected()throws Exception{
        postJson("/commercial/cash/open",adminToken,Map.of("amount",-1),400);open();postJson("/commercial/cash/open",adminToken,Map.of("amount",0),400);
        postJson("/commercial/payments",adminToken,payment("bad","0.001"),400);
    }
    @Test void sameIdempotencyKeyWithDifferentPayloadIsRejected()throws Exception{
        open();postJson("/commercial/payments",adminToken,payment("one","40.00"),200);
        postJson("/commercial/payments",adminToken,payment("one","50.00"),409);
    }
    @Test void stockSaleAndReversalUpdateBothLedgers()throws Exception{
        open();String created=postJson("/commercial/products",adminToken,Map.of("name","Produto","sku","SALE","category","Categoria","supplier","Fornecedor","cost",10,"price",30,"minimumStock",1),200);String id=json.readTree(created).get("id").asText();
        postJson("/commercial/stock",adminToken,Map.of("productId",id,"quantity",2,"kind","ENTRY","reason","Compra","requestKey","stock"),200);
        String sold=postJson("/commercial/sales",adminToken,Map.of("productId",id,"quantity",1,"method","CASH","reason","Venda","requestKey","sale"),200);
        mvc.perform(get("/commercial/inventory").header("Authorization","Bearer "+adminToken)).andExpect(jsonPath("$.balances['"+id+"']").value(1));
        postJson("/commercial/payments/"+json.readTree(sold).get("id").asText()+"/reverse",adminToken,Map.of("reason","Devolução"),200);
        mvc.perform(get("/commercial/inventory").header("Authorization","Bearer "+adminToken)).andExpect(jsonPath("$.balances['"+id+"']").value(2));
    }
    @Test void subscriptionSuspensionBlocksTenantButNotPlatform()throws Exception{
        String p=postJson("/platform/plans",platformToken,Map.of("name","Inicial","monthlyPrice",49,"barberLimit",2),200);
        postJson("/platform/subscriptions",platformToken,Map.of("tenantId",tenant,"planId",json.readTree(p).get("id").asText(),"status","SUSPENDED","startsOn","2020-01-01","endsOn","2099-01-01","reason","Pausa solicitada"),200);
        mvc.perform(get("/commercial/finance").header("Authorization","Bearer "+adminToken)).andExpect(status().isForbidden());
        mvc.perform(get("/platform/subscriptions").header("Authorization","Bearer "+platformToken)).andExpect(status().isOk());
    }
    @Test void fractionalLimitsAreRejected()throws Exception{
        postJson("/platform/plans",platformToken,Map.of("name","Inválido","monthlyPrice",49,"barberLimit",2.5),400);
    }
    @Test void barberEndpointsRejectOtherTenantAndSelfCommissionChanges()throws Exception{
        mvc.perform(get("/barbers/"+barberId).header("Authorization","Bearer "+otherToken)).andExpect(status().isNotFound());
        mvc.perform(get("/barbers?unitId="+unitId).header("Authorization","Bearer "+otherToken)).andExpect(status().isNotFound());
        String token=jwt.generateTokemn(barbers.findById(barberId).orElseThrow().getUser());
        mvc.perform(patch("/barbers/"+barberId).header("Authorization","Bearer "+token).contentType(MediaType.APPLICATION_JSON).content("{\"defaultCommissionPercent\":100}")).andExpect(status().isForbidden());
    }
    @Test void catalogRestrictsAvailabilityAndCannotReferenceAnotherTenant()throws Exception{
        mvc.perform(put("/commercial/barbers/"+barberId+"/catalog").header("Authorization","Bearer "+adminToken).contentType(MediaType.APPLICATION_JSON).content("{\"restricted\":true,\"serviceIds\":[]}")).andExpect(status().isOk());
        mvc.perform(get("/barbers/"+barberId+"/availability?date=2026-10-01&serviceId="+serviceId).header("Authorization","Bearer "+clientToken)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/commercial/barbers/"+barberId+"/catalog").header("Authorization","Bearer "+otherToken)).andExpect(status().isNotFound());
    }
    @Test void settingsPersistAndRejectStaleVersions()throws Exception{
        String body="{\"minimumNoticeHours\":2,\"cancellationNoticeHours\":12,\"defaultCommissionPercent\":35,\"staffNotifications\":false}";
        mvc.perform(put("/commercial/settings").header("Authorization","Bearer "+adminToken).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isOk());
        mvc.perform(get("/commercial/settings").header("Authorization","Bearer "+adminToken)).andExpect(jsonPath("$.minimumNoticeHours").value(2));
        mvc.perform(put("/commercial/settings").header("Authorization","Bearer "+adminToken).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isBadRequest());
    }
    @Test void planBarberLimitBlocksNewProfessional()throws Exception{
        String p=postJson("/platform/plans",platformToken,Map.of("name","Individual","monthlyPrice",49,"barberLimit",1),200);
        postJson("/platform/subscriptions",platformToken,Map.of("tenantId",tenant,"planId",json.readTree(p).get("id").asText(),"status","ACTIVE","startsOn","2020-01-01","endsOn","2099-01-01","reason","Plano contratado"),200);
        User extra=user(Role.BARBER,tenant);postJson("/barbers",adminToken,Map.of("userId",extra.getId(),"unitId",unitId,"displayName","Segundo profissional","defaultCommissionPercent",40),409);
    }
    @Test void publicRegistrationRequiresEmailConfirmation()throws Exception{
        Map<String,Object> body=Map.of("tradeName","Nova Empresa","defaultTimeZone","America/Sao_Paulo","locale","pt-BR","currency","BRL","admin",Map.of("fullName","Admin Exemplo","email","register@example.com","password","password123","role","ADMIN"),"initialUnit",Map.of("name","Principal","timeZone","America/Sao_Paulo","active",true));
        mvc.perform(post("/tenants").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isCreated());
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"register@example.com\",\"password\":\"password123\"}")).andExpect(status().isForbidden()).andExpect(jsonPath("$.message").value("EMAIL_NOT_VERIFIED"));
    }
    @Test void stockAndRewardRejectReusedKeyWithChangedPayload()throws Exception{
        String created=postJson("/commercial/products",adminToken,Map.of("name","Pomada","sku","IDEMP","category","Finalização","supplier","Exemplo","cost",10,"price",30,"minimumStock",2),200);
        String id=json.readTree(created).get("id").asText();
        postJson("/commercial/stock",adminToken,Map.of("productId",id,"quantity",3,"kind","ENTRY","reason","Compra","requestKey","entry"),200);
        postJson("/commercial/stock",adminToken,Map.of("productId",id,"quantity",30,"kind","ENTRY","reason","Compra","requestKey","entry"),409);
        open();postJson("/commercial/payments",adminToken,payment("paid","100.00"),200);
        var reward=Map.of("customerId",customer,"points",10,"reason","Brinde","requestKey","reward");
        postJson("/commercial/loyalty/redeem",adminToken,reward,200);postJson("/commercial/loyalty/redeem",adminToken,reward,200);
        postJson("/commercial/loyalty/redeem",adminToken,Map.of("customerId",customer,"points",20,"reason","Brinde","requestKey","reward"),409);
        assertEquals(90,loyalty.findAllByTenantId(tenant).stream().mapToInt(l->l.points).sum());
    }
    @Test void archivedProductCannotBeSoldAndStaleEditFails()throws Exception{
        var product=Map.of("name","Pomada","sku","EDIT","category","Finalização","supplier","Exemplo","cost",10,"price",30,"minimumStock",2);
        var created=json.readTree(postJson("/commercial/products",adminToken,product,200));String id=created.get("id").asText();
        var edit=Map.of("product",product,"active",false,"version",created.get("version").asLong());
        mvc.perform(put("/commercial/products/"+id).header("Authorization","Bearer "+adminToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(edit))).andExpect(status().isOk());
        // The enclosing test transaction does not commit between HTTP calls.
        entityManager.flush();
        mvc.perform(put("/commercial/products/"+id).header("Authorization","Bearer "+adminToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(edit))).andExpect(status().isConflict());
        mvc.perform(put("/commercial/products/"+id).header("Authorization","Bearer "+otherToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(edit))).andExpect(status().isNotFound());
        postJson("/commercial/sales",adminToken,Map.of("productId",id,"quantity",1,"method","CASH","reason","Venda","requestKey","sale"),404);
    }
    @Test void minimumNoticeFiltersCustomerSlotsButStaffCanOverride()throws Exception{
        var date=java.time.LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo")).plusDays(2);
        mvc.perform(put("/barbers/"+barberId+"/work-schedules").header("Authorization","Bearer "+adminToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(List.of(Map.of("weekday",date.getDayOfWeek().getValue()-1,"startTime","09:00","endTime","10:00"))))).andExpect(status().isOk());
        mvc.perform(put("/commercial/settings").header("Authorization","Bearer "+adminToken).contentType(MediaType.APPLICATION_JSON).content("{\"minimumNoticeHours\":720,\"cancellationNoticeHours\":0,\"defaultCommissionPercent\":40,\"staffNotifications\":true}")).andExpect(status().isOk());
        String path="/barbers/"+barberId+"/availability?date="+date+"&serviceId="+serviceId;
        mvc.perform(get(path).header("Authorization","Bearer "+clientToken)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get(path).header("Authorization","Bearer "+adminToken)).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(3));
    }
    @Test void archivedPlanBlocksNewContractsButAllowsExistingCancellation()throws Exception{
        var plan=json.readTree(postJson("/platform/plans",platformToken,Map.of("name","Antigo","monthlyPrice",49,"barberLimit",2),200));String id=plan.get("id").asText();
        var contract=json.readTree(postJson("/platform/subscriptions",platformToken,Map.of("tenantId",tenant,"planId",id,"status","ACTIVE","startsOn","2020-01-01","endsOn","2099-01-01","reason","Adesão"),200));
        mvc.perform(put("/platform/plans/"+id+"/status").header("Authorization","Bearer "+platformToken).contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("active",false,"version",plan.get("version").asLong())))).andExpect(status().isOk());
        postJson("/platform/subscriptions",platformToken,Map.of("tenantId",tenant,"planId",id,"status","CANCELED","startsOn","2020-01-01","endsOn","2099-01-01","reason","Cancelamento","version",contract.get("version").asLong()),200);
        UUID other=tenants.save(new Tenant(null,"Nova Empresa",null,null,"America/Sao_Paulo","pt-BR","BRL",null,null)).getId();
        postJson("/platform/subscriptions",platformToken,Map.of("tenantId",other,"planId",id,"status","ACTIVE","startsOn","2020-01-01","endsOn","2099-01-01","reason","Adesão"),400);
    }
    @Test void receiptShowsPartialPaymentAndRespectsTenantScope()throws Exception{
        open();postJson("/commercial/payments",adminToken,payment("receipt","40.00"),200);
        mvc.perform(get("/commercial/receipts/"+appointment).header("Authorization","Bearer "+adminToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$.establishment").value("Empresa Exemplo"))
                .andExpect(jsonPath("$.items[0].name").value("Serviço"))
                .andExpect(jsonPath("$.paid").value(40)).andExpect(jsonPath("$.remaining").value(60))
                .andExpect(jsonPath("$.fiscal").value(false));
        mvc.perform(get("/commercial/receipts/"+appointment).header("Authorization","Bearer "+otherToken)).andExpect(status().isNotFound());
    }
    @Test void inactiveProfessionalCannotReceiveNewAppointments()throws Exception{
        barbers.findById(barberId).orElseThrow().setStatus(com.backend.barbers.BarberStatus.INACTIVE);
        String result=postJson("/appointments",adminToken,Map.of("customerId",customer,"unitId",unitId,"barberId",barberId,"channel","ADMIN","startAt",LocalDateTime.now().plusDays(2).toString(),"items",List.of(Map.of("serviceId",serviceId))),400);
        assertEquals("Profissional indisponível nesta unidade",json.readTree(result).get("message").asText());
    }
}
