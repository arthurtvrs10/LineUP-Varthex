# Inventory Products — Estoque e Produtos

## 1. Objetivo do domínio

Controlar produtos da barbearia, quantidade, preço de custo, preço de venda e movimentações de estoque.

## 2. Problema de negócio

Barbearias vendem pomadas, óleos, shampoos e outros itens. Sem estoque, o dono não sabe o que acabou, o lucro dos produtos e o que precisa comprar.

## 3. Atores impactados

- Admin
- Barbeiro
- Domínio Product Sales
- Dashboard

## 4. Escopo

### Entra neste domínio

- Cadastro de produto
- Entrada de estoque
- Saída manual
- Estoque mínimo
- Alerta de estoque baixo
- Histórico de movimentações

### Não entra neste domínio

- Venda detalhada
- Fornecedor avançado
- Nota fiscal

## 5. Entidades e dados principais

### Product

Produto vendido ou controlado.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `name`: nome
  - `category`: categoria
  - `costPrice`: preço custo
  - `salePrice`: preço venda
  - `quantity`: quantidade atual
  - `minimumStock`: estoque mínimo
  - `status`: status

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### StockMovement

Movimentação de estoque.

**Campos principais:**

  - `id`: UUID
  - `productId`: produto
  - `type`: tipo
  - `quantity`: quantidade
  - `reason`: motivo
  - `createdByUserId`: usuário
  - `createdAt`: data

**Relacionamentos:**

  - StockMovement N:1 Product

**Observações:**



## 6. Tipos, enums e status

- ProductStatus: ACTIVE, INACTIVE
- StockMovementType: IN, OUT, SALE, ADJUSTMENT
- ProductCategory: POMADE, SHAMPOO, OIL, ACCESSORY, OTHER

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateProductRequest
- UpdateProductRequest
- StockMovementRequest
- ProductResponse

## 8. Regras de negócio

- Quantidade não pode ficar negativa.
- Venda reduz estoque.
- Produto com estoque baixo gera alerta.
- Produto inativo não aparece para venda.
- Movimentação deve manter histórico.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin cadastra produto.
- Admin registra entrada.
- Sistema aumenta estoque.
- Venda reduz estoque.
- Estoque baixo aparece no dashboard/notificação.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /products | Criar produto | Admin |
| GET | /products | Listar produtos | Protegida |
| POST | /products/{id}/stock-movements | Registrar movimento | Admin |
| PATCH | /products/{id} | Editar produto | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar produto

- **Objetivo:** Validar cadastro
- **Método/rota:** `POST /products`
- **Pré-condição:** Token Admin
- **Entrada:** name, salePrice, quantity
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** preço negativo, estoque mínimo inválido
### Entrada de estoque

- **Objetivo:** Validar movimento
- **Método/rota:** `POST /products/{id}/stock-movements`
- **Pré-condição:** Produto existente
- **Entrada:** type IN, quantity
- **Resultado esperado:** HTTP 201 e quantidade atualizada
- **Erros que precisam ser testados:** quantidade negativa, produto inativo

## 13. Critérios de aceite

- Produto cadastrado.
- Entrada aumenta estoque.
- Saída reduz estoque sem negativar.
- Estoque mínimo sinaliza alerta.

## 14. Ordem de implementação recomendada por domínio

- Criar enums.
- Criar Product.
- Criar StockMovement.
- Criar service transacional.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Movimentações devem ser rastreáveis; evite alterar quantidade sem registrar movimento.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio inventory-products"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio inventory-products"
```
