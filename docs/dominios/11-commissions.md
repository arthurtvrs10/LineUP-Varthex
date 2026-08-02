# Commissions — Comissões

## 1. Objetivo do domínio

Calcular valores de comissão para barbeiros por atendimento, produto ou regra específica.

## 2. Problema de negócio

Donos precisam saber quanto pagar para cada barbeiro por dia, semana e mês. Sem domínio de comissões, o financeiro fica manual e sujeito a erro.

## 3. Atores impactados

- Admin
- Barbeiro
- Domínios Appointments, Product Sales e Dashboard

## 4. Escopo

### Entra neste domínio

- Regra de comissão por barbeiro
- Comissão por atendimento concluído
- Comissão por produto
- Status de pagamento
- Ajuste manual com motivo

### Não entra neste domínio

- Folha de pagamento completa
- Impostos
- Contabilidade avançada

## 5. Entidades e dados principais

### CommissionRule

Regra configurada para cálculo.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `barberId`: barbeiro opcional
  - `serviceId`: serviço opcional
  - `type`: tipo
  - `value`: percentual ou valor fixo
  - `status`: status

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**


### CommissionEntry

Comissão gerada.

**Campos principais:**

  - `id`: UUID
  - `barberId`: barbeiro
  - `appointmentId`: atendimento opcional
  - `productSaleId`: venda opcional
  - `grossAmount`: valor bruto
  - `commissionAmount`: valor da comissão
  - `status`: status
  - `generatedAt`: geração
  - `paidAt`: pagamento

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- CommissionType: PERCENTAGE, FIXED
- CommissionStatus: PENDING, PAID, CANCELLED, ADJUSTED

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateCommissionRuleRequest
- AdjustCommissionRequest
- CommissionEntryResponse
- CommissionSummaryResponse

## 8. Regras de negócio

- Comissão só deve ser gerada após atendimento concluído.
- Ajuste manual exige motivo.
- Comissão paga não deve ser alterada sem ajuste registrado.
- Regra específica do barbeiro pode sobrescrever regra padrão.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin configura regra.
- Atendimento é concluído.
- Sistema calcula comissão.
- Comissão fica pendente.
- Admin marca como paga.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /commissions/rules | Criar regra | Admin |
| GET | /commissions | Listar comissões | Admin/Barbeiro própria |
| PATCH | /commissions/{id}/pay | Marcar como paga | Admin |
| PATCH | /commissions/{id}/adjust | Ajustar comissão | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Gerar comissão

- **Objetivo:** Validar cálculo
- **Método/rota:** `PATCH /appointments/{id}/complete`
- **Pré-condição:** Appointment confirmado
- **Entrada:** sem body
- **Resultado esperado:** Appointment concluído e comissão gerada
- **Erros que precisam ser testados:** appointment cancelado, regra ausente, valor inválido
### Listar comissão do barbeiro

- **Objetivo:** Validar visão do barbeiro
- **Método/rota:** `GET /commissions?barberId=`
- **Pré-condição:** Token Barber/Admin
- **Entrada:** filtro de período
- **Resultado esperado:** HTTP 200
- **Erros que precisam ser testados:** barbeiro vendo comissão de outro

## 13. Critérios de aceite

- Regra criada.
- Comissão gerada ao concluir atendimento.
- Barbeiro vê apenas as próprias.
- Admin vê todas da barbearia.

## 14. Ordem de implementação recomendada por domínio

- Criar enums.
- Criar CommissionRule.
- Criar CommissionEntry.
- Criar cálculo no service.
- Integrar conclusão de appointment.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Dinheiro deve usar BigDecimal. Não calcule comissão com double.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio commissions"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio commissions"
```
