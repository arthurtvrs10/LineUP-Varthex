# Design system Varthex Barber

**ID:** DOC-DS-001  
**Status:** baseline aprovada  
**Fonte canônica de valores:** [`design-tokens.json`](design-tokens.json)

## 1. Objetivo

Criar uma interface profissional, legível e eficiente para operação intensa. TailAdmin é ponto de partida; o Varthex define tokens, componentes, estados e acessibilidade.

## 2. Regras

- não escrever hexadecimal fora do arquivo de tokens;
- não criar espaçamento arbitrário quando existir token;
- não duplicar componente por tela;
- variante nova exige caso real;
- estados precisam de texto/ícone, não apenas cor;
- foco é sempre visível;
- área de toque mínima segue `size.touchTarget`;
- contraste normal atende WCAG AA;
- animação respeita redução de movimento.

## 3. Hierarquia

- `display`: marketing e onboarding;
- `h1`: título da página;
- `h2`: seção;
- `h3`: card ou grupo;
- `body`: conteúdo;
- `label`: campo e controle;
- `caption`: metadado.

Texto operacional usa fonte sans. Mono é reservado para IDs, logs e valores técnicos.

## 4. Componentes canônicos

| ID | Componente | Variantes | Estados obrigatórios |
|---|---|---|---|
| `CMP-BUTTON` | Botão | primary, secondary, ghost, danger | default, hover, focus, disabled, loading |
| `CMP-INPUT` | Entrada | text, search, money, phone | default, focus, error, disabled, readonly |
| `CMP-SELECT` | Seleção | single, multi | vazio, busca, erro, disabled |
| `CMP-DATE-TIME` | Data/hora | date, time, range | inválido, indisponível, timezone |
| `CMP-DATA-TABLE` | Tabela | compact, regular | loading, vazio, erro, seleção |
| `CMP-CARD` | Card | metric, content, action | loading, warning |
| `CMP-BADGE` | Estado | neutral, success, warning, danger, info | rótulo textual |
| `CMP-MODAL` | Modal | default, destructive, full-screen-mobile | foco preso, fechar, loading |
| `CMP-DRAWER` | Painel lateral | right, bottom-mobile | foco e retorno |
| `CMP-TOAST` | Feedback | success, error, warning, info | tempo adequado, ação |
| `CMP-EMPTY` | Estado vazio | first-use, filtered, permission | título, orientação, ação |
| `CMP-SKELETON` | Carregamento | text, card, table | sem simular dado real |
| `CMP-CALENDAR` | Agenda | day, week, month | conflito, bloqueio, atual, seleção |
| `CMP-MONEY` | Valor | positive, negative, neutral | sinal e moeda |
| `CMP-CONFIRM` | Confirmação | regular, high-risk | resumo e consequência |

## 5. Botões

- uma ação primária por região;
- ações destrutivas não usam cor primária;
- texto começa com verbo;
- loading mantém largura e bloqueia repetição;
- ícone sem texto somente quando significado é universal e possui nome acessível.

## 6. Formulários

Estrutura:

1. label;
2. indicador de obrigatoriedade quando útil;
3. controle;
4. ajuda;
5. mensagem de erro;
6. contador para limite longo.

Placeholder não substitui label. Mensagem de erro explica correção.

## 7. Agenda

- eixo de tempo legível;
- profissional identificado por nome e avatar opcional;
- status com badge e padrão visual;
- bloqueio distinguível de agendamento;
- hora atual marcada;
- conflito nunca resolvido apenas por sobreposição visual;
- celular usa lista/dia antes de grade semanal;
- arrastar e soltar exige confirmação e alternativa por teclado/formulário.

## 8. Tabelas

- cabeçalho fixo em listas longas;
- colunas prioritárias no celular;
- ordenação anunciada;
- paginação;
- ações em menu;
- seleção em massa somente quando houver ação segura;
- números alinhados à direita;
- datas e status consistentes.

## 9. Layout

### Desktop

- sidebar expansível;
- header com contexto, unidade, notificações e usuário;
- conteúdo com largura máxima;
- filtros próximos do resultado.

### Mobile

- navegação inferior ou drawer conforme papel;
- ações principais alcançáveis;
- modal complexo vira tela cheia;
- tabelas viram cards ou rolagem controlada;
- agenda prioriza o dia.

## 10. Acessibilidade

- ordem de foco corresponde à leitura;
- skip link;
- landmarks;
- heading sem saltos arbitrários;
- modal devolve foco;
- erro é anunciado;
- ícone decorativo é ocultado do leitor;
- gráfico possui resumo tabular;
- contraste validado;
- zoom de 200% não perde função;
- interação não depende de hover.

## 11. Uso do TailAdmin

Antes de aceitar um componente:

1. mapear para ID canônico;
2. substituir cores e medidas por tokens;
3. revisar semântica;
4. testar teclado e leitor;
5. remover dependência desnecessária;
6. documentar licença;
7. criar testes visual e funcional.

