# Catálogo de entidades

**ID:** DOC-DAD-001  
**Status:** aprovado  
**Fonte canônica para:** existência, responsabilidade e ciclo de vida das entidades  
**Campos:** [`catalogo-dados.csv`](catalogo-dados.csv)

## 1. Conjuntos reutilizáveis de campos

| ID | Inclui | Uso |
|---|---|---|
| `FS-ID-AUDIT` | `id`, `createdAt`, `updatedAt`, `version` | Entidades mutáveis |
| `FS-TENANT` | `tenantId` | Toda entidade pertencente à barbearia |
| `FS-SOFT-DELETE` | `deletedAt`, `deletedBy` | Cadastros arquiváveis |

Entidades imutáveis usam `id` e `createdAt` do conjunto, mas não alteram movimentos anteriores. O catálogo CSV define os tipos uma vez.

## 2. Plataforma e identidade

| Entidade | Tabela | Release | Field sets | Responsabilidade |
|---|---|---|---|---|
| `ENT-TENANT` | `tenants` | MVP | ID-AUDIT | Barbearia contratante e configuração global |
| `ENT-UNIT` | `units` | MVP | ID-AUDIT, TENANT, SOFT-DELETE | Local físico e fuso operacional |
| `ENT-UNIT-OPENING-HOUR` | `unit_opening_hours` | MVP | ID-AUDIT, TENANT | Faixa de funcionamento local por dia da semana |
| `ENT-USER` | `users` | MVP | ID-AUDIT, SOFT-DELETE | Identidade global autenticável |
| `ENT-USER-MEMBERSHIP` | `user_memberships` | MVP | ID-AUDIT, TENANT | Papel e vínculo do usuário no tenant/unidade |
| `ENT-USER-SESSION` | `user_sessions` | MVP | ID-AUDIT | Sessão, dispositivo e refresh token protegido |
| `ENT-AUTH-CHALLENGE` | `auth_challenges` | MVP | ID-AUDIT | Desafio de recuperação, verificação ou MFA, sempre protegido |
| `ENT-ROLE` | `roles` | FINAL | ID-AUDIT, TENANT, SOFT-DELETE | Papel padrão ou personalizado e suas permissões |
| `ENT-SAAS-PLAN` | `saas_plans` | INTERMEDIARIO | ID-AUDIT | Plano comercial configurável |
| `ENT-SUBSCRIPTION` | `subscriptions` | INTERMEDIARIO | ID-AUDIT, TENANT | Assinatura da barbearia |
| `ENT-FEATURE-ENTITLEMENT` | `feature_entitlements` | INTERMEDIARIO | ID-AUDIT, TENANT | Recurso ou limite efetivo |
| `ENT-COUPON` | `coupons` | INTERMEDIARIO | ID-AUDIT, SOFT-DELETE | Cupom, elegibilidade, validade e uso do SaaS |
| `ENT-SUPPORT-SESSION` | `support_sessions` | INTERMEDIARIO | ID-AUDIT, TENANT | Acesso temporário e auditado de suporte |
| `ENT-API-CREDENTIAL` | `api_credentials` | FINAL | ID-AUDIT, TENANT, SOFT-DELETE | Chave da API pública |
| `ENT-WEBHOOK-SUBSCRIPTION` | `webhook_subscriptions` | FINAL | ID-AUDIT, TENANT, SOFT-DELETE | Webhook de saída do tenant |

## 3. Cadastros operacionais

| Entidade | Tabela | Release | Field sets | Responsabilidade |
|---|---|---|---|---|
| `ENT-CUSTOMER` | `customers` | MVP | ID-AUDIT, TENANT, SOFT-DELETE | Perfil do cliente no tenant |
| `ENT-CUSTOMER-MERGE` | `customer_merges` | FINAL | ID-AUDIT, TENANT | União revisada e reversível de duplicidades |
| `ENT-BARBER-PROFILE` | `barber_profiles` | MVP | ID-AUDIT, TENANT, SOFT-DELETE | Perfil profissional ligado a usuário |
| `ENT-SERVICE-CATEGORY` | `service_categories` | MVP | ID-AUDIT, TENANT, SOFT-DELETE | Agrupamento e ordenação de serviços |
| `ENT-SERVICE` | `services` | MVP | ID-AUDIT, TENANT, SOFT-DELETE | Serviço, preço e duração padrão |
| `ENT-BARBER-SERVICE` | `barber_services` | MVP | ID-AUDIT, TENANT | Habilitação e sobrescrita por profissional |
| `ENT-SERVICE-COMPOSITION` | `service_compositions` | INTERMEDIARIO | ID-AUDIT, TENANT | Itens e quantidades de combo ou adicional |

## 4. Agenda

| Entidade | Tabela | Release | Field sets | Responsabilidade |
|---|---|---|---|---|
| `ENT-WORK-SCHEDULE` | `work_schedules` | MVP | ID-AUDIT, TENANT | Jornada semanal vigente |
| `ENT-AVAILABILITY-EXCEPTION` | `availability_exceptions` | MVP | ID-AUDIT, TENANT | Pausa, bloqueio, ausência, férias ou feriado |
| `ENT-RECURRENCE-SERIES` | `recurrence_series` | MVP | ID-AUDIT, TENANT | Regra de recorrência e seu ciclo |
| `ENT-APPOINTMENT` | `appointments` | MVP | ID-AUDIT, TENANT | Reserva e estado do atendimento |
| `ENT-APPOINTMENT-ITEM` | `appointment_items` | MVP | ID-AUDIT, TENANT | Snapshot de cada serviço reservado |
| `ENT-APPOINTMENT-HISTORY` | `appointment_status_history` | MVP | ID-AUDIT, TENANT | Transição imutável de estado |
| `ENT-WAITLIST-ENTRY` | `waitlist_entries` | MVP | ID-AUDIT, TENANT | Interesse do cliente em uma vaga |
| `ENT-WAITLIST-OFFER` | `waitlist_offers` | MVP | ID-AUDIT, TENANT | Oferta temporária de slot |

## 5. Comissão, comunicação e auditoria

| Entidade | Tabela | Release | Field sets | Responsabilidade |
|---|---|---|---|---|
| `ENT-COMMISSION-RULE` | `commission_rules` | MVP | ID-AUDIT, TENANT | Regra com vigência e precedência |
| `ENT-COMMISSION-ENTRY` | `commission_entries` | MVP | ID-AUDIT, TENANT | Lançamento ou reversão de comissão |
| `ENT-NOTIFICATION` | `notifications` | MVP | ID-AUDIT, TENANT | Solicitação e entrega por canal |
| `ENT-NOTIFICATION-PREFERENCE` | `notification_preferences` | MVP | ID-AUDIT, TENANT | Preferência permitida por destinatário, tipo e canal |
| `ENT-CUSTOMER-CONSENT` | `customer_consents` | INTERMEDIARIO | ID-AUDIT, TENANT | Prova imutável de consentimento ou descadastro |
| `ENT-AUDIT-LOG` | `audit_logs` | MVP | ID-AUDIT | Trilha imutável de segurança e negócio |
| `ENT-OUTBOX-EVENT` | `outbox_events` | MVP | ID-AUDIT, TENANT | Entrega recuperável de evento assíncrono |
| `ENT-MESSAGE-TEMPLATE` | `message_templates` | INTERMEDIARIO | ID-AUDIT, TENANT, SOFT-DELETE | Template validado por canal |
| `ENT-INTEGRATION-CONNECTION` | `integration_connections` | INTERMEDIARIO | ID-AUDIT, TENANT | Estado e credencial referenciada de fornecedor |
| `ENT-CAMPAIGN` | `campaigns` | FINAL | ID-AUDIT, TENANT | Campanha e definição de público |
| `ENT-CRM-AUTOMATION` | `crm_automations` | FINAL | ID-AUDIT, TENANT, SOFT-DELETE | Gatilho, condição, atraso e limite de automação |
| `ENT-CONTACT-POLICY` | `contact_policies` | FINAL | ID-AUDIT, TENANT | Frequência e horário permitido de contato |
| `ENT-DASHBOARD-PREFERENCE` | `dashboard_preferences` | FINAL | ID-AUDIT, TENANT | Widgets escolhidos pelo usuário |

## 6. Caixa e pagamentos

| Entidade | Tabela | Release | Field sets | Responsabilidade |
|---|---|---|---|---|
| `ENT-CASH-SESSION` | `cash_sessions` | INTERMEDIARIO | ID-AUDIT, TENANT | Abertura e fechamento do caixa |
| `ENT-CASH-MOVEMENT` | `cash_movements` | INTERMEDIARIO | ID-AUDIT, TENANT | Movimento imutável do caixa |
| `ENT-PAYMENT` | `payments` | INTERMEDIARIO | ID-AUDIT, TENANT | Recebimento e estado financeiro |
| `ENT-REFUND` | `refunds` | INTERMEDIARIO | ID-AUDIT, TENANT | Reembolso imutável ligado ao pagamento |

## 7. Estoque e fidelidade

| Entidade | Tabela | Release | Field sets | Responsabilidade |
|---|---|---|---|---|
| `ENT-PRODUCT-CATEGORY` | `product_categories` | INTERMEDIARIO | ID-AUDIT, TENANT, SOFT-DELETE | Categoria de produto |
| `ENT-PRODUCT` | `products` | INTERMEDIARIO | ID-AUDIT, TENANT, SOFT-DELETE | Produto, custo e preço |
| `ENT-SUPPLIER` | `suppliers` | INTERMEDIARIO | ID-AUDIT, TENANT, SOFT-DELETE | Fornecedor |
| `ENT-STOCK-MOVEMENT` | `stock_movements` | INTERMEDIARIO | ID-AUDIT, TENANT | Razão imutável de estoque |
| `ENT-LOYALTY-PROGRAM` | `loyalty_programs` | INTERMEDIARIO | ID-AUDIT, TENANT, SOFT-DELETE | Regras do programa |
| `ENT-LOYALTY-ACCOUNT` | `loyalty_accounts` | INTERMEDIARIO | ID-AUDIT, TENANT | Conta do cliente |
| `ENT-LOYALTY-TRANSACTION` | `loyalty_transactions` | INTERMEDIARIO | ID-AUDIT, TENANT | Razão imutável de pontos |
| `ENT-CUSTOMER-PLAN` | `customer_plans` | INTERMEDIARIO | ID-AUDIT, TENANT, SOFT-DELETE | Pacote ou plano vendido ao cliente |
| `ENT-CUSTOMER-PLAN-ITEM` | `customer_plan_items` | INTERMEDIARIO | ID-AUDIT, TENANT | Serviço e créditos incluídos no pacote/plano |
| `ENT-CUSTOMER-PLAN-SUBSCRIPTION` | `customer_plan_subscriptions` | INTERMEDIARIO | ID-AUDIT, TENANT | Adesão do cliente ao plano |
| `ENT-PURCHASE-ORDER` | `purchase_orders` | FINAL | ID-AUDIT, TENANT | Pedido a fornecedor |
| `ENT-PURCHASE-ORDER-ITEM` | `purchase_order_items` | FINAL | ID-AUDIT, TENANT | Item solicitado e recebido |
| `ENT-STOCK-TRANSFER` | `stock_transfers` | FINAL | ID-AUDIT, TENANT | Transferência entre unidades |
| `ENT-STOCK-TRANSFER-ITEM` | `stock_transfer_items` | FINAL | ID-AUDIT, TENANT | Produto e quantidade transferida |
| `ENT-GOAL` | `goals` | FINAL | ID-AUDIT, TENANT | Meta por período, unidade ou profissional |

## 8. Regras estruturais

- Toda FK tenant-owned deve apontar para registro do mesmo tenant; o service valida e testes cobrem.
- Índices compostos iniciam por `tenant_id` nas consultas de tenant.
- E-mail é normalizado em minúsculas e telefone em formato canônico.
- Registros financeiros, estoque, fidelidade, histórico e auditoria não usam exclusão física operacional.
- Textos livres possuem limites e nunca recebem HTML arbitrário.
- Credenciais externas são referenciadas por segredo criptografado; o valor não fica no catálogo de entidades.
