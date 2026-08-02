# Loyalty — Fidelidade

## 1. Objetivo do domínio

Controlar pontos, níveis e benefícios para aumentar retorno dos clientes.

## 2. Problema de negócio

Programa de fidelidade incentiva o cliente a voltar, comprar produtos e avaliar a barbearia.

## 3. Atores impactados

- Admin
- Cliente
- Barbeiro
- Appointments
- Product Sales
- CRM

## 4. Escopo

### Entra neste domínio

- Conta de pontos
- Acúmulo
- Resgate
- Níveis
- Histórico de transações

### Não entra neste domínio

- Marketplace de recompensas
- Gamificação avançada

## 5. Entidades e dados principais

### LoyaltyAccount

Conta de fidelidade do cliente.

**Campos principais:**

  - `id`: UUID
  - `clientId`: cliente
  - `pointsBalance`: saldo
  - `tier`: nível
  - `createdAt`: criação

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### LoyaltyTransaction

Movimento de pontos.

**Campos principais:**

  - `id`: UUID
  - `accountId`: conta
  - `type`: tipo
  - `points`: pontos
  - `reason`: motivo
  - `createdAt`: data

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- LoyaltyTier: BRONZE, SILVER, GOLD, DIAMOND
- LoyaltyTransactionType: EARN, REDEEM, EXPIRE, ADJUST

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateLoyaltyRuleRequest
- RedeemPointsRequest
- LoyaltyAccountResponse

## 8. Regras de negócio

- Pontos não podem ficar negativos, salvo ajuste autorizado.
- Resgate deve registrar histórico.
- Pontos podem expirar conforme configuração futura.
- Apenas cliente da barbearia acumula pontos nela.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Cliente conclui atendimento.
- Sistema gera pontos conforme regra.
- Cliente acumula saldo.
- Admin/cliente resgata benefício.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| GET | /loyalty/accounts/{clientId} | Ver saldo | Protegida |
| POST | /loyalty/redeem | Resgatar pontos | Admin/Cliente |
| GET | /loyalty/transactions | Histórico | Protegida |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Acumular pontos

- **Objetivo:** Validar pontos por atendimento
- **Método/rota:** `PATCH /appointments/{id}/complete`
- **Pré-condição:** Regra configurada
- **Entrada:** sem body
- **Resultado esperado:** pontos adicionados
- **Erros que precisam ser testados:** cliente sem conta, regra ausente
### Resgatar pontos

- **Objetivo:** Validar saldo
- **Método/rota:** `POST /loyalty/redeem`
- **Pré-condição:** Saldo suficiente
- **Entrada:** benefitId/points
- **Resultado esperado:** HTTP 200
- **Erros que precisam ser testados:** saldo insuficiente, cliente errado

## 13. Critérios de aceite

- Conta criada.
- Pontos acumulam.
- Resgate reduz saldo.
- Histórico registra tudo.

## 14. Ordem de implementação recomendada por domínio

- Criar enums.
- Criar entidades.
- Criar regra simples.
- Integrar appointment complete.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Comece simples: pontos por atendimento concluído.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio loyalty"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio loyalty"
```
