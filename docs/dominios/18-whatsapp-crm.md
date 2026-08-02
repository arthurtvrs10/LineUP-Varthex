# WhatsApp CRM — Mensagens e Menu WhatsApp

## 1. Objetivo do domínio

Organizar mensagens automáticas, menu de atendimento, campanhas e comunicação via WhatsApp.

## 2. Problema de negócio

WhatsApp é canal principal para barbearias. Ele reduz faltas, lembra cortes, pede avaliação e automatiza atendimento.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Notifications
- Google Integrations

## 4. Escopo

### Entra neste domínio

- Templates de WhatsApp
- Menu com opções
- Mensagem pós-agendamento
- Mensagem pós-atendimento
- Lembrete de corte
- Campanha simples

### Não entra neste domínio

- Integração real com provedor específico
- Chatbot IA
- Disparo em massa avançado

## 5. Entidades e dados principais

### WhatsappMessage

Mensagem planejada/enviada.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `clientId`: cliente opcional
  - `phone`: destino
  - `templateType`: tipo
  - `content`: conteúdo
  - `status`: status
  - `scheduledAt`: agendada para
  - `sentAt`: enviada em

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### WhatsappMenuOption

Opção do menu.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `label`: texto
  - `action`: ação
  - `position`: ordem
  - `status`: status

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- WhatsappMessageStatus: PENDING, SENT, FAILED, CANCELLED
- WhatsappTemplateType: APPOINTMENT_CONFIRMATION, REMINDER, REVIEW_REQUEST, MENU, CAMPAIGN
- WhatsappMenuAction: SCHEDULE, CANCEL, RESCHEDULE, PAY, PRODUCTS, WAITLIST, HUMAN

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateWhatsappTemplateRequest
- SendWhatsappMessageRequest
- WhatsappMenuOptionRequest

## 8. Regras de negócio

- Mensagem promocional exige consentimento.
- Não enviar duplicado para o mesmo evento.
- Áudio/ligação pode receber mensagem padrão.
- Menu deve ser configurável pelo Admin.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Cliente envia mensagem.
- Sistema responde menu.
- Cliente escolhe opção.
- Sistema direciona para fluxo.
- Eventos geram mensagens automáticas.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /whatsapp/messages | Registrar/enviar mensagem | Admin/Sistema |
| GET | /whatsapp/menu-options | Listar menu | Admin |
| POST | /whatsapp/menu-options | Criar opção | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar opção de menu

- **Objetivo:** Validar menu
- **Método/rota:** `POST /whatsapp/menu-options`
- **Pré-condição:** Token Admin
- **Entrada:** label, action, position
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** ação inválida, posição duplicada
### Registrar lembrete

- **Objetivo:** Validar mensagem
- **Método/rota:** `POST /whatsapp/messages`
- **Pré-condição:** Cliente com telefone
- **Entrada:** templateType e content
- **Resultado esperado:** HTTP 201 PENDING
- **Erros que precisam ser testados:** cliente sem consentimento para promo, telefone inválido

## 13. Critérios de aceite

- Menu configurável.
- Mensagem é registrada.
- Status de envio controlado.
- Não duplica mensagem do mesmo evento.

## 14. Ordem de implementação recomendada por domínio

- Definir templates.
- Criar entidades.
- Criar service sem provedor real primeiro.
- Testar criação de mensagens no Bruno.

## 15. Observações para desenvolvimento

Comece registrando mensagens no banco. Integração real com API de WhatsApp fica depois.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio whatsapp-crm"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio whatsapp-crm"
```
