package com.backend.whatsapp;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.http.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/integrations/whatsapp")
public class WhatsAppController {
    private final WhatsAppService service;private final WhatsAppWebhook webhook;
    public WhatsAppController(WhatsAppService service,WhatsAppWebhook webhook){this.service=service;this.webhook=webhook;}
    static UUID tenant(JwtAuthenticationToken a){String id=a.getToken().getClaimAsString("tenantId");if(id==null)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Conta sem barbearia");return UUID.fromString(id);}
    @GetMapping public Object status(JwtAuthenticationToken a){return service.status(tenant(a));}
    @PutMapping public Object save(JwtAuthenticationToken a,@RequestBody WhatsAppService.Credentials input){return service.save(tenant(a),input);}
    @PostMapping("/test") public Object test(JwtAuthenticationToken a){return service.test(tenant(a));}
    @DeleteMapping @ResponseStatus(HttpStatus.NO_CONTENT) public void disconnect(JwtAuthenticationToken a){service.disconnect(tenant(a));}
    @PostMapping("/signup/start") public Object start(JwtAuthenticationToken a){return service.startSignup(tenant(a));}
    @PostMapping("/signup/finish") public Object finish(JwtAuthenticationToken a,@RequestBody WhatsAppService.Signup input){return service.finishSignup(tenant(a),input);}
    @GetMapping("/dashboard") public Object dashboard(JwtAuthenticationToken a){return service.dashboard(tenant(a));}
    @PostMapping("/templates/sync") public Object sync(JwtAuthenticationToken a){return service.sync(tenant(a));}
    @PostMapping("/templates") public Object template(JwtAuthenticationToken a,@RequestBody WhatsAppService.TemplateInput input){return service.createTemplate(tenant(a),input);}
    @PostMapping("/test-message") public Object sendTest(JwtAuthenticationToken a,@RequestBody WhatsAppService.SendInput input){return service.testMessage(tenant(a),input);}
    @GetMapping("/consents") public Object consents(JwtAuthenticationToken a){return service.consents(tenant(a));}
    @PutMapping("/consents") public Object consent(JwtAuthenticationToken a,@RequestBody WhatsAppService.ConsentInput input){return service.saveConsent(tenant(a),UUID.fromString(a.getToken().getSubject()),input);}
    @PostMapping("/campaigns") public Object campaign(JwtAuthenticationToken a,@RequestBody WhatsAppService.CampaignInput input){return service.campaign(tenant(a),input);}
    @PostMapping("/campaigns/{id}/cancel") @ResponseStatus(HttpStatus.NO_CONTENT) public void cancel(JwtAuthenticationToken a,@PathVariable UUID id){service.cancelCampaign(tenant(a),id);}
    @PostMapping("/automations") public Object automation(JwtAuthenticationToken a,@RequestBody WhatsAppService.AutomationInput input){return service.automation(tenant(a),null,input);}
    @PutMapping("/automations/{id}") public Object automation(JwtAuthenticationToken a,@PathVariable UUID id,@RequestBody WhatsAppService.AutomationInput input){return service.automation(tenant(a),id,input);}
    @PostMapping("/reply") public Object reply(JwtAuthenticationToken a,@RequestBody WhatsAppService.ReplyInput input){return service.reply(tenant(a),input);}
    @GetMapping(value={"/webhook","/webhook/{tenantId}"},produces=MediaType.TEXT_PLAIN_VALUE)
    public String verify(@PathVariable(required=false) UUID tenantId,@RequestParam("hub.mode") String mode,@RequestParam("hub.verify_token") String token,@RequestParam("hub.challenge") String challenge){return webhook.verify(tenantId,mode,token,challenge);}
    @PostMapping({"/webhook","/webhook/{tenantId}"}) public ResponseEntity<Void> webhook(@PathVariable(required=false) UUID tenantId,@RequestBody byte[] body,@RequestHeader(value="X-Hub-Signature-256",required=false) String signature){webhook.receive(tenantId,body,signature);return ResponseEntity.ok().build();}
    @ExceptionHandler(MetaWhatsAppClient.Failure.class) public ResponseEntity<Map<String,String>> metaFailure(MetaWhatsAppClient.Failure e){return ResponseEntity.status(502).body(Map.of("message","Não foi possível concluir a operação na Meta. Código: "+e.code+". Verifique as permissões, a conta e tente novamente."));}
}
