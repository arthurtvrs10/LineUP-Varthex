package com.backend.users;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

import static com.backend.users.UserStatus.ACTIVE;

@Service
public class UserService {

    public record RequesterContext(Role role, UUID tenantId) {
        public boolean isSuperAdmin() {
            return role == Role.SUPER_ADMIN;
        }
    }

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> listUsers(RequesterContext requester) {
        if (requester.isSuperAdmin()) {
            return userRepository.findAll();
        }
        return userRepository.findAll().stream()
                .filter(user -> requester.tenantId().equals(user.getTenantId()))
                .toList();
    }

    public User findById(UUID id, RequesterContext requester) {
        User user = findById(id);
        requireSameTenant(user, requester);
        return user;
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado"));
    }

    public User findByEmail(String email, RequesterContext requester) {
        User user = findByEmail(email);
        requireSameTenant(user, requester);
        return user;
    }

    public User findByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Email não encontrado"));
    }

    public User blockUser(UUID id, RequesterContext requester){
        User user = findById(id, requester);
        user.setStatus(UserStatus.BLOCKED);
        return userRepository.save(user);
    }

    public User activateUser(UUID id, RequesterContext requester){
        User user = findById(id, requester);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    public User updateOwnProfile(UUID userId, String name, String photoData) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome é obrigatório");
        }

        User user = findById(userId);
        user.setName(name);
        if (photoData != null) {
            user.setPhotoData(photoData.isBlank() ? null : photoData);
        }
        return userRepository.save(user);
    }

    public User assignTenant(UUID userId, UUID tenantId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("Usuário não encontrado")
                );

        user.assignTenantId(tenantId);
        return userRepository.save(user);
    }

    public User createUser(RequesterContext requester, String name, String email, String password, Role role, UUID tenantId) {
        if (name == null || email == null || password == null || role == null){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados obrigatórios faltando");
        }

        UUID resolvedTenantId = tenantId;

        if (!requester.isSuperAdmin()) {
            if (role == Role.SUPER_ADMIN || role == Role.ADMIN) {
                throw new AccessDeniedException("Perfil não pode criar usuários com este papel");
            }
            // Nunca confia no tenantId vindo do cliente para quem não é
            // SUPER_ADMIN — sempre usa a barbearia do próprio requisitante,
            // mesmo que o corpo da requisição não informe nenhum.
            resolvedTenantId = requester.tenantId();
        }

        boolean emailAlreadyExists = userRepository.existsByEmail(email);
        if (emailAlreadyExists) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        String passwordHash = passwordEncoder.encode(password);

        User user = new User(
                UUID.randomUUID(),
                name,
                email,
                passwordHash,
                role,
                ACTIVE,
                resolvedTenantId,
                null,
                null,
                null
        );
        return userRepository.save(user);
    }

    private void requireSameTenant(User user, RequesterContext requester) {
        if (requester.isSuperAdmin()) {
            return;
        }
        if (!requester.tenantId().equals(user.getTenantId())) {
            throw new AccessDeniedException("Usuário fora da barbearia do requisitante");
        }
    }
}
