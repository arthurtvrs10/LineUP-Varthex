package com.backend.users;

import com.backend.users.UserService.RequesterContext;
import com.backend.users.dto.CreateUserRequest;
import com.backend.users.dto.UserResponse;
import com.backend.users.dto.UserSummaryResponse;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {
    //*
    // criar usuário;
    // listar usuários;
    // buscar usuário por id;
    // bloquear usuário.
    //*

    private final UserService userService;

    public UserController(UserService userService){
        this.userService = userService;
    }

    private RequesterContext requesterContext(JwtAuthenticationToken authentication) {
        Jwt jwt = authentication.getToken();

        Role role = Role.valueOf(jwt.getClaimAsString("role"));
        String tenantIdClaim = jwt.getClaimAsString("tenantId");
        UUID tenantId = tenantIdClaim != null ? UUID.fromString(tenantIdClaim) : null;

        return new RequesterContext(role, tenantId);
    }

    @PostMapping
    public UserResponse createUser(@RequestBody CreateUserRequest request,
                                    JwtAuthenticationToken authentication) {
        User createdUser = userService.createUser(
                requesterContext(authentication),
                request.name(),
                request.email(),
                request.password(),
                request.role(),
                request.tenantId()
        );

        return new UserResponse(
                createdUser.getId(),
                createdUser.getName(),
                createdUser.getEmail(),
                createdUser.getRole(),
                createdUser.getStatus(),
                createdUser.getTenantId(),
                createdUser.getCreatedAt()
        );
    }

    @GetMapping
    public List<UserSummaryResponse> getUsers(JwtAuthenticationToken authentication){
        List<User> users = userService.listUsers(requesterContext(authentication));

        return users.stream()
                .map(user -> new UserSummaryResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getStatus(),
                        user.getTenantId()
                ))
                .toList();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable UUID id, JwtAuthenticationToken authentication){
        User user = userService.findById(id, requesterContext(authentication));
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getTenantId(),
                user.getCreatedAt()
        );
    }

    @GetMapping("/by-email")
    public UserResponse getUserByEmail(@RequestParam String email, JwtAuthenticationToken authentication){
        User user = userService.findByEmail(email, requesterContext(authentication));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getTenantId(),
                user.getCreatedAt()
        );
    }

    @PatchMapping("/{id}/block")
    public UserResponse patchBlockUser(@PathVariable UUID id, JwtAuthenticationToken authentication){
        User user = userService.blockUser(id, requesterContext(authentication));
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getTenantId(),
                user.getCreatedAt()
        );
    }

    @PatchMapping("/{id}/activate")
    public UserResponse patchActivateUser(@PathVariable UUID id, JwtAuthenticationToken authentication){
        User user = userService.activateUser(id, requesterContext(authentication));
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getTenantId(),
                user.getCreatedAt()
        );
    }
}
