# Rebrand LINEUP — plano de implementação

> **Para executores agênticos:** SUB-SKILL OBRIGATÓRIA: use
> `superpowers:subagent-driven-development` (recomendada) ou
> `superpowers:executing-plans` para executar tarefa a tarefa. Os passos usam
> checkbox (`- [ ]`) para rastreio.

**Objetivo:** trocar a fundação visual do frontend de Varthex Barber para o
sistema de marca LINEUP, criando a camada de tokens que hoje não existe.

**Arquitetura:** tokens em `@theme` do Tailwind v4, dentro de `app/globals.css`.
Nenhum `tailwind.config.ts` é criado — o projeto é v4 e tematização vive em CSS.
Componentes passam a consumir utilities de token (`bg-accent`, `text-ink`), nunca
literais hex.

**Stack:** Next.js 16 (App Router), Tailwind v4, TypeScript strict, Recharts.

**Spec:** `docs/superpowers/specs/2026-08-28-rebrand-lineup-design.md`

---

## Escopo deste plano

O spec define 6 fases. **Este plano cobre as Fases 0, 1 e 2** — fundação,
primitivos e marca.

As Fases 3–5 (os quatro painéis, gráficos, site público) ficam para um plano
seguinte, deliberadamente. O próprio spec (§10) identifica o fim da Fase 0 como
o ponto de decisão real: é ali que o produto já aparece laranja e sem cantos, e
onde se para se a direção não agradar. Detalhar a conversão de 139 arquivos
antes disso é o desperdício que o spec avisa para evitar.

Ao fim deste plano o produto está funcional, coerente e revisável.

---

## Constraints globais

Valores copiados literalmente do spec. Valem para toda tarefa.

- **Paleta:** Ink `#0E1012` · Graphite `#3A3F44` · Steel `#7A8288` · Fog
  `#E4E7E9` · Paper `#FFFFFF` · Signal `#FF4A17`
- **Acento tem três tokens:** `--accent #FF4A17` (superfícies) ·
  `--text-on-accent #0E1012` (sobre laranja) · `--accent-strong #C73A12`
  (laranja como texto em branco). **Branco sobre Signal é 3.36:1 e reprova.**
- **Botão primário é Ink sobre Signal**, nunca branco sobre Signal.
- **Raio 0 em tudo.**
- **Elevação por borda.** Sombra só em `--shadow-popover
  0 4px 16px rgb(14 16 18 / .10)` e `--shadow-modal 0 16px 48px rgb(14 16 18 / .18)`.
- **Espaçamento:** 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. Sem valor arbitrário.
- **Tipo, oito degraus:** display 39 · h1 31 · h2 25 · h3 20 · body-lg 18 ·
  body 16 · small 13 · caption 11.
- **Números são Archivo com `tabular-nums`.**
- **Estado nunca depende só de cor** — sempre ícone + palavra.
- **Um botão primário por tela.**
- **Português, voz da marca:** direto, específico, sem exclamação.

### Ciclo de verificação (não há test runner)

Este projeto **não tem jest, vitest, playwright nem testing-library**. O ciclo
de verificação de cada tarefa é:

```bash
npx tsc --noEmit -p .     # tipos
npx next build            # build de produção
```

mais medição no browser via `javascript_tool`, comparando valores computados
contra o esperado. Onde este plano diz "verifique", há uma sonda concreta.

---

## Estrutura de arquivos

| Arquivo | Responsabilidade | Ação |
|---|---|---|
| `app/globals.css` | Camada de tokens (`@theme`) e reset transitório de raio | Reescrever |
| `app/layout.tsx` | Fontes Archivo/Work Sans, metadata LINEUP | Modificar |
| `components/brand/Logo.tsx` | Logo LINEUP | Criar |
| `components/brand/Brand.tsx` | Logo Varthex | Remover |
| `components/ui/*.tsx` | Primitivos consumindo tokens | Modificar (8 arquivos) |
| `README.md` (raiz) | Nome do produto | Modificar |

---

## Task 1: Fundação de tokens

**Files:**
- Modify: `frontend/app/globals.css` (hoje: 1 linha)

**Interfaces:**
- Produces: as utilities de token que todas as tarefas seguintes consomem —
  `bg-accent`, `bg-accent-hover`, `text-on-accent`, `text-accent-strong`,
  `bg-accent-subtle`, `text-ink`, `text-secondary`, `text-tertiary`,
  `border-fog`, `bg-surface`, `bg-surface-sunken`, `text-success`,
  `text-warning`, `text-danger`, `bg-danger` e as variantes `-subtle` de
  success/warning/danger; `shadow-popover`, `shadow-modal`; `font-display`,
  `font-body`; os oito degraus `text-display` … `text-caption`.

- [ ] **Passo 1: Reescrever `app/globals.css`**

```css
@import "tailwindcss";

/* ---------------------------------------------------------------------------
 * LINEUP — camada de tokens.
 *
 * Duas camadas, de propósito:
 *   --brand-*  a paleta, exatamente como o manual especifica. Componente
 *              NUNCA referencia estas.
 *   as demais  tokens semânticos. Componentes usam só estes, para que uma
 *              repintura seja um arquivo e não um refactor.
 *
 * Contrastes abaixo foram medidos, não estimados.
 * ------------------------------------------------------------------------- */

@theme {
  /* --- paleta da marca (não usar direto em componente) --- */
  --color-brand-ink: #0e1012;
  --color-brand-graphite: #3a3f44;
  --color-brand-steel: #7a8288;
  --color-brand-fog: #e4e7e9;
  --color-brand-paper: #ffffff;
  --color-brand-signal: #ff4a17;

  /* --- semânticos: texto --- */
  --color-ink: #0e1012;          /* 19.06:1 em branco */
  --color-secondary: #3a3f44;    /* 10.64:1 */
  --color-tertiary: #7a8288;     /*  3.91:1 — texto grande e UI apenas */

  /* --- semânticos: superfície --- */
  --color-surface: #ffffff;
  --color-surface-sunken: #f5f6f7; /* spec §4.1 — fora da paleta da marca */
  --color-fog: #e4e7e9;

  /* --- acento: três tokens, não um ---
   * Branco sobre #FF4A17 é 3.36:1 e REPROVA. Por isso o botão primário
   * é Ink sobre Signal (5.67:1), e laranja como texto em branco usa
   * accent-strong (5.19:1). */
  --color-accent: #ff4a17;
  --color-on-accent: #0e1012;
  --color-accent-strong: #c73a12;
  --color-accent-hover: #e63f0f;  /* spec §4.4 */
  --color-accent-subtle: #fff1ec;

  /* --- semânticos de estado --- */
  --color-success: #1e7a4c;
  --color-warning: #8a5a00;
  --color-danger: #8c1d18;
  /* variantes suaves: candidatas, contraste medido na Task 3 */
  --color-success-subtle: #eaf5ef;
  --color-warning-subtle: #faf3e6;
  --color-danger-subtle: #f9edec;

  /* --- tipografia --- */
  --font-display: var(--font-archivo), system-ui, sans-serif;
  --font-body: var(--font-work-sans), system-ui, sans-serif;

  --text-display: 2.4375rem;      /* 39px */
  --text-display--line-height: 0.95;
  --text-display--letter-spacing: -0.02em;
  --text-display--font-weight: 700;

  --text-h1: 1.9375rem;           /* 31px */
  --text-h1--line-height: 1.1;
  --text-h1--letter-spacing: -0.015em;
  --text-h1--font-weight: 700;

  --text-h2: 1.5625rem;           /* 25px */
  --text-h2--line-height: 1.15;
  --text-h2--letter-spacing: -0.01em;
  --text-h2--font-weight: 600;

  --text-h3: 1.25rem;             /* 20px */
  --text-h3--line-height: 1.2;
  --text-h3--letter-spacing: -0.005em;
  --text-h3--font-weight: 600;

  --text-body-lg: 1.125rem;       /* 18px */
  --text-body-lg--line-height: 1.55;

  --text-body: 1rem;              /* 16px */
  --text-body--line-height: 1.6;

  --text-small: 0.8125rem;        /* 13px */
  --text-small--line-height: 1.5;

  --text-caption: 0.6875rem;      /* 11px */
  --text-caption--line-height: 1.4;
  --text-caption--letter-spacing: 0.02em;
  --text-caption--font-weight: 500;

  /* --- espaçamento: 4px base --- */
  --spacing: 0.25rem;

  /* --- elevação: só o que de fato flutua --- */
  --shadow-popover: 0 4px 16px rgb(14 16 18 / 0.1);
  --shadow-modal: 0 16px 48px rgb(14 16 18 / 0.18);

  /* --- raio zero em toda a escala do tema --- */
  --radius-xs: 0;
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-xl: 0;
  --radius-2xl: 0;
  --radius-3xl: 0;
  --radius-4xl: 0;
}

/* ---------------------------------------------------------------------------
 * RESET TRANSITÓRIO DE RAIO — remover na Fase 3.
 *
 * Zerar --radius-* acima NÃO neutraliza `rounded-[12px]`: em Tailwind v4
 * valor arbitrário passa por fora do tema e continua produzindo 12px.
 * São 258 dos 459 usos no código hoje.
 *
 * Este bloco força o raio a 0 durante a migração, para que a Fase 0 já
 * mostre a aparência final. Precisa de !important justamente porque
 * compete com utilities.
 *
 * Ao final da Fase 3, quando os `rounded-*` tiverem sido removidos do
 * código, APAGUE este bloco e confirme que nada arredondou de volta.
 * ------------------------------------------------------------------------- */
*,
*::before,
*::after {
  border-radius: 0 !important;
}

body {
  background-color: var(--color-surface-sunken);
  color: var(--color-ink);
  font-family: var(--font-body);
}

/* Números alinham em coluna: tabular em toda célula de tabela. */
th,
td {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Passo 2: Verificar que o build aceita o `@theme`**

```bash
cd frontend && npx tsc --noEmit -p . && npx next build
```

Esperado: ambos passam. Se `next build` reclamar de `@theme`, a versão do
Tailwind não é v4 — pare e confirme `package.json`.

- [ ] **Passo 3: Verificar os tokens no browser**

Abra `http://localhost:3000/admin/dashboard` e rode:

```js
(() => {
  const cs = getComputedStyle(document.documentElement);
  const sonda = (cls) => {
    const el = document.createElement('div');
    el.className = cls; document.body.appendChild(el);
    const s = getComputedStyle(el);
    const r = { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
    el.remove(); return r;
  };
  return {
    accent: sonda('bg-accent'),
    onAccent: sonda('bg-accent text-on-accent'),
    raioArbitrario: sonda('rounded-[12px]'),
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
})()
```

Esperado:
- `accent.bg` = `rgb(255, 74, 23)`
- `onAccent.color` = `rgb(14, 16, 18)`
- **`raioArbitrario.radius` = `0px`** — se vier `12px`, o reset transitório não
  está aplicando; confira se o bloco ficou fora de `@theme`.
- `bodyBg` = `rgb(245, 246, 247)`

- [ ] **Passo 4: Commit**

```bash
git add frontend/app/globals.css
git commit -m "feat: camada de tokens LINEUP em @theme (Tailwind v4)"
```

---

## Task 2: Fontes

**Files:**
- Modify: `frontend/app/layout.tsx:1-18`

**Interfaces:**
- Consumes: `--font-display` e `--font-body` do `@theme` (Task 1), que leem
  `--font-archivo` e `--font-work-sans` definidos aqui.
- Produces: as CSS vars `--font-archivo` e `--font-work-sans` no `<html>`.

- [ ] **Passo 1: Trocar o bloco de fontes**

Substitua as linhas 1–18 de `app/layout.tsx` por:

```tsx
import type { Metadata } from "next";
import { Archivo, Work_Sans } from "next/font/google";
import "./globals.css";

// Self-hosted pelo next/font: sem chamada ao Google em runtime, sem layout shift.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  display: "swap",
});
```

- [ ] **Passo 2: Aplicar as variáveis no `<html>`**

Troque o `className` do `<html>` e o do `<body>`:

```tsx
    <html lang="pt-BR" className={`${archivo.variable} ${workSans.variable} scroll-smooth`}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
```

O `bg` e a cor de texto saem do `className` do body — agora vêm de
`globals.css` (Task 1), para não haver duas fontes de verdade.

- [ ] **Passo 3: Apagar os arquivos de fonte antigos**

```bash
cd frontend && rm -rf app/fonts
```

- [ ] **Passo 4: Verificar**

```bash
npx tsc --noEmit -p . && npx next build
```

E no browser:

```js
(() => {
  const h1 = document.querySelector('h1');
  return {
    htmlVars: document.documentElement.className,
    fonteBody: getComputedStyle(document.body).fontFamily,
    manropeSumiu: !document.documentElement.className.includes('manrope'),
  };
})()
```

Esperado: `fonteBody` contém `Work Sans`; `manropeSumiu` é `true`.

- [ ] **Passo 5: Commit**

```bash
git add frontend/app/layout.tsx
git rm -r --cached frontend/app/fonts 2>/dev/null || true
git commit -m "feat: troca Manrope por Archivo + Work Sans"
```

---

## Task 3: Medir contraste das variantes suaves

O spec (§4.3) define `--success-subtle`, `--warning-subtle` e `--danger-subtle`
como **candidatos pendentes de medição**. Esta tarefa fecha isso. Sem ela, os
badges podem sair ilegíveis.

**Files:**
- Modify: `frontend/app/globals.css` (só se alguma reprovar)

- [ ] **Passo 1: Medir os três pares no browser**

```js
(() => {
  function lum(hex) {
    const c = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255)
      .map(v => v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4));
    return 0.2126*c[0] + 0.7152*c[1] + 0.0722*c[2];
  }
  function razao(a, b) {
    const [l1, l2] = [lum(a), lum(b)].sort((x,y) => y-x);
    return +((l1 + 0.05) / (l2 + 0.05)).toFixed(2);
  }
  return {
    success: razao('#1e7a4c', '#eaf5ef'),
    warning: razao('#8a5a00', '#faf3e6'),
    danger:  razao('#8c1d18', '#f9edec'),
    onAccent: razao('#0e1012', '#ff4a17'),   // deve bater os 5.67 do manual
  };
})()
```

- [ ] **Passo 2: Avaliar**

- `onAccent` deve dar **≈5.67**. Se não der, algum hex foi digitado errado —
  corrija antes de seguir.
- Cada um dos três deve dar **≥4.5**. Anote os valores.

- [ ] **Passo 3: Corrigir os que reprovarem**

Para cada razão abaixo de 4.5, escureça o texto em passos de 4% de luminosidade
(não clareie o fundo — ele precisa continuar lendo como tinta suave) e re-meça
até passar. Registre o hex final como comentário ao lado do token em
`globals.css`.

- [ ] **Passo 4: Commit**

```bash
git add frontend/app/globals.css
git commit -m "fix: ajusta variantes suaves ao piso de contraste 4.5:1"
```

---

## Task 4: Primitivos para tokens

Converte os oito primitivos compartilhados. São eles que propagam o sistema
para o resto do app, então vêm antes dos painéis.

**Files:**
- Modify: `frontend/components/ui/Modal.tsx`
- Modify: `frontend/components/ui/Toast.tsx`
- Modify: `frontend/components/ui/StatCard.tsx`
- Modify: `frontend/components/ui/FormFields.tsx`
- Modify: `frontend/components/ui/FilterSelect.tsx`
- Modify: `frontend/components/ui/ConfirmModal.tsx`
- Modify: `frontend/components/ui/SettingsPrimitives.tsx`
- Modify: `frontend/components/ui/TrendCharts.tsx`

**Interfaces:**
- Consumes: as utilities de token da Task 1.
- Produces: nenhuma API nova — as props públicas de cada componente ficam
  idênticas. Só as classes internas mudam.

- [ ] **Passo 1: Tabela de substituição**

Aplique em todos os oito arquivos, nesta ordem (do mais específico ao mais
geral, para não sobrescrever errado):

| De | Para |
|---|---|
| `bg-[#7247f3]` | `bg-accent` |
| `hover:bg-[#5c2ee0]` | `hover:bg-accent-hover` |
| `text-[#7247f3]` | `text-accent-strong` |
| `bg-[#ede9fd]` | `bg-accent-subtle` |
| `text-[#0d1831]` | `text-ink` |
| `text-[#5f6f87]`, `text-[#686a73]` | `text-secondary` |
| `text-[#98a2b3]`, `text-[#b0afa8]` | `text-tertiary` |
| `border-[#e6e4df]`, `border-[#eef0f3]` | `border-fog` |
| `bg-[#f7f6f2]`, `bg-[#f0efea]` | `bg-surface-sunken` |
| `text-[#27865b]` | `text-success` |
| `bg-[#e8f7f1]` | `bg-success-subtle` |
| `text-[#d28b27]` | `text-warning` |
| `bg-[#fdf3e3]` | `bg-warning-subtle` |
| `text-[#c84a4a]` | `text-danger` |
| `bg-[#fdeaea]` | `bg-danger-subtle` |
| `shadow-[0_12px_32px_rgba(13,24,49,0.14)]` | `shadow-popover` |
| `shadow-[0_8px_24px_rgba(13,24,49,0.08)]` | `shadow-popover` |

- [ ] **Passo 2: Escala tipográfica nos primitivos**

A tabela do Passo 1 só troca cor. Os 8 arquivos têm **4 tamanhos
arbitrários** que violam o constraint global ("sem valor arbitrário"):

```bash
grep -n "text-\[11px\]\|text-\[22px\]\|text-\[17px\]" Modal.tsx StatCard.tsx
```

Aplique exatamente estas trocas:

`Modal.tsx:94` — título do modal, mais próximo de `text-h3` (20px, diff 3) do
que de `text-small` (13px, diff 4):

```tsx
// De:
<h2 id="modal-titulo" className="text-[17px] font-bold text-[#0d1831]">
// Para:
<h2 id="modal-titulo" className="text-h3 text-ink">
```

(`text-h3` já embute peso 600 — remova `font-bold`, o token cuida do peso.)

`StatCard.tsx:47` e `:51` — rótulo e hint, 11px é match exato de
`text-caption`:

```tsx
// De:
<p className="truncate text-[11px] font-bold uppercase tracking-wide text-[#98a2b3]">
// Para:
<p className="truncate text-caption uppercase text-tertiary">
```

```tsx
// De:
{hint && <p className={`mt-1.5 text-[11px] ${toneText[tone]}`}>{hint}</p>}
// Para:
{hint && <p className={`mt-1.5 text-caption ${toneText[tone]}`}>{hint}</p>}
```

(`text-caption` já embute tracking +2% e peso 500 — remova `tracking-wide`
manual do rótulo, que duplicaria o espaçamento.)

`StatCard.tsx:50` — o valor do KPI é **número**, então além do degrau leva
`font-display` e `tabular-nums` (constraint global: números são Archivo
tabular):

```tsx
// De:
<p className="mt-1.5 text-[22px] font-bold leading-none text-[#0d1831]">{value}</p>
// Para:
<p className="mt-1.5 text-h3 font-display tabular-nums leading-none text-ink">{value}</p>
```

22px cai mais perto de `text-h3` (20px, diff 2) do que de `text-h2` (25px,
diff 3) — não se cria degrau novo para os 2px que faltam.

- [ ] **Passo 3: Corrigir o botão primário — branco sobre laranja reprova**

Em `Modal.tsx`, `ModalSubmitButton` hoje é `text-white` sobre o acento. Troque:

```tsx
  const cores =
    tone === "danger"
      ? "bg-danger text-white hover:opacity-90"
      : "bg-accent text-on-accent hover:bg-accent-hover";
```

Faça o mesmo em `SettingsPrimitives.tsx` (`SaveBar`) e em `ConfirmModal.tsx`
(o botão de confirmar com `tone="accent"`).

`danger` mantém texto branco: `#8C1D18` contra branco é 9.11:1 e passa.

- [ ] **Passo 4: `TrendCharts` — NÃO trocar a cor de série ainda**

`ACCENT = "#7247f3"` em `TrendCharts.tsx` é cor de dado, não de UI. Trocá-la
por Signal agora deixaria o gráfico laranja antes da paleta categórica ser
validada (spec §9). **Deixe como está** e adicione o comentário:

```tsx
/* Cor de série provisória: aguarda a paleta categórica validada (spec §9).
   Não trocar por Signal antes disso — dado e acento de marca não podem ser
   a mesma cor. */
const ACCENT = "#7247f3";
```

- [ ] **Passo 5: Verificar**

```bash
npx tsc --noEmit -p . && npx next build
```

No browser, em `/superadmin/barbearias`, abra o modal "Nova barbearia" e rode:

```js
(() => {
  const btn = document.querySelector('dialog[open] button[type="submit"]');
  const s = getComputedStyle(btn);
  return { bg: s.backgroundColor, color: s.color, radius: s.borderRadius };
})()
```

Esperado: `bg` = `rgb(255, 74, 23)`, **`color` = `rgb(14, 16, 18)`** (Ink, não
branco), `radius` = `0px`.

- [ ] **Passo 6: Commit**

```bash
git add frontend/components/ui
git commit -m "refactor: primitivos consomem tokens LINEUP"
```

---

## Task 5: Marca

**Files:**
- Create: `frontend/components/brand/Logo.tsx`
- Delete: `frontend/components/brand/Brand.tsx`
- Delete: `frontend/components/brand/varthex-brandmark-violet.svg`
- Modify: `frontend/components/layout/PortalSidebar.tsx` (importa `Brand`)
- Modify: `frontend/app/layout.tsx` (metadata)
- Modify: `README.md` (raiz)

**Interfaces:**
- Produces: `<Logo variant="full" | "mark" />` — substitui `<Brand light align />`.

- [ ] **Passo 1: Copiar o Logo do skill**

```bash
cp "<base do skill lineup-brand>/code/components/Logo.tsx" frontend/components/brand/Logo.tsx
```

Abra o arquivo e confirme que ele não importa nada que o projeto não tenha
(`cn.ts` pode ser necessário — se for, copie junto).

- [ ] **Passo 2: Trocar o uso no `PortalSidebar`**

Em `PortalSidebar.tsx`, troque o import e o uso:

```tsx
import { Logo } from "@/components/brand/Logo";
```

```tsx
          <Link href={homeHref} onClick={close}>
            <Logo variant="full" />
          </Link>
```

- [ ] **Passo 3: Remover a marca antiga**

```bash
cd frontend && rm components/brand/Brand.tsx components/brand/varthex-brandmark-violet.svg
grep -rn "Brand\b" components/ app/ | grep -v Logo
```

O `grep` deve voltar vazio. Se achar algum uso, converta para `Logo` antes de
seguir.

- [ ] **Passo 4: Metadata**

Em `app/layout.tsx`:

```tsx
export const metadata: Metadata = {
  title: {
    default: "LINEUP | Gestão de barbearia",
    template: "%s | LINEUP",
  },
  description:
    "Agenda, equipe, clientes, comissões e indicadores em uma única plataforma para barbearias.",
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
};
```

- [ ] **Passo 5: Trocar "Varthex" no texto visível**

```bash
cd frontend && grep -rln "Varthex" components/ app/
```

Para cada arquivo, troque "Varthex Barber" → "LINEUP" e "varthex.com" →
"lineup.com". Atenção: `subtitleLine1` das sidebars, e-mails de exemplo em
configurações e ajuda, e o nome da barbearia fictícia ("Barbearia Estilo
Único") — **este último NÃO muda**, é nome de cliente fictício, não da marca.

- [ ] **Passo 6: README**

Troque o título e as menções ao produto em `README.md` na raiz. Não altere as
instruções de setup nem os comandos.

- [ ] **Passo 7: Verificar**

```bash
npx tsc --noEmit -p . && npx next build
cd frontend && grep -rn "Varthex" components/ app/ | grep -v "Estilo Único"
```

Esperado: build passa; o `grep` volta vazio.

- [ ] **Passo 8: Commit**

```bash
git add -A
git commit -m "feat: substitui a marca Varthex por LINEUP"
```

---

## Ponto de parada

Ao fim da Task 5 o produto está **inteiramente laranja, sem cantos arredondados
e com a tipografia nova**, embora os painéis ainda tenham literais hex.

Revise aqui antes de seguir. Se a direção não agradar, este é o momento barato
de voltar — `git checkout main` e nada se perdeu.

O plano das Fases 3–5 (painéis, gráficos, site público) é escrito depois desta
revisão, já sabendo o que a Fase 0 revelou.
