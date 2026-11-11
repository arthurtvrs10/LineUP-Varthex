# Configuracao local e Docker (somente Asaas Sandbox)

Nao substitua arquivos locais existentes pelos exemplos: complete apenas as entradas faltantes.

| Modelo | Copiar para | Uso |
| --- | --- | --- |
| `.env.example` | `.env` na raiz | Interpolacao do Compose: PostgreSQL. Nao e enviado inteiro aos containers. |
| `backend/.env.example` | `backend/.env` | Credenciais privadas e integracoes do backend. |
| `frontend/.env.local.example` | `frontend/.env.local` | NextAuth e configuracao do servidor Next. |

Use somente os tres arquivos da tabela. Nao crie `.env.local` na raiz nem `.env.local` no backend ou `.env` no frontend. Para executar Java fora do Docker, exporte as variaveis de backend/.env no processo; o Spring nao carrega esses arquivos automaticamente.

Preencha POSTGRES_PASSWORD com a senha do banco existente. Em volumes existentes, alterar POSTGRES_PASSWORD nao altera a senha armazenada no PostgreSQL. Nao remova volumes. O fallback postgres do Compose preserva a configuracao local anterior, mas nao deve ser usado em hospedagem publica.

No frontend preencha NEXTAUTH_SECRET com um segredo gerado localmente. Google e opcional: se usar login Google, preencha ID e secret no frontend e o mesmo ID no backend. Resend pertence ao backend. Os exemplos nao contem credenciais. `.env*` reais sao ignorados no Git e nos contextos de build.

## Rede e build

Abra http://localhost:3000. A API esta em http://localhost:18080. O navegador chama /billing, /auth etc. na origem do frontend. Next faz proxy para http://backend:8080 dentro do Compose. Por isso CORS nao precisa ser aberto: o navegador usa a mesma origem. Chamadas diretas do navegador a :8080 nao sao o fluxo suportado.

BACKEND_INTERNAL_URL e usado no build dos rewrites e no runtime das rotas NextAuth. Ao executar o Java diretamente fora do Docker, use http://localhost:8080 e refaca o build. NEXT_PUBLIC_API_URL nao define o destino de apiFetch; deixe vazio. Nenhum segredo deve ter prefixo NEXT_PUBLIC_. Valores publicos acessados estaticamente no Next sao fixados no build. NEXT_PUBLIC_DEMO_SWITCHER e lido na rota de configuracao do demo.

O Compose injeta somente backend/.env no backend, e frontend/.env.local no Next. Define explicitamente host Redis e conexao PostgreSQL internos. O frontend usa imagem standalone com usuario node. O backend mantem Java 21 e Maven existentes; cache Maven BuildKit e retries de download reduzem falhas transitorias. 'Premature end of Content-Length delimited message body' indica transferencia incompleta, nao comprova erro no codigo. Reexecute o build sem trocar versoes; retries nao garantem recuperacao de toda falha de rede.

## Asaas e checkout

Em backend/.env: ASAAS_ENABLED=true, ASAAS_ENVIRONMENT=sandbox, ASAAS_API_KEY com chave real do Sandbox. Coloque chave e token entre aspas simples para preservar o caractere $ na leitura do Compose. O cliente seleciona https://api-sandbox.asaas.com/v3 e envia access_token e User-Agent. ASAAS_BASE_URL nao e consumida e nao deve ser adicionada. Producao e rejeitada na inicializacao, inclusive fora do Compose; prefixo de chave de producao tambem e rejeitado.

ASAAS_WEBHOOK_TOKEN deve coincidir com o authToken configurado no webhook Asaas, enviado por ele no header asaas-access-token. Endpoint: /billing/webhook. Para receber eventos externos, precisa de URL publica HTTPS que encaminhe ao backend. Nunca use a chave API como token de webhook.

O aviso 'A contratacao online esta temporariamente indisponivel' vem de available=false no catalogo ou resumo: AsaasClient.configured exige enabled=true e chave nao vazia. Isso nao verifica autenticidade da chave; falhas de autenticacao do provedor podem surgir depois. Reinicie/recrie o backend depois de mudar env.

Pix pode ser testado localmente. ASAAS_SANDBOX_ACTIONS_ENABLED=true habilita confirmacao simulada de Pix no Sandbox; ASAAS_WORKER_ENABLED=true habilita conciliacao periodica e nao habilita o checkout sozinho. Os exemplos deixam simulacao desligada para ativacao consciente.

Cartao usa checkout hospedado, e o codigo exige FRONTEND_URL publica HTTPS para callbacks. Em localhost ele permanece desabilitado mesmo com chave correta; use um tunel HTTPS para o frontend, configure FRONTEND_URL no backend e NEXTAUTH_URL no frontend com essa mesma URL, e configure OAuth se necessario. O retorno do checkout nao confirma pagamento: conciliacao/eventos fazem isso. Use apenas dados de teste.

## Executar

Na raiz: `docker compose config --quiet`, depois `docker compose up -d --build`. Verifique `docker compose ps` e `docker compose logs --tail=100 backend frontend`. Nao use `down -v`. Rebuild do frontend e necessario para mudar destino dos rewrites.

Testes sem chamadas financeiras: `cd backend; ./mvnw.cmd -Dtest=AsaasClientSafetyTest,BillingIntegrationTest test`; no frontend `npm test`, `npm run typecheck`, `npm run build`. Testes de integracao usam a configuracao de testes do projeto.

## Verificacao desta revisao

- docker compose config --quiet: passou.
- Frontend: 19 testes passaram; npm run typecheck passou.
- Build frontend: nao concluido; download de fontes Google falhou (Archivo e Work Sans).
- AsaasClientSafetyTest: dois testes passaram na primeira execucao.
- BillingIntegrationTest: primeira execucao encontrou classes JWT antigas em target. Depois de clean, compilacao passou e contexto de testes iniciou sem aquele conflito, mas a execucao nao concluiu e foi interrompida. Integracao nao validada.
- Docker compose up -d --build: falhou por indisponibilidade do pipe dockerDesktopLinuxEngine, mesmo apos tentativa de iniciar Docker Desktop.
- Nenhum fluxo financeiro externo ou navegacao ponta a ponta foi validado. Portas 3000 e 8080 nao estavam atendendo no teste de conectividade.

## Porta do backend no Windows

O Compose publica o backend em http://localhost:18080 para evitar o bloqueio de bind na porta 8080 do host. Dentro do Docker, o backend continua em http://backend:8080. O frontend permanece em http://localhost:3000. Nao altere BACKEND_INTERNAL_URL para a porta externa.
