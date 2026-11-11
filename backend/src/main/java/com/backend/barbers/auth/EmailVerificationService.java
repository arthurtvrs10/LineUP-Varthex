package com.backend.barbers.auth;

import com.backend.users.*;
import com.backend.email.EmailService;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.security.*;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class EmailVerificationService {
    @jakarta.persistence.PersistenceContext private jakarta.persistence.EntityManager em;
    private final UserRepository users;
    private final EmailVerificationRepository tokens;
    private final ApplicationEventPublisher events;
    private final EmailService email;
    private final String frontend;
    private final SecureRandom random=new SecureRandom();
    public EmailVerificationService(UserRepository users,EmailVerificationRepository tokens,ApplicationEventPublisher events,
            EmailService email,@Value("${app.frontend-url:http://localhost:3000}") String frontend) {
        this.users=users;this.tokens=tokens;this.events=events;this.email=email;this.frontend=frontend.replaceAll("/+$", "");
    }
    public record Delivery(String recipient,String link) {
        @Override public String toString(){return "EmailVerificationDelivery[REDACTED]";}
    }
    public void start(User user) {
        user.requireEmailVerification();users.saveAndFlush(user);
        events.publishEvent(new Delivery(user.getEmail(),issue(user)));
    }
    private String issue(User user) {
        byte[] bytes=new byte[32];random.nextBytes(bytes);
        String raw=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        var token=tokens.findById(user.getId()).orElseGet(EmailVerificationToken::new);
        token.userId=user.getId();token.tokenHash=hash(raw);token.sentAt=LocalDateTime.now();
        token.expiresAt=token.sentAt.plusMinutes(30);token.usedAt=null;tokens.saveAndFlush(token);
        // Fragment avoids sending the token in page requests or referrer headers.
        return frontend+"/confirmar-email#token="+raw;
    }
    @Transactional
    public void resend(String address) {
        String normalized=address==null?"":address.strip().toLowerCase(Locale.ROOT);
        if(normalized.length()>180||!normalized.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe um e-mail válido");
        var found=users.findByEmailIgnoreCase(normalized).orElse(null);
        if(found==null)return;
        var user=users.findLockedById(found.getId()).orElseThrow();
        if(!user.needsEmailVerification())return;
        var previous=tokens.findById(user.getId()).orElse(null);
        if(previous!=null&&previous.sentAt.isAfter(LocalDateTime.now().minusSeconds(60)))return;
        String link=issue(user);
        if(!email.sendVerificationEmail(user.getEmail(),link))
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Não foi possível enviar o e-mail agora. Tente novamente mais tarde.");
    }
    @Transactional
    public void confirm(String raw) {
        if(raw==null||!raw.matches("[A-Za-z0-9_-]{43}"))throw invalid();
        String hash=hash(raw);
        var found=tokens.findByTokenHash(hash).orElseThrow(this::invalid);
        var user=users.findLockedById(found.userId).orElseThrow(this::invalid);
        // Refresh after acquiring the shared user lock, to handle concurrent resend/confirmation.
        var token=tokens.findById(user.getId()).orElseThrow(this::invalid);
        em.refresh(token);
        if(!hash.equals(token.tokenHash)||token.usedAt!=null||!token.expiresAt.isAfter(LocalDateTime.now()))throw invalid();
        user.verifyEmail();users.save(user);token.usedAt=LocalDateTime.now();tokens.save(token);
    }
    private ResponseStatusException invalid(){return new ResponseStatusException(HttpStatus.BAD_REQUEST,"Link inválido, expirado ou já utilizado. Solicite um novo e-mail.");}
    private String hash(String value) {
        try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}
        catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}
    }
}
