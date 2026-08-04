package com.backend.users;

import com.backend.users.dto.CreateUserRequest;
import com.backend.users.dto.UserResponse;
import jakarta.websocket.server.PathParam;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static com.backend.users.UserStatus.BLOCKED;

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

    @PostMapping
    public UserResponse createUser(@RequestBody // serve para
                                            CreateUserRequest request) {
        User createdUser = userService.createUser(
                request.name(),
                request.email(),
                request.passwordHash(),
                request.role(),
                request.barbershopId()
        );

        UserResponse response = new UserResponse(
                createdUser.getId(),
                createdUser.getName(),
                createdUser.getEmail(),
                createdUser.getRole(),
                createdUser.getStatus(),
                createdUser.getBarbershopId(),
                createdUser.getCreatedAt()
        );
        return response;
    }

    @GetMapping
    public List<UserResponse> getUsers(){
        List<User> users = userService.listUsers();

        return users.stream()
                .map(user -> new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail(),
                        user.getRole(),
                        user.getStatus(),
                        user.getBarbershopId(),
                        user.getCreatedAt()
                        ))
                .toList();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(@PathVariable UUID id){
        User user = userService.findById(id);
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getBarbershopId(),
                user.getCreatedAt()
        );
    }

    @PatchMapping("/{id}/block")
    public UserResponse patchBlockUser(@PathVariable UUID id){
        User user = userService.blockUser(id);
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getBarbershopId(),
                user.getCreatedAt()
        );
    }

    @PatchMapping("/{id}/activate")
    public UserResponse patchActivateUser(@PathVariable UUID id){
        User user = userService.activateUser(id);
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus(),
                user.getBarbershopId(),
                user.getCreatedAt()
        );
    }
}
