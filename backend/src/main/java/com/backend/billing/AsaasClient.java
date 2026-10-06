package com.backend.billing;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import java.net.URI;
import java.time.Duration;

@Component
public class AsaasClient {
    public static class Rejected extends ResponseStatusException {
        public Rejected() { super(HttpStatus.BAD_REQUEST, "Asaas recusou os dados da operação. Confira os dados do contratante e as condições da cobrança."); }
    }
    private final RestClient client;
    private final boolean enabled;
    private final String apiKey;
    private final boolean production;

    public AsaasClient(@Value("${asaas.enabled:false}") boolean enabled,
            @Value("${asaas.api-key:}") String apiKey,
            @Value("${asaas.environment:sandbox}") String environment) {
        if (!environment.equals("sandbox") && !environment.equals("production"))
            throw new IllegalArgumentException("ASAAS_ENVIRONMENT deve ser sandbox ou production");
        this.enabled = enabled; this.apiKey = apiKey; this.production = environment.equals("production");
        if ((production && apiKey.startsWith("$aact_hmlg_")) || (!production && apiKey.startsWith("$aact_prod_")))
            throw new IllegalArgumentException("Chave Asaas incompatível com o ambiente configurado");
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(65));
        client = RestClient.builder().requestFactory(factory)
                .baseUrl(production ? "https://api.asaas.com/v3" : "https://api-sandbox.asaas.com/v3")
                .defaultHeader("access_token", apiKey).defaultHeader("User-Agent", "LineUp/1.0").build();
    }
    public boolean configured() { return enabled && !apiKey.isBlank(); }
    public boolean production() { return production; }
    public String environment() { return production ? "production" : "sandbox"; }
    public void confirmSandboxPayment(String paymentId) {
        if (production) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurso indisponível");
        post("/sandbox/payment/" + safeId(paymentId) + "/confirm", java.util.Map.of());
    }
    public void requireConfigured() {
        if (!configured()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Contratação online ainda não disponível");
    }
    public JsonNode get(String path) { return call(HttpMethod.GET, path, null); }
    public JsonNode getOptional(String path) {
        requireConfigured();
        try { return client.get().uri(path).retrieve().body(JsonNode.class); }
        catch (HttpClientErrorException.NotFound ex) { return null; }
        catch (RestClientException ex) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Conciliação com Asaas indisponível"); }
    }
    public JsonNode post(String path, Object body) { return call(HttpMethod.POST, path, body); }
    public JsonNode put(String path, Object body) { return call(HttpMethod.PUT, path, body); }
    public void delete(String path) { call(HttpMethod.DELETE, path, null); }
    private JsonNode call(HttpMethod method, String path, Object body) {
        requireConfigured();
        try {
            var request = client.method(method).uri(path).contentType(MediaType.APPLICATION_JSON);
            if (body != null) request.body(body);
            return request.retrieve().body(JsonNode.class);
        } catch (HttpClientErrorException ex) {
            if(ex.getStatusCode().value()==400 || ex.getStatusCode().value()==422) throw new Rejected();
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Operação Asaas indisponível; consulte o estado antes de tentar novamente.");
        } catch (RestClientException ex) {
            // Never surface provider bodies, API keys or payer information.
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Não foi possível confirmar a operação no Asaas. Consulte o estado antes de tentar novamente.");
        }
    }
    public String checkoutUrl(String id) {
        return (production ? "https://asaas.com" : "https://sandbox.asaas.com") + "/checkoutSession/show?id=" + safeId(id);
    }
    public static String safeId(String id) {
        if (id == null || !id.matches("[A-Za-z0-9_-]{1,100}"))
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Identificador inválido do provedor");
        return id;
    }
    public static String safeUrl(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            URI uri = URI.create(value);
            if ("https".equals(uri.getScheme()) && uri.getUserInfo() == null
                    && ("asaas.com".equals(uri.getHost()) || "www.asaas.com".equals(uri.getHost())
                    || "sandbox.asaas.com".equals(uri.getHost()))) return value;
        } catch (IllegalArgumentException ignored) { }
        return null;
    }
}
