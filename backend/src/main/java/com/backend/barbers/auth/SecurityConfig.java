package com.backend.barbers.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;


@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder(){
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthUserDetailsService authUserDetailsService,
            PasswordEncoder passwordEncoder
    )  {
        DaoAuthenticationProvider authenticationProvider =
                new DaoAuthenticationProvider(authUserDetailsService);

        authenticationProvider.setPasswordEncoder(passwordEncoder);

        return  new ProviderManager(authenticationProvider);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth

                        // Público
                        .requestMatchers(HttpMethod.POST, "/auth/login", "/auth/social-login")
                        .permitAll()

                        // Criação de um novo tenant (cadastro da barbearia) é pública —
                        // ainda não existe usuário autenticado nesse momento.
                        .requestMatchers(HttpMethod.POST, "/tenants")
                        .permitAll()

                        // Listagem e suspensão/reativação de tenants são operação
                        // de plataforma — só SUPER_ADMIN, nunca ADMIN de uma
                        // barbearia específica.
                        .requestMatchers(HttpMethod.GET, "/tenants")
                        .hasRole("SUPER_ADMIN")

                        .requestMatchers(HttpMethod.PATCH, "/tenants/*/status")
                        .hasRole("SUPER_ADMIN")

                        // Gestão de usuários
                        .requestMatchers("/users", "/users/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN")

                        // Tenant/unidade do contexto autenticado
                        .requestMatchers(
                                "/tenant",
                                "/tenant/**",
                                "/unit",
                                "/unit/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN")

                        .requestMatchers(
                                "/barbers",
                                "/barbers/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "BARBER")

                        .requestMatchers(
                                "/customers",
                                "/customers/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "BARBER")

                        .requestMatchers(
                                "/services",
                                "/services/**",
                                "/service-categories",
                                "/service-categories/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "BARBER")

                        .requestMatchers(
                                "/appointments",
                                "/appointments/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN", "BARBER")

                        // Qualquer outro endpoint exige login
                        .anyRequest().authenticated()
                )

                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(
                                        jwtAuthenticationConverter()
                                ))
                )
                .build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {

        JwtGrantedAuthoritiesConverter authoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        authoritiesConverter.setAuthoritiesClaimName("role");
        authoritiesConverter.setAuthorityPrefix("ROLE_");

        JwtAuthenticationConverter jwtAuthenticationConverter =
                new JwtAuthenticationConverter();

        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(
                authoritiesConverter
        );

        return jwtAuthenticationConverter;
    }
}
