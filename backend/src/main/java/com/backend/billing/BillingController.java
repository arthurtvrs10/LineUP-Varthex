package com.backend.billing;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@RestController
public class BillingController {
    private final BillingService billing;
    private final BillingChanges changes;
    public BillingController(BillingService billing,BillingChanges changes) { this.billing=billing;this.changes=changes; }
    private UUID tenant(JwtAuthenticationToken auth) {
        String id=auth.getToken().getClaimAsString("tenantId");
        if(id==null) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Perfil sem barbearia");
        return UUID.fromString(id);
    }
    private UUID actor(JwtAuthenticationToken auth) { return UUID.fromString(auth.getToken().getSubject()); }
    @GetMapping("/billing/plans") public Object plans() { return billing.catalog(); }
    @GetMapping("/billing/subscription") public Object subscription(JwtAuthenticationToken auth) { return billing.summary(tenant(auth)); }
    @PostMapping("/billing/checkout") public Object checkout(@RequestBody BillingService.CheckoutInput input,JwtAuthenticationToken auth) { return billing.checkout(tenant(auth),actor(auth),input); }
    @PostMapping("/billing/sync") public Object sync(JwtAuthenticationToken auth) { billing.reconcile(tenant(auth));return billing.summary(tenant(auth)); }
    @PostMapping("/billing/sandbox/charges/{id}/confirm") public Object sandboxConfirm(@PathVariable UUID id,JwtAuthenticationToken auth) {
        return billing.confirmSandbox(tenant(auth),actor(auth),id);
    }
    @PostMapping("/billing/cancel") public Object cancel(JwtAuthenticationToken auth) { return billing.cancel(tenant(auth),actor(auth)); }
    @PostMapping("/billing/card") public Object card(@RequestBody BillingService.CardInput input,JwtAuthenticationToken auth,jakarta.servlet.http.HttpServletRequest request) {
        return billing.updateCard(tenant(auth),actor(auth),input,request.getRemoteAddr(),request.isSecure());
    }
    @PostMapping("/billing/changes/preview") public Object preview(@RequestBody BillingChanges.Selection input,JwtAuthenticationToken auth) {
        billing.reconcile(tenant(auth));return changes.quote(tenant(auth),input);
    }
    @PostMapping("/billing/changes/confirm") public Object confirm(@RequestBody BillingChanges.Confirmation input,JwtAuthenticationToken auth,jakarta.servlet.http.HttpServletRequest request) {
        changes.confirm(tenant(auth),actor(auth),input,request.getRemoteAddr(),request.isSecure());return billing.summary(tenant(auth));
    }
    @GetMapping("/platform/billing") public Object platform() { return billing.platform(); }
    @PostMapping("/platform/billing/charges/{id}/refund") public Object refund(@PathVariable UUID id,@RequestBody BillingService.RefundInput input,JwtAuthenticationToken auth) {
        billing.refund(id,actor(auth),input);return billing.platform();
    }
}
