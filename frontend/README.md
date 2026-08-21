# Varthex Barber — Frontend

Frontend em Next.js e TypeScript, padronizado com Tailwind CSS.

## Estrutura

```text
app/                    Rotas e metadados
components/
  about/                Página Sobre nós
  auth/                 Login e cadastro
  brand/                Identidade da Varthex
  landing/              Seções e mockups da landing page
  layout/               Header e footer
  ui/                   Componentes básicos reutilizáveis
public/                 Imagens e ícones estáticos
```

As páginas em `app/` apenas montam os componentes. A aparência fica nas classes
do Tailwind, sem CSS Modules e sem folhas de estilo específicas por página.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Validar

```bash
npm run lint
npm run build
```

## Rotas

- `/` — landing page
- `/login` — acesso
- `/cadastro` — criação de conta
- `/sobre-nos` — propósito, missão, visão e valores
