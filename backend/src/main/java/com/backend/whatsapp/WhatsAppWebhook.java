package com.backend.whatsapp;

import com.backend.whatsapp.WhatsAppData.*;
import jakarta.persistence.EntityManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.JsonNode;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;

@Service @Transactional
public class WhatsAppWebhook {
    private final EntityManager em;private final WhatsAppService service;private final WhatsAppCrypto crypto;private final ObjectMapper json;
    public WhatsAppWebhook(EntityManager em,WhatsAppService service,WhatsAppCrypto crypto,ObjectMapper json){this.em=em;this.service=service;this.crypto=crypto;this.json=json;}
    public String verify(UUID tenant,String mode,String token,String challenge){
        boolean valid=false;
        if(tenant==null)valid=!service.sharedVerify.isBlank()&&equal(service.sharedVerify,token);
        else {service.lock(tenant);Connection c=em.find(Connection.class,tenant);valid=c!=null&&c.verifyHash!=null&&token!=null&&equal(c.verifyHash,WhatsAppCrypto.hash(token));if(valid)c.webhookVerified=true;}
        if(!"subscribe".equals(mode)||!valid)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Verificação inválida");return challenge;
    }
    static boolean equal(String a,String b){return a!=null&&b!=null&&MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8),b.getBytes(StandardCharsets.UTF_8));}
    public static boolean signed(String secret,byte[] payload,String signature){
        if(secret==null||secret.isBlank()||signature==null)return false;
        try{Mac mac=Mac.getInstance("HmacSHA256");mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8),"HmacSHA256"));return equal("sha256="+HexFormat.of().formatHex(mac.doFinal(payload)),signature);}catch(Exception e){return false;}
    }
    public void receive(UUID tenant,byte[] body,String signature){
        if(body.length>1048576)throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE);
        Connection manual=tenant==null?null:em.find(Connection.class,tenant);
        String secret=tenant==null?service.appSecret:manual!=null&&manual.secretEncrypted!=null?crypto.decrypt(tenant,manual.secretEncrypted):"";
        if(!signed(secret,body,signature))throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Assinatura inválida");
        JsonNode root;try{root=json.readTree(body);}catch(Exception e){throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Evento inválido");}
        for(JsonNode entry:root.path("entry"))for(JsonNode change:entry.path("changes")){
            JsonNode value=change.path("value");String phoneId=value.path("metadata").path("phone_number_id").asText();
            Connection c=manual;
            if(c==null)c=em.createQuery("select c from WaConnection c where c.phoneId=:p and c.mode='EMBEDDED'",Connection.class).setParameter("p",phoneId).getResultStream().findFirst().orElse(null);
            if(c==null||c.tokenEncrypted==null||!Objects.equals(c.phoneId,phoneId)||!Objects.equals(c.wabaId,entry.path("id").asText()))continue;
            service.lock(c.tenantId);c.webhookVerified=true;c.webhookAt=Instant.now();
            for(JsonNode status:value.path("statuses"))status(c,status);
            for(JsonNode message:value.path("messages"))inbound(c,message);
        }
    }
    private void status(Connection c,JsonNode event){
        String metaId=event.path("id").asText();
        Message m=em.createQuery("select m from WaMessage m where m.tenantId=:t and m.metaId=:id",Message.class).setParameter("t",c.tenantId).setParameter("id",metaId).getResultStream().findFirst().orElse(null);
        if(m==null){try{Message candidate=em.find(Message.class,UUID.fromString(event.path("biz_opaque_callback_data").asText()));if(candidate!=null&&c.tenantId.equals(candidate.tenantId)&&Objects.equals(candidate.phone,event.path("recipient_id").asText())&&Set.of("SENDING","UNKNOWN").contains(candidate.status)){m=candidate;m.metaId=metaId;}}catch(IllegalArgumentException ignored){}}
        if(m==null||!"OUTBOUND".equals(m.direction))return;
        Instant at=time(event);String status=event.path("status").asText();
        switch(status){
            case "read" -> {m.readAt=at;if(m.deliveredAt==null)m.deliveredAt=at;if(m.sentAt==null)m.sentAt=at;m.status="READ";}
            case "delivered" -> {if(m.deliveredAt==null)m.deliveredAt=at;if(m.sentAt==null)m.sentAt=at;if(m.readAt==null)m.status="DELIVERED";}
            case "sent" -> {if(m.sentAt==null)m.sentAt=at;if(m.deliveredAt==null&&m.readAt==null&&!"FAILED".equals(m.status))m.status="SENT";}
            case "failed" -> {if(m.deliveredAt==null&&m.readAt==null){m.status="FAILED";m.errorCode=event.path("errors").path(0).path("code").asText("META_FAILURE");}}
            default -> {}
        }
    }
    private static Instant time(JsonNode node){try{return Instant.ofEpochSecond(Long.parseLong(node.path("timestamp").asText()));}catch(Exception e){return Instant.now();}}
    private void inbound(Connection c,JsonNode event){
        String metaId=event.path("id").asText();if(metaId.isBlank()||metaId.length()>255)return;
        if(em.createQuery("select count(m) from WaMessage m where m.tenantId=:t and m.metaId=:id",Long.class).setParameter("t",c.tenantId).setParameter("id",metaId).getSingleResult()>0)return;
        String phone;try{phone=WhatsAppService.phone(event.path("from").asText());}catch(Exception e){return;}
        Message m=new Message();m.tenantId=c.tenantId;m.phone=phone;m.metaId=metaId;m.requestKey="in:"+WhatsAppCrypto.hash(metaId);m.direction="INBOUND";m.status="RECEIVED";m.createdAt=time(event);
        if(m.createdAt.isAfter(Instant.now()))m.createdAt=Instant.now();
        m.body=switch(event.path("type").asText()){
            case "text" -> event.path("text").path("body").asText();
            case "button" -> event.path("button").path("text").asText();
            case "interactive" -> event.path("interactive").path("button_reply").path("title").asText(event.path("interactive").path("list_reply").path("title").asText());
            default -> "[Mensagem recebida: "+event.path("type").asText("tipo não suportado")+"]";
        };
        if(m.body.length()>4096)m.body=m.body.substring(0,4096);em.persist(m);
        if(Set.of("SAIR","PARAR","STOP","CANCELAR","DESCADASTRAR").contains(m.body.trim().toUpperCase(Locale.ROOT))){
            Consent consent=service.consent(c.tenantId,phone);if(consent==null){consent=new Consent();consent.tenantId=c.tenantId;consent.phone=phone;em.persist(consent);}consent.blocked=true;consent.serviceAllowed=false;consent.marketingAllowed=false;consent.source="Descadastro pelo WhatsApp";consent.updatedAt=Instant.now();
            em.createQuery("update WaMessage m set m.status='CANCELED',m.errorCode='OPT_OUT' where m.tenantId=:t and m.phone=:p and m.status='QUEUED'").setParameter("t",c.tenantId).setParameter("p",phone).executeUpdate();
        }
    }
}
