# Matriz de módulos

**ID:** DOC-ARQ-003  
**Status:** aprovado  
**Fonte canônica para:** proprietário técnico e interface entre módulos

| Módulo | Release | Entidades próprias | API pública interna | Eventos principais |
|---|---|---|---|---|
| `auth` | MVP | UserSession, AuthChallenge | autenticar, recuperar, verificar, renovar e revogar | `user.logged_in`, `session.revoked` |
| `tenants` | MVP | Tenant, Unit, UnitOpeningHour | contexto, configuração e funcionamento | `tenant.activated`, `tenant.suspended` |
| `users` | MVP | User, Membership, Role na Final | convite, perfil, papel e permissão | `user.invited`, `membership.changed` |
| `customers` | MVP | Customer, CustomerMerge na Final | cadastro, consulta e deduplicação | `customer.created`, `customer.archived` |
| `barbers` | MVP | BarberProfile | profissional e vínculo | `barber.updated` |
| `services` | MVP | Category, Service, BarberService, ServiceComposition no Intermediário | catálogo, composição e preço efetivo | `service.updated` |
| `scheduling` | MVP | WorkSchedule, Exception, Series, Appointment, Item, History | disponibilidade e agenda | `appointment.created`, `appointment.completed` |
| `waitlist` | MVP | WaitlistEntry, WaitlistOffer | candidatura e oferta | `slot.available`, `waitlist.offer.accepted` |
| `commissions` | MVP | CommissionRule, CommissionEntry | regra e razão | `commission.provisioned`, `commission.reversed` |
| `notifications` | MVP | Notification, NotificationPreference, Template no Intermediário | solicitar, preferir e acompanhar | `notification.delivered`, `notification.failed` |
| `audit` | MVP | AuditLog | registrar e consultar | não publica dados sensíveis |
| `outbox` | MVP | OutboxEvent | publicar de forma recuperável | todos os eventos externos |
| `reporting` | MVP | projeções; DashboardPreference na Final | dashboards e exportações | `export.generated` |
| `cash` | INTERMEDIARIO | CashSession, CashMovement | abrir, movimentar e fechar | `cash.opened`, `cash.closed` |
| `payments` | INTERMEDIARIO | Payment, Refund | receber, confirmar e estornar | `payment.confirmed`, `refund.confirmed` |
| `inventory` | INTERMEDIARIO | Product, Supplier, StockMovement; compras na final | catálogo e razão | `stock.changed`, `stock.low` |
| `loyalty` | INTERMEDIARIO | Program, Account, Transaction, CustomerPlan, CustomerPlanItem, CustomerPlanSubscription | crédito, resgate e planos | `loyalty.credited`, `plan.consumed` |
| `integrations` | INTERMEDIARIO | IntegrationConnection | OAuth, webhooks e adapters | `integration.degraded` |
| `subscriptions` | INTERMEDIARIO | SaaSPlan, Subscription, Entitlement, Coupon | direitos, cupons e cobrança | `subscription.changed` |
| `administration` | MVP | SupportSession no Intermediário; demais dados via APIs dos módulos | suporte e plataforma | `support.access_started` |
| `crm` | INTERMEDIARIO | CustomerConsent; Campaign, CrmAutomation e ContactPolicy na Final | consentimento, segmentos, automações e campanhas | `campaign.started`, `campaign.completed` |
| `publicapi` | FINAL | ApiCredential, WebhookSubscription | API e webhooks externos | eventos permitidos |

## 1. Dependências permitidas

- todos podem usar `shared` sem regra de negócio;
- `scheduling` consulta serviços públicos de `customers`, `barbers` e `services`;
- `commissions` reage a conclusão e reembolso;
- `inventory` reage a venda/consumo;
- `loyalty` reage a pagamento/conclusão/reembolso;
- `notifications` reage a eventos; não altera agenda diretamente;
- `reporting` lê projeções e consultas públicas;
- `administration` nunca acessa tabelas de outro módulo diretamente.

## 2. Dependências proibidas

- `customers` depender de `scheduling`;
- `services` depender de `payments`;
- `notifications` chamar repository de agenda;
- `reporting` alterar entidades operacionais;
- frontend ou controller decidir comissão;
- Redis ser dependência de corretude transacional.

## 3. Dono dos dados

Somente o módulo proprietário grava sua entidade. Outros módulos solicitam uma ação, consultam API pública ou reagem a evento. Exceção precisa de ADR.
