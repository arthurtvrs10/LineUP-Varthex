# Matriz de Domínios do Varthex Barber

Esta matriz mostra todos os domínios principais do software e quando eles aparecem no roadmap.

| Domínio | Responsabilidade | Semana principal | Entidades principais |
|---|---|---|---|
| `auth` | Login, JWT, refresh token, sessão e segurança inicial | Semana 02 | User, RefreshToken |
| `users` | Pessoas que acessam o sistema e seus perfis | Semana 02/03 | User, Role, UserStatus |
| `barbershops` | Tenant/SaaS: cada barbearia dentro da plataforma | Semana 03 | Barbershop, BarbershopStatus |
| `barbers` | Profissionais que atendem clientes | Semana 04 | BarberProfile, User |
| `clients` | Clientes da barbearia | Semana 04 | ClientProfile, User |
| `services` | Serviços vendidos: corte, barba etc. | Semana 04 | ServiceCatalogItem |
| `schedules-availability` | Horários de funcionamento e disponibilidade | Semana 05 | WorkingHour, BarberAvailability |
| `appointments` | Agendamentos e ciclo do atendimento | Semana 06 | Appointment, AppointmentStatus |
| `blocked-times` | Bloqueio e desbloqueio de horários | Semana 07 | BlockedTime |
| `waitlist` | Fila de espera para dias cheios | Semana 10 | WaitlistEntry |
| `commissions` | Comissão por atendimento, produto e barbeiro | Semana 08 | CommissionRule, CommissionEntry |
| `dashboard-financial-closing` | Indicadores, cards e fechamento | Semana 08/09 | FinancialClosing, DashboardSnapshot |
| `inventory-products` | Produtos em estoque | Semana 12 | Product, StockMovement |
| `product-sales` | Venda de produtos e baixa de estoque | Semana 12 | ProductSale, ProductSaleItem |
| `loyalty` | Pontos, níveis e benefícios | Semana 13 | LoyaltyAccount, LoyaltyTransaction |
| `customer-plans` | Planos vendidos para clientes finais | Semana 13 | CustomerPlan, CustomerSubscription |
| `notifications` | Notificações internas e externas | Semana 14 | Notification, NotificationTemplate |
| `whatsapp-crm` | Mensagens, menu e campanhas via WhatsApp | Semana 15 | WhatsappMessage, Campaign |
| `google-integrations` | Google Agenda e avaliação Google | Semana 15 | GoogleCalendarSync, ReviewRequest |
| `saas-plans-billing` | Planos da plataforma e cobrança do SaaS | Semana 16 | SaasPlan, Subscription |
| `devices` | Controle de dispositivos por barbeiro/usuário | Semana 16 | DeviceSession |
| `audit-logs` | Logs e rastreabilidade | Transversal | AuditLog |
| `shared-kernel` | Tipos e padrões compartilhados | Transversal | Money, DateRange, Address |

## Como usar

Sempre que for implementar uma semana, consulte primeiro a matriz para identificar quais domínios serão alterados. Depois abra o arquivo específico do domínio.
