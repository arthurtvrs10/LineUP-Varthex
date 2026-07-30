# Plano em três níveis

**ID:** DOC-ROAD-001  
**Status:** baseline de escopo  
**Fonte canônica para:** composição e gates das releases

## 1. Regra de leitura

Os níveis são cumulativos: Intermediário inclui o MVP; Final inclui MVP e Intermediário. Este documento referencia os IDs do [catálogo de requisitos](../02-requisitos/01-catalogo-requisitos.md) e não repete suas definições.

Datas comerciais só podem ser prometidas depois de estimativa técnica, disponibilidade da equipe e resolução das pendências que bloqueiam o nível.

## 2. Visão comparativa

| Dimensão | Inicial — MVP vendável | Mediano — operação completa | Final — escala e diferenciação |
|---|---|---|---|
| Objetivo | provar agenda SaaS segura e operável | centralizar gestão, receita e relacionamento | atender redes, ecossistema e inteligência |
| Cliente-alvo | barbearia de uma unidade | operação com caixa, estoque e marketing | rede/marca com múltiplas unidades |
| Núcleo | cadastro, agenda, fila, comissão, resumo, notificações essenciais | caixa, pagamentos, estoque, fidelidade, CRM, integrações e assinatura | multiunidade, automação, API e análises avançadas |
| Operação | 99,5%, RPO 24 h, RTO 8 h | 99,9%, RPO 1 h, RTO 4 h | 99,95%, RPO 15 min, RTO 1 h |
| Saída | piloto pago controlado | produto comercial repetível | plataforma escalável |

## 3. Nível 1 — Inicial (MVP)

### Escopo funcional

| Domínio | IDs incluídos |
|---|---|
| Autenticação | `RF-AUT-001..008` |
| Tenant e usuário | `RF-TEN-001..006`, `RF-USR-001..006` |
| Cliente, profissional e serviço | `RF-CLI-001..007`, `RF-BAR-001..006`, `RF-SER-001..006` |
| Disponibilidade e agenda | `RF-DIS-001..006`, `RF-AGE-001..015` |
| Fila de espera | `RF-FIL-001..005` |
| Comissão e resumo | `RF-COM-001..005`, `RF-REL-001..004` |
| Notificação | `RF-NOT-001..004` |
| Administração SaaS | `RF-ADM-001..003` |

### Entregáveis técnicos

- monólito modular Java/Spring Boot com módulos previstos para o MVP;
- PostgreSQL com Flyway, Redis para sessão/rate limit/cache transitório;
- OpenAPI e cliente TypeScript gerado;
- Next.js responsivo para gestão, barbeiro, cliente e Super Admin;
- pipeline, imagens imutáveis, homologação, produção e observabilidade;
- backup/restauração, runbooks críticos e controles LGPD;
- documentação, treinamento e roteiro de implantação.

### Fora do MVP

Reserva sem conta, caixa, pagamento integrado, estoque, fidelidade, WhatsApp, Google Calendar, assinatura automatizada, campanhas, multiunidade e BI. No MVP, o cliente agenda autenticado ou com apoio da operação. Vendas manuais do SaaS podem ocorrer no piloto, mas não simulam requisitos ausentes.

### Gate de saída

- todos os requisitos MVP aceitos e rastreados;
- zero falha conhecida de isolamento entre tenants;
- fluxos críticos E2E e concorrência de agenda aprovados;
- metas MVP de performance atingidas em carga documentada;
- restauração concluída dentro do RTO;
- pentest ou revisão independente dos fluxos críticos sem achado crítico aberto;
- documentos jurídicos aprovados;
- ao menos três tenants-piloto operando por 30 dias, sem incidente SEV-1 aberto;
- suporte, monitoramento, cobrança e offboarding ensaiados.

## 4. Nível 2 — Mediano

### Escopo incremental

| Domínio | IDs adicionados |
|---|---|
| Identidade e equipe | `RF-AUT-009`, `RF-USR-007..009` |
| Cliente e serviço | `RF-CLI-008..009`, `RF-SER-007` |
| Agenda | `RF-AGE-016..018` |
| Caixa e pagamentos | `RF-CXA-001..006`, `RF-PAG-001..006` |
| Estoque | `RF-EST-001..010` |
| Fidelidade | `RF-FID-001..008` |
| CRM | `RF-CRM-001..006` |
| Notificação | `RF-NOT-005..010` |
| Integrações | `RF-INT-001..005` |
| Assinatura SaaS | `RF-ASS-001..010` |
| Administração | `RF-ADM-004..008` |
| Relatórios | `RF-REL-005..012` |

### Gate de saída

- reconciliação financeira, caixa, estoque, fidelidade e comissão reproduzível;
- webhooks e integrações idempotentes sob repetição e atraso;
- consentimento, opt-out e histórico de comunicação testados;
- assinatura, limite e suspensão compatíveis com o catálogo comercial;
- importação com prévia, erro e rollback lógico;
- SLO/RPO/RTO intermediários ensaiados;
- custo unitário e suporte medidos em base real;
- onboarding repetível sem intervenção de desenvolvimento.

## 5. Nível 3 — Final

### Escopo incremental

| Domínio | IDs adicionados |
|---|---|
| Segurança e papéis | `RF-AUT-010`, `RF-USR-010` |
| Multiunidade | `RF-TEN-007..010`, `RF-SER-008` |
| Qualidade de dados | `RF-CLI-010` |
| Pagamento online | `RF-PAG-007..008` |
| Suprimentos | `RF-EST-011..013` |
| CRM avançado | `RF-CRM-007..010` |
| Plataforma | `RF-INT-006..007` |
| Gestão e inteligência | `RF-REL-013..017` |

### Gate de saída

- autorização por unidade e consolidação testadas em todos os módulos;
- MFA para perfis sensíveis e API pública com escopo/limite/auditoria;
- gateway conciliado e recuperável a webhooks fora de ordem;
- transferências de estoque atômicas e auditáveis;
- métricas preditivas explicam fonte, atualização e confiança;
- teste de escala atende `RNF-PER-*` final;
- exercício de desastre e segurança cumpre metas finais;
- operação suporta o SLA comercial sem dependência de uma única pessoa.

## 6. Regras de promoção

1. Gate funcional sem gate operacional não libera venda.
2. Item parcialmente pronto permanece no nível anterior por feature flag e não entra no material comercial.
3. Requisito pode mudar de nível apenas com análise de dependências e atualização deste arquivo, do catálogo e do contrato.
4. Pendência comercial, jurídica ou de fornecedor pode bloquear release mesmo com código pronto.
5. Métrica de sucesso não substitui critério de aceite; ambas são necessárias.
