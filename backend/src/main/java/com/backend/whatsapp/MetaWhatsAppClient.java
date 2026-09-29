package com.backend.whatsapp;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.Map;

@Component
public class MetaWhatsAppClient {
    private final RestClient client;
    private final ObjectMapper json;
    public final String version;
    public MetaWhatsAppClient(ObjectMapper json,@Value("${whatsapp.graph-version:v23.0}") String version){
        if(!version.matches("v[0-9]+\\.0"))throw new IllegalArgumentException("Versão Graph inválida");
        this.version=version;this.json=json;
        var factory=new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build());
        factory.setReadTimeout(Duration.ofSeconds(20));
        client=RestClient.builder().baseUrl("https://graph.facebook.com/"+version).requestFactory(factory).build();
    }
    public static class Failure extends RuntimeException {
        public final String code;
        public final boolean ambiguous;
        Failure(String code,boolean ambiguous){super("Meta: "+code);this.code=code;this.ambiguous=ambiguous;}
    }
    public JsonNode call(String method,String path,String token,Map<String,String> query,Object body){
        try {
            var req=client.method(org.springframework.http.HttpMethod.valueOf(method)).uri(builder->{builder.path("/"+path);query.forEach(builder::queryParam);return builder.build();});
            if(token!=null)req.header("Authorization","Bearer "+token);
            req.contentType(org.springframework.http.MediaType.APPLICATION_JSON);
            if(body!=null)req.body(body);
            String result=req.retrieve().body(String.class);
            return json.readTree(result==null?"{}":result);
        }catch(RestClientResponseException e){
            String code="HTTP_"+e.getStatusCode().value();
            try{code=json.readTree(e.getResponseBodyAsString()).path("error").path("code").asText(code);}catch(Exception ignored){}
            throw new Failure(code,e.getStatusCode().is5xxServerError());
        }catch(Exception e){throw new Failure("NETWORK",true);}
    }
}
