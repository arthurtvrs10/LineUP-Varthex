# Blocked Times — Bloqueio e Desbloqueio de Horários

## 1. Objetivo do domínio

Permitir que Admin ou barbeiro autorizado bloqueie horários ou dias para impedir agendamentos.

## 2. Problema de negócio

Barbearias precisam bloquear horários por almoço, ausência, manutenção, evento, folga ou emergência. Sem bloqueio, clientes podem agendar quando não haverá atendimento.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Domínio Appointments

## 4. Escopo

### Entra neste domínio

- Bloqueio por horário
- Bloqueio de dia inteiro
- Motivo do bloqueio
- Desbloqueio
- Consulta junto da disponibilidade

### Não entra neste domínio

- Férias longas avançadas
- Recorrência de bloqueios
- Escala completa

## 5. Entidades e dados principais

### BlockedTime

Período indisponível para agenda.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `barberId`: barbeiro opcional
  - `startsAt`: início
  - `endsAt`: fim
  - `reason`: motivo
  - `createdByUserId`: quem criou
  - `status`: ativo/cancelado
  - `createdAt`: criação

**Relacionamentos:**

  - BlockedTime N:1 Barbershop
  - BlockedTime N:1 BarberProfile opcional

**Observações:**



## 6. Tipos, enums e status

- BlockedTimeStatus: ACTIVE, CANCELLED
- BlockedReason: LUNCH, ABSENCE, HOLIDAY, MAINTENANCE, PERSONAL, OTHER

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateBlockedTimeRequest
- CancelBlockedTimeRequest
- BlockedTimeResponse

## 8. Regras de negócio

- Bloqueio ativo remove horários da disponibilidade.
- Não deve bloquear período com atendimento confirmado sem decisão explícita.
- Desbloquear não apaga histórico; altera status.
- Barbeiro só bloqueia próprio horário se tiver permissão.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin seleciona período.
- Sistema verifica conflitos com appointments.
- Sistema registra bloqueio.
- Disponibilidade passa a ignorar período.
- Admin pode cancelar bloqueio.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /blocked-times | Criar bloqueio | Admin/Barbeiro permitido |
| GET | /blocked-times | Listar bloqueios | Protegida |
| PATCH | /blocked-times/{id}/cancel | Cancelar bloqueio | Admin/Barbeiro permitido |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar bloqueio

- **Objetivo:** Validar indisponibilidade
- **Método/rota:** `POST /blocked-times`
- **Pré-condição:** Token Admin
- **Entrada:** startsAt, endsAt, reason
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** período inválido, conflito com atendimento, sem permissão

## 13. Critérios de aceite

- Bloqueio criado.
- Horário bloqueado não aparece disponível.
- Cancelamento libera disponibilidade.
- Motivo fica registrado.

## 14. Ordem de implementação recomendada por domínio

- Criar enum reason/status.
- Criar entity.
- Criar service.
- Integrar availability.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Este domínio conversa diretamente com availability e appointments.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio blocked-times"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio blocked-times"
```
