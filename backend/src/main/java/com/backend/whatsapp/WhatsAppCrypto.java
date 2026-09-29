package com.backend.whatsapp;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Component
public class WhatsAppCrypto {
    private final byte[] key;
    public WhatsAppCrypto(@Value("${whatsapp.encryption-key:}") String encoded) {
        byte[] parsed;
        try { parsed=Base64.getDecoder().decode(encoded); } catch(Exception e) { parsed=new byte[0]; }
        key=parsed;
    }
    public boolean ready(){return key.length==32;}
    public String encrypt(UUID tenant,String plain){
        if(!ready())throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"A proteção de credenciais precisa ser configurada pelo operador do LineUp");
        try {
            byte[] iv=new byte[12];new SecureRandom().nextBytes(iv);
            Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");cipher.init(Cipher.ENCRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,iv));
            cipher.updateAAD(tenant.toString().getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(iv)+":"+Base64.getEncoder().encodeToString(cipher.doFinal(plain.getBytes(StandardCharsets.UTF_8)));
        }catch(Exception e){throw new IllegalStateException("Não foi possível proteger a credencial");}
    }
    public String decrypt(UUID tenant,String encoded){
        try {
            String[] parts=encoded.split(":");Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,Base64.getDecoder().decode(parts[0])));
            cipher.updateAAD(tenant.toString().getBytes(StandardCharsets.UTF_8));
            return new String(cipher.doFinal(Base64.getDecoder().decode(parts[1])),StandardCharsets.UTF_8);
        }catch(Exception e){throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"Credencial indisponível. Verifique a chave de proteção do servidor");}
    }
    public static String hash(String value){
        try{return HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}
        catch(Exception e){throw new IllegalStateException(e);}
    }
}
