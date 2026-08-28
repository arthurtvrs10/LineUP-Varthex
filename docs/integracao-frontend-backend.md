# Ligando o frontend ao backend

Guia para conectar o Next.js (`frontend/`) ao Spring Boot (`backend/`) deste
repositório. Escrito a partir do que existe hoje no código, não de um exemplo
genérico — os endpoints, tipos e nomes citados são os reais.

---

## O que você já tem

| | |
|---|---|
| **Backend** | Spring Boot + PostgreSQL, porta **8080** |
| **Autenticação** | JWT Bearer, sessão **stateless** |
| **Frontend** | Next.js 16 (App Router), porta 3000, **100% dados mock** |
| **Migrations** | Flyway em `backend/src/main/resources/db/` (V1 users, V2 barbershops, V3 barber_profiles) |

Endpoints que existem hoje:

```
POST   /auth/login                    público
GET    /auth/me

GET    /users            POST /users            GET /users/{id}
GET    /users/by-email   PATCH /users/{id}/block   PATCH /users/{id}/activate

GET    /barbershops      POST /barbershops      GET /barbershops/{id}
PATCH  /barbershops/{id} PATCH /barbershops/{id}/block
PATCH  /barbershops/{id}/activate

GET    /barbers          POST /barbers          GET /barbers/{id}
PATCH  /barbers/{id}     PATCH /barbers/{id}/status
```

Papéis: `SUPER_ADMIN`, `ADMIN`, `BARBER`, `CLIENT`.

---

## Passo 0 — CORS (faça isto primeiro)

**Sem isto, nada funciona.** O backend hoje não tem nenhuma configuração de
CORS. O navegador vai bloquear toda requisição de `localhost:3000` para
`localhost:8080` antes mesmo de ela sair, e o erro no console (`blocked by
CORS policy`) não parece um erro de backend — muita gente perde horas aqui
achando que o problema é no fetch.

Em `backend/src/main/java/.../config/SecurityConfig.java`, adicione o bean e
ligue-o à filter chain:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:3000"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}
```

E dentro de `securityFilterChain`, antes do `.csrf(...)`:

```java
.cors(cors -> cors.configurationSource(corsConfigurationSource()))
```

> Em produção troque `localhost:3000` pelo domínio real. Não use
> `setAllowedOriginPatterns(List.of("*"))` junto com credenciais — a
> especificação proíbe e o navegador rejeita.

**Como saber que funcionou:** abra o DevTools na aba Network, dispare qualquer
requisição e confirme que a resposta traz o header
`Access-Control-Allow-Origin: http://localhost:3000`.

---

## Passo 1 — Variável de ambiente

Crie `frontend/.env.local` (já ignorado pelo git):

```
NEXT_PUBLIC_API_URL=http://localhost:8080
```

O prefixo `NEXT_PUBLIC_` é obrigatório para a variável chegar ao navegador. Sem
ele, ela existe só no servidor e vira `undefined` nos componentes client — que
é onde estão todos os formulários deste projeto.

> Variável de ambiente é lida **no build**. Depois de criar ou alterar o
> arquivo, reinicie o `npm run dev` — salvar não basta.

---

## Passo 2 — Um cliente HTTP central

Crie `frontend/lib/api.ts`. Concentrar aqui evita repetir tratamento de erro e
token em cada tela:

```ts
const BASE = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("varthex_token");
}

export async function api<T>(caminho: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const res = await fetch(`${BASE}${caminho}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  // 401 = token ausente/expirado. Manda para o login em vez de
  // deixar a tela quebrar com um erro genérico.
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("varthex_token");
    window.location.href = "/login";
    throw new ApiError(401, "Sessão expirada");
  }

  if (!res.ok) {
    const corpo = await res.text();
    throw new ApiError(res.status, corpo || `Erro ${res.status}`);
  }

  // 204 No Content não tem corpo — .json() estouraria.
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
```

---

## Passo 3 — Tipos espelhando os DTOs do backend

Crie `frontend/lib/tipos.ts`. Copie a forma exata dos `record` Java — se
divergir, o TypeScript não avisa, porque `res.json()` devolve `any`:

```ts
export type Role = "SUPER_ADMIN" | "ADMIN" | "BARBER" | "CLIENT";

// LoginResponse.java
export type LoginResponse = {
  id: string;          // UUID vira string no JSON
  email: string;
  role: Role;
  accessToken: string;
  tokenType: string;
  message: string;
};

// MeResponse.java
export type MeResponse = {
  id: string;
  email: string;
  role: Role;
  barbershopId: string | null;
};

// BarbershopSummaryResponse.java
export type BarbershopSummary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: "ACTIVE" | "BLOCKED";  // confira BarbershopStatus.java
};
```

> `UUID` do Java serializa como string. `LocalDate` vira `"2026-08-28"` e
> `LocalDateTime` vira `"2026-08-28T15:00:00"` — ambos strings, não `Date`.

---

## Passo 4 — Login

O backend devolve `accessToken` em `POST /auth/login`. Guarde-o e use nas
demais chamadas.

```ts
// frontend/lib/auth.ts
import { api } from "./api";
import type { LoginResponse, MeResponse } from "./tipos";

export async function login(email: string, password: string) {
  const r = await api<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem("varthex_token", r.accessToken);
  return r;
}

export async function me() {
  return api<MeResponse>("/auth/me");
}

export function logout() {
  localStorage.removeItem("varthex_token");
  window.location.href = "/login";
}
```

Ligue no formulário em `frontend/components/auth/AuthPage.tsx`. Depois do
login, use `role` para decidir o destino:

```ts
const r = await login(email, senha);
const destino = {
  SUPER_ADMIN: "/superadmin/dashboard",
  ADMIN: "/admin/dashboard",
  BARBER: "/barbeiro/dashboard",
  CLIENT: "/clientes/dashboard",
}[r.role];
router.push(destino);
```

E troque o `logoutHref` do `PortalSidebar` por um `onClick` que chame
`logout()` — hoje é só navegação para `/login`, sem limpar nada.

### Sobre guardar o token em localStorage

É o caminho mais simples e é o que este guia usa, mas seja consciente do
trade-off: token em `localStorage` é legível por qualquer JavaScript da
página, então uma falha de XSS vira roubo de sessão. A alternativa mais
segura é o backend devolver o token num cookie `httpOnly` + `SameSite`, que
o JavaScript não enxerga — exige mudar o `AuthController` e ajustar o CORS
para `allowCredentials`. Se o projeto for a produção com dados reais,
vale fazer essa troca antes.

---

## Passo 5 — Substituir o primeiro mock

Comece pela **listagem de barbearias**: é `GET`, sem corpo, e a tela já existe.

Em `frontend/components/superadmin/SuperAdminBarbeariasPage.tsx` existe hoje:

```ts
const barbearias: Barbearia[] = [ /* array fixo */ ];
```

Troque por carregamento real:

```tsx
const [barbearias, setBarbearias] = useState<BarbershopSummary[]>([]);
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState<string | null>(null);

useEffect(() => {
  let cancelado = false;   // evita setState depois do unmount

  api<BarbershopSummary[]>("/barbershops")
    .then((dados) => { if (!cancelado) setBarbearias(dados); })
    .catch((e) => { if (!cancelado) setErro(e.message); })
    .finally(() => { if (!cancelado) setCarregando(false); });

  return () => { cancelado = true; };
}, []);
```

**Os três estados que o mock escondia.** Com array fixo os dados estão sempre
prontos; com API não. Trate os três, ou a tela pisca vazia e parece quebrada:

```tsx
if (carregando) return <p className="text-sm text-[#5f6f87]">Carregando…</p>;
if (erro) return <p className="text-sm text-[#c84a4a]">Não foi possível carregar: {erro}</p>;
if (barbearias.length === 0) return <p>Nenhuma barbearia cadastrada ainda.</p>;
```

> **Atenção aos nomes dos campos.** O mock usa `name`, `cnpj`, `responsavel`,
> `plano`, `status: "Ativo" | "Bloqueado"`. O backend devolve `name`, `email`,
> `phone`, `status: "ACTIVE" | "BLOCKED"`. Os `statusStyles` da tela são
> indexados pelo texto em português — ou você traduz na borda, ou ajusta as
> chaves. Traduzir num único ponto é mais fácil de manter:
> ```ts
> const rotuloStatus = { ACTIVE: "Ativo", BLOCKED: "Bloqueado" } as const;
> ```

---

## Passo 6 — Ligar as ações de escrita

Os modais que já existem têm o ponto da chamada marcado por comentário. Exemplo
real, o modal de confirmação de bloqueio na mesma tela:

```tsx
async function confirmarMudancaDeStatus() {
  const b = confirmando;
  setConfirmando(null);
  if (!b) return;

  try {
    const acao = b.status === "ACTIVE" ? "block" : "activate";
    await api(`/barbershops/${b.id}/${acao}`, { method: "PATCH" });

    // Relê a lista para a tabela refletir o novo status.
    const atualizada = await api<BarbershopSummary[]>("/barbershops");
    setBarbearias(atualizada);

    toast.mostrar(`${b.name} foi ${acao === "block" ? "bloqueada" : "reativada"}.`);
  } catch (e) {
    toast.mostrar(`Não foi possível concluir: ${(e as Error).message}`, "erro");
  }
}
```

Note o `try/catch`: hoje os handlers assumem que tudo dá certo, porque não há
rede envolvida. Com API, **toda escrita pode falhar** — e o `useToast` que já
existe aceita `"erro"` como segundo argumento justamente para isso.

Mesmo padrão para os formulários: `Nova barbearia` → `POST /barbershops`,
`Adicionar barbeiro` → `POST /barbers`, `Cadastrar cliente` → `POST /users`.

---

## Passo 7 — Proteger as rotas

Hoje qualquer um abre `/superadmin/dashboard` digitando a URL. Crie
`frontend/middleware.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // Middleware roda no servidor e NÃO enxerga localStorage.
  // Para funcionar, o token precisa estar num cookie.
  const token = req.cookies.get("varthex_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*", "/admin/:path*", "/barbeiro/:path*", "/clientes/:path*"],
};
```

**A pegadinha:** middleware do Next roda no servidor, onde `localStorage` não
existe. Se você seguiu o Passo 4 guardando em `localStorage`, o middleware
nunca verá o token e vai redirecionar todo mundo para o login. Duas saídas:

1. Gravar o token **também** num cookie no login (`document.cookie = ...`), ou
2. Migrar para cookie `httpOnly` (a opção segura mencionada no Passo 4).

Enquanto não fizer isso, deixe o middleware de fora e proteja no cliente — o
backend já valida o JWT em toda requisição, então o dado está seguro; o que
falta é só não mostrar a casca da tela para quem não deveria vê-la.

---

## Ordem sugerida

Uma tela por vez, verificando cada uma antes da próxima:

1. CORS (Passo 0) — sem isso nada anda
2. Login + `/auth/me`
3. Barbearias (leitura) — a mais simples
4. Barbearias (bloquear/ativar) — primeira escrita
5. Usuários e barbeiros
6. Proteção de rotas

**Não existe endpoint para tudo.** Agendamentos, serviços, estoque, comissões,
planos e assinaturas têm tela no frontend mas **não têm controller no backend**.
Essas telas continuam mock até você criar os endpoints — o que é uma decisão de
backend, não de integração.

---

## Quando algo der errado

| Sintoma | Causa provável |
|---|---|
| `blocked by CORS policy` | Passo 0 não feito, ou origem diferente de `localhost:3000` |
| `NEXT_PUBLIC_API_URL` é `undefined` | Faltou reiniciar o `npm run dev` |
| `401` em tudo, menos no login | Token não está indo no header, ou expirou |
| `403` mesmo logado | O papel do usuário não tem permissão na rota (veja `SecurityConfig`) |
| `Unexpected end of JSON input` | Resposta `204` sem corpo — tratado no Passo 2 |
| Campo chega `undefined` | Nome do campo no TS diverge do `record` Java |
| Tabela vazia sem erro | A API respondeu `[]` — provavelmente o banco não foi populado |

Para isolar se o problema é frontend ou backend, chame o endpoint direto:

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@varthex.com","password":"suasenha"}'
```

Se o `curl` funciona e o navegador não, o problema é CORS ou o header
`Authorization`. Se o `curl` também falha, é backend.

---

## Subindo os dois

O `docker-compose.yml` na raiz sobe o Postgres. Depois:

```bash
cd backend && ./mvnw spring-boot:run
```

```bash
cd frontend && npm run dev
```

`spring.jpa.hibernate.ddl-auto=validate` significa que o Hibernate **não cria
tabelas** — ele exige que o schema já exista e bata com as entidades. Se subir
com o banco vazio, a aplicação falha no boot. As migrations do Flyway em
`src/main/resources/db/` devem rodar antes.
