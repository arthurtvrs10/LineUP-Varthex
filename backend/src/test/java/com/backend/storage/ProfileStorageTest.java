package com.backend.storage;

import com.backend.users.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(properties="whatsapp.worker-enabled=false")
class ProfileStorageTest {
    @Autowired UserRepository users;
    @Autowired UserService service;
    @Autowired PlatformTransactionManager transactions;
    @MockitoBean SupabaseStorage storage;
    UUID id;
    @BeforeEach void seed() {
        User user = new User(null, "Storage", UUID.randomUUID()+"@example.test", "unused", Role.CLIENT, UserStatus.ACTIVE, null, null, null, null);
        user.setPhotoData("old-reference"); id = users.save(user).getId();
    }
    @AfterEach void cleanup() { users.deleteById(id); }
    @Test void savesOnlyReferenceAndDeletesPreviousAfterCommit() {
        when(storage.upload(id,"new-image")).thenReturn("new-reference");
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            service.updateOwnProfile(id,"Storage","new-image");
            verify(storage, never()).delete(any());
        });
        assertEquals("new-reference",users.findById(id).orElseThrow().getPhotoData());
        verify(storage).upload(id,"new-image"); verify(storage).delete("old-reference");
    }
    @Test void rollbackKeepsOldReferenceAndCleansNewObject() {
        when(storage.upload(id,"new-image")).thenReturn("new-reference");
        new TransactionTemplate(transactions).executeWithoutResult(tx -> {
            service.updateOwnProfile(id,"Storage","new-image"); tx.setRollbackOnly();
        });
        assertEquals("old-reference",users.findById(id).orElseThrow().getPhotoData());
        verify(storage).delete("new-reference"); verify(storage, never()).delete("old-reference");
    }
    @Test void unchangedPhotoDoesNotUploadAgainAndRemovalDeletesStoredObject() {
        when(storage.samePhoto("old-reference","same-signed-url")).thenReturn(true);
        service.updateOwnProfile(id,"Updated","same-signed-url");
        verify(storage,never()).upload(any(),any());
        service.updateOwnProfile(id,"Updated","");
        assertNull(users.findById(id).orElseThrow().getPhotoData()); verify(storage).delete("old-reference");
    }
}
