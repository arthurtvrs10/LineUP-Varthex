# CT-DOM-NNN — Título do caso

**Status:** `proposto | automatizado | manual aprovado | bloqueado`  
**Nível:** `unidade | integração | contrato | componente | E2E | carga | segurança | operacional`  
**Release:** `MVP | INTERMEDIARIO | FINAL`  
**Responsável:** `<P1..P5>`  
**Automação:** `<caminho/nome do teste ou justificativa manual>`

## Rastreabilidade

| Tipo | IDs |
|---|---|
| Requisito | `RF-...` |
| Regras | `RN-...` |
| RNFs | `RNF-...` |
| Entidades/campos | `ENT-...`, `field_id` |
| API | `operationId` |
| Tela/permissão | `TEL-...`, `PER-...` |

## Objetivo

Uma frase descrevendo o risco ou comportamento que o teste comprova.

## Pré-condições

- versão e feature flags;
- tenant e perfil;
- relógio/fuso;
- dados mínimos produzidos por fábrica;
- mocks apenas nas fronteiras permitidas.

## Dados

| Dado | Valor/classe | Motivo |
|---|---|---|
| `<campo>` | `<valor sintético>` | `<partição ou limite>` |

## Procedimento

1. Preparar estado observável.
2. Executar uma ação principal.
3. Coletar resposta, persistência, evento e telemetria aplicáveis.

## Resultado esperado

- status/saída exatos;
- estado persistido e ausência de efeito indevido;
- mensagem/erro no contrato;
- auditoria, métrica ou evento;
- comportamento de tenant e permissão.

## Limpeza

Descrever isolamento transacional, descarte do container ou remoção segura da fábrica. Nunca depender de dados pessoais reais.

## Evidência

| Execução | Versão | Ambiente | Resultado | Artefato |
|---|---|---|---|---|
| `<data/hora>` | `<commit/tag>` | `<ambiente>` | `<aprovado/reprovado>` | `<relatório/log sem segredo>` |

## Variações que merecem caso próprio

- limite inferior/superior;
- entrada inválida;
- concorrência e repetição;
- outro tenant;
- perfil sem permissão;
- fornecedor lento, indisponível ou fora de ordem;
- acessibilidade, timezone e dispositivo.

