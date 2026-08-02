# Waitlist — Fila de Espera

## 1. Objetivo do domínio

Permitir que clientes entrem em fila quando não há horário disponível e sejam chamados quando abrir vaga.

## 2. Problema de negócio

Em dias cheios, a barbearia perde clientes se não houver forma organizada de guardar interessados. A fila aumenta conversão e reduz horários vagos por cancelamento.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Domínios Appointments e Notifications

## 4. Escopo

### Entra neste domínio

- Entrada na fila
- Preferência de data/período/barbeiro
- Status da solicitação
- Oferta de vaga
- Aceite ou recusa

### Não entra neste domínio

- Ranking pago/VIP avançado
- Automação completa via WhatsApp

## 5. Entidades e dados principais

### WaitlistEntry

Solicitação de vaga em dia/período desejado.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `clientId`: cliente
  - `barberId`: barbeiro desejado opcional
  - `serviceId`: serviço
  - `desiredDate`: data desejada
  - `preferredPeriod`: período
  - `status`: status
  - `position`: posição
  - `createdAt`: criação

**Relacionamentos:**

  - WaitlistEntry N:1 ClientProfile
  - WaitlistEntry N:1 ServiceCatalogItem

**Observações:**



## 6. Tipos, enums e status

- WaitlistStatus: WAITING, OFFERED, ACCEPTED, DECLINED, EXPIRED, CANCELLED
- PreferredPeriod: MORNING, AFTERNOON, EVENING, ANY

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateWaitlistEntryRequest
- OfferSlotRequest
- WaitlistEntryResponse

## 8. Regras de negócio

- Fila deve respeitar ordem de entrada, salvo prioridade manual do Admin.
- Cliente deve ter tempo limite para aceitar vaga.
- Apenas um cliente pode aceitar a mesma vaga.
- Entrada aceita pode virar Appointment.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Cliente/Admin adiciona cliente à fila.
- Sistema registra posição.
- Ao abrir vaga, Admin ou sistema oferece horário.
- Cliente aceita.
- Sistema cria agendamento.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /waitlist | Entrar na fila | Protegida |
| GET | /waitlist | Listar fila | Admin |
| PATCH | /waitlist/{id}/offer | Oferecer vaga | Admin |
| PATCH | /waitlist/{id}/accept | Aceitar vaga | Cliente/Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Entrar na fila

- **Objetivo:** Validar cadastro na fila
- **Método/rota:** `POST /waitlist`
- **Pré-condição:** Cliente e serviço válidos
- **Entrada:** desiredDate, serviceId
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** cliente bloqueado, serviço inativo, duplicidade no mesmo dia
### Aceitar vaga

- **Objetivo:** Virar agendamento
- **Método/rota:** `PATCH /waitlist/{id}/accept`
- **Pré-condição:** Entry OFFERED
- **Entrada:** appointment slot
- **Resultado esperado:** HTTP 200 e appointment criado
- **Erros que precisam ser testados:** vaga expirada, horário ocupado por outro

## 13. Critérios de aceite

- Cliente entra na fila.
- Admin visualiza fila.
- Oferta de vaga muda status.
- Aceite cria agendamento sem conflito.

## 14. Ordem de implementação recomendada por domínio

- Criar enums.
- Criar entity.
- Criar service.
- Integrar appointments.
- Testar fluxo no Bruno.

## 15. Observações para desenvolvimento

Fila de espera deve ser feita depois de agendamento e disponibilidade.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio waitlist"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio waitlist"
```
