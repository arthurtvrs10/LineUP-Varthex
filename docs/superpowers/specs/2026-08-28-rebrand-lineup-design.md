# Rebrand LINEUP — design

**Data:** 2026-08-28
**Escopo:** `frontend/` inteiro — Varthex Barber deixa de existir e vira LINEUP.
**Classificação:** arquitetural. Troca a fundação de tokens da qual todo
componente depende.

---

## 1. Por que isto não é uma substituição de cores

O código hoje **não tem camada de tokens**. Toda cor é literal dentro de um
`className`:

| | |
|---|---|
| Arquivos `.tsx` | 139 |
| Literais hex | **2.134** |
| Cores distintas | **138** |
| Usos de `rounded-*` | 459 |
| Usos do violeta `#7247f3` | 254, em 66 arquivos |

A regra central do LINEUP é *"tokens, nunca literais"*. Então o trabalho real é
**criar a camada que não existe** e converter o código para ela. Depois disso,
uma repintura é um arquivo; hoje seriam 2.134 edições.

---

## 2. Decisão técnica: `@theme` da v4, não `tailwind.config.ts`

O LINEUP entrega um `tailwind.config.ts` escrito para **Tailwind v3**. Este
projeto é **v4 sem config** — `app/globals.css` é uma linha (`@import
"tailwindcss"`).

Na v4, tematização vive em CSS via `@theme`. Um config v3 só é lido com a
diretiva `@config`, em modo de compatibilidade. Adotá-lo seria carregar uma
configuração de versão anterior dentro de um projeto v4: funciona hoje, cobra
depois.

**Decisão:** portar os tokens do LINEUP para `@theme` em `app/globals.css`.
Nenhum `tailwind.config.ts` é criado. Os tokens viram utilities de primeira
classe (`bg-accent`, `text-ink`, `border-fog`), com autocomplete.

Alternativas descartadas:
- *Copiar o config v3* — briga com o framework.
- *Só variáveis CSS + `bg-[var(--accent)]`* — funciona, mas não impede literais
  de voltarem, que é a causa que estamos tratando.

---

## 3. Tokens

Duas camadas, como o manual exige. Componentes tocam **apenas** a segunda.

### Camada 1 — paleta da marca

```
--brand-ink       #0E1012
--brand-graphite  #3A3F44
--brand-steel     #7A8288
--brand-fog       #E4E7E9
--brand-paper     #FFFFFF
--brand-signal    #FF4A17
```

### Camada 2 — semânticos

```
--text            #0E1012
--text-secondary  #3A3F44
--text-tertiary   #7A8288
--border          #E4E7E9
--surface         #FFFFFF
--accent          #FF4A17
--text-on-accent  #0E1012   ← Ink sobre laranja, 5.67:1
--accent-strong   #C73A12   ← laranja COMO TEXTO em branco, 5.19:1
--accent-subtle   #FFF1EC
--success         #1E7A4C
--warning         #8A5A00
--danger          #8C1D18
```

**A regra dos três tokens de acento é a mais importante deste documento.**
Branco sobre `#FF4A17` mede 3.36:1 e reprova. Portanto:

- Botão primário = `bg-accent text-on-accent` → **preto sobre laranja**.
- Link ou número laranja sobre branco = `--accent-strong`.
- `--accent` como cor de texto em branco só é permitido a partir de 24px
  (ou 19px em negrito).

---

## 4. Lacunas: onde o LINEUP não cobre o produto

O sistema foi desenhado para a marca, não para este produto. Cinco coisas que
usamos hoje não têm equivalente. Cada uma abaixo tem resolução proposta —
**estas são as decisões que mais merecem sua revisão.**

### 4.1 Fundo de página (93 usos de `#f7f6f2`)

O LINEUP diz que o fundo é Paper `#FFFFFF`. Nosso fundo é um off-white quente, e
os cards brancos se destacam contra ele. Com tudo branco, card e fundo colapsam
— e, sem sombra (elevação é por borda), a hierarquia se perde.

**Proposta:** adicionar `--surface-sunken: #F5F6F7`, um cinza frio derivado de
Fog. Não é da paleta da marca; é necessidade real de UI. Fica registrado aqui
para o dono da marca decidir se vira token oficial.

### 4.2 Cor informativa (38 usos: `#3478c9` + `#eaf2fb`)

O LINEUP tem success, warning e danger — **não tem info**. Usamos azul em
estados neutros-informativos (Trial, Agendado, callouts).

**Proposta:** dobrar info em `--text-secondary` + ícone. O LINEUP já exige que
estado nunca dependa de cor sozinha, então o ícone e a palavra carregam o
significado. Elimina uma cor sem perder informação.

### 4.3 Variantes suaves de estado (83 usos)

`#e8f7f1`, `#fdf3e3`, `#fdeaea` são fundos de badge. O LINEUP define só
`--accent-subtle`.

**Proposta:** derivar pela mesma lógica do `--accent-subtle` — tinta clara do
mesmo matiz, ~95% de luminosidade:

```
--success-subtle  #EAF5EF
--warning-subtle  #FAF3E6
--danger-subtle   #F9EDEC
```

Estes valores são **candidatos**. Cada um precisa do contraste medido com seu
texto (`--success` sobre `--success-subtle`, etc.) na Fase 0, e ajustado se não
atingir 4.5:1. Não entram em uso antes disso.

### 4.4 Hover do acento (35 usos de `#5c2ee0`)

Não existe `--accent-hover` no manual.

**Proposta:** `--accent-hover: #E63F0F` — Signal escurecido, mantendo Ink como
texto (o contraste sobe, não cai).

### 4.5 Dourado premium (16 usos de `#c8a86b`)

Marca o plano Enterprise. Não há equivalente.

**Proposta:** eliminar. Diferenciar tier por rótulo e peso tipográfico, não por
cor — coerente com "estado nunca depende só de cor". Uma cor a menos no sistema.

---

## 5. Mapeamento das cores

Os 32 tons abaixo cobrem **90%** das 2.134 ocorrências. A cauda (106 cores, 212
usos) é resolvida caso a caso na fase da área correspondente.

| Atual | Usos | Vira | Token |
|---|---:|---|---|
| `#0d1831` | 344 | `#0E1012` | `--text` |
| `#e6e4df` | 260 | `#E4E7E9` | `--border` |
| `#7247f3` | 254 | `#FF4A17` | `--accent` |
| `#686a73` | 171 | `#3A3F44` | `--text-secondary` |
| `#5f6f87` | 126 | `#3A3F44` | `--text-secondary` |
| `#98a2b3` | 105 | `#7A8288` | `--text-tertiary` |
| `#f7f6f2` | 93 | `#F5F6F7` | `--surface-sunken` (§4.1) |
| `#ede9fd` | 70 | `#FFF1EC` | `--accent-subtle` |
| `#27865b` | 52 | `#1E7A4C` | `--success` |
| `#d28b27` | 46 | `#8A5A00` | `--warning` |
| `#f0efea` | 39 | `#F5F6F7` | `--surface-sunken` |
| `#c84a4a` | 36 | `#8C1D18` | `--danger` |
| `#5c2ee0` | 35 | `#E63F0F` | `--accent-hover` (§4.4) |
| `#e8f7f1` | 34 | derivado | `--success-subtle` (§4.3) |
| `#fdf3e3` | 31 | derivado | `--warning-subtle` |
| `#eef0f3` | 29 | `#E4E7E9` | `--border` |
| `#3478c9` | 23 | — | dobra em `--text-secondary` (§4.2) |
| `#e2e7f0` | 22 | `#E4E7E9` | `--border` |
| `#fdeaea` | 18 | derivado | `--danger-subtle` |
| `#c8a86b` | 16 | — | eliminado (§4.5) |
| `#eaf2fb` | 15 | — | eliminado com o info |
| `#b0afa8` | 13 | `#7A8288` | `--text-tertiary` |
| `#fbf4e8` | 10 | — | eliminado com o dourado |

**Colapsos que perdem distinção** — confira se alguma importava:
`#5f6f87` + `#686a73` viram o mesmo `--text-secondary`; `#eef0f3` + `#e2e7f0` +
`#e6e4df` viram o mesmo `--border`; `#f0efea` + `#f7f6f2` viram
`--surface-sunken`.

---

## 6. Tipografia

Manrope (local) sai. Entram **Archivo** (display, títulos, **todo número**) e
**Work Sans** (corpo), via `next/font/google` — self-hosted, sem chamada em
runtime.

Oito degraus, e apenas eles: `display 39` · `h1 31` · `h2 25` · `h3 20` ·
`body-lg 18` · `body 16` · `small 13` · `caption 11`.

Nosso código usa tamanhos arbitrários (`text-[22px]`, `text-[17px]`,
`text-[11px]`, `text-[42px]`…). Cada um encaixa no degrau mais próximo. Onde
não encaixar, **o layout está errado, não a escala** — não se cria degrau
intermediário.

**Números são Archivo com `tabular-nums`.** Já aplicamos isso em partes; passa a
valer em toda tabela.

---

## 7. Forma

- **Raio 0 em tudo.** `--radius-*: 0`, então `rounded-[12px]` resolve para 0 sem
  quebrar. Os 459 usos são limpos por fase, mas nada quebra antes disso.
- **Elevação por borda.** Sombra só em coisas que de fato flutuam: `Modal`,
  `NotificacoesPopover`, `PortalSwitcher`, `Toast`, menu de conta. Card com
  sombra sai.
- **Espaçamento 4/8/12/16/24/32/48/64.** Sem valor arbitrário.

---

## 8. Marca

`components/brand/Brand.tsx` e `varthex-brandmark-violet.svg` saem; entra o
`Logo.tsx` do LINEUP com o vetor real. Também mudam:

- `app/layout.tsx` — metadata, título, descrição
- `README.md` na raiz
- Todo texto que diz "Varthex" (sidebars, e-mails, ajuda, configurações)
- Favicon e ícone de app

---

## 9. Paleta dos gráficos — refazer

A paleta categórica atual (`#7247f3` violeta / `#eb6834` laranja / `#1baf7a`
aqua) foi validada contra o violeta da marca. Com Signal laranja, o slot 2 vira
**um segundo laranja significando outra coisa** — inaceitável.

**Ação:** montar nova paleta categórica ancorada em Signal e rodar
`validate_palette.js` em `--pairs all` (o donut fecha o anel, slot 1 encosta no
3) antes de aplicar. Sem paleta aprovada, os gráficos não mudam.

---

## 10. Fases

Cada fase termina com `tsc`, `build` e verificação no browser. Você revisa antes
da seguinte.

| # | Fase | Entrega |
|---|---|---|
| **0** | Fundação | `@theme` com todos os tokens, fontes trocadas, raio zerado, contraste das variantes suaves medido (§4.3). Nenhum componente é reescrito — mas como o raio e as fontes são globais, **a aparência do produto inteiro muda de uma vez**. |
| **1** | Primitivos | `Modal`, `Toast`, `StatCard`, `FormFields`, `FilterSelect`, `ConfirmModal`, `SettingsPrimitives`, `TrendCharts` convertidos para tokens. |
| **2** | Marca | Logo, metadata, README, textos "Varthex" → LINEUP. |
| **3** | Painéis | Admin, superadmin, barbeiro, cliente — área por área. |
| **4** | Gráficos | Nova paleta validada e aplicada. |
| **5** | Site público | Landing, login, cadastro, legais. |

**Fase 0 é o ponto de decisão real.** Ao fim dela o produto inteiro já estará
laranja e sem cantos arredondados, mesmo com o resto por converter. Se a direção
não agradar, é ali que se para — e não depois de 139 arquivos.

---

## 11. Verificação

Por fase:
- `npx tsc --noEmit` e `npx next build` limpos
- Browser a 375px e desktop: sem overflow horizontal, alvos de toque ≥44px
- Console sem erros novos

Ao final:
- Nenhum literal hex restante em `components/` (`grep -rE "#[0-9a-fA-F]{6}"` só
  pode achar `globals.css` e as cores de série dos gráficos)
- Contraste conferido nos pares novos, principalmente Ink sobre Signal
- Checagem 60-30-10: Signal perto de 5% da tela, nunca um terço

---

## 12. O que este documento não decide

Estratégia de produto, arquitetura de informação e conteúdo de tela. Decide como
o que existe passa a se ver e se ouvir.

Onde uma regra da marca colidir com necessidade real de uso, **a usabilidade
ganha** — e o desvio fica registrado aqui (§4), para a regra ser atualizada em
vez de quebrada em silêncio numa tela só.
