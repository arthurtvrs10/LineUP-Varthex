# Modelo de requisito funcional

Use este modelo somente para adicionar ou alterar uma linha na fonte canônica `02-requisitos/01-catalogo-requisitos.md`. Detalhamento que pertence a regra, campo, API, tela ou teste deve ser registrado na respectiva fonte, não copiado aqui.

## Identificação

| Campo | Preenchimento |
|---|---|
| ID | `RF-<DOMÍNIO>-<NNN>` |
| Título | `<ação observável em linguagem de negócio>` |
| Release | `MVP`, `INTERMEDIARIO` ou `FINAL` |
| Status | `proposto`, `aprovado`, `em implementação`, `entregue` ou `descontinuado` |
| Ator | `<papel que inicia ou recebe valor>` |
| Responsável | `P1..P5` |
| Origem | `<discovery, contrato, risco, incidente ou métrica>` |

## Declaração

**Como** `<ator>`  
**Quero** `<capacidade>`  
**Para** `<resultado de negócio>`

## Critério de aceite

Escreva resultado verificável, sem prescrever camada:

- Dado `<contexto>`, quando `<ação>`, então `<resultado>`.
- Dado `<cenário inválido ou concorrente>`, quando `<ação>`, então `<proteção/erro>`.
- Dado `<perfil sem acesso>`, quando `<tentativa>`, então `<negação sem vazamento>`.

## Rastreabilidade

| Relação | IDs |
|---|---|
| Regras | `RN-...` |
| RNFs | `RNF-...` |
| Entidades | `ENT-...` |
| Operações API | `operationId` do OpenAPI |
| Telas | `TEL-...` |
| Permissões | `PER-...` |
| Casos de teste | `CT-...` |
| Métricas/eventos | `<nome estável>` |

## Impacto da mudança

- valor e KPI afetado;
- dados e migração;
- contrato e compatibilidade;
- interface e acessibilidade;
- segurança, privacidade e abuso;
- operação, custo e suporte;
- dependências externas;
- rollout, flag e rollback.

## Checklist

- [ ] Não duplica requisito existente.
- [ ] Usa termo do glossário e domínio correto.
- [ ] Release respeita dependências.
- [ ] Critérios cobrem sucesso, falha, permissão e tenant.
- [ ] Fontes canônicas afetadas serão alteradas no mesmo PR.
- [ ] Rastreabilidade e testes foram atualizados.

