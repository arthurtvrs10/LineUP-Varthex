# Perfis e permissões

**ID:** DOC-REQ-003  
**Status:** aprovado  
**Fonte canônica para:** RBAC e acesso por papel

## 1. Papéis

| Papel | Release | Escopo |
|---|---|---|
| `SUPER_ADMIN` | MVP | Plataforma Varthex |
| `ADMIN` | MVP | Tenant e unidade inicial |
| `BARBER` | MVP | Operação própria |
| `CLIENT` | MVP | Dados e reservas próprias |
| `MANAGER` | INTERMEDIARIO | Gestão delegada por unidade |
| `RECEPTIONIST` | INTERMEDIARIO | Clientes, agenda e fila |
| `CASHIER` | INTERMEDIARIO | Caixa e pagamentos |
| Papel customizado | FINAL | Conjunto aprovado de permissões |

## 2. Permissões canônicas

| Código | Ação |
|---|---|
| `tenant:read` | Ver configuração da barbearia |
| `tenant:update` | Alterar configuração |
| `user:manage` | Convidar, bloquear e atribuir papel |
| `customer:read` | Ver cliente |
| `customer:write` | Criar e editar cliente |
| `customer:export` | Exportar dados |
| `service:manage` | Gerenciar catálogo |
| `schedule:read:any` | Ver agendas da unidade |
| `schedule:read:own` | Ver agenda própria |
| `appointment:create` | Criar agendamento |
| `appointment:update` | Editar/reagendar |
| `appointment:cancel` | Cancelar |
| `appointment:operate` | Check-in, iniciar, concluir e falta |
| `availability:manage:any` | Gerenciar disponibilidade da equipe |
| `availability:manage:own` | Gerenciar própria disponibilidade permitida |
| `waitlist:manage` | Operar fila |
| `commission:read:any` | Ver comissão da equipe |
| `commission:read:own` | Ver comissão própria |
| `commission:manage` | Configurar e ajustar comissão |
| `dashboard:read` | Ver indicadores autorizados |
| `cash:operate` | Abrir, movimentar e fechar caixa |
| `cash:reopen` | Reabrir caixa |
| `payment:operate` | Receber e estornar dentro do limite |
| `inventory:read` | Consultar estoque |
| `inventory:manage` | Movimentar e inventariar |
| `loyalty:manage` | Configurar e ajustar fidelidade |
| `crm:manage` | Templates, segmentos e campanhas |
| `integration:manage` | Conectar e remover integrações |
| `subscription:read` | Ver plano e consumo |
| `subscription:manage` | Alterar assinatura |
| `audit:read` | Consultar auditoria |
| `support:impersonate` | Acesso de suporte controlado |

## 3. Matriz padrão

Legenda: `T` total no escopo; `P` próprio; `L` limitado; `—` negado.

| Capacidade | Super Admin | Admin | Manager | Receptionist | Cashier | Barber | Client |
|---|---:|---:|---:|---:|---:|---:|---:|
| Configuração do tenant | L | T | L | — | — | — | — |
| Usuários e papéis | L | T | L | — | — | — | — |
| Clientes | L | T | T | T | L | L | P |
| Serviços | L | T | L | L | L | L | L |
| Agenda da unidade | L | T | T | T | L | P | P |
| Criar/reagendar | — | T | T | T | L | L | P |
| Operar atendimento | — | T | T | T | — | P | — |
| Disponibilidade equipe | — | T | T | L | — | P | — |
| Fila de espera | — | T | T | T | — | L | P |
| Comissão da equipe | — | T | T | — | — | P | — |
| Configurar comissão | — | T | L | — | — | — | — |
| Dashboard financeiro | L | T | T | — | L | P | — |
| Caixa e pagamentos | — | T | T | L | T | L | P |
| Estoque | — | T | T | L | L | L | — |
| Fidelidade/CRM | — | T | T | L | L | L | P |
| Integrações | L | T | L | — | — | — | — |
| Assinatura SaaS | T | T | L | — | — | — | — |
| Auditoria | T | T | L | — | — | — | — |

## 4. Controles obrigatórios

- autorização no backend para toda operação;
- esconder botão não substitui autorização;
- consultas `own` validam o identificador ligado ao usuário;
- papéis pertencem a um tenant/unidade, exceto Super Admin;
- aumento de privilégio exige auditoria e invalidação de cache;
- exportação e acesso de suporte exigem evento de auditoria;
- cliente não acessa observação interna, comissão ou dados de terceiros;
- barbeiro não vê comissão de outro profissional;
- suporte controlado não assume a identidade do usuário e expira automaticamente.

## 5. Política de menor privilégio

Novas permissões começam negadas para todos os papéis. O Product Owner define necessidade; Segurança revisa; o catálogo é atualizado antes do código.

