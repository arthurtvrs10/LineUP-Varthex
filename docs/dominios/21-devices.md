# Devices — Controle de Dispositivos

## 1. Objetivo do domínio

Controlar quantos dispositivos cada usuário, especialmente barbeiro, pode usar conforme plano.

## 2. Problema de negócio

Uma regra de monetização proposta é permitir 2 dispositivos por barbeiro e cobrar adicional por mais dispositivos.

## 3. Atores impactados

- Admin
- Barbeiro
- SuperAdmin
- Auth
- SaaS Billing

## 4. Escopo

### Entra neste domínio

- Registro de dispositivo
- Identificação no login
- Limite por usuário/barbeiro
- Bloqueio de dispositivo extra
- Remoção de dispositivo antigo

### Não entra neste domínio

- Biometria
- MDM
- Segurança avançada de hardware

## 5. Entidades e dados principais

### DeviceSession

Dispositivo autorizado para usuário.

**Campos principais:**

  - `id`: UUID
  - `userId`: usuário
  - `deviceFingerprint`: identificador
  - `deviceName`: nome amigável
  - `status`: status
  - `lastAccessAt`: último acesso
  - `createdAt`: criação

**Relacionamentos:**

  - DeviceSession N:1 User

**Observações:**



## 6. Tipos, enums e status

- DeviceStatus: ACTIVE, BLOCKED, REMOVED
- DeviceLimitReason: PLAN_LIMIT, SECURITY_BLOCK

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- RegisterDeviceRequest
- DeviceSessionResponse
- RemoveDeviceRequest

## 8. Regras de negócio

- Login em novo dispositivo deve verificar limite.
- Admin pode remover dispositivo antigo.
- Dispositivo bloqueado não deve acessar.
- Limite vem do plano SaaS.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Usuário faz login.
- Sistema identifica dispositivo.
- Se novo, verifica limite.
- Se permitido, registra.
- Se exceder, bloqueia ou exige upgrade.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| GET | /devices | Listar dispositivos | Protegida |
| POST | /devices/register | Registrar dispositivo | Auth/Sistema |
| PATCH | /devices/{id}/remove | Remover dispositivo | Admin/Usuário próprio |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Registrar dispositivo

- **Objetivo:** Validar limite
- **Método/rota:** `POST /devices/register`
- **Pré-condição:** Usuário autenticado
- **Entrada:** deviceFingerprint
- **Resultado esperado:** HTTP 201 ou 403 se excedeu
- **Erros que precisam ser testados:** limite excedido, fingerprint duplicado
### Remover dispositivo

- **Objetivo:** Liberar vaga
- **Método/rota:** `PATCH /devices/{id}/remove`
- **Pré-condição:** Dispositivo próprio/Admin
- **Entrada:** sem body
- **Resultado esperado:** HTTP 200
- **Erros que precisam ser testados:** dispositivo de outro usuário

## 13. Critérios de aceite

- Dispositivo registrado.
- Limite respeitado.
- Admin remove dispositivo.
- Dispositivo removido não conta no limite.

## 14. Ordem de implementação recomendada por domínio

- Criar DeviceSession.
- Integrar login.
- Consultar plano SaaS.
- Criar endpoints.
- Testar no Bruno.

## 15. Observações para desenvolvimento

No início, deviceFingerprint pode ser simples; depois melhora com estratégia mais robusta.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio devices"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio devices"
```
