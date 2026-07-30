# Dicionário de dados

**ID:** DOC-DAD-002  
**Status:** aprovado  
**Fonte canônica dos campos:** [`catalogo-dados.csv`](catalogo-dados.csv)

Este documento explica como interpretar o catálogo; não replica suas linhas.

## 1. Colunas do catálogo

| Coluna | Significado |
|---|---|
| `field_id` | Identificador estável do conceito |
| `owner` | Entidade ou field set que possui a definição |
| `concept` | Significado em português |
| `java_name` / `java_type` | Campo e bean do backend |
| `db_column` / `sql_type` | Coluna e tipo físico |
| `api_name` | Propriedade JSON/OpenAPI; `-` quando nunca exposta |
| `typescript_type` | Tipo no consumidor |
| `nullable` | `YES` ou `NO` no modelo lógico |
| `validation` | Validações e limites |
| `release` | Primeira release que utiliza o campo |
| `data_classification` | `PUBLIC`, `INTERNAL`, `PERSONAL`, `SENSITIVE`, `SECRET` |
| `reference` | Regra, enum ou entidade relacionada |

## 2. Tipos padrão

| Conceito | Java | PostgreSQL | API/TypeScript |
|---|---|---|---|
| ID | `UUID` | `uuid` | string `uuid` |
| Instante | `Instant` | `timestamptz` | string `date-time` |
| Data civil | `LocalDate` | `date` | string `date` |
| Hora civil | `LocalTime` | `time` | string `HH:mm:ss` |
| Dinheiro | `BigDecimal` | `numeric(19,2)` | string decimal |
| Quantidade fracionável | `BigDecimal` | `numeric(19,3)` | string decimal |
| Contagem | `Integer` ou `Long` | `integer` ou `bigint` | number inteiro |
| Enum | enum Java | `varchar` + check | string enum |
| Estrutura flexível controlada | record/DTO | `jsonb` | objeto tipado |

## 3. Enums canônicos

| Enum | Valores iniciais |
|---|---|
| `TenantStatus` | `TRIAL`, `ACTIVE`, `PAST_DUE`, `SUSPENDED`, `CANCELED` |
| `UserStatus` | `INVITED`, `ACTIVE`, `BLOCKED`, `DISABLED` |
| `MembershipRole` | `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `RECEPTIONIST`, `CASHIER`, `BARBER`, `CLIENT` |
| `AppointmentStatus` | `PENDING`, `CONFIRMED`, `CHECKED_IN`, `IN_PROGRESS`, `COMPLETED`, `CANCELED`, `NO_SHOW` |
| `AppointmentChannel` | `ADMIN`, `RECEPTION`, `BARBER`, `CLIENT_WEB`, `WHATSAPP`, `API` |
| `ServiceType` | `SERVICE`, `COMBO`, `ADDON` |
| `AuthChallengeType` | `PASSWORD_RECOVERY`, `CONTACT_VERIFICATION`, `MFA` |
| `DepositMode` | `NONE`, `PERCENTAGE`, `FIXED` |
| `DepositStatus` | `NOT_REQUIRED`, `PENDING`, `PAID`, `EXPIRED`, `WAIVED` |
| `ExceptionType` | `BREAK`, `BLOCK`, `ABSENCE`, `VACATION`, `HOLIDAY` |
| `WaitlistStatus` | `ACTIVE`, `OFFERED`, `BOOKED`, `EXPIRED`, `CANCELED` |
| `OfferStatus` | `PENDING`, `ACCEPTED`, `EXPIRED`, `REJECTED` |
| `CommissionType` | `PERCENTAGE`, `FIXED`, `MIXED` |
| `CommissionStatus` | `PROVISIONED`, `APPROVED`, `PAID`, `REVERSED` |
| `NotificationChannel` | `IN_APP`, `EMAIL`, `WHATSAPP`, `SMS`, `PUSH` |
| `DeliveryStatus` | `PENDING`, `PROCESSING`, `SENT`, `DELIVERED`, `FAILED_TEMPORARY`, `FAILED_FINAL`, `CANCELED` |
| `ConsentPurpose` | `TRANSACTIONAL`, `MARKETING`, `ANALYTICS` |
| `ConsentStatus` | `GRANTED`, `WITHDRAWN`, `OPTED_OUT` |
| `CashStatus` | `OPEN`, `CLOSED`, `REOPENED` |
| `PaymentStatus` | `PENDING`, `CONFIRMED`, `FAILED`, `CANCELED`, `PARTIALLY_REFUNDED`, `REFUNDED` |
| `PaymentMethod` | `CASH`, `PIX`, `CREDIT_CARD`, `DEBIT_CARD`, `OTHER` |
| `PaymentPurpose` | `APPOINTMENT_SETTLEMENT`, `DEPOSIT`, `PRODUCT_SALE` |
| `StockMovementType` | `PURCHASE`, `SALE`, `SERVICE_CONSUMPTION`, `LOSS`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `TRANSFER_IN`, `TRANSFER_OUT`, `REVERSAL` |
| `SubscriptionStatus` | `TRIAL`, `ACTIVE`, `PAST_DUE`, `SUSPENDED`, `CANCELED` |

Enums novos exigem atualização desta seção, OpenAPI, banco e testes no mesmo pull request.

## 4. Normalização

- e-mail: trim e lowercase para busca; valor de apresentação pode ser preservado separadamente se necessário;
- telefone: E.164 quando possível;
- CPF/CNPJ: somente dígitos na persistência, formatação na interface;
- estado brasileiro: código UF com duas letras;
- país: ISO 3166-1 alpha-2;
- moeda: ISO 4217, inicialmente `BRL`;
- locale: BCP 47, inicialmente `pt-BR`;
- fuso: identificador IANA;
- strings: trim, Unicode válido e limites explícitos.

## 5. Dados pessoais

- `PERSONAL`: nome, e-mail, telefone, data de nascimento, endereço, IP pseudonimizado.
- `SENSITIVE`: não é esperado por padrão; qualquer novo campo exige avaliação de privacidade.
- `SECRET`: senha hash, refresh token hash, credencial de integração e segredo de webhook.
- `INTERNAL`: regras, valores operacionais, IDs e notas não públicas.
- `PUBLIC`: nome público, logo e catálogo exibido ao cliente.

## 6. Alteração do catálogo

O catálogo é modificado primeiro. Depois são atualizados migration, Entity, DTO, OpenAPI, tipos TypeScript e testes. Uma coluna não pode ser implementada se não possuir `field_id`.
