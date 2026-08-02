# Dashboard Financial Closing — Dashboard e Fechamento

## 1. Objetivo do domínio

Exibir cards financeiros, operacionais e fechamentos diário, semanal e mensal.

## 2. Problema de negócio

O dono precisa entender rapidamente faturamento, atendimentos, comissões, produtos vendidos e desempenho dos barbeiros. Sem dashboard, o sistema agenda, mas não ajuda a gerir.

## 3. Atores impactados

- Admin
- SuperAdmin futuramente
- Barbeiro parcialmente

## 4. Escopo

### Entra neste domínio

- Cards do dia, semana e mês
- Fechamento diário
- Resumo por barbeiro
- Resumo de comissão
- Indicadores de cancelamento e no-show

### Não entra neste domínio

- BI avançado
- DRE completa
- Integração contábil

## 5. Entidades e dados principais

### FinancialClosing

Fechamento financeiro de um período.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `periodType`: dia/semana/mês
  - `startDate`: início
  - `endDate`: fim
  - `grossRevenue`: receita bruta
  - `commissionTotal`: total comissões
  - `productRevenue`: receita produtos
  - `serviceRevenue`: receita serviços
  - `status`: status
  - `createdAt`: criação

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- PeriodType: DAILY, WEEKLY, MONTHLY
- ClosingStatus: OPEN, CLOSED, REOPENED

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- DashboardSummaryResponse
- BarberPerformanceResponse
- FinancialClosingResponse
- DateRangeFilter

## 8. Regras de negócio

- Dashboard deve respeitar barbershopId.
- Valores devem considerar apenas atendimentos concluídos/pagos conforme regra.
- Fechamento fechado não muda sem reabertura registrada.
- Filtros de data devem ser claros.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin abre dashboard.
- Frontend solicita período.
- Backend agrega appointments, sales e commissions.
- Cards são retornados.
- Admin pode gerar fechamento.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| GET | /dashboard/summary | Resumo geral | Admin |
| GET | /dashboard/barbers | Resumo por barbeiro | Admin |
| POST | /financial-closings | Gerar fechamento | Admin |
| GET | /financial-closings | Listar fechamentos | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Resumo diário

- **Objetivo:** Validar cards
- **Método/rota:** `GET /dashboard/summary?period=today`
- **Pré-condição:** Dados existentes
- **Entrada:** sem body
- **Resultado esperado:** HTTP 200 com cards
- **Erros que precisam ser testados:** sem dados, período inválido, outra barbearia
### Gerar fechamento

- **Objetivo:** Validar fechamento
- **Método/rota:** `POST /financial-closings`
- **Pré-condição:** Token Admin
- **Entrada:** periodType, startDate, endDate
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** período duplicado, sem permissão

## 13. Critérios de aceite

- Cards diários aparecem.
- Cards semanais e mensais funcionam.
- Resumo por barbeiro aparece.
- Fechamento é gerado e consultado.

## 14. Ordem de implementação recomendada por domínio

- Definir métricas.
- Criar queries/agregações.
- Criar DTOs de resposta.
- Criar controller de dashboard.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Dashboard deve retornar dados prontos para frontend, evitando regra financeira no React.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio dashboard-financial-closing"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio dashboard-financial-closing"
```
