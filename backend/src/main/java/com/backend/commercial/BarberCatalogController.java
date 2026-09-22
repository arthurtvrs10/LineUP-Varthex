package com.backend.commercial;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.backend.barbers.BarberRepository;
import com.backend.services.ServiceOfferingRepository;
import java.util.*;
@RestController
@RequestMapping("/commercial/barbers/{id}/catalog")
@Transactional
public class BarberCatalogController {
 private final BarberCatalogRepository catalogs;private final BarberRepository barbers;private final ServiceOfferingRepository services;private final CommercialService commercial;
 public BarberCatalogController(BarberCatalogRepository catalogs,BarberRepository barbers,ServiceOfferingRepository services,CommercialService commercial){this.catalogs=catalogs;this.barbers=barbers;this.services=services;this.commercial=commercial;}
 private void scope(UUID tenant,UUID id){if(barbers.findById(id).filter(b->tenant.equals(b.getUnit().getTenant().getId())).isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Profissional não encontrado");}
 @GetMapping public BarberCatalog get(@PathVariable UUID id,JwtAuthenticationToken auth){UUID tenant=CommercialController.tenant(auth);scope(tenant,id);return catalogs.findById(id).orElseGet(()->{var c=new BarberCatalog();c.barberId=id;c.tenantId=tenant;return c;});}
 public record Input(boolean restricted,Set<UUID> serviceIds,Long version){}
 @PutMapping public BarberCatalog update(@PathVariable UUID id,@RequestBody Input input,JwtAuthenticationToken auth){UUID tenant=CommercialController.tenant(auth);commercial.lock(tenant);BarberCatalog c=get(id,auth);CommercialService.require(Objects.equals(c.version,input.version()),"Catálogo alterado; recarregue");CommercialService.require(input.serviceIds()!=null,"Informe os serviços");for(UUID service:input.serviceIds())CommercialService.require(service!=null&&services.findById(service).filter(s->tenant.equals(s.getTenantId())).isPresent(),"Serviço não encontrado");c.restricted=input.restricted();c.serviceIds=new HashSet<>(input.serviceIds());catalogs.save(c);commercial.event(tenant,CommercialController.actor(auth),"BARBER_CATALOG_UPDATE",id);return c;}
}
