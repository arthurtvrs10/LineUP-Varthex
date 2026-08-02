# Clients — Clientes da Barbearia

## 1. Objetivo do domínio

Registrar clientes, contato, preferências, observações e histórico básico para agendamento, CRM e fidelidade.

## 2. Problema de negócio

Clientes são a base da agenda e do CRM. Sem cadastro consistente, a barbearia não consegue lembrar retorno, enviar WhatsApp, controlar fidelidade nem consultar histórico.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Domínios Appointments, CRM, Loyalty

## 4. Escopo

### Entra neste domínio

- Cadastro de cliente
- Dados de contato
- Observações internas
- Vínculo com User opcional
- Status do cliente
- Preferências básicas

### Não entra neste domínio

- Plano de fidelidade completo
- Histórico detalhado de atendimento
- Mensagens automáticas

## 5. Entidades e dados principais

### ClientProfile

Ficha do cliente na barbearia.

**Campos principais:**

  - `id`: UUID
  - `userId`: usuário vinculado opcional
  - `barbershopId`: barbearia
  - `name`: nome
  - `phone`: WhatsApp
  - `email`: e-mail opcional
  - `birthDate`: data de nascimento opcional
  - `notes`: observações internas
  - `status`: status
  - `lastVisitAt`: última visita
  - `createdAt`: criação
  - `updatedAt`: atualização

**Relacionamentos:**

  - ClientProfile N:1 Barbershop
  - ClientProfile 1:N Appointment
  - ClientProfile 1:1 User opcional

**Observações:**

- Cliente pode existir sem login.
- Telefone é essencial para WhatsApp.

## 6. Tipos, enums e status

- ClientStatus: ACTIVE, INACTIVE, BLOCKED
- MarketingConsent: OPT_IN, OPT_OUT, UNKNOWN

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateClientRequest
- UpdateClientRequest
- ClientResponse
- ClientSummaryResponse
- ClientSearchFilter

## 8. Regras de negócio

- Telefone deve ser validado minimamente.
- Cliente bloqueado não deve agendar.
- Cliente pode ser cadastrado pelo Admin antes de ter login.
- Mensagens promocionais exigem consentimento.
- Observações internas não devem aparecer para cliente sem regra explícita.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin cadastra cliente.
- Sistema valida telefone/e-mail.
- Cliente fica disponível para agendamento.
- Barbeiro pode visualizar dados permitidos.
- CRM poderá usar telefone e consentimento.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /clients | Criar cliente | Admin/Barbeiro permitido |
| GET | /clients | Listar clientes | Admin/Barbeiro permitido |
| GET | /clients/{id} | Detalhar cliente | Protegida |
| PATCH | /clients/{id} | Editar cliente | Admin |
| PATCH | /clients/{id}/status | Alterar status | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar cliente

- **Objetivo:** Validar cadastro básico
- **Método/rota:** `POST /clients`
- **Pré-condição:** Token Admin
- **Entrada:** name, phone
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** telefone inválido, duplicidade na mesma barbearia, sem permissão
### Buscar cliente

- **Objetivo:** Validar busca para agendamento
- **Método/rota:** `GET /clients?search=joao`
- **Pré-condição:** Token Admin
- **Entrada:** query search
- **Resultado esperado:** HTTP 200 com clientes da barbearia
- **Erros que precisam ser testados:** cliente de outra barbearia, sem token

## 13. Critérios de aceite

- Cliente cadastrado com telefone.
- Cliente de outra barbearia não aparece.
- Cliente bloqueado não agenda.
- Observações internas protegidas.

## 14. Ordem de implementação recomendada por domínio

- Criar ClientStatus.
- Criar ClientProfile.
- Criar repository com busca.
- Criar service com validação.
- Criar controller.
- Testar criação e busca no Bruno.

## 15. Observações para desenvolvimento

No início, mantenha cadastro simples. Histórico de cortes será consequência de appointments.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio clients"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio clients"
```
