package com.backend.commercial;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@Transactional
public class BusinessSettingsService {
 private final BusinessSettingsRepository settings; private final CommunicationConsentRepository consents;
 private final CommercialService commercial;
 public BusinessSettingsService(BusinessSettingsRepository settings,CommunicationConsentRepository consents,CommercialService commercial){this.settings=settings;this.consents=consents;this.commercial=commercial;}
 public BusinessSettings get(UUID tenant){return settings.findById(tenant).orElseGet(()->{var s=new BusinessSettings();s.tenantId=tenant;return s;});}
 public record Input(Integer minimumNoticeHours,Integer cancellationNoticeHours,Integer defaultCommissionPercent,Boolean staffNotifications,Long version){}
 public BusinessSettings update(UUID tenant,UUID actor,Input input){commercial.lock(tenant);var s=get(tenant);CommercialService.require(java.util.Objects.equals(s.version,input.version()),"Configuração alterada por outra pessoa; recarregue");CommercialService.require(input.minimumNoticeHours()!=null&&input.minimumNoticeHours()>=0&&input.minimumNoticeHours()<=720&&input.cancellationNoticeHours()!=null&&input.cancellationNoticeHours()>=0&&input.cancellationNoticeHours()<=720&&input.defaultCommissionPercent()!=null&&input.defaultCommissionPercent()>=0&&input.defaultCommissionPercent()<=100&&input.staffNotifications()!=null,"Configuração inválida");s.minimumNoticeHours=input.minimumNoticeHours();s.cancellationNoticeHours=input.cancellationNoticeHours();s.defaultCommissionPercent=input.defaultCommissionPercent();s.staffNotifications=input.staffNotifications();settings.save(s);commercial.event(tenant,actor,"SETTINGS_UPDATE",tenant);return s;}
 public CommunicationConsent consent(UUID user){return consents.findById(user).orElseGet(()->{var c=new CommunicationConsent();c.userId=user;return c;});}
 public CommunicationConsent consent(UUID user,boolean marketing){var c=consent(user);c.marketing=marketing;c.updatedAt=LocalDateTime.now();commercial.event(null,user,marketing?"MARKETING_OPT_IN":"MARKETING_OPT_OUT",user);return consents.save(c);}
}
