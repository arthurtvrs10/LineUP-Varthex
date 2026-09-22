package com.backend.commercial;
import jakarta.persistence.*;
import java.util.UUID;
@Entity @Table(name="business_settings")
public class BusinessSettings {
 @Id public UUID tenantId;
 @Version public Long version;
 public int minimumNoticeHours=0;
 public int cancellationNoticeHours=0;
 public int defaultCommissionPercent=40;
 public boolean staffNotifications=true;
}
