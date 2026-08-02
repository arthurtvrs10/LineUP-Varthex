# Services — Catálogo de Serviços

## 1. Objetivo do domínio

Definir os serviços que a barbearia vende, como corte, barba, sobrancelha, combo e seus preços/durações.

## 2. Problema de negócio

A agenda depende da duração do serviço. O financeiro depende do preço. A comissão depende do serviço executado. Sem catálogo de serviços, o agendamento vira texto solto e não permite cálculo confiável.

## 3. Atores impactados

- Admin
- Barbeiro
- Cliente
- Domínios Appointments e Commissions

## 4. Escopo

### Entra neste domínio

- Cadastro de serviço
- Preço
- Duração
- Status
- Categoria
- Comissão padrão opcional

### Não entra neste domínio

- Promoções avançadas
- Pacotes de planos
- Estoque

## 5. Entidades e dados principais

### ServiceCatalogItem

Serviço oferecido pela barbearia.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia
  - `name`: nome
  - `description`: descrição
  - `price`: preço
  - `durationMinutes`: duração
  - `category`: categoria
  - `status`: status
  - `defaultCommissionPercent`: comissão padrão opcional
  - `createdAt`: criação
  - `updatedAt`: atualização

**Relacionamentos:**

  - ServiceCatalogItem N:1 Barbershop
  - ServiceCatalogItem 1:N Appointment

**Observações:**

- Não exclua serviço com histórico; inative.

## 6. Tipos, enums e status

- ServiceStatus: ACTIVE, INACTIVE
- ServiceCategory: HAIR, BEARD, EYEBROW, COMBO, OTHER

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateServiceRequest
- UpdateServiceRequest
- ServiceResponse
- ServiceListFilter

## 8. Regras de negócio

- Preço deve ser maior ou igual a zero.
- Duração deve ser maior que zero.
- Serviço inativo não aparece para novo agendamento.
- Serviço com agendamentos históricos não deve ser removido fisicamente.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Conforme regra do domínio | Conforme regra do domínio | Apenas se permitido | Apenas dados próprios |
| Listar | Tudo da plataforma | Dados da própria barbearia | Dados próprios | Dados próprios |
| Editar | Tudo | Dados da própria barbearia | Apenas dados próprios se permitido | Apenas dados próprios |
| Excluir/Inativar | Sim | Sim, dentro da barbearia | Não | Não |

## 10. Fluxos principais

- Admin cria serviço.
- Sistema valida preço e duração.
- Serviço ativo aparece para agendamento.
- Appointment usa preço e duração do serviço no momento do agendamento.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /services | Criar serviço | Admin |
| GET | /services | Listar serviços | Protegida/Pública conforme estratégia |
| GET | /services/{id} | Detalhar serviço | Protegida |
| PATCH | /services/{id} | Editar serviço | Admin |
| PATCH | /services/{id}/status | Ativar/inativar | Admin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar serviço

- **Objetivo:** Validar catálogo
- **Método/rota:** `POST /services`
- **Pré-condição:** Token Admin
- **Entrada:** name, price, durationMinutes
- **Resultado esperado:** HTTP 201
- **Erros que precisam ser testados:** preço negativo, duração zero, nome duplicado opcional
### Listar ativos

- **Objetivo:** Validar agenda
- **Método/rota:** `GET /services?status=ACTIVE`
- **Pré-condição:** Token válido
- **Entrada:** sem body
- **Resultado esperado:** HTTP 200 com ativos
- **Erros que precisam ser testados:** inativo aparecendo, outra barbearia

## 13. Critérios de aceite

- Serviço ativo cadastrado.
- Preço e duração válidos.
- Serviço inativo não agenda.
- Bruno testa CRUD básico.

## 14. Ordem de implementação recomendada por domínio

- Criar enums.
- Criar entity.
- Criar repository.
- Criar service.
- Criar controller.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Use BigDecimal para dinheiro no backend Java. Não use double para valores financeiros.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio services"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio services"
```
