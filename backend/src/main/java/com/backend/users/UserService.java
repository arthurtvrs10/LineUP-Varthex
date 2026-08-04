package com.backend.users;

import com.backend.users.dto.UserResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

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

    public  UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> listUsers(){
        return userRepository.findAll();
    }

    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    // 1 - recebe dados
    public User createUser(String name, String email, String passwordHash, Role role, UUID barbershopId) {
        // 2 - verifica se faltou algo
        if (name == null || email == null || passwordHash == null || role == null){
            throw new RuntimeException("Dados obrigatórios faltando");
        }
        // 3 - verifica se o e-mail ja existe
        boolean emailAlreadyExists = userRepository.existsByEmail(email);
        // Se existir bloqueia
        if (emailAlreadyExists) {
            throw new RuntimeException("E-mail já cadastrado");
        }
        // 4 - Cria o object User
        User user = new User(
                UUID.randomUUID(),
                name,
                email,
                passwordHash,
                role,
                UserStatus.ACTIVE,
                barbershopId,
                null,
                null,
                null
        );
        // 5 - Salva no banco
        return userRepository.save(user);
    }

}

// A lógica em português fica assim:

//  Criar usuário:
//
//  1 - Recebo nome, email, senha criptografada, role e barbershopId.
//
//  2 - Se algum dado obrigatório estiver faltando:
//    paro e lanço erro.
//
//  3 - Pergunto ao banco se o email já existe.
//
//  4 - Se o email já existir:
//    paro e lanço erro.
//
//  5 - Se tudo estiver certo:
//    crio um novo User.
//    salvo no banco.
//    retorno o User salvo.