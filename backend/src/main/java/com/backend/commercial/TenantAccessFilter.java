package com.backend.commercial;

import com.backend.tenants.TenantRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

public class TenantAccessFilter extends OncePerRequestFilter {
    private final TenantRepository tenants;
    private final BookingDirectory directory;
    public TenantAccessFilter(TenantRepository tenants, SubscriptionRepository subscriptions) {
        this.tenants = tenants;
        this.directory = new BookingDirectory(tenants, subscriptions);
    }
    @Override protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String path = req.getRequestURI();
        // Account and discovery remain usable even when the previous shop closes.
        boolean account = path.startsWith("/auth/") || path.equals("/users/me")
                || path.startsWith("/billing/")
                || path.equals("/notifications") || path.startsWith("/notifications/")
                || path.equals("/me/barbershops")
                || path.equals("/me/barbershop-selection")
                || path.equals("/notification-preferences");
        if (authentication instanceof JwtAuthenticationToken auth
                && !"SUPER_ADMIN".equals(auth.getToken().getClaimAsString("role")) && !account) {
            String claim = auth.getToken().getClaimAsString("tenantId");
            // Only CLIENT may choose a booking context. Staff always retain their signed tenant.
            String selection = req.getHeader("X-Barbershop-Id");
            if ("CLIENT".equals(auth.getToken().getClaimAsString("role")) && selection != null) {
                try {
                    if (!UUID.fromString(selection).toString().equalsIgnoreCase(selection)) throw new IllegalArgumentException();
                } catch (IllegalArgumentException ex) { reject(res, 400, "Barbearia inválida"); return; }
                claim = selection;
                Jwt context = Jwt.withTokenValue(auth.getToken().getTokenValue())
                        .headers(h -> h.putAll(auth.getToken().getHeaders()))
                        .claims(c -> { c.putAll(auth.getToken().getClaims()); c.put("tenantId", selection); }).build();
                var selected = new JwtAuthenticationToken(context, auth.getAuthorities(), auth.getName());
                selected.setDetails(auth.getDetails());
                SecurityContextHolder.getContext().setAuthentication(selected);
            }
            boolean client = "CLIENT".equals(auth.getToken().getClaimAsString("role"));
            if (claim != null && tenants.findById(UUID.fromString(claim))
                    .filter(t -> client ? directory.available(t) : directory.accessible(t)).isEmpty()) {
                reject(res, 403, "Esta barbearia está indisponível. Escolha outra para continuar."); return;
            }
        }
        chain.doFilter(req, res);
    }
    private void reject(HttpServletResponse res, int status, String message) throws IOException {
        res.setStatus(status);
        res.setContentType("application/json;charset=UTF-8");
        res.getWriter().write("{\"message\":\"" + message + "\"}");
    }
}
