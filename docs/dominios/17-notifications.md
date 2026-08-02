# Notifications — Notificações

## 1. Objetivo do domínio

Gerenciar notificações internas, templates e eventos que avisam usuários sobre ações importantes.

## 2. Problema de negócio

Agendamentos, cancelamentos, estoque baixo e comissões precisam gerar avisos. Sem notificação, o usuário precisa procurar tudo manualmente.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Sistema interno
- WhatsApp CRM

## 4. Escopo

### Entra neste domínio

- Notificação interna
- Template
- Status de envio
- Canal
- Fila futura

### Não entra neste domínio

- Campanhas completas
- WhatsApp avançado
- Push mobile

## 5. Entidades e dados principais

### Notification

Aviso enviado ou exibido no sistema.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `userId`: destinatário
  - `type`: tipo
  - `channel`: canal
  - `title`: título
  - `message`: mensagem
  - `status`: status
  - `createdAt`: criação
  - `readAt`: leitura

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### NotificationTemplate

Modelo de mensagem.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia opcional
  - `type`: tipo
  - `channel`: canal
  - `content`: conteúdo
  - `status`: status

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- NotificationChannel: IN_APP, WHATSAPP, EMAIL
- NotificationStatus: PENDING, SENT, FAILED, READ
- NotificationType: APPOINTMENT_CREATED, CANCELLED, STOCK_LOW, COMMISSION_GENERATED

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateNotificationRequest
- NotificationResponse
- TemplateRequest

## 8. Regras de negócio

- Evento importante deve gerar notificação quando configurado.
- Usuário só vê notificações próprias.
- Falha de envio externo deve ser registrada.
- Template inativo não deve ser usado.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Appointment cria evento.
- NotificationService monta mensagem.
- Sistema salva notificação.
- Usuário visualiza ou canal externo envia.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| GET | /notifications | Listar notificações | Protegida |
| PATCH | /notifications/{id}/read | Marcar como lida | Protegida |
| POST | /notification-templates | Criar template | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Listar notificações

- **Objetivo:** Validar destinatário
- **Método/rota:** `GET /notifications`
- **Pré-condição:** Token usuário
- **Entrada:** sem body
- **Resultado esperado:** HTTP 200 apenas próprias
- **Erros que precisam ser testados:** notificação de outro usuário, sem token
### Marcar lida

- **Objetivo:** Validar leitura
- **Método/rota:** `PATCH /notifications/{id}/read`
- **Pré-condição:** Notificação própria
- **Entrada:** sem body
- **Resultado esperado:** HTTP 200
- **Erros que precisam ser testados:** notificação de outro usuário

## 13. Critérios de aceite

- Notificação salva.
- Usuário vê próprias notificações.
- Marcar como lida funciona.
- Template pode ser criado.

## 14. Ordem de implementação recomendada por domínio

- Criar enums.
- Criar Notification.
- Criar Template.
- Criar service.
- Integrar evento simples.
- Testar no Bruno.

## 15. Observações para desenvolvimento

WhatsApp real deve ser separado no domínio whatsapp-crm.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio notifications"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio notifications"
```
