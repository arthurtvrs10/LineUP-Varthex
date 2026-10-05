package com.backend.billing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import tools.jackson.databind.JsonNode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import com.backend.tenants.Tenant;

@RestController
public class BillingWebhookController {
    private final BillingEventRepository events;
    private final BillingAccountRepository accounts;
    private final EntityManager em;
    private final TransactionTemplate tx;
    private final String token;
    public BillingWebhookController(BillingEventRepository events,BillingAccountRepository accounts,EntityManager em,
            PlatformTransactionManager tm,@Value("${asaas.webhook-token:}") String token) {
        this.events=events;this.accounts=accounts;this.em=em;this.tx=new TransactionTemplate(tm);this.token=token;
    }
    @PostMapping("/billing/webhook")
    public Object receive(@RequestHeader(value="asaas-access-token",required=false) String supplied,@RequestBody JsonNode payload) {
        if(token.length()<32 || supplied==null || !MessageDigest.isEqual(token.getBytes(StandardCharsets.UTF_8),supplied.getBytes(StandardCharsets.UTF_8)))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Webhook não autorizado");
        String id=BillingService.text(payload,"id"),kind=BillingService.text(payload,"event");
        BillingService.check(id!=null && id.length()<=200 && kind!=null && kind.length()<=100,"Evento inválido");
        String field=kind.startsWith("PAYMENT_")?"payment":kind.startsWith("SUBSCRIPTION_")?"subscription":kind.startsWith("CHECKOUT_")?"checkout":null;
        if(field==null) return java.util.Map.of("received",true);
        JsonNode resource=payload.path(field);
        String resourceId=AsaasClient.safeId(BillingService.text(resource,"id"));
        // Serialize events for the same known tenant; unique event ID handles unknown-resource races.
        var account=accounts.findByCustomerId(BillingService.text(resource,"customer")).orElse(null);
        try {
            tx.execute(status->{
                if(account!=null) em.find(Tenant.class,account.tenantId,LockModeType.PESSIMISTIC_WRITE);
                if(!events.existsById(id)) {
                    var event=new BillingEvent();event.id=id;event.kind=kind;event.resourceId=resourceId;events.saveAndFlush(event);
                }
                return null;
            });
        } catch(org.springframework.dao.DataIntegrityViolationException ex) {
            if(!events.existsById(id)) throw ex;
        }
        return java.util.Map.of("received",true);
    }
}
