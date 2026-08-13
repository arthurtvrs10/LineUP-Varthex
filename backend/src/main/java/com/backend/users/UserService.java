package com.backend.users;

import com.backend.users.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

import static com.backend.users.UserStatus.*;
import static org.springframework.data.jpa.domain.AbstractPersistable_.id;

//* Aqui ficam regras como:

//  buscar usuário por e-mail;
//  validar se usuário existe;
//  verificar se está ativo;
//  registrar último login;
//  bloquear usuário;
//  ativar usuário.
// *//

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public  UserService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> listUsers(){
        return userRepository.findAll();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    public User findByEmail(String email){
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email não encontrado")); // Uma função sem parâmetros que retorna uma RuntimeException.
    }

    public User blockUser(UUID id){
        User user = findById(id);
        user.setStatus(UserStatus.BLOCKED);
        return userRepository.save(user);
    }

    public User activateUser(UUID id){
        User user = findById(id);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    public User assignBarbershop(UUID userId, UUID barbershopId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("Usuário não encontrado")
                );

        user.assignBarbershopId(barbershopId);
        return userRepository.save(user);
    }

    // 1 - recebe dados
    public User createUser(String name, String email, String password, Role role, UUID barbershopId) {
        // 2 - verifica se faltou algo
        if (name == null || email == null || password == null || role == null){
            throw new RuntimeException("Dados obrigatórios faltando");
        }
        // 3 - verifica se o e-mail ja existe
        boolean emailAlreadyExists = userRepository.existsByEmail(email);
        // Se existir bloqueia
        if (emailAlreadyExists) {
            throw new RuntimeException("E-mail já cadastrado");
        }

        String passwordHash = passwordEncoder.encode(password);

        // 4 - Cria o object User
        User user = new User(
                UUID.randomUUID(),
                name,
                email,
                passwordHash,
                role,
                ACTIVE,
                barbershopId,
                null,
                null,
                null
        );
        // 5 - Salva no banco
        return userRepository.save(user);
    }

}