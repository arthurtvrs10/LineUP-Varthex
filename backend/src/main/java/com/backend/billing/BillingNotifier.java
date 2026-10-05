package com.backend.billing;

import com.backend.email.EmailService;
import com.backend.notifications.*;
import com.backend.users.UserRepository;
import jakarta.persistence.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.time.LocalDate;
import java.util.Set;

@Component
public class BillingNotifier {
    private final BillingAccountRepository accounts;
    private final BillingChargeRepository charges;
    private final NotificationRepository notifications;
    private final UserRepository users;
    private final EmailService email;
    private final TransactionTemplate tx;
    private final EntityManager em;
    private final boolean enabled;
    private final boolean emailConfigured;
    private final String frontend;
    public BillingNotifier(BillingAccountRepository accounts,BillingChargeRepository charges,NotificationRepository notifications,
            UserRepository users,EmailService email,PlatformTransactionManager tm,EntityManager em,
            @Value("${asaas.worker-enabled:true}") boolean enabled,@Value("${resend.api-key:}") String emailKey,
            @Value("${app.frontend-url:http://localhost:3000}") String frontend) {
        this.accounts=accounts;this.charges=charges;this.notifications=notifications;this.users=users;this.email=email;
        this.tx=new TransactionTemplate(tm);this.em=em;this.enabled=enabled;this.emailConfigured=!emailKey.isBlank();this.frontend=frontend.replaceAll("/+$","");
    }
    @Scheduled(fixedDelayString="${asaas.notice-delay-ms:60000}")
    public void notifyDuePayments() {
        if(!enabled) return;
        for(var account:accounts.findAll()) for(var charge:charges.findAllByAccountIdOrderByDueDateDesc(account.id)) {
            if(account.actorId==null || charge.dueDate==null || charge.dueDate.isAfter(LocalDate.now().plusDays(2))
                    || !Set.of("PENDING","OVERDUE").contains(charge.status==null?"":charge.status)) continue;
            String notice=charge.failureCode==null?charge.status:charge.failureCode;
            String title="CARD_REFUSED".equals(notice)?"Cartão recusado na mensalidade do LineUp":charge.status.equals("OVERDUE")?"Mensalidade do LineUp vencida":"Mensalidade do LineUp a pagar";
            String message="Confira sua mensalidade e regularize o pagamento em Minha assinatura. Vencimento: "+charge.dueDate+".";
            tx.execute(status->{
                var current=em.find(BillingCharge.class,charge.id,LockModeType.PESSIMISTIC_WRITE);
                if(!notice.equals(current.noticeStatus)) {
                    notifications.save(new Notification(account.tenantId,account.actorId,null,NotificationChannel.IN_APP,
                            charge.status.equals("OVERDUE") || "CARD_REFUSED".equals(notice)?NotificationType.BILLING_PAYMENT_FAILED:NotificationType.BILLING_PAYMENT_DUE,
                            title,message,"BILLING",charge.id,NotificationStatus.SENT));
                    current.noticeStatus=notice;current.noticeEmailSent=false;charges.save(current);
                }
                return null;
            });
            var current=charges.findById(charge.id).orElseThrow();
            if(emailConfigured && !current.noticeEmailSent) users.findById(account.actorId).ifPresent(owner->{
                boolean sent=email.sendNotificationEmail(owner.getEmail(),title,"<p>"+message+"</p><p><a href=\""+
                        org.springframework.web.util.HtmlUtils.htmlEscape(frontend)+"/admin/assinatura\">Gerenciar assinatura</a></p>");
                if(sent) tx.execute(status->{var saved=charges.findById(charge.id).orElseThrow();saved.noticeEmailSent=true;charges.save(saved);return null;});
            });
        }
    }
}
