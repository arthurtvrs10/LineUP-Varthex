package com.backend.commercial;
import jakarta.persistence.*;
import java.util.*;
@Entity @Table(name="barber_catalogs")
public class BarberCatalog {
 @Id public UUID barberId;
 public UUID tenantId;
 @Version public Long version;
 public boolean restricted;
 @ElementCollection(fetch=FetchType.EAGER)
 @CollectionTable(name="barber_catalog_services",joinColumns=@JoinColumn(name="barber_id"))
 @Column(name="service_id")
 public Set<UUID> serviceIds=new HashSet<>();
}
