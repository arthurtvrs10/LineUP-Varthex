# Arquitetura do frontend Next.js

**ID:** DOC-FE-001  
**Status:** aprovado  
**Fonte canônica para:** estrutura do frontend, sessão e consumo da API

## 1. Baseline

- Next.js 16 App Router;
- Node.js 24 LTS;
- React 19;
- TypeScript estrito;
- Tailwind CSS 4;
- TailAdmin como base de layout e componentes;
- tipos gerados do OpenAPI;
- design tokens do Varthex.

Versões exatas ficam travadas no `package-lock.json`. Atualização exige pipeline, teste visual e ADR quando houver mudança estrutural.

## 2. Estrutura

```text
src/
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (admin)/
│   ├── (barber)/
│   ├── (client)/
│   └── (super-admin)/
├── features/
│   ├── appointments/
│   ├── customers/
│   ├── services/
│   └── ...
├── components/
│   ├── ui/
│   ├── layout/
│   └── feedback/
├── lib/
│   ├── api/
│   ├── auth/
│   ├── formatting/
│   └── telemetry/
├── generated/
│   └── api/
└── styles/
```

`features` contém interface e regras de apresentação do domínio. `components/ui` contém componentes reutilizáveis sem regra de negócio.

## 3. Rotas

- grupos de rota definem layout e autorização;
- server-side guard melhora a experiência, mas backend continua autoridade;
- URLs usam nomes estáveis e compartilháveis;
- filtros relevantes ficam na URL;
- modais críticos possuem rota ou estado recuperável quando necessário;
- redirecionamento pós-login considera papel e último contexto válido.

## 4. Sessão

- token não é salvo em `localStorage` ou `sessionStorage`;
- cookies seguros são manipulados pelo backend/reverse proxy;
- leitura de sessão retorna usuário, tenant, papéis e permissões;
- menu é derivado das permissões;
- 401 tenta renovação controlada uma vez;
- falha de renovação encerra sessão e preserva rota de retorno;
- 403 mostra estado sem permissão, não erro genérico.

## 5. Cliente da API

- gerado ou tipado a partir de [`../05-api-integracoes/openapi.yaml`](../05-api-integracoes/openapi.yaml);
- adiciona correlation ID quando apropriado;
- envia CSRF em mutações;
- converte `Problem` em erro conhecido;
- nunca inventa campo fora do contrato;
- cancela requisição obsoleta;
- centraliza timeout e política de retry;
- não repete automaticamente mutação sem idempotência.

## 6. Server e Client Components

### Server Components

- layout;
- carga inicial de páginas;
- dados que não exigem interação imediata;
- proteção e redirecionamento;
- redução de JavaScript.

### Client Components

- calendário;
- formulários;
- modais;
- filtros interativos;
- drag/drop aprovado;
- atualizações otimistas seguras.

Um componente não vira Client Component apenas por conveniência.

## 7. Estado

- estado de URL: filtro, período, página e ordenação;
- estado remoto: biblioteca de consulta escolhida ou APIs do framework com política única;
- estado de formulário: local ao formulário;
- estado global: somente sessão, preferências e notificações globais;
- cache é invalidado por chave de domínio e tenant;
- resposta otimista só em operação reversível e sem risco financeiro.

## 8. Formulários

- schema compatível com OpenAPI;
- validação de forma no cliente e autoridade no backend;
- erro associado ao campo;
- primeiro erro recebe foco;
- submissão protegida contra duplo clique;
- valores não são perdidos em erro de conflito;
- confirmação para ação destrutiva;
- justificativa obrigatória quando a regra exigir.

## 9. Datas e dinheiro

- API recebe e entrega UTC;
- apresentação usa fuso da unidade;
- data sem horário não sofre conversão UTC;
- moeda usa `Intl.NumberFormat`;
- entrada monetária é convertida para string decimal;
- nenhum cálculo financeiro autoritativo ocorre no navegador.

## 10. Qualidade

- lint e typecheck bloqueiam merge;
- testes de componente para estados;
- Playwright para jornadas;
- verificação de acessibilidade;
- orçamento de performance definido por tela;
- logs do navegador não expõem dados pessoais;
- analytics usa IDs de eventos aprovados.

## 11. TailAdmin

O código aproveitado deve:

1. preservar avisos de licença;
2. ser convertido para tokens Varthex;
3. remover páginas e componentes não usados;
4. atender o catálogo de telas;
5. ser testado em celular, tablet e desktop;
6. não ditar arquitetura de negócio.
