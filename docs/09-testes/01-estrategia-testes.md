# Estratégia de testes e qualidade

**ID:** DOC-QA-001  
**Status:** aprovado  
**Fonte canônica para:** níveis de teste, casos críticos e gates

## 1. Princípio

Teste começa com requisito e regra, não depois do código. Cobertura numérica é um indicador; o critério real é cobrir estados, limites, falhas, autorização e concorrência.

A `matriz-rastreabilidade.csv` possui uma linha para cada requisito. Todo requisito recebe um caso-base determinístico `CT-<DOMÍNIO>-RF<NNN>`, que verifica exatamente seu critério de aceite e as regras referenciadas sem copiá-los. Casos `CT-<DOMÍNIO>-<NNN>` desta estratégia acrescentam riscos críticos, concorrência ou operação. Campo de operação API vazio é permitido somente para controle transversal sem endpoint próprio, como isolamento por tenant.

## 2. Pirâmide

| Nível | Objetivo | Ferramenta prevista |
|---|---|---|
| Unidade | Regra e cálculo puro | JUnit |
| Componente/módulo | Service, eventos e limites | Spring Boot Test / Spring Modulith |
| Repository | SQL, constraints e migration | Testcontainers PostgreSQL |
| Contrato | OpenAPI e serialização | Validador de contrato |
| Integração externa | Adapter, timeout e webhook | MockServer/fake |
| Frontend | Componente e acessibilidade | Ferramenta definida no frontend |
| E2E | Jornada do usuário | Playwright |
| Carga | SLO e concorrência | Ferramenta aprovada |
| Recuperação | Backup, restore e rollback | Runbook automatizado |

## 3. Ambientes e dados

- teste automatizado cria dados próprios;
- IDs previsíveis apenas em fixtures;
- PostgreSQL real, não H2, para integração;
- relógio injetável para regras de tempo;
- fornecedor simulado com falhas;
- dados pessoais reais não entram em teste;
- tenant A e tenant B existem em toda suíte de segurança;
- limpeza não depende de ordem de testes.

## 4. Casos críticos MVP

| ID | Cenário | Resultado |
|---|---|---|
| `CT-AUT-001` | Login válido | Sessão segura e contexto correto |
| `CT-AUT-002` | Credencial inválida repetida | Erro genérico e rate limit |
| `CT-AUT-003` | Reuso de refresh rotacionado | Família revogada |
| `CT-TEN-001` | Usuário do tenant A consulta ID do B | 404/403 sem vazamento |
| `CT-TEN-002` | FK do tenant A aponta para B | Operação rejeitada |
| `CT-CLI-001` | Cliente com contato duplicado | Alerta, sem união automática |
| `CT-SER-001` | Alterar preço após reserva | Snapshot antigo preservado |
| `CT-DIS-001` | Slot atravessa pausa | Não oferecido |
| `CT-AGE-001` | Dois requests concorrentes no mesmo slot | Exatamente um sucesso |
| `CT-AGE-002` | Atendimento termina quando outro começa | Ambos válidos |
| `CT-AGE-003` | Transição inválida de status | 409, estado preservado |
| `CT-AGE-004` | Reagendamento conflitante | 409 e horário anterior preservado |
| `CT-AGE-005` | Recorrência com conflito parcial | Instâncias válidas e relatório dos conflitos |
| `CT-AGE-006` | Cancelamento | Histórico, motivo e evento criados |
| `CT-FIL-001` | Duas aceitações da mesma oferta | Uma reserva, outra expirada/conflito |
| `CT-COM-001` | Comissão percentual com desconto | Fórmula `RN-COM-002/003` |
| `CT-COM-002` | Ajuste manual | Novo lançamento auditado |
| `CT-NOT-001` | Retry de e-mail temporário | Uma entrega final, sem duplicidade |
| `CT-OPS-001` | Backup do MVP | Restauração em ambiente limpo |

## 5. Casos críticos intermediários

| ID | Cenário | Resultado |
|---|---|---|
| `CT-CXA-001` | Segundo caixa no mesmo escopo | Rejeitado |
| `CT-CXA-002` | Fechamento com diferença | Valores congelados e auditados |
| `CT-PAG-001` | Pagamento dividido | Soma exata e movimentos correlatos |
| `CT-PAG-002` | Webhook repetido | Um pagamento confirmado |
| `CT-PAG-003` | Reembolso parcial | Estado e reversões proporcionais |
| `CT-EST-001` | Movimento causaria saldo negativo | Rejeitado por padrão |
| `CT-EST-002` | Inventário com diferença | Movimento de ajuste |
| `CT-FID-001` | Reembolso após crédito | Pontos revertidos |
| `CT-NOT-002` | Template rejeitado | Falha final visível |
| `CT-INT-001` | OAuth state divergente | Fluxo bloqueado |
| `CT-INT-002` | Token Google expirado | Renovação ou estado expirado |
| `CT-ASS-001` | Limite de dispositivos | Sessão excedente bloqueada |
| `CT-ASS-002` | Inadimplência com tolerância | Estados e direitos corretos |

## 6. Casos críticos finais

| ID | Cenário | Resultado |
|---|---|---|
| `CT-UNT-001` | Gestor restrito tenta outra unidade | Acesso negado |
| `CT-EST-003` | Transferência entre unidades | Saída e entrada correlacionadas |
| `CT-API-001` | Chave sem escopo | 403 e auditoria |
| `CT-WEB-001` | Webhook externo falha repetidamente | Backoff e desativação controlada |
| `CT-CRM-001` | Cliente opt-out entra no segmento | Envio bloqueado |
| `CT-OPS-002` | Perda simulada de região/serviço | RTO e RPO medidos |

## 7. Testes de frontend

Para cada tela:

- renderização;
- loading;
- vazio;
- erro;
- sem permissão;
- formulário válido e inválido;
- teclado;
- foco;
- zoom;
- mobile;
- conflito 409;
- sessão expirada;
- dados longos e acentos.

## 8. Gates

### Pull request

- build;
- lint;
- typecheck;
- unidade;
- integração afetada;
- OpenAPI válido;
- migration válida;
- docs válidas;
- dependências verificadas.

### Homologação

- E2E crítico;
- isolamento;
- smoke;
- acessibilidade;
- evidência;
- Product Owner.

### Produção

- backup;
- migration ensaiada;
- rollback;
- observabilidade;
- aprovação;
- smoke pós-deploy.

## 9. Severidade

| Severidade | Exemplo | Release |
|---|---|---|
| S0 | Vazamento, perda, cobrança indevida ampla | Bloqueada/rollback |
| S1 | Agenda ou pagamento indisponível sem contorno | Bloqueada |
| S2 | Função importante com contorno | Decisão formal |
| S3 | Defeito menor visual/textual | Pode seguir priorizado |

## 10. Homologação real

Antes de clientes pagantes:

- pelo menos três barbearias piloto;
- cenários de agenda real;
- comissões comparadas manualmente;
- caixa comparado a fechamento manual;
- backup e exportação;
- uso em celular e desktop;
- acentos, nomes longos e horários extremos;
- feedback registrado como requisito ou decisão.
