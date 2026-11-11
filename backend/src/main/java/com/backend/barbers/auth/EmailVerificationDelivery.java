package com.backend.barbers.auth;
import com.backend.email.EmailService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
@Component
public class EmailVerificationDelivery {
    private final EmailService email;
    public EmailVerificationDelivery(EmailService email){this.email=email;}
    @TransactionalEventListener
    public void afterRegistration(EmailVerificationService.Delivery event) {
        email.sendVerificationEmail(event.recipient(),event.link());
    }
}
