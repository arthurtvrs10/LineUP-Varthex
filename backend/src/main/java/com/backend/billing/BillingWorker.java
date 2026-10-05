package com.backend.billing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;

@Component
public class BillingWorker {
    private final BillingEventRepository events;
    private final BillingAccountRepository accounts;
    private final BillingService billing;
    private final AsaasClient asaas;
    private final TransactionTemplate tx;
    private final boolean enabled;
    public BillingWorker(BillingEventRepository events,BillingAccountRepository accounts,BillingService billing,
            AsaasClient asaas,PlatformTransactionManager tm,@Value("${asaas.worker-enabled:true}") boolean enabled) {
        this.events=events;this.accounts=accounts;this.billing=billing;this.asaas=asaas;this.tx=new TransactionTemplate(tm);this.enabled=enabled;
    }
    @Scheduled(fixedDelayString="${asaas.events-delay-ms:15000}")
    public void processEvents() {
        if(!enabled || !asaas.configured()) return;
        for(var event:events.findTop50ByProcessedFalseAndNextAttemptAtLessThanEqualOrderByReceivedAtAsc(LocalDateTime.now())) {
            try {
                BillingAccount account=null;
                if(event.kind.startsWith("PAYMENT_")) {
                    var payment=asaas.get("/payments/"+AsaasClient.safeId(event.resourceId));
                    account=accounts.findByCustomerId(BillingService.text(payment,"customer")).orElse(null);
                } else if(event.kind.startsWith("SUBSCRIPTION_")) {
                    account=accounts.findByProviderSubscriptionId(event.resourceId).orElse(null);
                    if(account==null) {
                        var subscription=asaas.getOptional("/subscriptions/"+AsaasClient.safeId(event.resourceId));
                        if(subscription!=null) account=accounts.findByCustomerId(BillingService.text(subscription,"customer")).orElse(null);
                    }
                } else account=accounts.findByCheckoutId(event.resourceId).orElse(null);
                if(account==null) { retry(event.id); continue; } // Customer may still be getting linked.
                billing.reconcile(account.tenantId); // Authoritative snapshots prevent old events reverting current state.
                if(event.kind.equals("PAYMENT_CREDIT_CARD_CAPTURE_REFUSED")) billing.recordCardFailure(event.resourceId);
                if(event.kind.equals("CHECKOUT_EXPIRED") || event.kind.equals("CHECKOUT_CANCELED")) {
                    tx.execute(status->{var current=accounts.findById(accountId(event.resourceId)).orElseThrow();
                        if(current.providerSubscriptionId==null) {current.state=event.kind.equals("CHECKOUT_EXPIRED")?"EXPIRED":"CANCELED";current.checkoutUrl=null;accounts.save(current);}return null;});
                }
                tx.execute(status->{var current=events.findById(event.id).orElseThrow();current.processed=true;
                    current.processedAt=LocalDateTime.now();events.save(current);return null;});
            } catch(RuntimeException ex) {
                retry(event.id);
                LoggerFactory.getLogger(BillingWorker.class).warn("Falha de conciliação do evento de cobrança {}",event.id);
            }
        }
    }
    private void retry(String eventId) {
        tx.execute(status->{var current=events.findById(eventId).orElseThrow();current.attempts++;
            current.nextAttemptAt=LocalDateTime.now().plusSeconds(Math.min(3600,30L*(1L<<Math.min(current.attempts,7))));
            events.save(current);return null;});
    }
    private java.util.UUID accountId(String checkoutId) { return accounts.findByCheckoutId(checkoutId).orElseThrow().id; }
    @Scheduled(fixedDelayString="${asaas.reconciliation-delay-ms:3600000}")
    public void reconcile() {
        if(!enabled || !asaas.configured()) return;
        for(var account:accounts.findAll()) try { billing.reconcile(account.tenantId); }
        catch(RuntimeException ex) { LoggerFactory.getLogger(BillingWorker.class).warn("Conciliação pendente da assinatura {}",account.id); }
    }
}
