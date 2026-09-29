package com.backend.whatsapp;

import com.backend.whatsapp.WhatsAppData.*;
import com.backend.customers.*;
import com.backend.scheduling.*;
import com.backend.tenants.*;
import jakarta.persistence.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service @Transactional
public class WhatsAppDelivery {
    private final EntityManager em; private final WhatsAppService service; private final com.backend.commercial.BookingDirectory directory;
    public WhatsAppDelivery(EntityManager em,WhatsAppService service,com.backend.commercial.BookingDirectory directory){this.em=em;this.service=service;this.directory=directory;}
    public List<UUID> tenants(){return em.createQuery("select c.tenantId from WaConnection c where c.status='CONNECTED'",UUID.class).getResultList();}
    public List<UUID> queued(){return em.createQuery("select m.id from WaMessage m where m.status='QUEUED' and m.scheduledAt<=:now order by m.scheduledAt",UUID.class).setParameter("now",Instant.now()).setMaxResults(30).getResultList();}
    public record Dispatch(UUID id,UUID tenant,String phoneId,String token,Map<String,Object> payload){
        @Override public String toString(){return "WhatsApp dispatch "+id;}
    }
    public Dispatch claim(UUID id){
        Message m=em.find(Message.class,id);if(m==null)return null;service.lock(m.tenantId);em.refresh(m);
        if(!"QUEUED".equals(m.status)||m.scheduledAt.isAfter(Instant.now()))return null;
        Connection c=em.find(Connection.class,m.tenantId);Tenant tenant=em.find(Tenant.class,m.tenantId);
        if(c==null||!"CONNECTED".equals(c.status)||!directory.available(tenant))return null;
        if(m.automationId!=null){Automation a=em.find(Automation.class,m.automationId);if(a==null||!a.enabled){m.status="CANCELED";return null;}}
        if(m.appointmentId!=null){Appointment a=em.find(Appointment.class,m.appointmentId);if(a==null||a.getStatus()==AppointmentStatus.CANCELED||a.getStatus()==AppointmentStatus.NO_SHOW){m.status="CANCELED";return null;}}
        Template t=m.templateId==null?null:em.find(Template.class,m.templateId);
        if(t!=null&&(!"APPROVED".equals(t.status)||!t.supported||!m.testMessage&&!service.allowed(m.tenantId,m.phone,t))){m.status="CANCELED";m.errorCode="TEMPLATE_OR_CONSENT";return null;}
        Consent consent=service.consent(m.tenantId,m.phone);
        if(consent!=null&&consent.blocked){m.status="CANCELED";m.errorCode="OPT_OUT";return null;}
        if(t==null){
            long inbound=em.createQuery("select count(x) from WaMessage x where x.tenantId=:t and x.phone=:p and x.direction='INBOUND' and x.createdAt>:after",Long.class).setParameter("t",m.tenantId).setParameter("p",m.phone).setParameter("after",Instant.now().minus(Duration.ofHours(24))).getSingleResult();
            if(inbound==0){m.status="CANCELED";m.errorCode="WINDOW_CLOSED";return null;}
        }
        if(!m.testMessage&&t!=null){
            ZoneId zone=ZoneId.of(tenant.getDefaultTimeZone());ZonedDateTime now=ZonedDateTime.now(zone);
            if(now.getHour()<8||now.getHour()>=20){m.scheduledAt=now.toLocalDate().plusDays(now.getHour()>=20?1:0).atTime(8,0).atZone(zone).toInstant();return null;}
            if("MARKETING".equals(t.category)){
                long recent=em.createQuery("select count(x) from WaMessage x, WaTemplate t where x.templateId=t.id and x.tenantId=:tenant and x.phone=:p and t.category='MARKETING' and (x.sentAt>:after or x.status='SENDING' or x.status='UNKNOWN')",Long.class).setParameter("tenant",m.tenantId).setParameter("p",m.phone).setParameter("after",Instant.now().minus(Duration.ofHours(24))).getSingleResult();
                if(recent>0){m.status="CANCELED";m.errorCode="FREQUENCY_LIMIT";return null;}
            }
        }
        Map<String,Object> payload=new HashMap<>(Map.of("messaging_product","whatsapp","to",m.phone,"biz_opaque_callback_data",m.id.toString()));
        if(t==null){payload.put("type","text");payload.put("text",Map.of("body",m.body));}
        else{
            Map<String,Object> template=new HashMap<>(Map.of("name",t.name,"language",Map.of("code",t.language)));
            List<String> parameters=service.strings(m.parametersJson);
            if(!parameters.isEmpty())template.put("components",List.of(Map.of("type","body","parameters",parameters.stream().map(p->Map.of("type","text","text",p)).toList())));
            payload.put("type","template");payload.put("template",template);
        }
        m.status="SENDING";m.scheduledAt=Instant.now();em.flush();
        return new Dispatch(m.id,m.tenantId,c.phoneId,service.token(c),payload);
    }
    public void finish(Dispatch d,String metaId,String error,boolean ambiguous){service.lock(d.tenant());Message m=em.find(Message.class,d.id());if(m==null)return;
        if(metaId!=null){m.metaId=metaId;if(m.sentAt==null)m.sentAt=Instant.now();if("SENDING".equals(m.status))m.status="SENT";}
        else if("SENDING".equals(m.status)){m.status=ambiguous?"UNKNOWN":"FAILED";m.errorCode=error;}
    }
    public void recover(){em.createQuery("update WaMessage m set m.status='UNKNOWN',m.errorCode='INTERRUPTED' where m.status='SENDING' and m.scheduledAt<:before").setParameter("before",Instant.now().minusSeconds(180)).executeUpdate();}
    public void automate(UUID tenantId){
        service.lock(tenantId);Tenant tenant=em.find(Tenant.class,tenantId);if(!directory.available(tenant))return;
        ZoneId zone=ZoneId.of(tenant.getDefaultTimeZone());LocalDateTime now=LocalDateTime.now(zone);LocalDate today=now.toLocalDate();
        List<Automation> automations=service.rows("WaAutomation",Automation.class,tenantId).stream().filter(a->a.enabled).toList();
        for(Automation a:automations){
            Template template=em.find(Template.class,a.templateId);if(template==null||!"APPROVED".equals(template.status)||!template.supported)continue;
            if(Set.of("REMINDER","CONFIRMATION","AFTERCARE").contains(a.triggerType)){
                LocalDateTime enabled=LocalDateTime.ofInstant(a.enabledAt,zone);
                List<Appointment> appointments=em.createQuery("select p from Appointment p where p.tenantId=:t and p.endAt>:from and p.startAt<:to",Appointment.class).setParameter("t",tenantId).setParameter("from",now.minusDays(2)).setParameter("to",now.plusDays(2)).getResultList();
                for(Appointment p:appointments){boolean eligible=switch(a.triggerType){
                    case "REMINDER" -> Set.of(AppointmentStatus.PENDING,AppointmentStatus.CONFIRMED).contains(p.getStatus())&&p.getStartAt().isAfter(now.plusHours(23))&&!p.getStartAt().isAfter(now.plusHours(24));
                    case "CONFIRMATION" -> p.getStatus()==AppointmentStatus.CONFIRMED&&p.getCreatedAt().isAfter(enabled)&&p.getStartAt().isAfter(now);
                    default -> p.getStatus()==AppointmentStatus.COMPLETED&&p.getCompletedAt()!=null&&p.getCompletedAt().isAfter(enabled)&&p.getCompletedAt().isBefore(now.minusHours(2))&&p.getCompletedAt().isAfter(now.minusHours(26));
                };if(eligible)queueAutomation(a,template,em.find(Customer.class,p.getCustomerId()),tenant,p,a.triggerType+":"+p.getId());}
            }else{
                List<Customer> customers=em.createQuery("select c from Customer c where c.tenantId=:t and c.status=com.backend.customers.CustomerStatus.ACTIVE",Customer.class).setParameter("t",tenantId).getResultList();
                for(Customer c:customers){
                    if("BIRTHDAY".equals(a.triggerType)){if(c.getBirthDate()!=null&&c.getBirthDate().getMonth()==today.getMonth()&&c.getBirthDate().getDayOfMonth()==today.getDayOfMonth())queueAutomation(a,template,c,tenant,null,"birthday:"+today.getYear()+":"+c.getId());}
                    else {
                        var last=em.createQuery("select p from Appointment p where p.tenantId=:t and p.customerId=:c and p.status=com.backend.scheduling.AppointmentStatus.COMPLETED order by p.endAt desc",Appointment.class).setParameter("t",tenantId).setParameter("c",c.getId()).setMaxResults(1).getResultList();
                        if(last.isEmpty())continue;Appointment p=last.getFirst();long days=java.time.temporal.ChronoUnit.DAYS.between(p.getEndAt().toLocalDate(),today);int threshold="RETURN".equals(a.triggerType)?25:60;
                        if(days==threshold)queueAutomation(a,template,c,tenant,p,a.triggerType+":"+p.getId());
                    }
                }
            }
        }
    }
    private void queueAutomation(Automation a,Template template,Customer customer,Tenant tenant,Appointment p,String event){
        if(customer==null||customer.getStatus()!=CustomerStatus.ACTIVE)return;String phone;
        try{phone=WhatsAppService.phone(customer.getPhone());}catch(Exception e){return;}
        if(!service.allowed(a.tenantId,phone,template))return;
        var barber=p==null?null:em.find(com.backend.barbers.BarberProfile.class,p.getBarberId());
        Map<String,String> values=Map.of("nome",customer.getFullName(),"barbearia",tenant.getTradeName(),"data",p==null?LocalDate.now().toString():p.getStartAt().toLocalDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),"hora",p==null?"":p.getStartAt().toLocalTime().toString(),"profissional",barber==null?"":barber.getDisplayName(),"servico",p==null?"":p.getItems().stream().map(AppointmentItem::getName).reduce((x,y)->x+", "+y).orElse("Atendimento"));
        List<String> parameters=service.strings(a.variablesJson).stream().map(values::get).toList();if(parameters.stream().anyMatch(v->v==null||v.isBlank()||v.length()>500))return;
        service.enqueue(a.tenantId,template,phone,parameters,"auto:"+a.id+":"+event,customer.getId(),p==null?null:p.getId(),null,a.id,false,Instant.now());
    }
}
