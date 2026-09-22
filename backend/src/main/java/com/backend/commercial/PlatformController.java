package com.backend.commercial;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@RestController
@RequestMapping("/platform")
public class PlatformController {
    private final PlatformService service;
    public PlatformController(PlatformService service){this.service=service;}
    @GetMapping("/plans") public Object plans(){return service.plans();}
    @PostMapping("/plans") public Object plan(@RequestBody PlatformService.PlanInput b,JwtAuthenticationToken a){return service.plan(CommercialController.actor(a),b);}
    @PutMapping("/plans/{id}/status") public Object planStatus(@PathVariable java.util.UUID id,@RequestBody PlatformService.PlanStatus b,JwtAuthenticationToken a){return service.planStatus(CommercialController.actor(a),id,b);}
    @GetMapping("/subscriptions") public Object subscriptions(){return service.subscriptions();}
    @PostMapping("/subscriptions") public Object subscribe(@RequestBody PlatformService.SubscriptionInput b,JwtAuthenticationToken a){return service.subscribe(CommercialController.actor(a),b);}
    @GetMapping("/audit") public Object audit(){return service.audit();}
    @GetMapping("/metrics") public Object metrics(){return service.metrics();}
    @GetMapping("/health") public Object health(){return service.health();}
}
