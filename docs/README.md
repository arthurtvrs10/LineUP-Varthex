# Varthex Barber — Documentação de Produto e Engenharia

**Versão documental:** 1.0.0  
**Data-base:** 29/07/2026  
**Status:** baseline aprovada para detalhamento e implementação  
**Produto:** SaaS comercial de gestão de barbearias  
**Responsável pela aprovação de negócio:** Product Owner da Varthex

## 1. Finalidade

Este pacote é a fonte oficial para planejar, construir, testar, implantar, operar e comercializar o Varthex Barber. Ele substitui documentos anteriores que misturavam escopo, código, infraestrutura e material de estudo.

O conteúdo foi dividido por responsabilidade, mas conectado por identificadores estáveis. Uma definição existe em um único lugar e os demais documentos apenas a referenciam.

## 2. Decisões técnicas de base

As versões abaixo formam a baseline desta documentação. Atualizações exigem um ADR e validação de compatibilidade.

| Camada | Decisão |
|---|---|
| Backend | Java 21, Spring Boot 4.1.x e Maven |
| Arquitetura | Monólito modular organizado por domínio |
| Segurança | Spring Security, RBAC e isolamento multi-tenant |
| Persistência | PostgreSQL 16 e Spring Data JPA |
| Migrations | Flyway; migrations aplicadas nunca são reescritas |
| Cache e jobs | Redis 7.x apenas para dados efêmeros, locks e filas aprovadas |
| API | REST JSON contratada por OpenAPI 3.1 |
| Frontend | Next.js 16 App Router, React 19, TypeScript e Tailwind CSS 4 |
| Runtime frontend | Node.js 24 LTS |
| Base visual | TailAdmin adaptado ao design system do Varthex |
| Testes | JUnit, Spring Boot Test, Testcontainers e Playwright |
| Execução local | Docker e Docker Compose |
| Entrega | GitHub Flow, CI/CD, homologação e promoção controlada |

O arquivo [`manifest.json`](manifest.json) é a representação legível por máquina dessa baseline.

## 3. Fontes únicas de verdade

| Informação | Fonte canônica |
|---|---|
| Funcionalidades e versão-alvo | [`02-requisitos/01-catalogo-requisitos.md`](02-requisitos/01-catalogo-requisitos.md) |
| Regras de negócio | [`02-requisitos/02-regras-negocio.md`](02-requisitos/02-regras-negocio.md) |
| Perfis e permissões | [`02-requisitos/03-perfis-permissoes.md`](02-requisitos/03-perfis-permissoes.md) |
| Metas de qualidade | [`02-requisitos/04-requisitos-nao-funcionais.md`](02-requisitos/04-requisitos-nao-funcionais.md) |
| Entidades | [`03-dominio-dados/01-catalogo-entidades.md`](03-dominio-dados/01-catalogo-entidades.md) |
| Campos Java, SQL, JSON e TypeScript | [`03-dominio-dados/catalogo-dados.csv`](03-dominio-dados/catalogo-dados.csv) |
| Relacionamentos | [`03-dominio-dados/03-modelo-dados.md`](03-dominio-dados/03-modelo-dados.md) |
| Contrato HTTP | [`05-api-integracoes/openapi.yaml`](05-api-integracoes/openapi.yaml) |
| Telas e fluxos | [`06-frontend-ux/02-catalogo-telas-fluxos.md`](06-frontend-ux/02-catalogo-telas-fluxos.md) |
| Valores visuais | [`07-design-system/design-tokens.json`](07-design-system/design-tokens.json) |
| Componentes | [`07-design-system/01-design-system.md`](07-design-system/01-design-system.md) |
| Casos de teste | [`09-testes/01-estrategia-testes.md`](09-testes/01-estrategia-testes.md) |
| Rastreabilidade | [`09-testes/matriz-rastreabilidade.csv`](09-testes/matriz-rastreabilidade.csv) |
| Releases | [`12-roadmap/01-plano-tres-niveis.md`](12-roadmap/01-plano-tres-niveis.md) |
| Responsabilidades | [`12-roadmap/02-equipe-cinco-pessoas.md`](12-roadmap/02-equipe-cinco-pessoas.md) |
| Fontes externas | [`13-referencias/01-referencias-oficiais.md`](13-referencias/01-referencias-oficiais.md) |

## 4. Releases cumulativas

| Release | Objetivo | Condição de saída |
|---|---|---|
| `MVP` | Operação central e piloto controlado | Agenda segura, isolamento, comissão básica, backup e testes críticos |
| `INTERMEDIARIO` | Versão comercial para clientes pagantes | Caixa, estoque, fidelidade, integrações, assinatura e operação assistida |
| `FINAL` | Plataforma completa e escalável | Multiunidade, CRM avançado, integrações públicas, escala e recuperação de desastre |

Não existem três cópias dos requisitos. Cada requisito, campo, endpoint, tela e teste possui a coluna `release`.

## 5. Ordem recomendada de leitura

1. [`00-governanca/01-mapa-documentacao.md`](00-governanca/01-mapa-documentacao.md)
2. [`01-produto-negocio/01-visao-produto.md`](01-produto-negocio/01-visao-produto.md)
3. [`12-roadmap/01-plano-tres-niveis.md`](12-roadmap/01-plano-tres-niveis.md)
4. [`02-requisitos/01-catalogo-requisitos.md`](02-requisitos/01-catalogo-requisitos.md)
5. [`02-requisitos/02-regras-negocio.md`](02-requisitos/02-regras-negocio.md)
6. [`03-dominio-dados/01-catalogo-entidades.md`](03-dominio-dados/01-catalogo-entidades.md)
7. [`04-arquitetura-backend/01-arquitetura-sistema.md`](04-arquitetura-backend/01-arquitetura-sistema.md)
8. [`05-api-integracoes/01-padroes-api.md`](05-api-integracoes/01-padroes-api.md)
9. [`06-frontend-ux/01-arquitetura-nextjs.md`](06-frontend-ux/01-arquitetura-nextjs.md)
10. [`07-design-system/01-design-system.md`](07-design-system/01-design-system.md)
11. Segurança, testes, DevOps e operação.

## 6. Regra para implementação

Uma tarefa só pode entrar em desenvolvimento quando possuir:

- requisito identificado;
- regra de negócio aplicável;
- release;
- critérios de aceite;
- entidades e campos mapeados;
- permissão;
- contrato de API, quando aplicável;
- tela ou consumidor identificado;
- casos de teste;
- responsável e revisor.

Qualquer alteração em um campo deve verificar, no mesmo pull request:

1. catálogo de dados;
2. modelo de dados;
3. migration Flyway;
4. Entity e DTO Java;
5. OpenAPI;
6. tipo TypeScript gerado;
7. formulário ou tela;
8. testes;
9. observabilidade e auditoria, quando aplicáveis.

## 7. Validação do pacote

Execute a partir desta pasta:

```bash
node scripts/validate-documentation.mjs
```

O validador confere arquivos obrigatórios, JSON, unicidade e nomenclatura dos campos canônicos, releases de entidades, IDs, referências locais, rastreabilidade completa e elementos mínimos do OpenAPI. A especificação OpenAPI também deve passar em um linter compatível com 3.1.1 no pipeline.

## 8. Limites deste pacote

- Este pacote é uma especificação; não contém o código do produto.
- Valores comerciais permanecem configuráveis e não devem ser gravados no código.
- Gateway de pagamento, provedor de WhatsApp e hospedagem são decisões de contratação registradas em pendências.
- Textos jurídicos finais precisam de revisão profissional antes da venda.
- A palavra “final” identifica a visão completa planejada, não o fim da evolução do produto.
