package com.backend.googlecalendar;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
@Component public class GoogleCalendarWorker {
 private final GoogleCalendarService service;
 public GoogleCalendarWorker(GoogleCalendarService service){this.service=service;}
 @Scheduled(fixedDelay=15000,initialDelay=20000)
 public void dispatch(){try{service.recoverStuck();}catch(Exception ignored){}for(var id:service.queuedIds())try{service.process(id);}catch(Exception ignored){}}
}
