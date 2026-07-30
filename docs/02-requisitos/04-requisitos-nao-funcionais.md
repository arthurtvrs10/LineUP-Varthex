# Requisitos não funcionais

**ID:** DOC-REQ-004  
**Status:** aprovado  
**Fonte canônica para:** metas mensuráveis de qualidade

## 1. Performance e capacidade

| ID | MVP | Intermediário | Final |
|---|---|---|---|
| `RNF-PER-001` Latência p95 leitura | ≤ 500 ms | ≤ 400 ms | ≤ 300 ms |
| `RNF-PER-002` Latência p95 escrita | ≤ 800 ms | ≤ 700 ms | ≤ 500 ms |
| `RNF-PER-003` Criação de agendamento p95 | ≤ 1 s | ≤ 800 ms | ≤ 600 ms |
| `RNF-PER-004` Tenants ativos de referência | 10 | 500 | 5.000 |
| `RNF-PER-005` Agendamentos/mês de referência | 20 mil | 1 milhão | 20 milhões |

Metas valem sob cenário de carga documentado; integrações externas são medidas separadamente.

## 2. Disponibilidade e recuperação

| ID | MVP | Intermediário | Final |
|---|---|---|---|
| `RNF-OPS-001` SLO mensal | 99,5% | 99,9% | 99,95% |
| `RNF-OPS-002` RPO | 24 h | 1 h | 15 min |
| `RNF-OPS-003` RTO | 8 h | 4 h | 1 h |
| `RNF-OPS-004` Teste de restauração | antes do piloto | mensal | mensal + desastre semestral |

Janelas de manutenção planejadas e regras de cálculo do SLO devem constar no contrato comercial antes da venda.

## 3. Segurança

| ID | Exigência |
|---|---|
| `RNF-SEG-001` | Zero acesso cruzado entre tenants nos testes automatizados. |
| `RNF-SEG-002` | TLS em trânsito e criptografia gerenciada em repouso em produção. |
| `RNF-SEG-003` | Senhas com algoritmo resistente, parâmetros revisados e migração de hash. |
| `RNF-SEG-004` | Segredos fora do repositório e rotacionáveis. |
| `RNF-SEG-005` | Auditoria de login, permissão, financeiro, exportação e suporte. |
| `RNF-SEG-006` | Dependências e imagens verificadas no pipeline. |
| `RNF-SEG-007` | Controles orientados pelo OWASP ASVS nível 2 para a versão comercial. |
| `RNF-SEG-008` | Logs não contêm senha, token, segredo ou dados de pagamento completos. |

## 4. Consistência

| ID | Exigência |
|---|---|
| `RNF-DAD-001` | Banco impede sobreposição de agenda em condição concorrente. |
| `RNF-DAD-002` | Movimentos financeiros e de estoque são imutáveis após confirmação. |
| `RNF-DAD-003` | Flyway valida migrations antes de subir aplicação. |
| `RNF-DAD-004` | Dinheiro não usa ponto flutuante. |
| `RNF-DAD-005` | Toda entidade mutável possui versão para concorrência otimista. |
| `RNF-DAD-006` | Integrações e criação crítica usam idempotência. |

## 5. Usabilidade e acessibilidade

| ID | Exigência |
|---|---|
| `RNF-UX-001` | Operações de barbeiro e cliente funcionam a partir de 360 px. |
| `RNF-UX-002` | Gestão completa funciona a partir de 1024 px; tablet a partir de 768 px recebe adaptação. |
| `RNF-UX-003` | Fluxos críticos atingem WCAG 2.2 nível AA. |
| `RNF-UX-004` | Todo formulário possui rótulo, erro associado, foco e navegação por teclado. |
| `RNF-UX-005` | Datas, moeda e idioma seguem pt-BR e fuso da unidade. |
| `RNF-UX-006` | Tela sempre define loading, vazio, erro, sucesso e permissão negada. |

## 6. Compatibilidade

- últimas duas versões estáveis de Chrome, Edge, Firefox e Safari na versão comercial;
- Chrome Android e Safari iOS;
- Java e Node travados por arquivos do projeto;
- PostgreSQL 16 em desenvolvimento, teste e produção;
- nenhum teste de integração usa H2 como substituto sem justificativa.

## 7. Manutenibilidade

| ID | Exigência |
|---|---|
| `RNF-MAN-001` | Módulos possuem API interna explícita e não acessam repositories alheios. |
| `RNF-MAN-002` | Regras críticas possuem testes de unidade e integração. |
| `RNF-MAN-003` | OpenAPI e tipos gerados permanecem consistentes. |
| `RNF-MAN-004` | Alterações passam por pull request e pipeline. |
| `RNF-MAN-005` | Cobertura de linha mínima orientativa de 80% em serviços de domínio; regras críticas exigem todos os cenários. |

## 8. Observabilidade

- correlation ID em requisições e jobs;
- logs estruturados com tenant pseudonimizado quando possível;
- métricas de erro, latência, disponibilidade, fila, pool e banco;
- trilhas para integrações e webhooks;
- alertas acionáveis, com runbook;
- retenção de logs conforme política de privacidade e custo.

