package com.backend.whatsapp;

import com.backend.whatsapp.WhatsAppData.*;
import com.backend.tenants.*;
import com.backend.users.*;
import com.backend.auth.jwt.JwtService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"whatsapp.worker-enabled=false","whatsapp.encryption-key=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="})
@AutoConfigureMockMvc @Transactional
class WhatsAppTest {
 @Autowired EntityManager em; @Autowired TenantRepository tenants; @Autowired UserRepository users; @Autowired JwtService jwt;
 @Autowired WhatsAppService service; @Autowired WhatsAppWebhook webhook; @Autowired WhatsAppDelivery delivery; @Autowired WhatsAppCrypto crypto;
 @Autowired MockMvc mvc; @Autowired ObjectMapper json;
 @MockitoBean MetaWhatsAppClient meta;
 UUID tenant,other;String admin,otherAdmin,client;
 @BeforeEach void seed(){tenant=tenants.save(new Tenant(null,"Barbearia A",null,null,"America/Sao_Paulo","pt-BR","BRL",null,null)).getId();other=tenants.save(new Tenant(null,"Barbearia B",null,null,"America/Sao_Paulo","pt-BR","BRL",null,null)).getId();admin=token(Role.ADMIN,tenant);otherAdmin=token(Role.ADMIN,other);client=token(Role.CLIENT,tenant);}
 String token(Role role,UUID t){return jwt.generateTokemn(users.save(new User(null,"Teste",UUID.randomUUID()+"@example.test","unused",role,UserStatus.ACTIVE,t,null,null,null)));}
 void connect(){service.save(tenant,new WhatsAppService.Credentials("123","456","secret-access-token","secret-app"));em.find(Connection.class,tenant).status="CONNECTED";}
 Template template(){Template t=new Template();t.tenantId=tenant;t.metaId="789";t.name="teste";t.language="pt_BR";t.category="UTILITY";t.status="APPROVED";t.supported=true;t.body="Olá";em.persist(t);return t;}
 @Test void encryptsWithTenantBindingAndNeverReturnsCredentials() throws Exception {
  connect();Connection c=em.find(Connection.class,tenant);assertFalse(c.tokenEncrypted.contains("secret-access-token"));assertEquals("secret-access-token",crypto.decrypt(tenant,c.tokenEncrypted));assertThrows(Exception.class,()->crypto.decrypt(other,c.tokenEncrypted));
  String body=mvc.perform(get("/integrations/whatsapp").header("Authorization","Bearer "+admin)).andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
  assertFalse(body.contains("secret-access-token"));assertFalse(body.contains("secret-app"));assertFalse(body.contains(c.tokenEncrypted));
  mvc.perform(get("/integrations/whatsapp").header("Authorization","Bearer "+otherAdmin)).andExpect(jsonPath("$.configured").value(false));
  mvc.perform(get("/integrations/whatsapp").header("Authorization","Bearer "+client)).andExpect(status().isForbidden());
  mvc.perform(get("/integrations/whatsapp")).andExpect(status().isUnauthorized());
 }
 @Test void rejectsForeignTemplatesAndRequiresConsent(){connect();Template t=template();
  assertThrows(Exception.class,()->service.testMessage(other,new WhatsAppService.SendInput(t.id,"5511999999999",List.of(),"one",true)));
  assertThrows(Exception.class,()->service.enqueue(tenant,t,"5511999999999",List.of(),"one",null,null,null,null,false,Instant.now()));
  service.saveConsent(tenant,UUID.randomUUID(),new WhatsAppService.ConsentInput("5511999999999",true,false,false,"Formulário"));
  var first=service.enqueue(tenant,t,"5511999999999",List.of(),"same",null,null,null,null,false,Instant.now());
  var repeated=service.enqueue(tenant,t,"5511999999999",List.of(),"same",null,null,null,null,false,Instant.now());assertEquals(first.id,repeated.id);
  t.category="MARKETING";assertThrows(Exception.class,()->service.enqueue(tenant,t,"5511999999999",List.of(),"another",null,null,null,null,false,Instant.now()));
 }
 String signature(String payload)throws Exception{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec("secret-app".getBytes(StandardCharsets.UTF_8),"HmacSHA256"));return "sha256="+HexFormat.of().formatHex(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));}
 String event(String content){return "{\"entry\":[{\"id\":\"123\",\"changes\":[{\"value\":{\"metadata\":{\"phone_number_id\":\"456\"},"+content+"}}]}]}";}
 void receive(String payload)throws Exception{webhook.receive(tenant,payload.getBytes(StandardCharsets.UTF_8),signature(payload));}
 @Test void verifiesSignatureAndDeduplicatesIncomingOptOut()throws Exception{connect();Template t=template();Message m=service.testMessage(tenant,new WhatsAppService.SendInput(t.id,"5511999999999",List.of(),"one",true));
  String payload=event("\"messages\":[{\"id\":\"wamid.in\",\"from\":\"5511999999999\",\"type\":\"text\",\"text\":{\"body\":\"SAIR\"}}]");
  assertThrows(Exception.class,()->webhook.receive(tenant,payload.getBytes(StandardCharsets.UTF_8),"sha256=bad"));
  receive(payload);receive(payload);assertEquals(2,service.messages(tenant).size());assertTrue(service.consent(tenant,"5511999999999").blocked);em.refresh(m);assertEquals("CANCELED",m.status);
  assertTrue(service.messages(other).isEmpty());
 }
 @Test void statusEventsNeverRegressAndCannotUpdateAnotherShop()throws Exception{connect();Message m=new Message();m.tenantId=tenant;m.phone="5511999999999";m.metaId="wamid.out";em.persist(m);
  receive(event("\"statuses\":[{\"id\":\"wamid.out\",\"status\":\"read\"}]"));receive(event("\"statuses\":[{\"id\":\"wamid.out\",\"status\":\"sent\"}]"));assertEquals("READ",m.status);assertNotNull(m.deliveredAt);
  Message foreign=new Message();foreign.tenantId=other;foreign.metaId="foreign";em.persist(foreign);receive(event("\"statuses\":[{\"id\":\"foreign\",\"status\":\"read\"}]"));assertEquals("QUEUED",foreign.status);
 }
 @Test void testsConnectionAgainstOwnedNumbersWithoutSendingMessages(){connect();when(meta.call(eq("GET"),eq("123/phone_numbers"),anyString(),anyMap(),isNull())).thenReturn(json.readTree("{\"data\":[{\"id\":\"456\",\"display_phone_number\":\"+5511999999999\"}]}"));
  assertEquals("CONNECTED",service.test(tenant).status());verify(meta,never()).call(eq("POST"),anyString(),any(),anyMap(),any());
 }
 @Test void rejectsPhoneFromAnotherWabaAndDoesNotExposeMetaErrors(){connect();when(meta.call(eq("GET"),eq("123/phone_numbers"),anyString(),anyMap(),isNull())).thenReturn(json.readTree("{\"data\":[{\"id\":\"999\"}]}"));assertEquals("NUMBER_NOT_FOUND",service.test(tenant).status());}
 @Test void importsOnlySupportedApprovedTextTemplates(){connect();when(meta.call(eq("GET"),eq("123/message_templates"),anyString(),anyMap(),isNull())).thenReturn(json.readTree("""
  {"data":[{"id":"1","name":"hello","status":"APPROVED","language":"pt_BR","category":"UTILITY","components":[{"type":"BODY","text":"Olá {{1}}"}]},{"id":"2","name":"image","status":"APPROVED","language":"pt_BR","category":"MARKETING","components":[{"type":"HEADER","format":"IMAGE"},{"type":"BODY","text":"Promoção"}]}]}
  """));var templates=service.sync(tenant);assertEquals(2,templates.size());assertTrue(templates.stream().filter(t->t.metaId.equals("1")).findFirst().orElseThrow().supported);assertFalse(templates.stream().filter(t->t.metaId.equals("2")).findFirst().orElseThrow().supported);assertTrue(service.templates(other).isEmpty());}
 @Test void replyingRequiresInboundWindowAndOptOutIsHonored()throws Exception{connect();assertThrows(Exception.class,()->service.reply(tenant,new WhatsAppService.ReplyInput("5511999999999","Olá","one")));
  receive(event("\"messages\":[{\"id\":\"wamid.question\",\"from\":\"5511999999999\",\"type\":\"text\",\"text\":{\"body\":\"Olá\"}}]"));
  assertEquals("QUEUED",service.reply(tenant,new WhatsAppService.ReplyInput("5511999999999","Bem-vindo","two")).status);
  receive(event("\"messages\":[{\"id\":\"wamid.stop\",\"from\":\"5511999999999\",\"type\":\"text\",\"text\":{\"body\":\"PARAR\"}}]"));
  assertThrows(Exception.class,()->service.reply(tenant,new WhatsAppService.ReplyInput("5511999999999","Nova","three")));
 }
 @Test void futureQueueAndBlockedRecipientAreNotDispatched(){connect();Template t=template();Message m=service.testMessage(tenant,new WhatsAppService.SendInput(t.id,"5511999999999",List.of(),"future",true));m.scheduledAt=Instant.now().plusSeconds(3600);em.flush();assertNull(delivery.claim(m.id));m.scheduledAt=Instant.now().minusSeconds(1);service.saveConsent(tenant,UUID.randomUUID(),new WhatsAppService.ConsentInput(m.phone,false,false,true,"Pedido do cliente"));em.flush();assertNull(delivery.claim(m.id));assertEquals("CANCELED",m.status);}
 @Test void dispatchClaimsOnceAndDisconnectCancelsQueue(){connect();Template t=template();Message m=service.testMessage(tenant,new WhatsAppService.SendInput(t.id,"5511999999999",List.of(),"one",true));em.flush();assertNotNull(delivery.claim(m.id));assertNull(delivery.claim(m.id));delivery.finish(new WhatsAppDelivery.Dispatch(m.id,tenant,"456","unused",Map.of()),null,"NETWORK",true);assertEquals("UNKNOWN",m.status);
  Message queued=service.testMessage(tenant,new WhatsAppService.SendInput(t.id,"5511888888888",List.of(),"two",true));em.flush();service.disconnect(tenant);em.refresh(queued);assertEquals("CANCELED",queued.status);assertNull(em.find(Connection.class,tenant).tokenEncrypted);
 }
}
