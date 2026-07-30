# Ambientes e operação

**ID:** DOC-OPS-002  
**Status:** baseline  
**Fonte canônica para:** ambientes, configuração, deploy, continuidade e resposta operacional

## 1. Matriz de ambientes

| Ambiente | Uso | Dados | Acesso | Implantação | Retenção |
|---|---|---|---|---|---|
| Local | desenvolvimento individual | fábrica sintética | desenvolvedor | Docker Compose | descartável |
| Teste efêmero | CI por mudança | fábrica sintética | pipeline | automática | duração do job |
| Desenvolvimento | integração contínua | sintético | equipe | automática após `main` | curta |
| Homologação | aceite e ensaio de release | sintético representativo | equipe + homologadores | versão candidata | conforme ciclo |
| Produção | operação contratada | real | mínimo privilégio | tag aprovada | política vigente |

Dados pessoais de produção não são copiados para ambientes inferiores. Quando um caso só puder ser reproduzido com formato real, usa-se amostra minimizada e anonimizada com autorização registrada.

## 2. Paridade e configuração

- Backend, frontend, worker e migrations são as mesmas imagens entre homologação e produção.
- Diferenças ficam em configuração externa, segredos e escala.
- PostgreSQL mantém a mesma versão principal em todos os testes relevantes.
- H2 não substitui PostgreSQL nos testes de integração.
- Relógio e armazenamento usam UTC; unidade define fuso de negócio.
- Infraestrutura compartilhável é declarada como código e revisada.

### Grupos de configuração

| Grupo | Exemplos | Fonte |
|---|---|---|
| Aplicação | perfil, URL pública, limites | configuração versionada |
| Banco | host, porta, schema, pool | segredo/recurso gerenciado |
| Redis | endpoint, TLS, timeout | segredo/recurso gerenciado |
| Segurança | chaves de assinatura, pepper, CORS | gerenciador de segredos |
| E-mail/WhatsApp | credenciais, remetente, templates | gerenciador + console do provedor |
| OAuth | client ID, secret, redirect URIs | gerenciador + provedor |
| Observabilidade | endpoint, sampling, ambiente | configuração/segredo |
| Feature flags | chave, regra, vigência | serviço/configuração auditada |

Variáveis concretas pertencem aos repositórios de software e devem apontar para estes grupos; este documento não duplica nomes que dependem do provedor.

## 3. Domínios, rede e armazenamento

| Superfície | Exemplo lógico | Política |
|---|---|---|
| Aplicação | `app.<dominio>` | autenticação e gestão |
| Reserva pública | `agendar.<dominio>` | proteção contra abuso e cache seletivo |
| API | `api.<dominio>` | TLS, rate limit e CORS restrito |
| Administração SaaS | `admin.<dominio>` | MFA externo/edge desde o MVP; MFA nativo na Final; acesso reforçado |
| Status | `status.<dominio>` | independente do plano de dados quando possível |

- Banco e Redis não ficam publicamente acessíveis.
- Uploads usam armazenamento de objeto privado e URLs temporárias.
- Arquivos têm validação de tipo real, tamanho, malware quando aplicável e nome aleatório.
- CDN nunca armazena resposta privada sem chave adequada de cache.

## 4. Health checks

| Check | Responde quando | Não deve depender de |
|---|---|---|
| Liveness | processo consegue continuar | fornecedores externos |
| Readiness | aplicação aceita tráfego e dependências essenciais respondem | integrações opcionais |
| Startup | inicialização e migrations terminaram | tráfego público |
| Smoke de negócio | tenant sintético conclui fluxo seguro | dados de cliente real |

Falha de readiness remove a instância do tráfego; falha isolada de WhatsApp ou e-mail degrada o canal e usa reprocessamento, sem derrubar o núcleo.

## 5. Backup e recuperação

As metas são as de `RNF-OPS-002`, `RNF-OPS-003` e `RNF-OPS-004`.

| Nível | Estratégia mínima |
|---|---|
| MVP | backup diário automatizado, retenção definida pelo provedor, restauração antes do piloto |
| Intermediário | backup contínuo ou incremental para RPO de 1 h, restauração mensal |
| Final | recuperação point-in-time para RPO de 15 min, cópia segregada e exercício de desastre semestral |

Cada teste de restauração registra versão, ponto restaurado, duração, integridade, lacunas e ações. Backup sem teste de restauração não é evidência de continuidade.

## 6. Runbooks obrigatórios

| ID | Runbook | Acionamento |
|---|---|---|
| `RB-OPS-001` | Implantar e verificar release | toda produção |
| `RB-OPS-002` | Reverter aplicação | regressão após release |
| `RB-OPS-003` | Restaurar PostgreSQL | perda/corrupção |
| `RB-OPS-004` | Rotacionar segredo | ciclo ou comprometimento |
| `RB-OPS-005` | Banco indisponível/lento | alerta de conexão ou latência |
| `RB-OPS-006` | Redis indisponível | falha de cache/rate limit/job |
| `RB-OPS-007` | Fila ou job atrasado | backlog acima do limiar |
| `RB-OPS-008` | Provedor externo degradado | taxa de falha do canal |
| `RB-OPS-009` | Suspeita de acesso entre tenants | qualquer evidência |
| `RB-OPS-010` | Vazamento de credencial/dado | detecção ou denúncia |
| `RB-OPS-011` | Saturação/capacidade | uso sustentado acima do limite |
| `RB-OPS-012` | Exportação e encerramento de tenant | solicitação aprovada |

Cada runbook contém pré-condições, comandos seguros, validações, escalonamento, rollback, comunicação e evidências. Comandos destrutivos nunca usam alvo implícito.

## 7. Classificação de incidentes

| Severidade | Critério | Resposta inicial | Comunicação |
|---|---|---:|---|
| SEV-1 | indisponibilidade ampla, possível vazamento ou acesso cruzado | 15 min | contínua até contenção |
| SEV-2 | função crítica degradada, muitos tenants afetados | 30 min | a cada 60 min |
| SEV-3 | impacto limitado com alternativa | 4 h úteis | no chamado/status |
| SEV-4 | baixo impacto ou dúvida | 1 dia útil | fluxo normal |

O responsável pelo incidente coordena; outra pessoa executa; uma terceira registra e comunica quando houver capacidade. Após SEV-1/2, realizar post-mortem sem culpabilização em até cinco dias úteis, com linha do tempo, causa sistêmica, impacto, detecção e ações com dono e prazo.

## 8. Escalonamento e plantão

No piloto, P5 é primeiro contato técnico e mantém substituto definido por release. Antes de comprometer atendimento 24×7, a empresa deve contratar capacidade humana e ferramenta compatíveis; o documento comercial não promete cobertura não operacionalizada.

| Área | Primário | Secundário |
|---|---|---|
| Produto/comunicação | P1 | P4 |
| Backend/dados | P2 | P5 |
| Frontend | P3 | P2 |
| Qualidade/segurança | P4 | P2 |
| Plataforma/produção | P5 | P2 |

## 9. Checklist de deploy

Antes:

- versão, changelog, riscos e aprovadores identificados;
- pipeline verde e artefato assinado/identificado;
- migration revisada e tempo ensaiado;
- backup/rollback/feature flag confirmados;
- suporte e status avisados quando necessário.

Depois:

- versão e migration conferidas;
- smoke técnico e de negócio aprovados;
- erro, latência, fila e métricas de agenda observados;
- logs sem anomalia ou dado sensível;
- release registrada e flag graduada.

## 10. Gestão de capacidade e custo

- Definir baseline por nível com carga reprodutível.
- Alertar uso sustentado antes de esgotamento.
- Acompanhar custo por tenant, agendamento, mensagem e armazenamento.
- Tratar crescimento com medição: índices, cache, filas, réplicas e escala horizontal, nesta ordem conforme gargalo.
- Revisar mensalmente recursos ociosos, retenção e custo de fornecedores.
