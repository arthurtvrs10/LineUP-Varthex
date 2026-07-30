# Checklist de aprovação da baseline

**ID:** DOC-CHK-001  
**Versão avaliada:** `1.0.0`  
**Data de referência:** 2026-07-29

Preencher responsáveis e evidências no sistema de trabalho. Marcar uma caixa sem evidência não aprova o item.

## 1. Produto e negócio — P1

- [ ] Problema, público, proposta de valor e fora de escopo estão aceitos.
- [ ] KPIs têm fórmula, fonte, janela e responsável.
- [ ] Cada requisito possui ID, release, ator e critério observável.
- [ ] Regras cobrem estados, concorrência, tenant e exceções.
- [ ] MVP, Intermediário e Final são cumulativos e comercialmente compreensíveis.
- [ ] Pendências comerciais têm dono, prazo e gate.

## 2. Dados, backend e API — P2

- [ ] `catalogo-dados.csv` representa os mesmos conceitos em Java, SQL, JSON e TypeScript.
- [ ] Entidades, cardinalidades, constraints, índices e histórico foram revisados.
- [ ] Dinheiro, horário, UUID, auditoria e versão seguem as convenções.
- [ ] Isolamento por tenant é aplicado no banco, consulta, cache e job.
- [ ] Módulos não acessam repositories alheios.
- [ ] `openapi.yaml` cobre operações, erros, segurança, paginação e idempotência.
- [ ] Migrations seguem expand/migrate/contract e têm ensaio.

## 3. Frontend, UX e design — P3

- [ ] Cada tela possui ator, permissão, entrada, estado e ação.
- [ ] Loading, vazio, erro, sucesso e acesso negado estão definidos.
- [ ] Reserva, agenda e operação funcionam no breakpoint exigido.
- [ ] Navegação por teclado, foco, rótulo, erro e contraste atendem WCAG 2.2 AA nos fluxos críticos.
- [ ] Cores, tipografia, espaço, raio e sombra vêm de `design-tokens.json`.
- [ ] Componentes reaproveitados do TailAdmin estão inventariados e licenciados.
- [ ] Tipos de API são gerados/validados a partir do OpenAPI.

## 4. Qualidade, segurança e privacidade — P4

- [ ] Matriz liga requisito, regra, entidade, operação, tela e caso de teste.
- [ ] Fluxos críticos cobrem sucesso, falha, concorrência, repetição, tenant e permissão.
- [ ] Threat model e ASVS nível 2 orientam os controles da versão comercial.
- [ ] Segredos, sessões, cookies, rate limits, uploads e logs foram revisados.
- [ ] Inventário, classificação, finalidade, retenção e direitos LGPD têm processo.
- [ ] Carga atende as metas da release em cenário documentado.
- [ ] Achados críticos e altos bloqueadores estão encerrados ou formalmente aceitos.

## 5. DevOps e operação — P5

- [ ] Pipeline bloqueia documentação, build, teste, segurança e imagem inválidos.
- [ ] Ambientes usam artefato imutável e configuração externa.
- [ ] Produção tem TLS, segredo gerenciado, menor privilégio e auditoria.
- [ ] Healthchecks, logs, métricas, traces, painéis e alertas são acionáveis.
- [ ] Backup foi restaurado dentro do RPO/RTO da release.
- [ ] Runbooks críticos foram executados por pessoa diferente da autora.
- [ ] Deploy, rollback, feature flag, incidente, custo e capacidade estão operáveis.

## 6. Comercial, jurídico e implantação — P1/P4/P5

- [ ] Plano, limite, preço, trial, excedente, reajuste e cancelamento foram aprovados.
- [ ] Contrato, termos, privacidade, DPA, suboperadores e retenção passaram por revisão jurídica.
- [ ] SLA prometido cabe na capacidade de suporte e é distinto do SLO.
- [ ] Contas, aprovações, custos e contingências dos fornecedores estão resolvidos.
- [ ] Ficha, migração, treinamento, aceite, go-live e revisão de 7/30 dias foram ensaiados.
- [ ] Exportação, revogação, retenção e exclusão no encerramento foram testadas.

## 7. Validação do pacote

Executar na raiz da documentação:

```bash
node scripts/validate-documentation.mjs
```

- [ ] Manifesto não aponta arquivo ausente.
- [ ] Links relativos, JSON, CSV, IDs e rastreabilidade são válidos.
- [ ] OpenAPI 3.1.1 possui `operationId` único e release por operação.
- [ ] Não existem marcadores temporários proibidos.
- [ ] ZIP foi testado após a criação e contém apenas o pacote esperado.

## 8. Aprovação

| Papel | Nome | Decisão | Data | Evidência/ressalva |
|---|---|---|---|---|
| P1 |  |  |  |  |
| P2 |  |  |  |  |
| P3 |  |  |  |  |
| P4 |  |  |  |  |
| P5 |  |  |  |  |

Decisões válidas: `APROVADO`, `APROVADO COM RESSALVA` ou `REPROVADO`. Ressalva contém risco, compensação, dono e prazo.

