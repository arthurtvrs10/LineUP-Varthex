# Shared Kernel — Tipos e Padrões Compartilhados

## 1. Objetivo do domínio

Centralizar conceitos compartilhados que aparecem em vários domínios sem pertencer a apenas um.

## 2. Problema de negócio

Alguns tipos aparecem em vários lugares: dinheiro, período, endereço, telefone, paginação e status comuns. Se cada domínio criar do seu jeito, o sistema fica inconsistente.

## 3. Atores impactados

- Todos os domínios
- Backend
- Frontend
- Documentação

## 4. Escopo

### Entra neste domínio

- Tipos de valor compartilhados
- Padrões de resposta
- Paginação
- Datas e períodos
- Endereço/telefone quando genérico

### Não entra neste domínio

- Regra específica de negócio
- Entidades operacionais de domínio

## 5. Entidades e dados principais

### Money

Conceito de valor monetário.

**Campos principais:**

  - `amount`: valor
  - `currency`: moeda, geralmente BRL

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### DateRange

Intervalo de datas.

**Campos principais:**

  - `startDate`: início
  - `endDate`: fim

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### Address

Endereço reutilizável.

**Campos principais:**

  - `street`: rua
  - `number`: número
  - `city`: cidade
  - `state`: UF
  - `zipCode`: CEP

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- Currency: BRL inicialmente
- SortDirection: ASC, DESC
- GenericStatus: ACTIVE, INACTIVE

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- PageResponse
- ErrorResponse
- DateRangeFilter
- AddressRequest

## 8. Regras de negócio

- Dinheiro não deve usar double.
- Datas devem considerar timezone da barbearia.
- Erros devem seguir formato comum.
- Paginação deve ser padrão nas listagens grandes.

## 9. Permissões

| Ação | Sistema | Observação |
|---|---|---|
| Reutilizar tipo comum | Sim | Quando não houver regra específica |
| Colocar regra de negócio aqui | Não | Regra fica no domínio dono |
| Criar enum compartilhado | Com cuidado | Só se realmente usado por vários domínios |

## 10. Fluxos principais

- Domínio precisa de tipo comum.
- Verifica se já existe no shared-kernel.
- Reutiliza se for genérico.
- Se tiver regra específica, cria no próprio domínio.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| N/A | N/A | Shared kernel não precisa expor endpoints próprios | N/A |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Validação indireta

- **Objetivo:** Garantir padrão
- **Método/rota:** `Qualquer endpoint paginado`
- **Pré-condição:** Endpoint existente
- **Entrada:** page, size
- **Resultado esperado:** Resposta segue PageResponse
- **Erros que precisam ser testados:** formato inconsistente, erro sem padrão

## 13. Critérios de aceite

- Tipos comuns documentados.
- Não há regra de domínio escondida no shared.
- Erro padrão definido.
- Paginação padrão definida.

## 14. Ordem de implementação recomendada por domínio

- Criar pacote common/shared.
- Definir ErrorResponse.
- Definir PageResponse.
- Definir padrões de datas/dinheiro.
- Usar nos domínios.

## 15. Observações para desenvolvimento

Shared Kernel deve ser pequeno. Se crescer demais, provavelmente você está colocando regra de domínio no lugar errado.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio shared-kernel"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio shared-kernel"
```
