# Barbershops — Barbearias e Tenant SaaS

## 1. Objetivo do domínio

Representar cada barbearia cliente da plataforma e garantir isolamento de dados entre barbearias.

## 2. Problema de negócio

O Varthex Barber é um SaaS. Isso significa que uma única plataforma atende várias barbearias. Sem o domínio barbershops, não existe isolamento por cliente e uma barbearia poderia acessar dados de outra.

## 3. Atores impactados

- SuperAdmin
- Admin/Dono
- Barbeiro
- Cliente
- Todos os domínios operacionais

## 4. Escopo

### Entra neste domínio

- Cadastro de barbearia
- Status da barbearia
- Dados básicos do negócio
- Configurações iniciais
- Vínculo com usuários e dados operacionais

### Não entra neste domínio

- Assinatura SaaS detalhada
- Pagamentos
- Configurações avançadas de agenda

## 5. Entidades e dados principais

### Barbershop

Unidade/empresa que usa o sistema.

**Campos principais:**

  - `id`: UUID
  - `name`: nome comercial
  - `document`: CPF/CNPJ opcional
  - `phone`: telefone
  - `email`: e-mail de contato
  - `status`: status da barbearia
  - `timezone`: fuso horário
  - `createdAt`: criação
  - `updatedAt`: atualização

**Relacionamentos:**

  - Barbershop 1:N User
  - Barbershop 1:N Appointment
  - Barbershop 1:N Product

**Observações:**

- Quase todo dado operacional deve ter barbershopId.

## 6. Tipos, enums e status

- BarbershopStatus: ACTIVE, INACTIVE, BLOCKED, TRIAL, PAST_DUE
- BusinessDocumentType: CPF, CNPJ

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- CreateBarbershopRequest
- UpdateBarbershopRequest
- BarbershopResponse
- BarbershopSummaryResponse

## 8. Regras de negócio

- Somente SuperAdmin cria barbearia no SaaS.
- Admin só acessa a própria barbearia.
- Barbearia bloqueada não deve permitir operação normal.
- Dados de uma barbearia não podem aparecer para outra.
- Toda consulta operacional deve considerar barbershopId.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar barbearia | Sim | Não | Não | Não |
| Editar dados da barbearia | Sim | Sim, própria | Não | Não |
| Bloquear barbearia | Sim | Não | Não | Não |
| Ver dados básicos | Sim | Sim | Sim, própria | Sim, própria |

## 10. Fluxos principais

- SuperAdmin cria barbearia.
- Sistema define status inicial.
- SuperAdmin cria ou vincula Admin.
- Admin passa a operar dentro da barbearia.
- Todas as próximas entidades usam barbershopId.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| POST | /barbershops | Criar barbearia | SuperAdmin |
| GET | /barbershops | Listar barbearias | SuperAdmin |
| GET | /barbershops/{id} | Detalhar barbearia | SuperAdmin/Admin própria |
| PATCH | /barbershops/{id} | Editar dados | SuperAdmin/Admin própria |
| PATCH | /barbershops/{id}/status | Alterar status | SuperAdmin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Criar barbearia

- **Objetivo:** Validar tenant inicial
- **Método/rota:** `POST /barbershops`
- **Pré-condição:** Token SuperAdmin
- **Entrada:** dados básicos
- **Resultado esperado:** HTTP 201 com barbershopId
- **Erros que precisam ser testados:** sem token, perfil Admin tentando criar, documento duplicado
### Isolamento

- **Objetivo:** Garantir que Admin não acessa outra barbearia
- **Método/rota:** `GET /barbershops/{id}`
- **Pré-condição:** Token Admin
- **Entrada:** id de outra barbearia
- **Resultado esperado:** HTTP 403 ou 404 seguro
- **Erros que precisam ser testados:** sem permissão, barbearia bloqueada

## 13. Critérios de aceite

- SuperAdmin cria barbearia.
- Admin não acessa barbearia de outro Admin.
- Status BLOCKED impede operação.
- barbershopId é usado nos domínios operacionais.

## 14. Ordem de implementação recomendada por domínio

- Criar BarbershopStatus.
- Criar Barbershop.
- Criar repository.
- Criar service com isolamento.
- Criar controller.
- Testar SuperAdmin no Bruno.
- Testar Admin tentando acessar outra barbearia.

## 15. Observações para desenvolvimento

Este é o domínio central do SaaS. Sempre pergunte: este dado pertence a qual barbearia?

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio barbershops"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio barbershops"
```
