package com.backend.barbers.auth;

import com.backend.auth.jwt.JwtService;
import com.backend.customers.Customer;
import com.backend.customers.CustomerRepository;
import com.backend.tenants.Tenant;
import com.backend.tenants.TenantRepository;
import com.backend.users.Role;
import com.backend.users.User;
import com.backend.users.UserRepository;
import com.backend.users.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TenantRepository tenantRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void loginComCredenciaisInvalidasRetorna401() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"ninguem@lineup.dev","password":"senha-errada"}
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void socialLoginComTokenGoogleForjadoRetorna401() throws Exception {
        // "idToken" com formato de JWT, mas assinatura/claims que não batem
        // com nenhuma chave pública real do Google — deve ser rejeitado
        // antes de qualquer criação/login de usuário.
        String tokenForjado =
                "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6ImFkbWluQGV4ZW1wbG8uY29tIn0.assinatura-invalida";

        mockMvc.perform(post("/auth/social-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"idToken":"%s"}
                                """.formatted(tokenForjado)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void meRetornaNomeDoUsuarioAutenticado() throws Exception {
        User admin = userRepository.save(new User(
                null, "Admin do Teste", "admin.me@auth.dev",
                passwordEncoder.encode("senha-correta"),
                Role.ADMIN, UserStatus.ACTIVE, null,
                null, null, null
        ));
        String token = jwtService.generateTokemn(admin);

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Admin do Teste"))
                .andExpect(jsonPath("$.email").value("admin.me@auth.dev"));
    }

    @Test
    void loginDeClienteVinculaAutomaticamenteAoCustomerExistente() throws Exception {
        Tenant tenant = tenantRepository.save(new Tenant(
                null, "Barbearia do Link", null, null,
                "America/Sao_Paulo", "pt-BR", "BRL", null, null
        ));

        Customer customer = customerRepository.save(new Customer(
                null, tenant.getId(), "Cliente Vinculável", "vinculavel@auth.dev", "11999998888", null, null
        ));

        userRepository.save(new User(
                null, "Cliente Vinculável", "vinculavel@auth.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, null,
                null, null, null
        ));

        String response = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"vinculavel@auth.dev","password":"senha-correta"}
                                """))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String clientToken = objectMapper.readTree(response).get("accessToken").asText();

        mockMvc.perform(get("/auth/me")
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tenantId").value(tenant.getId().toString()));

        mockMvc.perform(get("/me/customer")
                        .header("Authorization", "Bearer " + clientToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(customer.getId().toString()))
                .andExpect(jsonPath("$.tenantName").value("Barbearia do Link"));
    }

    @Test
    void meCustomerSemVinculoRetorna404() throws Exception {
        User clientSemCustomer = userRepository.save(new User(
                null, "Cliente Sem Barbearia", "solto@auth.dev",
                passwordEncoder.encode("senha-correta"),
                Role.CLIENT, UserStatus.ACTIVE, null,
                null, null, null
        ));
        String token = jwtService.generateTokemn(clientSemCustomer);

        mockMvc.perform(get("/me/customer")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }
}
