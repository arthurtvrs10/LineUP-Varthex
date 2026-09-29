package com.backend.whatsapp;

import com.backend.whatsapp.WhatsAppData.*;
import com.backend.tenants.Tenant;
import com.backend.customers.Customer;
import jakarta.persistence.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import java.time.*;
import java.util.*;
import java.util.regex.*;

@Service @Transactional
public class WhatsAppService {
    private final EntityManager em; private final WhatsAppCrypto crypto; private final MetaWhatsAppClient meta; private final ObjectMapper json;
    final String appId,appSecret,configId,publicUrl,sharedVerify;
    public WhatsAppService(EntityManager em,WhatsAppCrypto crypto,MetaWhatsAppClient meta,ObjectMapper json,
        @Value("${whatsapp.app-id:}") String appId,@Value("${whatsapp.app-secret:}") String appSecret,
        @Value("${whatsapp.config-id:}") String configId,@Value("${whatsapp.public-url:}") String publicUrl,
        @Value("${whatsapp.webhook-verify-token:}") String sharedVerify){
        this.em=em;this.crypto=crypto;this.meta=meta;this.json=json;this.appId=appId;this.appSecret=appSecret;this.configId=configId;this.publicUrl=publicUrl.replaceAll("/$","");this.sharedVerify=sharedVerify;
    }
    static void require(boolean valid,String message){if(!valid)throw new ResponseStatusException(HttpStatus.BAD_REQUEST,message);}
    static String text(String s,int max,String label){require(s!=null&&!s.isBlank()&&s.length()<=max,label+" inválido");return s.trim();}
    static String phone(String s){String p=s==null?"":s.replaceAll("[ +()\\-]","");require(p.matches("[1-9][0-9]{7,14}"),"Informe telefone com DDI e DDD");return p;}
    void lock(UUID tenant){if(em.find(Tenant.class,tenant,LockModeType.PESSIMISTIC_WRITE)==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Barbearia não encontrada");}
    Connection connection(UUID tenant){Connection c=em.find(Connection.class,tenant);if(c==null){c=new Connection();c.tenantId=tenant;em.persist(c);}return c;}
    Connection configured(UUID tenant){Connection c=em.find(Connection.class,tenant);require(c!=null&&c.tokenEncrypted!=null,"Configure a integração WhatsApp primeiro");return c;}
    <T> List<T> rows(String entity,Class<T> type,UUID tenant){return em.createQuery("select x from "+entity+" x where x.tenantId=:t",type).setParameter("t",tenant).getResultList();}
    String token(Connection c){return crypto.decrypt(c.tenantId,c.tokenEncrypted);}
    JsonNode graph(Connection c,String method,String path,Map<String,String> query,Object body){return meta.call(method,path,token(c),query,body);}
    String serialized(Object value){return json.writeValueAsString(value);}
    List<String> strings(String value){List<String> result=new ArrayList<>();json.readTree(value).forEach(n->result.add(n.asText()));return result;}
    public record ConnectionView(boolean configured,boolean encryptionReady,boolean embeddedReady,String appId,String configId,String graphVersion,String status,String phoneId,String wabaId,String displayPhone,String businessName,String quality,Instant testedAt,boolean webhookVerified,Instant webhookAt,String webhookUrl,String mode){}
    public ConnectionView status(UUID tenant){
        Connection c=em.find(Connection.class,tenant);boolean embedded=crypto.ready()&&!appId.isBlank()&&!appSecret.isBlank()&&!configId.isBlank()&&publicUrl.startsWith("https://")&&!sharedVerify.isBlank();
        return new ConnectionView(c!=null&&c.tokenEncrypted!=null,crypto.ready(),embedded,appId,configId,meta.version,c==null?"NOT_CONFIGURED":c.status,c==null?null:c.phoneId,c==null?null:c.wabaId,c==null?null:c.displayPhone,c==null?null:c.businessName,c==null?null:c.quality,c==null?null:c.testedAt,c!=null&&c.webhookVerified,c==null?null:c.webhookAt,publicUrl.isBlank()?null:publicUrl+"/integrations/whatsapp/webhook"+(c!=null&&"EMBEDDED".equals(c.mode)?"":"/"+tenant),c==null?"MANUAL":c.mode);
    }
    public record Credentials(String wabaId,String phoneId,String accessToken,String appSecret){}
    public Map<String,Object> save(UUID tenant,Credentials input){
        lock(tenant);String waba=text(input.wabaId(),100,"ID da conta"),phoneId=text(input.phoneId(),100,"ID do número");
        require(waba.matches("[0-9]+")&&phoneId.matches("[0-9]+"),"IDs da Meta devem ser numéricos");
        Connection c=connection(tenant);
        boolean changed=!Objects.equals(c.phoneId,phoneId)||!Objects.equals(c.wabaId,waba);
        require(!changed||c.phoneId==null||"DISCONNECTED".equals(c.status),"Desconecte o número atual antes de conectar outro");
        require(em.createQuery("select count(c) from WaConnection c where c.phoneId=:p and c.tenantId<>:t",Long.class).setParameter("p",phoneId).setParameter("t",tenant).getSingleResult()==0,"Este número já está vinculado a outra barbearia");
        if(input.accessToken()!=null&&!input.accessToken().isBlank())c.tokenEncrypted=crypto.encrypt(tenant,text(input.accessToken(),4096,"Token"));
        if(input.appSecret()!=null&&!input.appSecret().isBlank())c.secretEncrypted=crypto.encrypt(tenant,text(input.appSecret(),2048,"Segredo do aplicativo"));
        require(c.tokenEncrypted!=null&&c.secretEncrypted!=null,"Informe o token de acesso e o segredo do aplicativo Meta");
        c.phoneId=phoneId;c.wabaId=waba;c.mode="MANUAL";c.status="SAVED";c.webhookVerified=false;c.testedAt=null;
        String verification=UUID.randomUUID()+"-"+UUID.randomUUID();c.verifyHash=WhatsAppCrypto.hash(verification);
        return Map.of("connection",status(tenant),"verifyToken",verification);
    }
    public ConnectionView test(UUID tenant){
        lock(tenant);Connection c=configured(tenant);
        try{
            boolean owned=false;String after=null;
            for(int page=0;page<10;page++){
                Map<String,String> params=new HashMap<>(Map.of("fields","id,display_phone_number,verified_name,quality_rating","limit","100"));if(after!=null)params.put("after",after);
                JsonNode response=graph(c,"GET",c.wabaId+"/phone_numbers",params,null);
                for(JsonNode n:response.path("data"))if(c.phoneId.equals(n.path("id").asText())){owned=true;c.displayPhone=n.path("display_phone_number").asText();c.businessName=n.path("verified_name").asText();c.quality=n.path("quality_rating").asText();}
                if(owned||!response.path("paging").has("next"))break;after=response.path("paging").path("cursors").path("after").asText(null);if(after==null)break;
            }
            if(!owned){c.status="NUMBER_NOT_FOUND";}else{c.status="CONNECTED";}
        }catch(MetaWhatsAppClient.Failure e){c.status="190".equals(e.code)?"TOKEN_INVALID":"CONNECTION_ERROR";}
        c.testedAt=Instant.now();return status(tenant);
    }
    public void disconnect(UUID tenant){lock(tenant);Connection c=connection(tenant);c.tokenEncrypted=null;c.secretEncrypted=null;c.verifyHash=null;c.phoneId=null;c.wabaId=null;c.status="DISCONNECTED";c.webhookVerified=false;c.signupState=null;
        rows("WaAutomation",Automation.class,tenant).forEach(a->a.enabled=false);
        em.createQuery("update WaMessage m set m.status='CANCELED' where m.tenantId=:t and m.status='QUEUED'").setParameter("t",tenant).executeUpdate();
        rows("WaTemplate",Template.class,tenant).forEach(t->t.status="DISCONNECTED");
    }
    public Map<String,String> startSignup(UUID tenant){lock(tenant);require(status(tenant).embeddedReady(),"A conexão guiada ainda não foi habilitada pelo operador do LineUp");Connection c=connection(tenant);String state=UUID.randomUUID().toString();c.signupState=WhatsAppCrypto.hash(state);c.signupExpiresAt=Instant.now().plusSeconds(600);return Map.of("state",state);}
    public record Signup(String code,String state,String wabaId,String phoneId){}
    public ConnectionView finishSignup(UUID tenant,Signup input){
        lock(tenant);Connection c=connection(tenant);require(c.signupState!=null&&input.state()!=null&&c.signupState.equals(WhatsAppCrypto.hash(input.state()))&&c.signupExpiresAt.isAfter(Instant.now()),"Conexão expirada. Inicie novamente");c.signupState=null;
        require(status(tenant).embeddedReady(),"Conexão guiada indisponível");
        JsonNode exchange=meta.call("GET","oauth/access_token",null,Map.of("client_id",appId,"client_secret",appSecret,"code",text(input.code(),4096,"Código")),null);
        save(tenant,new Credentials(input.wabaId(),input.phoneId(),exchange.path("access_token").asText(),appSecret));
        c.mode="EMBEDDED";
        if(!"CONNECTED".equals(test(tenant).status()))return status(tenant);
        graph(c,"POST",c.wabaId+"/subscribed_apps",Map.of(),Map.of());
        return status(tenant);
    }
    public List<Template> templates(UUID tenant){return rows("WaTemplate",Template.class,tenant);}
    public List<Template> sync(UUID tenant){
        lock(tenant);Connection c=configured(tenant);List<JsonNode> all=new ArrayList<>();String after=null;
        for(int page=0;page<20;page++){
            Map<String,String> params=new HashMap<>(Map.of("fields","id,name,status,category,language,components","limit","100"));if(after!=null)params.put("after",after);
            JsonNode data=graph(c,"GET",c.wabaId+"/message_templates",params,null);data.path("data").forEach(all::add);
            if(!data.path("paging").has("next"))break;
            after=data.path("paging").path("cursors").path("after").asText(null);require(after!=null&&page<19,"Muitos modelos. Reduza o catálogo antes de sincronizar");
        }
        List<Template> existing=templates(tenant);existing.forEach(t->t.status="UNAVAILABLE");
        for(JsonNode n:all){Template t=existing.stream().filter(x->Objects.equals(x.metaId,n.path("id").asText())).findFirst().orElseGet(()->{Template v=new Template();v.tenantId=tenant;em.persist(v);return v;});
            t.metaId=n.path("id").asText();t.name=n.path("name").asText();t.language=n.path("language").asText();t.status=n.path("status").asText();t.category=n.path("category").asText();t.body="";t.supported=true;t.parameterCount=0;
            for(JsonNode component:n.path("components")){String type=component.path("type").asText();if("BODY".equals(type))t.body=component.path("text").asText();else if(!"FOOTER".equals(type)&&!("HEADER".equals(type)&&"TEXT".equals(component.path("format").asText())&&!component.path("text").asText().contains("{{")))t.supported=false;}
            Matcher matcher=Pattern.compile("\\{\\{(\\d+)}}").matcher(t.body);Set<Integer> vars=new HashSet<>();while(matcher.find())vars.add(Integer.parseInt(matcher.group(1)));t.parameterCount=vars.size();
            for(int i=1;i<=t.parameterCount;i++)if(!vars.contains(i))t.supported=false;
            if(t.body.replaceAll("\\{\\{\\d+}}","").contains("{{"))t.supported=false;t.syncedAt=Instant.now();
        }return templates(tenant);
    }
    public record TemplateInput(String name,String language,String category,String body,List<String> examples){}
    public List<Template> createTemplate(UUID tenant,TemplateInput input){
        lock(tenant);Connection c=configured(tenant);String name=text(input.name(),100,"Nome");require(name.matches("[a-z0-9_]+"),"Use letras minúsculas, números e sublinhado no nome");
        require(Set.of("MARKETING","UTILITY").contains(input.category()),"Categoria inválida");String body=text(input.body(),1024,"Mensagem");String language=text(input.language(),20,"Idioma");require(language.matches("[a-z]{2}(_[A-Z]{2})?"),"Idioma inválido");
        Map<String,Object> component=new HashMap<>(Map.of("type","BODY","text",body));if(body.contains("{{")){require(input.examples()!=null&&!input.examples().isEmpty(),"Informe exemplos das variáveis");component.put("example",Map.of("body_text",List.of(input.examples())));}
        graph(c,"POST",c.wabaId+"/message_templates",Map.of(),Map.of("name",name,"language",language,"category",input.category(),"components",List.of(component)));return sync(tenant);
    }
    Template approved(UUID tenant,UUID id){Template t=id==null?null:em.find(Template.class,id);require(t!=null&&tenant.equals(t.tenantId)&&"APPROVED".equals(t.status)&&t.supported,"Selecione um modelo aprovado e compatível");return t;}
    Consent consent(UUID tenant,String phone){return em.createQuery("select c from WaConsent c where c.tenantId=:t and c.phone=:p",Consent.class).setParameter("t",tenant).setParameter("p",phone).getResultStream().findFirst().orElse(null);}
    boolean allowed(UUID tenant,String phone,Template t){Consent c=consent(tenant,phone);return c!=null&&!c.blocked&&("MARKETING".equals(t.category)?c.marketingAllowed:c.serviceAllowed);}
    public record ConsentInput(String phone,boolean serviceAllowed,boolean marketingAllowed,boolean blocked,String source){}
    public Consent saveConsent(UUID tenant,UUID actor,ConsentInput input){lock(tenant);String p=phone(input.phone());Consent c=consent(tenant,p);if(c==null){c=new Consent();c.tenantId=tenant;c.phone=p;em.persist(c);}c.source=text(input.source(),500,"Origem da autorização");c.serviceAllowed=input.serviceAllowed();c.marketingAllowed=input.marketingAllowed();c.blocked=input.blocked();c.updatedBy=actor;c.updatedAt=Instant.now();return c;}
    public List<Consent> consents(UUID tenant){return rows("WaConsent",Consent.class,tenant);}
    public record SendInput(UUID templateId,String phone,List<String> parameters,String requestKey,boolean authorized){}
    public Message testMessage(UUID tenant,SendInput input){lock(tenant);require(input.authorized(),"Confirme a autorização do destinatário e os possíveis custos");Template t=approved(tenant,input.templateId());return enqueue(tenant,t,phone(input.phone()),input.parameters(),"test:"+text(input.requestKey(),100,"Identificador"),null,null,null,null,true,Instant.now());}
    Message enqueue(UUID tenant,Template template,String phone,List<String> parameters,String requestKey,UUID customer,UUID appointment,UUID campaign,UUID automation,boolean test,Instant scheduled){
        require("CONNECTED".equals(configured(tenant).status),"Teste a conexão antes de enviar");
        List<Message> previous=em.createQuery("select m from WaMessage m where m.tenantId=:t and m.requestKey=:k",Message.class).setParameter("t",tenant).setParameter("k",requestKey).getResultList();if(!previous.isEmpty()){
            Message old=previous.getFirst();require(Objects.equals(old.phone,phone)&&Objects.equals(old.templateId,template.id)&&Objects.equals(old.parametersJson,serialized(parameters)),"Esta operação já foi registrada com outros dados. Atualize o formulário antes de reenviar");return old;
        }
        require(parameters!=null&&parameters.size()==template.parameterCount&&parameters.stream().allMatch(p->p!=null&&!p.isBlank()&&p.length()<=500),"Preencha todas as variáveis do modelo (até 500 caracteres)");
        require(test||allowed(tenant,phone,template),"Destinatário sem autorização para esta categoria de mensagem");
        Message m=new Message();m.tenantId=tenant;m.phone=phone;m.templateId=template.id;m.customerId=customer;m.appointmentId=appointment;m.campaignId=campaign;m.automationId=automation;m.requestKey=requestKey;m.testMessage=test;m.parametersJson=serialized(parameters);m.body=template.body;m.scheduledAt=scheduled;
        for(int i=0;i<parameters.size();i++)m.body=m.body.replace("{{"+(i+1)+"}}",parameters.get(i));require(m.body.length()<=4096,"Mensagem muito longa");em.persist(m);return m;
    }
    public record CampaignInput(String name,UUID templateId,List<UUID> customerIds,List<String> parameters,Instant scheduledAt,String requestKey,boolean confirmed){}
    public Campaign campaign(UUID tenant,CampaignInput input){
        lock(tenant);require(input.confirmed(),"Confirme os destinatários e possíveis custos");String key=text(input.requestKey(),100,"Identificador");
        var old=em.createQuery("select c from WaCampaign c where c.tenantId=:t and c.requestKey=:k",Campaign.class).setParameter("t",tenant).setParameter("k",key).getResultList();if(!old.isEmpty())return old.getFirst();
        require(input.customerIds()!=null&&!input.customerIds().isEmpty()&&input.customerIds().size()<=500,"Escolha entre 1 e 500 clientes");Template template=approved(tenant,input.templateId());
        Instant when=input.scheduledAt()==null?Instant.now():input.scheduledAt();require(when.isBefore(Instant.now().plus(Duration.ofDays(90))),"Agende dentro dos próximos 90 dias");
        Campaign c=new Campaign();c.tenantId=tenant;c.name=text(input.name(),160,"Nome");c.requestKey=key;c.scheduledAt=when;em.persist(c);Set<String> phones=new HashSet<>();
        for(UUID id:new HashSet<>(input.customerIds())){Customer customer=em.find(Customer.class,id);require(customer!=null&&tenant.equals(customer.getTenantId())&&customer.getStatus()==com.backend.customers.CustomerStatus.ACTIVE,"Cliente indisponível");String p=phone(customer.getPhone());if(!phones.add(p))continue;enqueue(tenant,template,p,input.parameters(),"campaign:"+c.id+":"+p,id,null,c.id,null,false,when);c.recipients++;}return c;
    }
    public void cancelCampaign(UUID tenant,UUID id){lock(tenant);Campaign c=em.find(Campaign.class,id);require(c!=null&&tenant.equals(c.tenantId),"Campanha não encontrada");em.createQuery("update WaMessage m set m.status='CANCELED' where m.tenantId=:t and m.campaignId=:id and m.status='QUEUED'").setParameter("t",tenant).setParameter("id",id).executeUpdate();}
    public record AutomationInput(String name,String triggerType,UUID templateId,List<String> variables,boolean enabled){}
    public Automation automation(UUID tenant,UUID id,AutomationInput input){lock(tenant);Template template=approved(tenant,input.templateId());require(Set.of("REMINDER","CONFIRMATION","AFTERCARE","RETURN","BIRTHDAY","INACTIVE").contains(input.triggerType()),"Gatilho inválido");
        require(input.variables()!=null&&input.variables().size()==template.parameterCount&&input.variables().stream().allMatch(v->Set.of("nome","barbearia","data","hora","profissional","servico").contains(v)),"Mapeie todas as variáveis");
        Automation a=id==null?new Automation():em.find(Automation.class,id);require(a!=null&&(id==null||tenant.equals(a.tenantId)),"Automação não encontrada");
        if(input.enabled())require("CONNECTED".equals(configured(tenant).status),"Teste a conexão antes de ativar");
        a.tenantId=tenant;a.name=text(input.name(),160,"Nome");a.triggerType=input.triggerType();a.templateId=template.id;a.variablesJson=serialized(input.variables());if(input.enabled()&&!a.enabled)a.enabledAt=Instant.now();a.enabled=input.enabled();if(id==null)em.persist(a);return a;
    }
    public List<Message> messages(UUID tenant){return em.createQuery("select m from WaMessage m where m.tenantId=:t order by m.createdAt desc",Message.class).setParameter("t",tenant).setMaxResults(500).getResultList();}
    public Map<String,Object> dashboard(UUID tenant){List<Message> m=messages(tenant);List<Message> outgoing=m.stream().filter(x->"OUTBOUND".equals(x.direction)).toList();long sent=outgoing.stream().filter(x->x.sentAt!=null).count();long delivered=outgoing.stream().filter(x->x.deliveredAt!=null||x.readAt!=null).count();return Map.of("connection",status(tenant),"templates",templates(tenant),"automations",rows("WaAutomation",Automation.class,tenant),"campaigns",rows("WaCampaign",Campaign.class,tenant),"messages",m,"metrics",Map.of("sent",sent,"delivered",delivered,"reached",outgoing.stream().filter(x->x.deliveredAt!=null||x.readAt!=null).map(x->x.phone).distinct().count(),"sampleLimit",500));}
    public record ReplyInput(String phone,String text,String requestKey){}
    public Message reply(UUID tenant,ReplyInput input){lock(tenant);configured(tenant);String p=phone(input.phone());Consent consent=consent(tenant,p);require(consent==null||!consent.blocked,"Destinatário solicitou não receber mensagens");
        require(em.createQuery("select count(m) from WaMessage m where m.tenantId=:t and m.phone=:p and m.direction='INBOUND' and m.createdAt>:after",Long.class).setParameter("t",tenant).setParameter("p",p).setParameter("after",Instant.now().minus(Duration.ofHours(24))).getSingleResult()>0,"Janela de atendimento encerrada. Use um modelo aprovado com autorização");
        String key="reply:"+text(input.requestKey(),100,"Identificador");var old=em.createQuery("select m from WaMessage m where m.tenantId=:t and m.requestKey=:k",Message.class).setParameter("t",tenant).setParameter("k",key).getResultList();if(!old.isEmpty())return old.getFirst();
        Message m=new Message();m.tenantId=tenant;m.phone=p;m.body=text(input.text(),4096,"Resposta");m.requestKey=key;em.persist(m);return m;
    }
}
