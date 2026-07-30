# Referências oficiais

**ID:** DOC-REF-001  
**Status:** baseline  
**Fonte canônica para:** fontes externas e justificativa de consulta  
**Data de acesso:** 29 de julho de 2026

## 1. Política de referência

- O `manifest.json` fixa a baseline; uma versão mais nova publicada não atualiza o projeto automaticamente.
- Mudança de versão principal exige compatibilidade validada, ADR e atualização conjunta de código, pipeline e documentação.
- Preferem-se especificações, documentação do mantenedor, legislação e órgãos oficiais.
- Blog, tutorial e resposta comunitária podem ajudar na pesquisa, mas não substituem estas fontes em decisão crítica.
- Segurança e privacidade exigem análise de risco e revisão jurídica; seguir um guia não comprova conformidade por si só.

## 2. Backend, dados e plataforma

| ID | Referência oficial | Uso no projeto |
|---|---|---|
| `REF-JAVA-001` | [Java SE 21 — documentação Oracle](https://docs.oracle.com/en/java/javase/21/) | linguagem, APIs, tipos de data e runtime |
| `REF-MVN-001` | [Apache Maven — guides](https://maven.apache.org/guides/) | build, dependências e ciclo de vida |
| `REF-SPR-001` | [Spring Boot — requisitos de sistema](https://docs.spring.io/spring-boot/system-requirements.html) | compatibilidade da baseline Java/Spring |
| `REF-SPR-002` | [Spring Boot — referência](https://docs.spring.io/spring-boot/reference/) | configuração, actuator, observabilidade e produção |
| `REF-SPR-003` | [Spring Security — referência](https://docs.spring.io/spring-security/reference/index.html) | autenticação, autorização e proteção web |
| `REF-SPR-004` | [Spring Security — arquitetura servlet](https://docs.spring.io/spring-security/reference/servlet/architecture.html) | cadeia de filtros e contexto de segurança |
| `REF-SPR-005` | [Spring Data JPA — referência](https://docs.spring.io/spring-data/jpa/reference/index.html) | persistência e repositories |
| `REF-SPR-006` | [Spring Modulith — referência](https://docs.spring.io/spring-modulith/reference/) | fronteiras e testes do monólito modular |
| `REF-PG-001` | [PostgreSQL 16 — documentação](https://www.postgresql.org/docs/16/) | SQL, tipos, índices, constraints, transações e operação |
| `REF-FLY-001` | [Flyway — migrations](https://documentation.red-gate.com/fd/migrations-271585107.html) | versionamento e execução de schema |
| `REF-RED-001` | [Redis — documentação](https://redis.io/docs/latest/) | sessão, rate limit, cache e coordenação transitória |
| `REF-TC-001` | [Testcontainers — Spring Boot e REST API](https://testcontainers.com/guides/testing-spring-boot-rest-api-using-testcontainers/) | testes com PostgreSQL/Redis reais em containers |
| `REF-DKR-001` | [Docker Compose — documentação](https://docs.docker.com/compose/) | ambiente local e composição de serviços |

## 3. API e frontend

| ID | Referência oficial | Uso no projeto |
|---|---|---|
| `REF-OAS-001` | [OpenAPI Specification](https://spec.openapis.org/oas/) | contrato HTTP; artefato fixado em 3.1.1 |
| `REF-NXT-001` | [Next.js — documentação](https://nextjs.org/docs) | App Router, renderização, cache e segurança do frontend |
| `REF-NODE-001` | [Node.js — calendário e estado das releases](https://nodejs.org/en/about/previous-releases) | runtime LTS suportado do frontend; baseline 24 LTS |
| `REF-RCT-001` | [React — documentação](https://react.dev/) | componentes, estado e renderização |
| `REF-TS-001` | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) | tipagem e contratos do cliente |
| `REF-TW-001` | [Tailwind CSS — theme variables](https://tailwindcss.com/docs/theme) | adaptação dos tokens canônicos |
| `REF-DTCG-001` | [Design Tokens Community Group — format](https://www.designtokens.org/tr/drafts/format/) | estrutura e interoperabilidade dos tokens |
| `REF-TAD-001` | [TailAdmin Free Next.js Dashboard](https://github.com/TailAdmin/free-nextjs-admin-dashboard) | referência visual e componentes permitidos |
| `REF-TAD-002` | [Licença MIT do TailAdmin](https://github.com/TailAdmin/free-nextjs-admin-dashboard/blob/main/LICENSE) | obrigação de manter aviso de licença ao reutilizar código |

TailAdmin é referência, não fonte canônica de UI. Toda reutilização deve ser inventariada, revisada, adaptada ao design system e acompanhada do aviso de licença aplicável.

## 4. Qualidade, segurança e acessibilidade

| ID | Referência oficial | Uso no projeto |
|---|---|---|
| `REF-ASVS-001` | [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/) | catálogo de controles; alvo comercial nível 2 |
| `REF-WCAG-001` | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | critérios de acessibilidade AA |
| `REF-PW-001` | [Playwright — documentação](https://playwright.dev/docs/intro) | testes E2E e navegadores |
| `REF-OTEL-001` | [OpenTelemetry — documentação](https://opentelemetry.io/docs/) | métricas, logs, traces e propagação |
| `REF-OCI-001` | [OCI Image Format Specification](https://github.com/opencontainers/image-spec) | imagens de container interoperáveis |

## 5. Privacidade e legislação brasileira

| ID | Referência oficial | Uso no projeto |
|---|---|---|
| `REF-LGPD-001` | [Lei nº 13.709/2018 — texto compilado](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm) | princípios, agentes, direitos, segurança e incidentes |
| `REF-ANPD-001` | [Autoridade Nacional de Proteção de Dados](https://www.gov.br/anpd/pt-br) | regulamentos, guias e comunicações oficiais |
| `REF-ANPD-002` | [Guia de segurança da informação para agentes de tratamento de pequeno porte](https://www.gov.br/anpd/pt-br/documentos-e-publicacoes/guia-vf.pdf) | referência de medidas organizacionais e técnicas |

A empresa deve confirmar enquadramento, bases legais, retenção, atendimento de titulares, suboperadores e comunicação de incidentes com assessoria jurídica atualizada.

## 6. Integrações

| ID | Referência oficial | Uso no projeto |
|---|---|---|
| `REF-GCAL-001` | [Google Calendar API — overview](https://developers.google.com/workspace/calendar/api/guides/overview) | sincronização de eventos |
| `REF-GOAU-001` | [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) | consentimento e gestão de tokens |
| `REF-GREV-001` | [Google Business Profile — link ou QR code para avaliações](https://support.google.com/business/answer/16816815) | solicitação de avaliação |
| `REF-WABA-001` | [WhatsApp Cloud API — overview](https://developers.facebook.com/docs/whatsapp/cloud-api/overview) | mensagens, templates e webhooks |

Termos, preços, limites e políticas de fornecedores mudam independentemente do software. P1 e P5 devem revisá-los antes de proposta, implantação e renovação.

## 7. Registro de consulta no trabalho

Uma decisão técnica baseada em fonte externa registra o `REF-*` no ADR, código ou PR aplicável. Não copiar texto extenso: resumir a implicação, apontar a seção consultada e guardar data.
