# Equipe de cinco pessoas

**ID:** DOC-ROAD-002  
**Status:** baseline organizacional  
**Fonte canônica para:** papéis, responsabilidades e revisão

## 1. Modelo

Cinco pessoas formam uma equipe multifuncional. Os códigos P1–P5 representam papéis, não senioridade nem nomes; devem ser associados a pessoas reais no início de cada ciclo. Todos desenvolvem documentação, revisão e operação dentro da sua especialidade.

| Papel | Missão | Responsabilidades principais |
|---|---|---|
| **P1 — Produto, negócio e documentação** | garantir que o produto resolva o problema vendável | discovery, requisitos, regras, roadmap, priorização, implantação, material comercial, aceite e governança documental |
| **P2 — Backend, dados e API** | preservar domínio, consistência e contratos | Spring Boot, módulos, PostgreSQL, Flyway, Redis, OpenAPI, integrações, concorrência e performance do servidor |
| **P3 — Frontend, UX e design system** | transformar contratos em experiência coerente | Next.js, acessibilidade, fluxos, responsividade, estados, design tokens, geração de cliente e telemetria de interface |
| **P4 — Qualidade, segurança e privacidade** | fornecer evidência independente de qualidade e risco | estratégia de testes, automação, rastreabilidade, ASVS, LGPD, threat modeling, carga, aceite e triagem de defeitos |
| **P5 — DevOps, plataforma e confiabilidade** | tornar a entrega repetível e operável | CI/CD, containers, ambientes, segredos, observabilidade, backup, restauração, incidentes, custos e capacidade |

## 2. Responsabilidade por documentação

| Conjunto documental | Autor primário | Revisores obrigatórios |
|---|---|---|
| Governança, visão, negócio e requisitos | P1 | P2, P3, P4 |
| Dados, backend e API | P2 | P4, P5; P3 para contratos |
| Frontend, fluxos e design system | P3 | P1, P4; P2 para contratos |
| Segurança, privacidade e testes | P4 | P2, P3, P5 |
| DevOps, ambientes e operação | P5 | P2, P4 |
| Comercial, implantação e suporte | P1 | P4, P5 |
| Roadmap e backlog | P1 | P2, P3, P4, P5 |

Mudança em fonte canônica exige revisão dos consumidores: campo por P2/P3/P4; endpoint por P2/P3/P4; token por P3/P4; SLO por P1/P4/P5.

## 3. RACI das decisões

Legenda: **R** executa; **A** responde pela decisão; **C** consultado; **I** informado.

| Decisão/atividade | P1 | P2 | P3 | P4 | P5 |
|---|---|---|---|---|---|
| Prioridade e corte de release | A/R | C | C | C | C |
| Regra de negócio | A/R | C | C | C | I |
| Modelo de dados | C | A/R | I | C | C |
| Contrato OpenAPI | I | A/R | R | C | I |
| Arquitetura backend | C | A/R | I | C | C |
| Arquitetura frontend/design | C | C | A/R | C | I |
| Acessibilidade | C | R | R | A | I |
| Segurança e privacidade | C | R | C | A/R | R |
| Estratégia e aceite de testes | C | R | R | A/R | C |
| Pipeline e infraestrutura | I | C | C | C | A/R |
| Release de produção | A | C | I | C | R |
| Resposta a incidente | I | R | C | C | A/R |
| Implantação e suporte | A/R | C | C | C | R |
| Promessa comercial | A/R | C | C | C | C |

Nenhuma pessoa aprova o próprio trabalho isoladamente. P1 e P5 aprovam promoção de produção; P4 pode bloquear por falha crítica de segurança, isolamento, dados ou aceite.

## 4. Participação por fase

### Sprint 0 — adaptação e fechamento documental

| Pessoa | Entrega |
|---|---|
| P1 | valida visão, personas, requisitos, níveis, KPIs e pendências comerciais |
| P2 | valida catálogo de dados, ERD, regras, módulos e OpenAPI |
| P3 | valida telas, fluxos, tokens, componentes e mapeamento TypeScript |
| P4 | valida rastreabilidade, ameaças, LGPD, testes e critérios de aceite |
| P5 | valida pipeline, ambientes, SLO, backup, runbooks e custo |

Saída: baseline versionada, validador verde e decisões bloqueadoras resolvidas ou formalmente atribuídas.

### Construção

- P2 e P3 implementam em fatias verticais, sem esperar uma camada inteira terminar.
- P4 automatiza critérios junto da história e revisa casos negativos.
- P5 evolui pipeline e ambientes antes de cada dependência operacional.
- P1 homologa incrementos, testa linguagem com usuários e impede expansão silenciosa de escopo.

### Release e operação

- P5 conduz checklist e implantação.
- P2 acompanha banco, servidor e integrações.
- P3 acompanha erros e jornada no cliente.
- P4 executa smoke/aceite e monitora risco.
- P1 comunica, decide go/no-go e acompanha adoção.

## 5. Distribuição de capacidade

Referência inicial, ajustada por sprint:

| Categoria | Capacidade da equipe |
|---|---:|
| Funcionalidades planejadas | 60% |
| Testes, segurança e qualidade | 15% |
| DevOps, confiabilidade e dívida técnica | 15% |
| Documentação, discovery e suporte | 10% |

Não alocar 100%: incidentes, revisão e aprendizagem consomem capacidade real. Pessoa com especialidade não vira gargalo; cada área crítica mantém pelo menos um secundário treinado.

## 6. Handoffs obrigatórios

| Origem → destino | Pacote de handoff |
|---|---|
| P1 → equipe | ID, valor, ator, regra, aceite, release e risco |
| P2 → P3 | OpenAPI validado, exemplos, erro, paginação e permissão |
| P3 → P4 | fluxo, estados, seletores estáveis e critérios de acessibilidade |
| P2 → P4 | fábrica de dados, contratos, eventos e invariantes |
| P2/P3 → P5 | healthcheck, configuração, recursos, migration e telemetria |
| P5 → suporte/P1 | versão, alteração, risco, runbook e painel |

Handoff não é entrega “por cima do muro”: quem produz permanece disponível até a validação.

## 7. Conhecimento e continuidade

- pareamento semanal entre primário e secundário;
- rotação de revisão entre módulos;
- demo gravada ou roteiro reproduzível para fluxo novo;
- runbooks exercitados por pessoa que não os escreveu;
- férias/ausência exigem handoff de incidentes, segredos e releases;
- nenhuma credencial, conta de fornecedor ou decisão reside apenas com uma pessoa.

