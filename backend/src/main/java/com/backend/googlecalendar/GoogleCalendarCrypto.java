package com.backend.googlecalendar;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
@Component public class GoogleCalendarCrypto {
 private final byte[] key;
 public GoogleCalendarCrypto(@Value("${google.calendar.encryption-key:}") String encoded){byte[] b;try{b=Base64.getDecoder().decode(encoded);}catch(Exception e){b=new byte[0];}key=b;}
 public boolean ready(){return key.length==32;}
 public String encrypt(UUID tenant,String plain){if(!ready())throw new IllegalStateException("Google Calendar encryption key is not configured");try{byte[] iv=new byte[12];new SecureRandom().nextBytes(iv);Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));c.updateAAD(tenant.toString().getBytes(StandardCharsets.UTF_8));return Base64.getEncoder().encodeToString(iv)+":"+Base64.getEncoder().encodeToString(c.doFinal(plain.getBytes(StandardCharsets.UTF_8)));}catch(Exception e){throw new IllegalStateException("Could not encrypt Google credential",e);}}
 public String decrypt(UUID tenant,String value){try{String[] p=value.split(":");Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,Base64.getDecoder().decode(p[0])));c.updateAAD(tenant.toString().getBytes(StandardCharsets.UTF_8));return new String(c.doFinal(Base64.getDecoder().decode(p[1])),StandardCharsets.UTF_8);}catch(Exception e){throw new IllegalStateException("Google credential cannot be decrypted",e);}}
}
