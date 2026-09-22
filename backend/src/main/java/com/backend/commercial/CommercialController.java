package com.backend.commercial;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController
@RequestMapping("/commercial")
public class CommercialController {
    private final CommercialService service;
    public CommercialController(CommercialService service) {this.service=service;}
    static UUID tenant(JwtAuthenticationToken auth) {
        String id=auth.getToken().getClaimAsString("tenantId");
        if(id==null)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Perfil sem barbearia vinculada");
        return UUID.fromString(id);
    }
    static UUID actor(JwtAuthenticationToken auth) {return UUID.fromString(auth.getToken().getSubject());}
    public record Reason(String reason) {}
    @GetMapping("/customers/summary") public Object customerStats(JwtAuthenticationToken a){return service.customerStats(tenant(a));}
    @GetMapping("/me") public Object me(JwtAuthenticationToken a){return service.mySummary(actor(a));}
    @GetMapping("/finance") public Object finance(JwtAuthenticationToken a){return service.finance(tenant(a));}
    @GetMapping("/receipts/{appointmentId}") public Object receipt(@PathVariable UUID appointmentId,JwtAuthenticationToken a){return service.receipt(tenant(a),appointmentId);}
    @PostMapping("/cash/open") public Object open(@RequestBody CommercialService.OpenCash b,JwtAuthenticationToken a){return service.openCash(tenant(a),actor(a),b);}
    @PostMapping("/cash/close") public Object close(@RequestBody CommercialService.CloseCash b,JwtAuthenticationToken a){return service.closeCash(tenant(a),actor(a),b);}
    @PostMapping("/payments") public Object pay(@RequestBody CommercialService.PaymentInput b,JwtAuthenticationToken a){return service.pay(tenant(a),actor(a),b);}
    @PostMapping("/payments/{id}/reverse") public Object reverse(@PathVariable UUID id,@RequestBody Reason b,JwtAuthenticationToken a){return service.reverse(tenant(a),actor(a),id,b.reason());}
    @PostMapping("/sales") public Object sale(@RequestBody CommercialService.ProductSaleInput b,JwtAuthenticationToken a){return service.sell(tenant(a),actor(a),b);}
    @GetMapping("/inventory") public Object inventory(JwtAuthenticationToken a){return service.inventory(tenant(a));}
    @PostMapping("/products") public Object product(@RequestBody CommercialService.ProductInput b,JwtAuthenticationToken a){return service.createProduct(tenant(a),actor(a),b);}
    @PutMapping("/products/{id}") public Object updateProduct(@PathVariable UUID id,@RequestBody CommercialService.ProductUpdate b,JwtAuthenticationToken a){return service.updateProduct(tenant(a),actor(a),id,b);}
    @PostMapping("/stock") public Object stock(@RequestBody CommercialService.StockInput b,JwtAuthenticationToken a){return service.moveStock(tenant(a),actor(a),b);}
    @GetMapping("/loyalty") public Object loyalty(JwtAuthenticationToken a){return service.loyalty(tenant(a));}
    @PostMapping("/loyalty/redeem") public Object redeem(@RequestBody CommercialService.RedeemInput b,JwtAuthenticationToken a){return service.redeem(tenant(a),actor(a),b);}
    @GetMapping("/reviews") public Object reviews(JwtAuthenticationToken a){return service.reviews(tenant(a));}
    @PostMapping("/reviews") public Object review(@RequestBody CommercialService.ReviewInput b,JwtAuthenticationToken a){return service.review(actor(a),b);}
    @PostMapping("/reviews/{id}/reply") public Object reply(@PathVariable UUID id,@RequestBody Reason b,JwtAuthenticationToken a){return service.reply(tenant(a),actor(a),id,b.reason());}
    @GetMapping("/crm") public Object crm(JwtAuthenticationToken a){return service.crm(tenant(a));}
    @PostMapping("/campaigns") public Object campaign(@RequestBody CommercialService.CampaignInput b,JwtAuthenticationToken a){return service.campaign(tenant(a),actor(a),b);}
}
