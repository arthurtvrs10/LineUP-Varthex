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
                        .requestMatchers(HttpMethod.POST, "/auth/login")
                        .permitAll()

                        // Gestão de usuários
                        .requestMatchers("/users", "/users/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN")

                        // Gestão global de barbearias
                        .requestMatchers(HttpMethod.POST,
                                "/barbershops")
                        .hasAnyRole("SUPER_ADMIN",
                                "ADMIN")

                        // Somente SUPER_ADMIN lista/acessa globalmente barbearias
                        .requestMatchers(
                                "/barbershops",
                                "/barbershops/**"
                        ).hasRole("SUPER_ADMIN")

                        // Barbershops
                        .requestMatchers(
                                "/barbershops",
                                "/barbershops/**"
                        ).hasAnyRole("SUPER_ADMIN", "ADMIN")

                        .requestMatchers(
                                "/barbers",
                                "/barbers/**"
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
