package com.backend.barbers.auth;

import com.backend.email.EmailService;
import com.backend.users.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.flyway.enabled=false","spring.jpa.show-sql=false","asaas.worker-enabled=false"})
@AutoConfigureMockMvc
class EmailVerificationTest {
    @Autowired AuthService auth;
    @Autowired EmailVerificationService verification;
    @Autowired EmailVerificationRepository tokens;
    @Autowired UserRepository users;
    @Autowired PasswordEncoder encoder;
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired PlatformTransactionManager tm;
    @MockitoBean EmailService emailService;
    String address;
    List<String> links;
    @BeforeEach void prepare(){
        address=UUID.randomUUID()+"@example.com";links=new CopyOnWriteArrayList<>();
        when(emailService.sendVerificationEmail(anyString(),anyString())).thenAnswer(inv->{links.add(inv.getArgument(1));return true;});
    }
    void register(){auth.registerClient(new AuthService.ClientRegistration("Cliente Teste",address,"password123"));}
    String raw(){return links.getLast().split("#token=")[1];}
    User user(){return users.findByEmail(address).orElseThrow();}
    void allowResend(){var token=tokens.findById(user().getId()).orElseThrow();token.sentAt=LocalDateTime.now().minusMinutes(2);tokens.save(token);}
    @Test void clientMustConfirmBeforeLoginAndLinkIsSingleUse() throws Exception {
        register();assertEquals(1,links.size());assertTrue(user().needsEmailVerification());
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email",address,"password","password123")))).andExpect(status().isForbidden()).andExpect(jsonPath("$.message").value("EMAIL_NOT_VERIFIED"));
        var token=tokens.findById(user().getId()).orElseThrow();assertNotEquals(raw(),token.tokenHash);
        mvc.perform(post("/auth/email-verification/confirm").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("token",raw())))).andExpect(status().isOk());
        assertFalse(user().needsEmailVerification());assertTrue(user().isEmailVerified());
        assertThrows(ResponseStatusException.class,()->verification.confirm(raw()));
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email",address,"password","password123")))).andExpect(status().isOk()).andExpect(jsonPath("$.accessToken").isNotEmpty());
    }
    @Test void loginNormalizesEmailAndRefreshCannotBypassVerification() throws Exception {
        register();String value=raw();
        verification.confirm(value);
        var response=mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email"," "+address.toUpperCase(Locale.ROOT)+" ","password","password123")))).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        var loggedIn=users.findByEmail(address).orElseThrow();
        // A session must not bypass the gate if verification becomes required.
        var field=User.class.getDeclaredField("emailVerified");field.setAccessible(true);field.setBoolean(loggedIn,false);users.save(loggedIn);
        assertThrows(ResponseStatusException.class,()->auth.refresh(json.readTree(response).get("refreshToken").asText(),"test"));
    }
    @Test void establishmentRegistrationAlsoSendsConfirmation() throws Exception {
        var body=Map.of("tradeName","Email Test","defaultTimeZone","America/Sao_Paulo","locale","pt-BR","currency","BRL",
            "admin",Map.of("fullName","Administrador","email",address,"password","password123","role","ADMIN"),
            "initialUnit",Map.of("name","Principal","timeZone","America/Sao_Paulo","active",true));
        mvc.perform(post("/tenants").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(body))).andExpect(status().isCreated());
        assertEquals(Role.ADMIN,user().getRole());assertTrue(user().needsEmailVerification());assertEquals(1,links.size());
        verification.confirm(raw());assertFalse(user().needsEmailVerification());
    }
    @Test void resendHasCooldownRotatesTokenAndDoesNotExposeUnknownAccounts() throws Exception {
        register();String old=raw();verification.resend(address);assertEquals(1,links.size());
        allowResend();verification.resend(address);assertEquals(2,links.size());assertNotEquals(old,raw());
        assertThrows(ResponseStatusException.class,()->verification.confirm(old));verification.confirm(raw());
        verification.resend(address);assertEquals(2,links.size());
        mvc.perform(post("/auth/email-verification/resend").contentType(MediaType.APPLICATION_JSON).content("{\"email\":\"unknown@example.com\"}")).andExpect(status().isOk()).andExpect(content().string(""));
    }
    @Test void expiredAndInvalidTokensDoNotVerifyAccount(){
        register();var t=tokens.findById(user().getId()).orElseThrow();t.expiresAt=LocalDateTime.now().minusSeconds(1);tokens.save(t);
        assertThrows(ResponseStatusException.class,()->verification.confirm(raw()));
        assertThrows(ResponseStatusException.class,()->verification.confirm("not-a-token"));assertTrue(user().needsEmailVerification());
    }
    @Test void deliveryFailureKeepsRegistrationAndResendDoesNotDestroyOldToken(){
        when(emailService.sendVerificationEmail(anyString(),anyString())).thenReturn(false);
        register();assertTrue(user().needsEmailVerification());allowResend();String old=tokens.findById(user().getId()).orElseThrow().tokenHash;
        assertThrows(ResponseStatusException.class,()->verification.resend(address));assertEquals(old,tokens.findById(user().getId()).orElseThrow().tokenHash);
    }
    @Test void rolledBackRegistrationNeverSendsEmail(){
        new TransactionTemplate(tm).execute(status->{auth.registerClient(new AuthService.ClientRegistration("Teste",address,"password123"));status.setRollbackOnly();return null;});
        assertTrue(users.findByEmail(address).isEmpty());verify(emailService,never()).sendVerificationEmail(anyString(),anyString());
    }
    @Test void twoConcurrentConfirmationsOnlyConsumeTokenOnce() throws Exception {
        register();String value=raw();var pool=Executors.newFixedThreadPool(2);var start=new CountDownLatch(1);
        Callable<Boolean> task=()->{start.await();try{verification.confirm(value);return true;}catch(ResponseStatusException e){return false;}};
        try{var a=pool.submit(task);var b=pool.submit(task);start.countDown();assertNotEquals(a.get(10,TimeUnit.SECONDS),b.get(10,TimeUnit.SECONDS));}finally{pool.shutdownNow();}
    }
    @Test void existingAccountsKeepAccess() throws Exception {
        users.save(new User(null,"Legado",address,encoder.encode("password123"),Role.CLIENT,UserStatus.ACTIVE,null,null,null,null));
        mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of("email",address,"password","password123")))).andExpect(status().isOk());
    }
}
