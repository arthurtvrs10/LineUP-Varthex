# Users — Usuários, Perfis e Status

## 1. Objetivo do domínio

Controlar as pessoas que acessam o sistema, seus dados básicos, perfis, status e vínculo com uma barbearia.

## 2. Problema de negócio

Como o sistema possui SuperAdmin, Admin, Barbeiro e Cliente, é necessário ter uma base única de usuário. Sem isso, cada tipo de pessoa poderia ser criado em estrutura separada, gerando duplicidade, login confuso e permissões difíceis de manter.

## 3. Atores impactados

- SuperAdmin
- Admin/Dono
- Barbeiro
- Cliente
- Domínio Auth
- Domínio Barbershops

## 4. Escopo

### Entra neste domínio

- Criar usuário base
- Definir perfil do usuário
- Definir status do usuário
- Vincular usuário a uma barbearia quando necessário
- Consultar usuário por e-mail
- Consultar dados seguros do usuário logado

### Não entra neste domínio

- Perfil profissional completo do barbeiro
- Ficha completa do cliente
- Controle financeiro
- Agendamento

## 5. Entidades e dados principais

### User

Pessoa que pode acessar o sistema.

**Campos principais:**

  - `id`: UUID
  - `name`: nome completo
  - `email`: e-mail único usado no login
  - `passwordHash`: senha criptografada
  - `role`: perfil principal
  - `status`: situação do acesso
  - `barbershopId`: barbearia vinculada, exceto SuperAdmin
  - `createdAt`: data de criação
  - `updatedAt`: última atualização
  - `lastLoginAt`: último login

**Relacionamentos:**

  - User N:1 Barbershop opcional para SUPER_ADMIN
  - User 1:N RefreshToken

**Observações:**

- Não use senha pura.
- Não exponha passwordHash em responses.
- Prefira inativar em vez de excluir.

## 6. Tipos, enums e status

- Role: SUPER_ADMIN, ADMIN, BARBER, CLIENT
- UserStatus: ACTIVE, INACTIVE, BLOCKED, PENDING

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateUserRequest: name, email, password, role, barbershopId
- UpdateUserStatusRequest: status
- UserResponse: id, name, email, role, status, barbershopId
- UserSummaryResponse: id, name, role

## 8. Regras de negócio

- E-mail deve ser único.
- SUPER_ADMIN pode não ter barbershopId.
- ADMIN, BARBER e CLIENT devem ter barbershopId.
- Usuário inativo não pode logar.
- Usuário bloqueado não pode executar ações protegidas.
- Senha só pode ser definida via fluxo seguro.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar SuperAdmin | Sim | Não | Não | Não |
| Criar Admin | Sim | Não inicialmente | Não | Não |
| Criar Barbeiro | Sim | Sim, na própria barbearia | Não | Não |
| Criar Cliente | Sim | Sim | Se permitido | Pode se cadastrar futuramente |
| Alterar status | Sim | Sim, na própria barbearia | Não | Não |
| Ver próprio perfil | Sim | Sim | Sim | Sim |

## 10. Fluxos principais

- Admin solicita criação de usuário.
- Backend valida e-mail único.
- Service valida role e barbershopId.
- Senha é convertida em hash.
- Repository salva User.
- Controller retorna UserResponse sem passwordHash.
- Bruno valida criação e consulta.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /users | Criar usuário | Protegida |
| GET | /users | Listar usuários da barbearia | Protegida |
| GET | /users/{id} | Detalhar usuário | Protegida |
| PATCH | /users/{id}/status | Alterar status | Protegida |
| GET | /users/me | Dados do usuário logado | Protegida |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar usuário

- **Objetivo:** Garantir criação com dados válidos
- **Método/rota:** `POST /users`
- **Pré-condição:** Token de Admin ou SuperAdmin
- **Entrada:** name, email, password, role, barbershopId
- **Resultado esperado:** HTTP 201 com UserResponse
- **Erros que precisam ser testados:** email duplicado, role inválida, barbershop ausente
### Bloquear usuário

- **Objetivo:** Garantir que status impacta acesso
- **Método/rota:** `PATCH /users/{id}/status`
- **Pré-condição:** Usuário existente
- **Entrada:** status BLOCKED
- **Resultado esperado:** HTTP 200 com status atualizado
- **Erros que precisam ser testados:** usuário inexistente, sem permissão, status inválido

## 13. Critérios de aceite

- User existe com campos mínimos.
- Role e UserStatus definidos.
- E-mail duplicado é rejeitado.
- passwordHash não aparece em resposta.
- Admin só lista usuários da própria barbearia.
- Bruno cobre criação, listagem, detalhe e alteração de status.

## 14. Ordem de implementação recomendada por domínio

- Definir Role e UserStatus.
- Criar User.
- Criar UserRepository.
- Criar UserService com regras.
- Criar DTOs.
- Criar UserController.
- Testar criação no Bruno.
- Testar duplicidade de e-mail.
- Testar isolamento por barbearia.

## 15. Observações para desenvolvimento

Não crie `Admin` como entidade só porque existe perfil ADMIN. No início, Admin é um `User` com `Role.ADMIN`. Crie perfil separado apenas quando houver dados específicos do Admin.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio users"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio users"
```
