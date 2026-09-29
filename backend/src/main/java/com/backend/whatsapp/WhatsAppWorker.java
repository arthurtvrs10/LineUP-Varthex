package com.backend.whatsapp;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.beans.factory.annotation.Value;
import java.util.Map;

@Configuration @EnableScheduling
public class WhatsAppWorker {
    private final WhatsAppDelivery delivery;private final MetaWhatsAppClient meta;private final boolean enabled;
    public WhatsAppWorker(WhatsAppDelivery delivery,MetaWhatsAppClient meta,@Value("${whatsapp.worker-enabled:true}") boolean enabled){this.delivery=delivery;this.meta=meta;this.enabled=enabled;}
    @Scheduled(fixedDelay=15000,initialDelay=30000)
    public void send(){if(!enabled)return;delivery.recover();for(var id:delivery.queued()){
        WhatsAppDelivery.Dispatch dispatch;
        try{dispatch=delivery.claim(id);}catch(Exception e){continue;}if(dispatch==null)continue;
        try{var result=meta.call("POST",dispatch.phoneId()+"/messages",dispatch.token(),Map.of(),dispatch.payload());String metaId=result.path("messages").path(0).path("id").asText(null);delivery.finish(dispatch,metaId,metaId==null?"NO_MESSAGE_ID":null,metaId==null);}
        catch(MetaWhatsAppClient.Failure e){delivery.finish(dispatch,null,e.code,e.ambiguous);}
    }}
    @Scheduled(fixedDelay=60000,initialDelay=45000)
    public void automate(){if(!enabled)return;for(var tenant:delivery.tenants())try{delivery.automate(tenant);}catch(Exception ignored){/* One shop must not interrupt the others. */}}
}
