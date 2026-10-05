package com.backend.googlecalendar;

import org.springframework.http.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@RestController @RequestMapping("/integrations/google-calendar")
public class GoogleCalendarController {
    private final GoogleCalendarService service;
    public GoogleCalendarController(GoogleCalendarService service){this.service=service;}
    @GetMapping("/status") Object status(@RequestParam(defaultValue="TENANT") String scope,JwtAuthenticationToken a){return service.status(owner(a,scope));}
    @PostMapping("/connect") Object connect(@RequestParam(defaultValue="TENANT") String scope,@RequestBody(required=false) Connect input,JwtAuthenticationToken a){return service.connect(owner(a,scope),input==null?null:input.returnTo());}
    @GetMapping("/callback") Object callback(@RequestParam(required=false) String code,@RequestParam(required=false) String state,@RequestParam(required=false) String error){return service.callback(code,state,error);}
    @GetMapping("/calendars") Object calendars(@RequestParam(defaultValue="TENANT") String scope,JwtAuthenticationToken a){return service.calendars(owner(a,scope));}
    @PutMapping("/calendar") Object select(@RequestParam(defaultValue="TENANT") String scope,@RequestBody Select input,JwtAuthenticationToken a){return service.select(owner(a,scope),input.calendarId());}
    @DeleteMapping("/connection") @ResponseStatus(HttpStatus.NO_CONTENT) void disconnect(@RequestParam(defaultValue="TENANT") String scope,JwtAuthenticationToken a){service.disconnect(owner(a,scope));}
    @PostMapping("/retry") Object retry(@RequestParam(defaultValue="TENANT") String scope,JwtAuthenticationToken a){return service.retry(owner(a,scope));}
    public record Connect(String returnTo){} public record Select(String calendarId){}
    private GoogleCalendarService.Owner owner(JwtAuthenticationToken a,String scope){
        String role=a.getToken().getClaimAsString("role");UUID tenant=uuid(a.getToken().getClaimAsString("tenantId"));UUID user=UUID.fromString(a.getToken().getSubject());
        if("TENANT".equals(scope)){if(!"ADMIN".equals(role)&&!"SUPER_ADMIN".equals(role))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Somente o administrador pode conectar o calendário da barbearia");return new GoogleCalendarService.Owner(scope,tenant,tenant);}
        if(!"BARBER".equals(scope))throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Escopo inválido");return service.barberOwner(tenant,user);
    }
    private UUID uuid(String s){if(s==null)throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Conta sem barbearia");return UUID.fromString(s);}
}
