# Schedules Availability — Horários e Disponibilidade

## 1. Objetivo do domínio

Definir quando a barbearia e cada barbeiro podem atender.

## 2. Problema de negócio

Agendamento só funciona se o sistema souber quando a barbearia abre, quando fecha, quais dias o barbeiro trabalha e quais intervalos existem.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Domínio Appointments

## 4. Escopo

### Entra neste domínio

- Horário da barbearia
- Horário por barbeiro
- Intervalos
- Folgas simples
- Consulta de disponibilidade

### Não entra neste domínio

- Agendamento em si
- Bloqueio pontual
- Recorrência avançada

## 5. Entidades e dados principais

### WorkingHour

Horário padrão da barbearia por dia da semana.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `dayOfWeek`: dia da semana
  - `opensAt`: horário de abertura
  - `closesAt`: horário de fechamento
  - `isClosed`: se o dia é fechado

**Relacionamentos:**

  - WorkingHour N:1 Barbershop

**Observações:**


### BarberAvailability

Disponibilidade específica de um barbeiro.

**Campos principais:**

  - `id`: UUID
  - `barberId`: barbeiro
  - `dayOfWeek`: dia
  - `startsAt`: início
  - `endsAt`: fim
  - `status`: ativo/inativo

**Relacionamentos:**

  - BarberAvailability N:1 BarberProfile

**Observações:**



## 6. Tipos, enums e status

- DayOfWeek: MONDAY...SUNDAY
- AvailabilityStatus: ACTIVE, INACTIVE
- TimeSlotStatus: AVAILABLE, UNAVAILABLE

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateWorkingHourRequest
- CreateBarberAvailabilityRequest
- AvailabilityResponse
- AvailableSlotResponse

## 8. Regras de negócio

- Horário do barbeiro deve estar dentro do horário da barbearia, salvo exceção.
- Dia fechado não gera horários disponíveis.
- Disponibilidade considera duração do serviço.
- Disponibilidade não pode ignorar agendamentos existentes.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin define horários da barbearia.
- Admin define horários por barbeiro.
- Sistema calcula slots.
- Cliente/Admin consulta horários disponíveis.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /schedules/working-hours | Criar horário da barbearia | Admin |
| POST | /schedules/barbers/{id}/availability | Criar disponibilidade | Admin |
| GET | /availability | Consultar horários disponíveis | Protegida/Pública |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Consultar disponibilidade

- **Objetivo:** Validar slots
- **Método/rota:** `GET /availability?barberId=&serviceId=&date=`
- **Pré-condição:** Serviço e barbeiro ativos
- **Entrada:** query params
- **Resultado esperado:** HTTP 200 com horários
- **Erros que precisam ser testados:** dia fechado, barbeiro inativo, serviço inativo

## 13. Critérios de aceite

- Horários configurados.
- Slots respeitam duração do serviço.
- Dia fechado não aparece.
- Bruno testa consulta de disponibilidade.

## 14. Ordem de implementação recomendada por domínio

- Criar tipos de dia/slot.
- Criar WorkingHour.
- Criar BarberAvailability.
- Criar services de cálculo.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Cálculo de disponibilidade é regra crítica. Faça simples primeiro: horários fixos e duração do serviço.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio schedules-availability"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio schedules-availability"
```
