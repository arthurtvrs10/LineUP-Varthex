# Customer Plans — Planos para Clientes

## 1. Objetivo do domínio

Permitir que a barbearia venda planos mensais ou pacotes de serviços para clientes finais.

## 2. Problema de negócio

Planos aumentam receita previsível para a barbearia e fidelizam clientes.

## 3. Atores impactados

- Admin
- Cliente
- Appointments
- Dashboard

## 4. Escopo

### Entra neste domínio

- Criar plano
- Assinar cliente
- Controlar validade
- Controlar uso de cortes incluídos
- Status da assinatura

### Não entra neste domínio

- Cobrança automática completa
- Gateway de pagamento avançado

## 5. Entidades e dados principais

### CustomerPlan

Plano oferecido pela barbearia.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `name`: nome
  - `price`: preço
  - `includedServices`: quantidade/serviços incluídos
  - `validityDays`: validade
  - `status`: status

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### CustomerSubscription

Assinatura do cliente.

**Campos principais:**

  - `id`: UUID
  - `clientId`: cliente
  - `planId`: plano
  - `startsAt`: início
  - `endsAt`: fim
  - `status`: status
  - `remainingUses`: usos restantes

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- CustomerPlanStatus: ACTIVE, INACTIVE
- SubscriptionStatus: ACTIVE, EXPIRED, CANCELLED, PAST_DUE

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateCustomerPlanRequest
- CreateSubscriptionRequest
- CustomerSubscriptionResponse

## 8. Regras de negócio

- Plano inativo não pode ser vendido.
- Assinatura vencida não libera benefício.
- Uso do plano deve reduzir saldo/uso restante.
- Cancelamento deve preservar histórico.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin cria plano.
- Cliente compra/assina.
- Sistema cria assinatura.
- Agendamento pode consumir uso do plano.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /customer-plans | Criar plano | Admin |
| POST | /customer-subscriptions | Assinar cliente | Admin |
| GET | /customer-subscriptions/{clientId} | Ver assinatura | Protegida |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar plano

- **Objetivo:** Validar plano
- **Método/rota:** `POST /customer-plans`
- **Pré-condição:** Token Admin
- **Entrada:** name, price, validity
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** preço inválido, validade inválida
### Assinar cliente

- **Objetivo:** Validar assinatura
- **Método/rota:** `POST /customer-subscriptions`
- **Pré-condição:** Cliente e plano ativos
- **Entrada:** clientId, planId
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** plano inativo, cliente bloqueado

## 13. Critérios de aceite

- Plano criado.
- Assinatura ativa.
- Uso reduzido ao consumir benefício.
- Assinatura vencida bloqueia uso.

## 14. Ordem de implementação recomendada por domínio

- Criar planos.
- Criar assinatura.
- Integrar appointments.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Não confunda plano de cliente com plano SaaS da barbearia. São domínios diferentes.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio customer-plans"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio customer-plans"
```
