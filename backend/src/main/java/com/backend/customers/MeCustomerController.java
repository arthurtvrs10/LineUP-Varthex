package com.backend.customers;

import com.backend.customers.dto.MeCustomerResponse;
import com.backend.customers.dto.UpdateMyPhoneRequest;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/me")
public class MeCustomerController {

    private final CustomerService customerService;

    public MeCustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/customer")
    public MeCustomerResponse getMyCustomer(JwtAuthenticationToken authentication) {
        UUID userId = UUID.fromString(authentication.getToken().getSubject());
        return customerService.getMyCustomer(userId);
    }

    // Só o telefone: nome vem de /users/me (é o dado de login), e-mail não é
    // autoeditável (é o identificador de login e o canal de contato que a
    // barbearia cadastrou).
    @PatchMapping("/customer")
    public MeCustomerResponse updateMyPhone(@RequestBody UpdateMyPhoneRequest request, JwtAuthenticationToken authentication) {
        UUID userId = UUID.fromString(authentication.getToken().getSubject());
        return customerService.updateMyPhone(userId, request.phone());
    }
}
