# SaaS Plans Billing — Planos e Monetização da Plataforma

## 1. Objetivo do domínio

Controlar planos vendidos para barbearias, limites, módulos pagos e situação de assinatura.

## 2. Problema de negócio

O produto precisa monetizar: cobrar por barbearia, barbeiros, dispositivos, CRM, WhatsApp e módulos extras.

## 3. Atores impactados

- SuperAdmin
- Admin/Dono
- Barbershops
- Devices
- WhatsApp CRM

## 4. Escopo

### Entra neste domínio

- Planos SaaS
- Limites por plano
- Módulos pagos
- Assinatura da barbearia
- Status financeiro
- Bloqueio por inadimplência

### Não entra neste domínio

- Gateway completo na primeira versão
- Emissão fiscal
- Cobrança automática avançada

## 5. Entidades e dados principais

### SaasPlan

Plano vendido para barbearias.

**Campos principais:**

  - `id`: UUID
  - `name`: nome
  - `price`: preço
  - `barberLimit`: limite barbeiros
  - `deviceLimitPerBarber`: limite dispositivos
  - `features`: recursos liberados
  - `status`: status

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### SaasSubscription

Assinatura de uma barbearia.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `planId`: plano
  - `status`: status
  - `startsAt`: início
  - `endsAt`: fim
  - `nextBillingAt`: próxima cobrança

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- SaasPlanStatus: ACTIVE, INACTIVE
- SubscriptionStatus: TRIAL, ACTIVE, PAST_DUE, CANCELLED, BLOCKED
- FeatureCode: CRM_WHATSAPP, GOOGLE_CALENDAR, ADVANCED_DASHBOARD, LOYALTY, EXTRA_DEVICE

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateSaasPlanRequest
- UpdateSubscriptionRequest
- FeatureAccessResponse

## 8. Regras de negócio

- Barbearia sem plano ativo pode ficar limitada.
- Recurso pago só funciona se plano permitir.
- Limite de barbeiros deve ser validado ao criar barbeiro.
- Limite de dispositivos deve ser validado no login/dispositivo.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar plano SaaS | Sim | Não | Não | Não |
| Alterar assinatura | Sim | Não | Não | Não |
| Ver plano atual | Sim | Sim, própria | Não | Não |
| Usar recurso pago | Conforme plano | Conforme plano | Conforme plano | Conforme plano |

## 10. Fluxos principais

- SuperAdmin cria plano.
- SuperAdmin vincula plano à barbearia.
- Sistema valida limites.
- Domínios consultam se feature está liberada.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /saas/plans | Criar plano | SuperAdmin |
| GET | /saas/subscriptions | Listar assinaturas | SuperAdmin |
| PATCH | /saas/subscriptions/{id} | Alterar assinatura | SuperAdmin |
| GET | /saas/features/check | Checar recurso | Protegida |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar plano

- **Objetivo:** Validar monetização
- **Método/rota:** `POST /saas/plans`
- **Pré-condição:** Token SuperAdmin
- **Entrada:** name, price, limits
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** preço inválido, feature inválida
### Checar limite

- **Objetivo:** Validar feature
- **Método/rota:** `GET /saas/features/check?feature=CRM_WHATSAPP`
- **Pré-condição:** Barbearia com plano
- **Entrada:** query feature
- **Resultado esperado:** HTTP 200 allowed true/false
- **Erros que precisam ser testados:** sem assinatura, barbearia bloqueada

## 13. Critérios de aceite

- Plano criado.
- Assinatura vinculada.
- Feature check funciona.
- Limite impede recurso indevido.

## 14. Ordem de implementação recomendada por domínio

- Criar feature codes.
- Criar SaasPlan.
- Criar Subscription.
- Criar service de feature check.
- Integrar com domínios pagos.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Diferencie plano SaaS da barbearia de plano vendido para cliente final.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio saas-plans-billing"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio saas-plans-billing"
```
