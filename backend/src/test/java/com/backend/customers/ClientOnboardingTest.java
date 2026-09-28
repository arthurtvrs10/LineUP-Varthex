package com.backend.customers;

import com.backend.auth.jwt.JwtService;
import com.backend.barbers.*;
import com.backend.notifications.NotificationRepository;
import com.backend.scheduling.AppointmentRepository;
import com.backend.services.*;
import com.backend.tenants.*;
import com.backend.units.*;
import com.backend.users.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// Deliberately no test transaction: assertions observe real commits/rollbacks and row locks.
@SpringBootTest
@AutoConfigureMockMvc
class ClientOnboardingTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired TenantRepository tenants;
    @Autowired UnitRepository units;
    @Autowired BarberRepository barbers;
    @Autowired ServiceOfferingRepository services;
    @Autowired CustomerRepository customers;
    @Autowired UserRepository users;
    @Autowired AppointmentRepository appointments;
    @Autowired NotificationRepository notifications;
    @Autowired PasswordEncoder passwords;
    @Autowired JwtService jwt;
    @Autowired JdbcTemplate jdbc;
    @Autowired PlatformTransactionManager transactions;
    private final List<Shop> shops = new ArrayList<>();
    private final List<UUID> userIds = new ArrayList<>();
    private User client;
    private String token;
    private record Shop(Tenant tenant, UUID unit, UUID barber, UUID service, String adminToken) {}

    @BeforeEach void setup() {
        client = user(Role.CLIENT, null);
        token = jwt.generateTokemn(client);
        shops.add(shop());
        shops.add(shop());
    }

    private User user(Role role, UUID tenant) {
        User u = users.save(new User(null, "Cliente Onboarding", UUID.randomUUID() + "@example.test",
                passwords.encode("teste-seguro"), role, UserStatus.ACTIVE, tenant, null, null, null));
        userIds.add(u.getId());
        return u;
    }

    private Shop shop() {
        Tenant t = tenants.save(new Tenant(null, "Onboarding " + UUID.randomUUID(), null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null));
        Unit u = units.save(new Unit(null, t, "Centro", "America/Sao_Paulo", true));
        User barberUser = user(Role.BARBER, t.getId());
        BarberProfile b = new BarberProfile();
        b.setUser(barberUser); b.setUnit(u); b.setDisplayName("Profissional");
        b.setDefaultCommissionPercent(0); b.setStatus(BarberStatus.ACTIVE);
        UUID barber = barbers.save(b).getId();
        UUID service = services.save(new ServiceOffering(null, t.getId(), null, null, ServiceType.SERVICE,
                "Corte", null, 30, 0, 0, new BigDecimal("50.00"), 0, true)).getId();
        return new Shop(t, u.getId(), barber, service, jwt.generateTokemn(user(Role.ADMIN, t.getId())));
    }

    private String body(Shop s, int hour) {
        return """
                {"unitId":"%s","barberId":"%s","customerId":"%s","startAt":"%s",
                 "channel":"CLIENT_WEB","items":[{"serviceId":"%s"}]}
                """.formatted(s.unit, s.barber, UUID.randomUUID(),
                LocalDateTime.now().plusDays(10).withHour(hour).withMinute(0).withSecond(0).withNano(0), s.service);
    }

    private String book(Shop s, String bearer, int hour) throws Exception {
        return mvc.perform(post("/appointments").header("Authorization", "Bearer " + bearer)
                        .header("X-Barbershop-Id", s.tenant.getId()).contentType(MediaType.APPLICATION_JSON).content(body(s, hour)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
    }

    @Test void registersClientWithoutTenantOrCustomerAndRejectsDuplicateEmail() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        String input = """
                {"fullName":"Novo Cliente","email":"%s","password":"senha-segura","role":"ADMIN","tenantId":"%s"}
                """.formatted(email, shops.getFirst().tenant.getId());
        mvc.perform(post("/auth/register-client").contentType(MediaType.APPLICATION_JSON).content(input)).andExpect(status().isCreated());
        User registered = users.findByEmail(email).orElseThrow(); userIds.add(registered.getId());
        assertEquals(Role.CLIENT, registered.getRole()); assertNull(registered.getTenantId());
        assertTrue(customers.findByTenantIdAndUserId(shops.getFirst().tenant.getId(), registered.getId()).isEmpty());
        mvc.perform(post("/auth/register-client").contentType(MediaType.APPLICATION_JSON).content(input.replace(email, email.toUpperCase(Locale.ROOT))))
                .andExpect(status().isConflict());
        mvc.perform(post("/auth/register-client").contentType(MediaType.APPLICATION_JSON).content("{\"fullName\":\"A\",\"email\":\"invalid\",\"password\":\"1\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test void initialChoiceIsRequiredOnlyWithoutSavedShopOrStaffRecord() throws Exception {
        mvc.perform(get("/me/barbershop-selection").header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
        Shop a = shops.getFirst();
        customers.save(new Customer(null, a.tenant.getId(), "Cadastro pela equipe", client.getEmail(), null, null, null));
        mvc.perform(get("/me/barbershop-selection").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(a.tenant.getId().toString()));
        // Recognizing the shop must not expose CRM history to an unverified account.
        mvc.perform(get("/me/customer").header("Authorization", "Bearer " + token).header("X-Barbershop-Id", a.tenant.getId()))
                .andExpect(status().isNotFound());
    }

    @Test void settingsChoicePersistsAcrossSessionsAndOverridesInitialStaffRecord() throws Exception {
        Shop a = shops.getFirst(), b = shops.getLast();
        customers.save(new Customer(null, a.tenant.getId(), "Cadastro pela equipe", client.getEmail(), null, null, null));
        mvc.perform(post("/me/barbershop-selection").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"tenantId\":\"" + b.tenant.getId() + "\"}"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(b.tenant.getId().toString()));
        String nextSession = jwt.generateTokemn(users.findById(client.getId()).orElseThrow());
        mvc.perform(get("/me/barbershop-selection").header("Authorization", "Bearer " + nextSession))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(b.tenant.getId().toString()));
        assertTrue(customers.findByTenantIdAndUserId(b.tenant.getId(), client.getId()).isEmpty());
        User another = user(Role.CLIENT, null);
        mvc.perform(get("/me/barbershop-selection").header("Authorization", "Bearer " + jwt.generateTokemn(another)))
                .andExpect(status().isNoContent());
    }

    @Test void savedUnavailableShopCanBeChangedFromSettingsWithoutRestartingOnboarding() throws Exception {
        Shop a = shops.getFirst(), b = shops.getLast();
        client.setPreferredTenantId(a.tenant.getId()); users.save(client);
        a.tenant.setStatus(TenantStatus.SUSPENDED); tenants.save(a.tenant);
        mvc.perform(get("/me/barbershop-selection").header("Authorization", "Bearer " + token).header("X-Barbershop-Id", a.tenant.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.id").value(a.tenant.getId().toString()));
        mvc.perform(post("/me/barbershop-selection").header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON).content("{\"tenantId\":\"" + a.tenant.getId() + "\"}"))
                .andExpect(status().isBadRequest());
        mvc.perform(post("/me/barbershop-selection").header("Authorization", "Bearer " + token).header("X-Barbershop-Id", a.tenant.getId())
                .contentType(MediaType.APPLICATION_JSON).content("{\"tenantId\":\"" + b.tenant.getId() + "\"}"))
                .andExpect(status().isOk());
    }

    @Test void firstBookingsCreateOneMembershipPerShopWithoutTrustingCustomerId() throws Exception {
        Shop a = shops.getFirst(), b = shops.getLast();
        book(a, token, 10); book(a, token, 11); book(b, token, 10);
        Customer ca = customers.findByTenantIdAndUserId(a.tenant.getId(), client.getId()).orElseThrow();
        Customer cb = customers.findByTenantIdAndUserId(b.tenant.getId(), client.getId()).orElseThrow();
        assertNotEquals(ca.getId(), cb.getId());
        assertEquals(1, customers.findAllByTenantIdAndEmailIgnoreCase(a.tenant.getId(), client.getEmail()).size());
        assertNull(users.findById(client.getId()).orElseThrow().getTenantId());
        mvc.perform(get("/me/customer").header("Authorization", "Bearer " + token).header("X-Barbershop-Id", b.tenant.getId()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.customerId").value(cb.getId().toString()));
    }

    @Test void reusesExistingVerifiedCustomerOnlyInSelectedShop() throws Exception {
        Shop a = shops.getFirst(), b = shops.getLast();
        Customer existing = customers.save(new Customer(null, a.tenant.getId(), "Cadastro antigo", client.getEmail(), "11999999999", null, "Anotação local"));
        Customer other = customers.save(new Customer(null, b.tenant.getId(), "Outro cadastro", client.getEmail(), null, null, null));
        client.verifyEmail(); users.save(client);
        book(a, token, 10);
        assertEquals(existing.getId(), customers.findByTenantIdAndUserId(a.tenant.getId(), client.getId()).orElseThrow().getId());
        assertEquals("Anotação local", customers.findById(existing.getId()).orElseThrow().getNotes());
        assertNull(customers.findById(other.getId()).orElseThrow().getUserId());
    }

    @Test void cannotClaimHistoricalRecordsWithUnverifiedEmail() throws Exception {
        Shop a = shops.getFirst();
        Customer old = customers.save(new Customer(null, a.tenant.getId(), "Histórico", client.getEmail(), null, null, null));
        mvc.perform(post("/appointments").header("Authorization", "Bearer " + token).header("X-Barbershop-Id", a.tenant.getId())
                .contentType(MediaType.APPLICATION_JSON).content(body(a, 10))).andExpect(status().isConflict());
        assertNull(customers.findById(old.getId()).orElseThrow().getUserId());
        assertEquals(1, customers.findAllByTenantIdAndEmailIgnoreCase(a.tenant.getId(), client.getEmail()).size());
    }

    @Test void slotConflictRollsBackNewMembershipAndExistingLink() throws Exception {
        Shop a = shops.getFirst(); book(a, token, 10);
        User newcomer = user(Role.CLIENT, null);
        String newcomerToken = jwt.generateTokemn(newcomer);
        mvc.perform(post("/appointments").header("Authorization", "Bearer " + newcomerToken).header("X-Barbershop-Id", a.tenant.getId())
                .contentType(MediaType.APPLICATION_JSON).content(body(a, 10))).andExpect(status().isConflict());
        assertTrue(customers.findByTenantIdAndUserId(a.tenant.getId(), newcomer.getId()).isEmpty());
        newcomer.verifyEmail(); users.save(newcomer);
        Customer old = customers.save(new Customer(null, a.tenant.getId(), "Antigo", newcomer.getEmail(), null, null, null));
        mvc.perform(post("/appointments").header("Authorization", "Bearer " + newcomerToken).header("X-Barbershop-Id", a.tenant.getId())
                .contentType(MediaType.APPLICATION_JSON).content(body(a, 10))).andExpect(status().isConflict());
        assertNull(customers.findById(old.getId()).orElseThrow().getUserId());
    }

    @Test void shopAndClientIsolationAlsoIgnoresStaffHeaderSpoofing() throws Exception {
        Shop a = shops.getFirst(), b = shops.getLast();
        String aId = json.readTree(book(a, token, 10)).get("id").asText(); book(b, token, 10);
        mvc.perform(get("/appointments/" + aId).header("Authorization", "Bearer " + token).header("X-Barbershop-Id", b.tenant.getId()))
                .andExpect(status().isNotFound());
        mvc.perform(get("/appointments/" + aId).header("Authorization", "Bearer " + b.adminToken).header("X-Barbershop-Id", a.tenant.getId()))
                .andExpect(status().isNotFound());
        UUID aCustomer = customers.findByTenantIdAndUserId(a.tenant.getId(), client.getId()).orElseThrow().getId();
        mvc.perform(get("/customers/" + aCustomer).header("Authorization", "Bearer " + b.adminToken).header("X-Barbershop-Id", a.tenant.getId()))
                .andExpect(status().isNotFound());
        User other = user(Role.CLIENT, null); String otherToken = jwt.generateTokemn(other); book(a, otherToken, 11);
        mvc.perform(get("/appointments/" + aId).header("Authorization", "Bearer " + otherToken).header("X-Barbershop-Id", a.tenant.getId()))
                .andExpect(status().isNotFound());
    }

    @Test void unavailableShopDoesNotBlockDiscoveryAndInvalidHeaderIsRejected() throws Exception {
        Shop a = shops.getFirst(); a.tenant.setStatus(TenantStatus.SUSPENDED); tenants.save(a.tenant);
        User legacy = user(Role.CLIENT, a.tenant.getId()); String legacyToken = jwt.generateTokemn(legacy);
        mvc.perform(get("/me/barbershops").param("q", a.tenant.getTradeName()).header("Authorization", "Bearer " + legacyToken))
                .andExpect(status().isOk()).andExpect(content().json("[]"));
        mvc.perform(get("/services").header("Authorization", "Bearer " + token).header("X-Barbershop-Id", a.tenant.getId()))
                .andExpect(status().isForbidden());
        mvc.perform(get("/services").header("Authorization", "Bearer " + token).header("X-Barbershop-Id", "invalid"))
                .andExpect(status().isBadRequest());
        mvc.perform(get("/me/barbershops").param("q", shops.getLast().tenant.getTradeName()).header("Authorization", "Bearer " + legacyToken))
                .andExpect(status().isOk()).andExpect(jsonPath("$[0].id").value(shops.getLast().tenant.getId().toString()))
                .andExpect(jsonPath("$[0].email").doesNotExist()).andExpect(jsonPath("$[0].document").doesNotExist());
    }

    @Test void concurrentFirstBookingsShareOneCustomer() throws Exception {
        Shop a = shops.getFirst(); CountDownLatch start = new CountDownLatch(1);
        try (ExecutorService pool = Executors.newFixedThreadPool(2)) {
            Future<String> one = pool.submit(() -> { start.await(); return book(a, token, 10); });
            Future<String> two = pool.submit(() -> { start.await(); return book(a, token, 11); });
            start.countDown(); one.get(20, TimeUnit.SECONDS); two.get(20, TimeUnit.SECONDS);
        }
        assertEquals(1, customers.findAllByTenantIdAndEmailIgnoreCase(a.tenant.getId(), client.getEmail()).size());
    }

    @AfterEach void cleanup() {
        Set<UUID> tenantIds = new HashSet<>(); shops.forEach(s -> tenantIds.add(s.tenant.getId()));
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            notifications.deleteAll(notifications.findAll().stream().filter(n -> tenantIds.contains(n.getTenantId())).toList());
            appointments.deleteAll(appointments.findAll().stream().filter(a -> tenantIds.contains(a.getTenantId())).toList());
            customers.deleteAll(customers.findAll().stream().filter(c -> tenantIds.contains(c.getTenantId())).toList());
            shops.forEach(s -> { barbers.deleteById(s.barber); services.deleteById(s.service); units.deleteById(s.unit); });
            for (UUID id : userIds) { jdbc.update("delete from refresh_tokens where user_id = ?", id); users.deleteById(id); }
            tenants.deleteAllById(tenantIds);
        });
    }
}
