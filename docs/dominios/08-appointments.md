# Appointments — Agendamentos

## 1. Objetivo do domínio

Criar, listar, cancelar, reagendar e concluir atendimentos.

## 2. Problema de negócio

Agendamento é o coração do produto. Ele conecta cliente, barbeiro, serviço, horário, status, preço, comissão e notificações.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Domínios Schedules, Commissions, Notifications

## 4. Escopo

### Entra neste domínio

- Criar agendamento
- Listar agenda por dia/barbeiro
- Cancelar
- Reagendar
- Concluir
- Marcar falta

### Não entra neste domínio

- Recorrência
- Fila de espera
- Pagamento avançado

## 5. Entidades e dados principais

### Appointment

Registro de um atendimento agendado.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `clientId`: cliente
  - `barberId`: barbeiro
  - `serviceId`: serviço
  - `startsAt`: início
  - `endsAt`: fim
  - `status`: status
  - `price`: valor
  - `notes`: observações
  - `createdAt`: criação

**Relacionamentos:**

  - Appointment N:1 ClientProfile
  - Appointment N:1 BarberProfile
  - Appointment N:1 ServiceCatalogItem

**Observações:**



## 6. Tipos, enums e status

- AppointmentStatus: PENDING, CONFIRMED, CANCELLED, RESCHEDULED, IN_PROGRESS, COMPLETED, NO_SHOW
- AppointmentOrigin: ADMIN, CLIENT, BARBER, WHATSAPP

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateAppointmentRequest
- RescheduleAppointmentRequest
- CancelAppointmentRequest
- AppointmentResponse
- AppointmentCalendarFilter

## 8. Regras de negócio

- Não pode haver dois agendamentos no mesmo horário para o mesmo barbeiro.
- Horário deve estar disponível.
- Cliente bloqueado não agenda.
- Barbeiro inativo não recebe agendamento.
- Atendimento concluído pode gerar comissão.
- Cancelamento deve registrar motivo.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Usuário escolhe cliente, barbeiro, serviço e horário.
- Sistema consulta disponibilidade.
- Sistema valida conflitos.
- Agendamento é salvo.
- Notificações podem ser disparadas.
- Agenda é atualizada.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /appointments | Criar agendamento | Protegida |
| GET | /appointments | Listar agenda | Protegida |
| PATCH | /appointments/{id}/cancel | Cancelar | Protegida |
| PATCH | /appointments/{id}/reschedule | Reagendar | Protegida |
| PATCH | /appointments/{id}/complete | Concluir | Admin/Barbeiro |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar agendamento válido

- **Objetivo:** Validar agenda
- **Método/rota:** `POST /appointments`
- **Pré-condição:** Cliente, barbeiro, serviço e slot válidos
- **Entrada:** clientId, barberId, serviceId, startsAt
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** horário ocupado, barbeiro inativo, cliente bloqueado
### Conflito de horário

- **Objetivo:** Garantir regra principal
- **Método/rota:** `POST /appointments`
- **Pré-condição:** Já existe appointment no horário
- **Entrada:** mesmo barberId e horário
- **Resultado esperado:** HTTP 409
- **Erros que precisam ser testados:** overlap parcial, mesmo horário outro barbeiro permitido

## 13. Critérios de aceite

- Criação sem conflito.
- Cancelamento registra motivo.
- Reagendamento valida novo horário.
- Concluir altera status.
- Bruno testa conflito.

## 14. Ordem de implementação recomendada por domínio

- Criar status.
- Criar entity.
- Criar repository com busca por intervalo.
- Criar service com validação.
- Criar controller.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Não calcule comissão dentro do controller. Ao concluir appointment, chame o domínio commissions ou emita evento interno no futuro.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio appointments"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio appointments"
```
