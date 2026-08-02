# Product Sales — Venda de Produtos

## 1. Objetivo do domínio

Registrar vendas de produtos, baixar estoque e gerar comissão quando aplicável.

## 2. Problema de negócio

Além de serviços, barbearias ganham com produtos. A venda precisa impactar estoque, financeiro, comissão e histórico do cliente.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Inventory
- Commissions
- Dashboard

## 4. Escopo

### Entra neste domínio

- Venda de produto
- Itens de venda
- Baixa automática de estoque
- Associação com cliente e barbeiro
- Comissão sobre produto

### Não entra neste domínio

- Pagamento online
- Cupom avançado
- Nota fiscal

## 5. Entidades e dados principais

### ProductSale

Venda de produtos.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `clientId`: cliente opcional
  - `barberId`: barbeiro opcional
  - `totalAmount`: total
  - `paymentStatus`: status pagamento
  - `createdAt`: data

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### ProductSaleItem

Item da venda.

**Campos principais:**

  - `id`: UUID
  - `productSaleId`: venda
  - `productId`: produto
  - `quantity`: quantidade
  - `unitPrice`: preço unitário
  - `totalPrice`: total

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- PaymentStatus: PENDING, PAID, CANCELLED, REFUNDED
- ProductSaleStatus: OPEN, COMPLETED, CANCELLED

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateProductSaleRequest
- ProductSaleResponse
- ProductSaleItemRequest

## 8. Regras de negócio

- Venda não pode deixar estoque negativo.
- Preço da venda deve congelar o preço do momento.
- Venda cancelada deve tratar estorno de estoque conforme regra.
- Comissão só é gerada se configurada.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Barbeiro/Admin cria venda.
- Sistema valida estoque.
- Sistema baixa produtos.
- Sistema registra total.
- Comissão pode ser gerada.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /product-sales | Criar venda | Admin/Barbeiro |
| GET | /product-sales | Listar vendas | Protegida |
| PATCH | /product-sales/{id}/cancel | Cancelar venda | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar venda

- **Objetivo:** Validar venda e estoque
- **Método/rota:** `POST /product-sales`
- **Pré-condição:** Produto com estoque
- **Entrada:** items
- **Resultado esperado:** HTTP 201 e estoque reduzido
- **Erros que precisam ser testados:** estoque insuficiente, produto inativo, quantidade zero

## 13. Critérios de aceite

- Venda criada.
- Estoque reduzido.
- Total calculado.
- Comissão gerada se houver regra.

## 14. Ordem de implementação recomendada por domínio

- Criar entidades.
- Criar service transacional.
- Integrar inventory.
- Integrar commissions.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Use transação: venda e baixa de estoque precisam acontecer juntas.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio product-sales"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio product-sales"
```
