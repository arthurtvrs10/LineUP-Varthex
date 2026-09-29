package com.backend.storage;

import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.*;
import javax.imageio.ImageIO;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

class SupabaseStorageTest {
    String photo(int size) throws Exception {
        var out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(size, size, BufferedImage.TYPE_INT_RGB), "jpg", out);
        return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(out.toByteArray());
    }
    @Test void acceptsCompressedJpegAndRejectsSpoofedOrOversizedImages() throws Exception {
        assertTrue(SupabaseStorage.validate(photo(200)).length > 0);
        assertThrows(ResponseStatusException.class, () -> SupabaseStorage.validate("data:image/jpeg;base64,PHNjcmlwdD4="));
        assertThrows(ResponseStatusException.class, () -> SupabaseStorage.validate("data:image/svg+xml;base64,PHN2Zz4="));
        assertThrows(ResponseStatusException.class, () -> SupabaseStorage.validate(photo(513)));
        assertThrows(ResponseStatusException.class, () -> SupabaseStorage.validate("data:image/jpeg;base64," + "A".repeat(350_000)));
    }
    @Test void absentConfigurationDoesNotSilentlyStoreNewPhotosInDatabase() throws Exception {
        var storage = new SupabaseStorage("", "", "lineup-avatars");
        assertFalse(storage.ready());
        assertThrows(ResponseStatusException.class, () -> storage.upload(UUID.randomUUID(), photo(20)));
        assertEquals("legacy-image", storage.display("legacy-image"));
    }
    @Test void onlyAcceptsOwnSignedPhotoReference() {
        var storage = new SupabaseStorage("https://demo.supabase.co", "fake", "lineup-avatars");
        String path = "avatars/" + UUID.randomUUID() + "/" + UUID.randomUUID() + ".jpg";
        String saved = "supabase:" + path;
        assertTrue(storage.samePhoto(saved, "https://demo.supabase.co/storage/v1/object/sign/lineup-avatars/" + path + "?token=fake"));
        assertFalse(storage.samePhoto(saved, "https://evil.example/" + path));
        assertFalse(storage.samePhoto(saved, "supabase:avatars/" + UUID.randomUUID() + "/" + UUID.randomUUID() + ".jpg"));
    }
    @Test void uploadsWithServerKeyAndCreatesPrivateExpiringUrl() throws Exception {
        var storage = new SupabaseStorage("https://demo.supabase.co", "fake", "lineup-avatars");
        var builder = RestClient.builder().baseUrl("https://demo.supabase.co/storage/v1").defaultHeader("apikey", "fake");
        var server = MockRestServiceServer.bindTo(builder).build();
        ReflectionTestUtils.setField(storage, "client", builder.build());
        UUID user = UUID.randomUUID();
        server.expect(requestTo(org.hamcrest.Matchers.startsWith("https://demo.supabase.co/storage/v1/object/lineup-avatars/avatars/" + user + "/")))
                .andExpect(method(HttpMethod.POST)).andExpect(header("apikey", "fake"))
                .andExpect(content().contentType(MediaType.IMAGE_JPEG)).andRespond(withSuccess("{}", MediaType.APPLICATION_JSON));
        String saved = storage.upload(user, photo(20));
        server.verify(); server.reset();
        String path = saved.substring("supabase:".length());
        String signed = "/object/sign/lineup-avatars/" + path + "?token=fake";
        server.expect(requestTo("https://demo.supabase.co/storage/v1/object/sign/lineup-avatars/" + path))
                .andExpect(content().json("{\"expiresIn\":3600}"))
                .andRespond(withSuccess("{\"signedURL\":\"" + signed + "\"}", MediaType.APPLICATION_JSON));
        assertEquals("https://demo.supabase.co/storage/v1" + signed, storage.display(saved));
        server.verify(); server.reset();
        server.expect(requestTo("https://demo.supabase.co/storage/v1/object/lineup-avatars"))
                .andExpect(method(HttpMethod.DELETE)).andExpect(content().json("{\"prefixes\":[\"" + path + "\"]}"))
                .andRespond(withSuccess());
        storage.delete(saved); server.verify();
    }
    @Test void rejectsNonSupabaseHosts() {
        assertThrows(IllegalArgumentException.class, () -> new SupabaseStorage("http://localhost:8080", "fake", "bucket"));
    }
}
