package com.backend.commercial;

import com.backend.tenants.TenantRepository;
import com.backend.tenants.TenantStatus;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

public class TenantAccessFilter extends OncePerRequestFilter {
    private final TenantRepository tenants;private final SubscriptionRepository subscriptions;
    public TenantAccessFilter(TenantRepository tenants,SubscriptionRepository subscriptions){this.tenants=tenants;this.subscriptions=subscriptions;}
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
        var authentication=SecurityContextHolder.getContext().getAuthentication();
        if(authentication instanceof JwtAuthenticationToken auth && !"SUPER_ADMIN".equals(auth.getToken().getClaimAsString("role")) && !req.getRequestURI().startsWith("/auth/") && !req.getRequestURI().equals("/users/me")){
            String claim=auth.getToken().getClaimAsString("tenantId");
            if(claim!=null){UUID id=UUID.fromString(claim);var tenant=tenants.findById(id);
                boolean blocked=tenant.isEmpty() || tenant.get().getStatus()==TenantStatus.SUSPENDED || tenant.get().getStatus()==TenantStatus.CANCELED;
                var subscription=subscriptions.findAllByTenantId(id).stream().findFirst();
                if(subscription.isPresent()){var s=subscription.get();blocked=blocked||!("ACTIVE".equals(s.status)||"TRIAL".equals(s.status))||s.startsOn.isAfter(LocalDate.now())||s.endsOn.isBefore(LocalDate.now());}
                if(blocked){res.setStatus(403);res.setContentType("application/json;charset=UTF-8");res.getWriter().write("{\"message\":\"Acesso da barbearia suspenso ou assinatura fora da vigência\"}");return;}
            }
        }
        chain.doFilter(req,res);
    }
}
