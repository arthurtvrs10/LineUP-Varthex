package com.backend.commercial;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
@RestController
public class BusinessSettingsController {
 private final BusinessSettingsService service;
 public BusinessSettingsController(BusinessSettingsService service){this.service=service;}
 @GetMapping("/commercial/settings") public Object get(JwtAuthenticationToken a){return service.get(CommercialController.tenant(a));}
 @PutMapping("/commercial/settings") public Object update(@RequestBody BusinessSettingsService.Input input,JwtAuthenticationToken a){return service.update(CommercialController.tenant(a),CommercialController.actor(a),input);}
 @GetMapping("/commercial/me/consent") public Object consent(JwtAuthenticationToken a){return service.consent(CommercialController.actor(a));}
 public record ConsentInput(Boolean marketing){}
 @PutMapping("/commercial/me/consent") public Object consent(@RequestBody ConsentInput b,JwtAuthenticationToken a){CommercialService.require(b.marketing()!=null,"Informe a preferência");return service.consent(CommercialController.actor(a),b.marketing());}
}
