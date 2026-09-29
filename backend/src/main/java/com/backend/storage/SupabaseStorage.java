package com.backend.storage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import tools.jackson.databind.JsonNode;
import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.*;

@Service
public class SupabaseStorage {
    private static final String PREFIX = "supabase:";
    private final String url, key, bucket;
    private final RestClient client;
    public SupabaseStorage(@Value("${storage.supabase.url:}") String url,
            @Value("${storage.supabase.secret-key:}") String key,
            @Value("${storage.supabase.bucket:lineup-avatars}") String bucket) {
        this.url = url.replaceAll("/+$", ""); this.key = key; this.bucket = bucket;
        if (!this.url.isBlank() && !this.url.matches("https://[a-z0-9-]+\\.supabase\\.co"))
            throw new IllegalArgumentException("SUPABASE_URL deve ser a origem HTTPS do projeto Supabase");
        if (!bucket.matches("[a-z0-9-]+")) throw new IllegalArgumentException("Bucket Supabase inválido");
        var factory = new JdkClientHttpRequestFactory(HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build());
        factory.setReadTimeout(Duration.ofSeconds(15));
        client = RestClient.builder().requestFactory(factory).baseUrl(this.url + "/storage/v1")
                .defaultHeader("apikey", key).build();
    }
    public boolean ready() { return !url.isBlank() && !key.isBlank(); }
    public boolean stored(String value) { return value != null && value.startsWith(PREFIX); }
    private String path(String value) {
        String path = value.substring(PREFIX.length());
        if (!path.matches("avatars/[0-9a-f-]{36}/[0-9a-f-]{36}\\.jpg")) throw new IllegalArgumentException("Objeto inválido");
        return path;
    }
    public boolean samePhoto(String saved, String submitted) {
        if (Objects.equals(saved, submitted)) return true;
        if (!stored(saved) || submitted == null) return false;
        return submitted.startsWith(url + "/storage/v1/object/sign/" + bucket + "/" + path(saved) + "?");
    }
    static byte[] validate(String data) {
        if (data == null || !data.startsWith("data:image/jpeg;base64,") || data.length() > 350_000)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie uma foto JPEG comprimida de até 256 KB");
        try {
            byte[] bytes = Base64.getDecoder().decode(data.substring(data.indexOf(',') + 1));
            if (bytes.length > 256 * 1024) throw new IllegalArgumentException();
            try (var input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
                var readers = ImageIO.getImageReaders(input);
                if (!readers.hasNext()) throw new IllegalArgumentException();
                var reader = readers.next();
                try {
                    reader.setInput(input);
                    if (!reader.getFormatName().equalsIgnoreCase("JPEG") || reader.getWidth(0) > 512 || reader.getHeight(0) > 512
                            || reader.read(0) == null) throw new IllegalArgumentException();
                } finally { reader.dispose(); }
            }
            return bytes;
        } catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Foto inválida; use JPEG de até 512 × 512 e 256 KB"); }
    }
    public String upload(UUID userId, String data) {
        byte[] bytes = validate(data);
        if (!ready()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "O operador precisa configurar o Supabase Storage para salvar fotos");
        String path = "avatars/" + userId + "/" + UUID.randomUUID() + ".jpg";
        try {
            client.post().uri("/object/" + bucket + "/" + path).contentType(MediaType.IMAGE_JPEG)
                    .header("Cache-Control", "max-age=3600").body(bytes).retrieve().toBodilessEntity();
            return PREFIX + path;
        } catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Não foi possível salvar a foto no Supabase. Confira a configuração e a cota de armazenamento"); }
    }
    public String display(String value) {
        if (!stored(value)) return value;
        if (!ready()) return null;
        try {
            JsonNode response = client.post().uri("/object/sign/" + bucket + "/" + path(value))
                    .contentType(MediaType.APPLICATION_JSON).body(Map.of("expiresIn", 3600)).retrieve().body(JsonNode.class);
            String signed = response == null ? "" : response.path("signedURL").asText();
            if (!signed.startsWith("/object/sign/" + bucket + "/" + path(value) + "?")) return null;
            return url + "/storage/v1" + signed;
        } catch (Exception e) { return null; }
    }
    public void delete(String value) {
        if (!stored(value) || !ready()) return;
        try {
            client.method(HttpMethod.DELETE).uri("/object/" + bucket).contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("prefixes", List.of(path(value)))).retrieve().toBodilessEntity();
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(getClass()).warn("Supabase: limpeza de foto pendente; revisar objetos órfãos no bucket");
        }
    }
}
