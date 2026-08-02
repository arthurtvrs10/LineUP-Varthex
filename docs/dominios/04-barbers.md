# Barbers — Barbeiros e Perfil Profissional

## 1. Objetivo do domínio

Documentar os profissionais que realizam atendimentos, suas informações profissionais, status, comissões padrão e vínculo com usuário.

## 2. Problema de negócio

O barbeiro precisa ter agenda, atendimentos, comissão e permissões. Ele pode ser usuário do sistema, mas também possui dados profissionais específicos. Por isso o domínio separa User de BarberProfile.

## 3. Atores impactados

- Admin/Dono
- Barbeiro
- Cliente
- Domínios Appointments, Commissions e Schedules

## 4. Escopo

### Entra neste domínio

- Perfil profissional do barbeiro
- Status operacional do barbeiro
- Comissão padrão
- Vínculo com User
- Listagem para agendamento

### Não entra neste domínio

- Login do barbeiro
- Cálculo detalhado de comissão
- Horários detalhados

## 5. Entidades e dados principais

### BarberProfile

Dados profissionais de um barbeiro.

**Campos principais:**

  - `id`: UUID
  - `userId`: usuário vinculado
  - `barbershopId`: barbearia
  - `displayName`: nome exibido
  - `bio`: descrição curta
  - `defaultCommissionPercent`: comissão padrão
  - `status`: status operacional
  - `createdAt`: criação
  - `updatedAt`: atualização

**Relacionamentos:**

  - BarberProfile 1:1 User
  - BarberProfile N:1 Barbershop
  - BarberProfile 1:N Appointment

**Observações:**

- Use User para login e BarberProfile para dados profissionais.

## 6. Tipos, enums e status

- BarberStatus: ACTIVE, INACTIVE, VACATION, BLOCKED

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateBarberRequest
- UpdateBarberRequest
- BarberResponse
- AvailableBarberResponse

## 8. Regras de negócio

- Barbeiro precisa estar vinculado a User com Role.BARBER.
- Barbeiro inativo não aparece para agendamento.
- Admin só cria barbeiro na própria barbearia.
- Comissão padrão pode ser sobrescrita por regra específica.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin cria User com Role.BARBER ou seleciona usuário existente.
- Admin cria BarberProfile.
- Sistema valida barbershopId.
- Barbeiro aparece em listagens internas e, se ativo, para agendamento.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /barbers | Criar perfil de barbeiro | Admin |
| GET | /barbers | Listar barbeiros | Admin/Cliente |
| GET | /barbers/{id} | Detalhar barbeiro | Protegida |
| PATCH | /barbers/{id} | Editar perfil | Admin |
| PATCH | /barbers/{id}/status | Alterar status | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar barbeiro

- **Objetivo:** Validar perfil profissional
- **Método/rota:** `POST /barbers`
- **Pré-condição:** Token Admin
- **Entrada:** userId, displayName, comissão
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** user não é BARBER, comissão inválida, barbearia diferente
### Listar barbeiros ativos

- **Objetivo:** Validar tela de agendamento
- **Método/rota:** `GET /barbers?status=ACTIVE`
- **Pré-condição:** Token válido
- **Entrada:** sem body
- **Resultado esperado:** HTTP 200 somente ativos
- **Erros que precisam ser testados:** barbeiro inativo aparecendo, dados de outra barbearia

## 13. Critérios de aceite

- BarberProfile criado.
- Só User BARBER vira barbeiro.
- Barbeiro inativo não agenda.
- Comissão padrão armazenada.
- Bruno testa criação, listagem e status.

## 14. Ordem de implementação recomendada por domínio

- Criar BarberStatus.
- Criar BarberProfile.
- Criar repository.
- Criar service validando User e barbershop.
- Criar controller.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Não duplique e-mail e senha em BarberProfile. Isso pertence ao domínio users.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio barbers"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio barbers"
```
