# Registro de decisões de arquitetura

**ID:** DOC-GOV-004  
**Fonte canônica para:** decisões técnicas aprovadas

## ADR-001 — Monólito modular

- **Status:** aprovado
- **Decisão:** iniciar com um deploy de backend, dividido por módulos de negócio com dependências controladas.
- **Motivo:** equipe pequena, domínio ainda em validação e necessidade de transações consistentes.
- **Consequência:** nenhum módulo acessa repository interno de outro; comunicação ocorre por serviço público ou evento.
- **Reavaliação:** quando escala, independência de deploy ou limites organizacionais justificarem separação.

## ADR-002 — Java 21 e Spring Boot 4.1.x

- **Status:** aprovado
- **Decisão:** Java 21 é a versão da linguagem. Spring Boot permanece na linha 4.1.x, com patch travado no `pom.xml`.
- **Motivo:** base existente, suporte do framework e padronização da equipe.
- **Consequência:** dependências Spring são geridas pelo BOM do Spring Boot.

## ADR-003 — PostgreSQL 16 como fonte transacional

- **Status:** aprovado
- **Decisão:** todos os dados de negócio persistentes ficam no PostgreSQL.
- **Consequência:** Redis nunca é fonte exclusiva de clientes, agenda, pagamentos, comissão ou estoque.

## ADR-004 — Multi-tenancy por coluna

- **Status:** aprovado
- **Decisão:** tabelas pertencentes à barbearia possuem `tenant_id`; o tenant vem do contexto autenticado.
- **Controle:** filtros explícitos, autorização de serviço, testes de isolamento e índices iniciados por `tenant_id`.
- **Proibição:** aceitar `tenantId` do navegador como autoridade.

## ADR-005 — OpenAPI-first

- **Status:** aprovado
- **Decisão:** o OpenAPI é alterado antes ou junto da implementação.
- **Consequência:** tipos TypeScript são gerados; DTOs Java devem cumprir o contrato; breaking changes exigem nova versão.

## ADR-006 — Next.js 16 App Router

- **Status:** aprovado para esta baseline
- **Decisão:** Next.js App Router, React, TypeScript e Tailwind CSS.
- **Motivo:** aderência ao TailAdmin atual, SSR quando útil e ecossistema conhecido.
- **Consequência:** autenticação não é armazenada em `localStorage`; tokens permanecem em cookies seguros ou no servidor.

## ADR-007 — Design system próprio sobre TailAdmin

- **Status:** aprovado
- **Decisão:** TailAdmin fornece estrutura inicial, mas tokens e componentes Varthex são soberanos.
- **Consequência:** componentes importados são adaptados; a licença MIT e os avisos exigidos devem ser preservados.

## ADR-008 — Redis com uso deliberado

- **Status:** aprovado
- **Usos permitidos inicialmente:** rate limiting, cache curto, locks distribuídos aprovados e fila de jobs.
- **Usos proibidos:** substituir banco transacional ou guardar informação sem estratégia de recuperação.

## ADR-009 — Flyway e roll-forward

- **Status:** aprovado
- **Decisão:** migrations versionadas são imutáveis depois de aplicadas em ambiente compartilhado.
- **Correção:** nova migration de avanço; rollback operacional ocorre por restauração ou migration compensatória ensaiada.

## ADR-010 — Tempo e fuso

- **Status:** aprovado
- **Decisão:** instantes em UTC; unidade guarda IANA timezone, inicialmente `America/Sao_Paulo`.
- **Consequência:** horários recorrentes são gerados no fuso da unidade e convertidos para UTC.

## ADR-011 — Valores monetários

- **Status:** aprovado
- **Decisão:** `BigDecimal` no Java, `numeric(19,2)` no PostgreSQL e arredondamento `HALF_EVEN`, salvo regra fiscal aprovada.
- **Proibição:** `float` ou `double` para dinheiro.

## ADR-012 — Autenticação web

- **Status:** aprovado
- **Decisão:** access token de curta duração e refresh token rotativo, ambos protegidos contra leitura por scripts no fluxo web.
- **Sessão:** refresh token é armazenado somente como hash, associado a dispositivo e revogável.
- **Controle:** cookies `HttpOnly`, `Secure`, `SameSite`; proteção CSRF para autenticação baseada em cookie.

## ADR-013 — Concorrência de agenda

- **Status:** aprovado
- **Decisão:** verificação de disponibilidade em transação e restrição no PostgreSQL impedem sobreposição para o mesmo profissional.
- **Intervalo:** `[startAt, endAt)`, permitindo que um atendimento comece exatamente quando o anterior termina.

## ADR-014 — Observabilidade desde o MVP

- **Status:** aprovado
- **Decisão:** logs estruturados, correlation ID, métricas e health checks entram no MVP.
- **Proibição:** logar senha, token, cartão completo, segredo ou conteúdo sensível sem necessidade.

## ADR-015 — DevOps compartilhado

- **Status:** aprovado
- **Decisão:** a Pessoa 5 mantém a plataforma, mas todos são responsáveis por build, teste, documentação, segurança e operação da própria entrega.

