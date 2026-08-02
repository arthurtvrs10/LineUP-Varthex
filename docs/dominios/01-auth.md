# Auth — Autenticação e Sessão

## 1. Objetivo do domínio

Controlar login, logout, renovação de sessão, identificação do usuário logado e proteção inicial das rotas.

## 2. Problema de negócio

O sistema guarda agenda, clientes, faturamento, comissões e dados de várias barbearias. Sem autenticação, qualquer pessoa poderia acessar dados sensíveis ou executar ações indevidas. O domínio auth garante que o sistema saiba quem está usando e se a sessão ainda é válida.

## 3. Atores impactados

- SuperAdmin
- Admin/Dono
- Barbeiro
- Cliente
- Sistema interno de segurança

## 4. Escopo

### Entra neste domínio

- Login com e-mail e senha
- Geração de access token
- Geração e persistência de refresh token
- Logout com revogação de refresh token
- Endpoint para consultar usuário logado
- Separação de rotas públicas e protegidas

### Não entra neste domínio

- Recuperação de senha completa
- 2FA
- Login social
- Permissões granulares avançadas
- Cadastro completo de clientes e barbeiros

## 5. Entidades e dados principais

### RefreshToken

Representa uma sessão renovável de um usuário.

**Campos principais:**

  - `id`: UUID do token
  - `token`: valor único do refresh token
  - `userId`: usuário dono do token
  - `expiresAt`: data de expiração
  - `revokedAt`: data de revogação, se houver
  - `createdAt`: data de criação
  - `deviceInfo`: informação simples do dispositivo
  - `ipAddress`: IP usado no login

**Relacionamentos:**

  - RefreshToken N:1 User

**Observações:**

- Não retorne o token em listagens administrativas.
- Logout deve revogar o token.
### AuthLog

Registro de tentativas de autenticação para auditoria e segurança.

**Campos principais:**

  - `id`: UUID
  - `email`: e-mail usado na tentativa
  - `userId`: usuário encontrado, se existir
  - `success`: se a tentativa deu certo
  - `reason`: motivo do sucesso ou falha
  - `ipAddress`: IP da requisição
  - `userAgent`: navegador/app
  - `createdAt`: data da tentativa

**Relacionamentos:**

  - AuthLog N:1 User opcional

**Observações:**

- Pode ser implementado depois, mas deve estar planejado.

## 6. Tipos, enums e status

- AuthFailureReason: USER_NOT_FOUND, INVALID_PASSWORD, USER_BLOCKED, TOKEN_EXPIRED, REFRESH_TOKEN_REVOKED
- TokenType: BEARER
- SessionStatus: ACTIVE, REVOKED, EXPIRED

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- LoginRequest: email, password
- LoginResponse: accessToken, refreshToken, tokenType, expiresIn, user
- RefreshTokenRequest: refreshToken
- AuthenticatedUserResponse: id, name, email, role, status, barbershopId

## 8. Regras de negócio

- Usuário inativo ou bloqueado não pode logar.
- Senha nunca deve aparecer em resposta, log ou token.
- Login válido deve gerar access token e refresh token.
- Refresh token vencido ou revogado não pode ser reutilizado.
- Logout deve invalidar a sessão atual.
- Erro de login deve ser genérico para não revelar se e-mail existe.

## 9. Permissões

| Ação | Público | Usuário autenticado | Admin | SuperAdmin |
|---|---|---|---|---|
| Login | Sim | Sim | Sim | Sim |
| Refresh token | Sim, com refresh token válido | Sim | Sim | Sim |
| Logout | Não | Sim | Sim | Sim |
| Ver `/auth/me` | Não | Sim | Sim | Sim |
| Ver logs de autenticação | Não | Não | Não inicialmente | Futuro |

## 10. Fluxos principais

- Usuário abre tela de login.
- Frontend envia e-mail e senha.
- AuthController recebe a requisição.
- AuthService valida usuário, status e senha.
- JwtService gera access token.
- RefreshTokenService cria refresh token.
- Backend retorna tokens e dados seguros.
- Frontend salva sessão e redireciona.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /auth/login | Autenticar usuário | Pública |
| POST | /auth/refresh | Renovar access token | Pública com refresh token válido |
| POST | /auth/logout | Encerrar sessão | Protegida |
| GET | /auth/me | Retornar usuário logado | Protegida |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Login válido

- **Objetivo:** Validar caminho feliz do login
- **Método/rota:** `POST /auth/login`
- **Pré-condição:** Usuário ativo existente
- **Entrada:** email e password válidos
- **Resultado esperado:** HTTP 200 com tokens e dados seguros do usuário
- **Erros que precisam ser testados:** senha errada, usuário inativo, e-mail inexistente
### Rota protegida sem token

- **Objetivo:** Garantir proteção inicial
- **Método/rota:** `GET /auth/me`
- **Pré-condição:** Nenhum token enviado
- **Entrada:** sem Authorization header
- **Resultado esperado:** HTTP 401
- **Erros que precisam ser testados:** token ausente, token inválido, token expirado
### Refresh token

- **Objetivo:** Garantir renovação de sessão
- **Método/rota:** `POST /auth/refresh`
- **Pré-condição:** Refresh token ativo
- **Entrada:** refreshToken válido
- **Resultado esperado:** HTTP 200 com novo access token
- **Erros que precisam ser testados:** refresh vencido, refresh revogado, refresh inexistente

## 13. Critérios de aceite

- Login funciona com usuário ativo.
- Senha errada retorna erro seguro.
- Usuário inativo não loga.
- Access token é exigido em rota protegida.
- Refresh token renova sessão.
- Logout revoga refresh token.
- Bruno tem collection com login, me, refresh e logout.

## 14. Ordem de implementação recomendada por domínio

- Criar/validar User e UserStatus no domínio users.
- Criar RefreshToken no domínio auth/tokens.
- Criar DTOs de login.
- Criar serviço de autenticação.
- Configurar Spring Security.
- Testar login no Bruno.
- Testar rota protegida no Bruno.
- Documentar resultado no diário.

## 15. Observações para desenvolvimento

Este domínio depende de `users`, mas não deve concentrar toda regra de usuário. Regra de senha, token e sessão fica em auth. Dados cadastrais e status do usuário ficam em users.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio auth"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio auth"
```
