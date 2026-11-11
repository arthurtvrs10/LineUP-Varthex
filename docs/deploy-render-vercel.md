# Publicar LineUP: Render + Vercel (Asaas Sandbox)

Repositorio: https://github.com/arthurtvrs10/LineUP-Varthex

O frontend Next.js fica na Vercel. O backend Java e PostgreSQL ficam no Render.
O navegador usa a origem do frontend, e os rewrites encaminham para o backend
HTTPS. Nao use `http://backend:8080`, `localhost` ou a porta local 18080 na hospedagem.
O codigo atual nao tem cliente Redis nem dependencia Redis no Maven: nao e
necessario contratar Redis para esta versao.

## 1. Disponibilizar o codigo

Envie as alteracoes revisadas para o GitHub, incluindo `render.yaml`, os fontes
novos de verificacao de e-mail, a migracao V35, `application-render.properties`
e a configuracao Next. Os arquivos `.env` reais sao privados e ignorados pelo Git.
Nao publique credenciais no repositorio.

## 2. Reservar o projeto da Vercel

No painel https://vercel.com/new importe o repositorio e use:

| Campo | Valor |
| --- | --- |
| Framework | Next.js |
| Root Directory | `frontend` |
| Install Command | `npm ci` |
| Build Command | `npm run build` |
| Output Directory | Padrao do framework |
| Node.js | 24.x |

Escolha o nome do projeto e sua URL de producao HTTPS. Copie a URL efetivamente
atribuida; o nome de exemplo nao garante disponibilidade. A primeira publicacao
depende de preencher BACKEND_INTERNAL_URL depois de criar o backend.

## 3. Criar backend e banco no Render

No painel https://dashboard.render.com/ escolha New > Blueprint e conecte o
repositorio. Use o arquivo `render.yaml` na raiz, sem definir Root Directory no
Blueprint. Ele usa Dockerfile e contexto em `backend`, PostgreSQL 16 e a mesma
regiao para banco e backend. Revise os recursos e planos antes de criar.

O modelo usa Free para demonstracao: o banco gratuito expira em 30 dias e o
backend pode dormir apos inatividade. Nao use esse plano para dados permanentes.
Para uso continuo, escolha planos adequados no painel apos conferir os custos.
Uma nova instancia do banco comeca vazia: migracoes criam o schema, mas nao
transferem seus dados locais. O volume Docker local permanece intacto.

O Blueprint configura automaticamente:

| Variavel Render | Valor/origem |
| --- | --- |
| `SPRING_PROFILES_ACTIVE` | `render` |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | Referencias ao PostgreSQL criado |
| `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD` | Referencias ao PostgreSQL criado |
| `JWT_SIGNING_KEY` | Segredo gerado pelo Render; preserve entre deploys |
| `ASAAS_WEBHOOK_TOKEN` | Segredo gerado pelo Render; copie para o webhook Asaas |
| `ASAAS_ENVIRONMENT` | `sandbox` |
| `ASAAS_ENABLED` | `true` |
| `ASAAS_WORKER_ENABLED` | `true` |
| `ASAAS_SANDBOX_ACTIONS_ENABLED` | `true`, somente simulacao Sandbox |
| `TZ` | `America/Sao_Paulo` |
| `JAVA_TOOL_OPTIONS` | Limites proporcionais de heap definidos no Blueprint |
| `PORT` | Fornecida pelo Render; nao precisa cadastrar manualmente |

Preencha no formulario/painel do backend:

| Variavel Render | O que preencher |
| --- | --- |
| `FRONTEND_URL` | URL HTTPS de producao efetiva da Vercel, sem barra final |
| `RESEND_API_KEY` | Sua chave privada do Resend |
| `RESEND_FROM_EMAIL` | Remetente de um dominio verificado no Resend |
| `ASAAS_API_KEY` | Sua chave do Sandbox, nunca a de producao |

Cole os valores diretamente no painel, sem as aspas usadas no arquivo .env.
Nao adicione ASAAS_BASE_URL: o cliente usa https://api-sandbox.asaas.com/v3.
O remetente onboarding@resend.dev serve para testes restritos, nao para enviar
confirmacoes a todos os usuarios. Verifique um dominio seu para liberar envios.

O health check usa GET `/billing/plans`, publico e sem criar cobrancas.
Espere o backend ficar Live e abra `https://URL-REAL-DO-BACKEND/billing/plans`.
A resposta deve ser JSON. Nao configure `SPRING_DATASOURCE_URL` com uma URL
postgresql:// comum: o driver Java precisa de jdbc:postgresql://; o perfil render
ja monta a URL JDBC com os componentes do banco fornecidos pelo Blueprint.

## 4. Variaveis da Vercel e deploy

Em Settings > Environment Variables, para Production:

| Variavel Vercel | O que preencher |
| --- | --- |
| `BACKEND_INTERNAL_URL` | URL HTTPS real do backend Render, sem barra final |
| `NEXTAUTH_URL` | URL HTTPS de producao efetiva da Vercel |
| `NEXTAUTH_SECRET` | Segredo aleatorio privado e estavel, independente do JWT do backend |
| `GOOGLE_CLIENT_ID` | Opcional, se usar login Google |
| `GOOGLE_CLIENT_SECRET` | Opcional, se usar login Google; somente servidor |

Gere NEXTAUTH_SECRET com `openssl rand -base64 32` em um terminal e cole somente
no painel. Nao coloque Resend, Asaas, banco ou segredos em NEXT_PUBLIC_*.
NEXT_PUBLIC_API_URL nao precisa ser criada: as chamadas do navegador sao relativas.
Nao importe o .env inteiro da raiz ou do backend para a Vercel.

Publique/republique apos salvar as variaveis. BACKEND_INTERNAL_URL e usada no
build dos rewrites e na execucao do NextAuth: mudar o valor exige novo deploy.
Nao abra CORS com wildcard; o fluxo previsto usa o proxy na mesma origem.
Use Production como ambiente principal; previews precisam de configuracao propria
e nao devem ser ligados inadvertidamente ao banco usado por usuarios reais.

## 5. Integracoes opcionais

| Integracao | Configuracao adicional |
| --- | --- |
| Login Google | Mesmo GOOGLE_CLIENT_ID no backend e frontend; GOOGLE_CLIENT_SECRET so na Vercel. Cadastre no Google `https://URL-DO-FRONTEND/api/auth/callback/google`. |
| Google Calendar | No Render: GOOGLE_CALENDAR_CLIENT_ID, GOOGLE_CALENDAR_CLIENT_SECRET, GOOGLE_CALENDAR_ENCRYPTION_KEY e GOOGLE_CALENDAR_CALLBACK_URL=`https://URL-DO-BACKEND/integrations/google-calendar/callback`. Cadastre o callback no Google. |
| Supabase avatares | No Render: SUPABASE_URL, SUPABASE_SECRET_KEY e SUPABASE_STORAGE_BUCKET. Use bucket privado conforme o guia de integracoes. |
| WhatsApp | No Render: WHATSAPP_ENCRYPTION_KEY, WHATSAPP_APP_ID, WHATSAPP_APP_SECRET, WHATSAPP_CONFIG_ID, WHATSAPP_PUBLIC_URL e WHATSAPP_WEBHOOK_VERIFY_TOKEN. Preserve as chaves de criptografia existentes. |
| Asaas webhook | No Sandbox: URL `https://URL-DO-BACKEND/billing/webhook` e authToken igual a ASAAS_WEBHOOK_TOKEN do Render. |

Essas integracoes dependem de contas, dominios e autorizacoes reais: os arquivos
do projeto nao criam configuracoes nos provedores externos.

## 6. Conferir apos publicar

1. Backend Live e `/billing/plans` respondendo no Render.
2. A mesma rota `/billing/plans` pela URL Vercel retorna JSON pelo proxy.
3. Cadastrar usuario, receber confirmacao e abrir o link na URL de producao.
4. Confirmar e-mail, entrar e consultar os dados da conta.
5. Testar checkout e conciliacao somente no Asaas Sandbox.
6. Se houver 502/timeout depois de inatividade, espere o backend gratuito acordar
   e repita. O login tem timeout curto; para disponibilidade constante use um
   backend sem suspensao automatica.

Fontes oficiais: https://render.com/docs/blueprint-spec,
https://render.com/docs/web-services, https://render.com/docs/free,
https://vercel.com/docs/monorepos e https://vercel.com/docs/environment-variables.
