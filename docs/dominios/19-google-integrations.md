# Google Integrations — Google Agenda e Avaliações

## 1. Objetivo do domínio

Sincronizar agenda com Google Calendar e enviar link de avaliação Google após atendimento.

## 2. Problema de negócio

Google Agenda ajuda barbeiros e donos a visualizar compromissos. Avaliações no Google aumentam reputação e atraem clientes.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Appointments
- WhatsApp CRM

## 4. Escopo

### Entra neste domínio

- Configurar link de avaliação
- Solicitar avaliação pós-atendimento
- Planejar sync com Google Calendar
- Registrar status de sincronização

### Não entra neste domínio

- OAuth completo na primeira etapa
- Edição bidirecional complexa

## 5. Entidades e dados principais

### ReviewRequest

Pedido de avaliação enviado ao cliente.

**Campos principais:**

  - `id`: UUID
  - `appointmentId`: atendimento
  - `clientId`: cliente
  - `reviewUrl`: link
  - `status`: status
  - `sentAt`: envio

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### GoogleCalendarSync

Registro de sincronização com agenda.

**Campos principais:**

  - `id`: UUID
  - `appointmentId`: atendimento
  - `externalEventId`: id evento Google
  - `status`: status
  - `lastSyncedAt`: último sync
  - `errorMessage`: erro

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- ReviewRequestStatus: PENDING, SENT, FAILED
- GoogleSyncStatus: PENDING, SYNCED, FAILED, CANCELLED

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- ConfigureGoogleReviewRequest
- ReviewRequestResponse
- GoogleSyncResponse

## 8. Regras de negócio

- Link de avaliação deve ser configurado pela barbearia.
- Avaliação deve ser solicitada após atendimento concluído.
- Não enviar várias solicitações para o mesmo atendimento.
- Falha de sync deve ser registrada.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin configura link.
- Atendimento é concluído.
- Sistema cria pedido de avaliação.
- WhatsApp envia link.
- Sync Google registra evento quando habilitado.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| PATCH | /barbershops/{id}/google-review | Configurar link | Admin |
| POST | /review-requests | Criar pedido de avaliação | Sistema/Admin |
| GET | /google-sync/appointments | Listar sync | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar pedido de avaliação

- **Objetivo:** Validar pós-atendimento
- **Método/rota:** `POST /review-requests`
- **Pré-condição:** Appointment concluído
- **Entrada:** appointmentId
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** appointment não concluído, link ausente, pedido duplicado

## 13. Critérios de aceite

- Link configurado.
- Pedido criado após atendimento.
- Duplicidade impedida.
- Status de sync registrado.

## 14. Ordem de implementação recomendada por domínio

- Adicionar campo reviewUrl em barbershop/config.
- Criar ReviewRequest.
- Criar GoogleCalendarSync planejado.
- Testar no Bruno.

## 15. Observações para desenvolvimento

A integração real com Google Calendar exige credenciais e OAuth; documente antes de implementar.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio google-integrations"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio google-integrations"
```
