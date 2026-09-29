# Integrações do LineUp — implantação e operação SaaS

Revisão: 28/09/2026. Inventário conferido na implementação atual. Todos os domínios, IDs e valores abaixo são fictícios. Este guia é interno, versionado no Git e destinado à consulta local; não deve ser publicado junto ao aplicativo.

## 1. Responsabilidades e disponibilidade

| Serviço | Estado e necessidade | Operador da plataforma | Cada barbearia |
|---|---|---|---|
| PostgreSQL | Implementado; obrigatório | Provisiona banco, usuário, senha, backups e rede | Não recebe credenciais do banco |
| Sessões NextAuth | Implementado; obrigatório | Configura segredo e URL do aplicativo | Apenas faz login |
| Resend | Implementado; opcional para iniciar localmente, necessário para entregar recuperação de senha e notificações por e-mail | Cria conta, verifica domínio e configura chave | Não cadastra chave Resend; usa remetente da plataforma |
| Login Google | Implementado; opcional | Cria projeto e cliente OAuth do LineUp | Usuário autoriza seu próprio login; não cria projeto Google |
| WhatsApp Business oficial | Implementado; opcional | Configura criptografia, endereço público e aplicativo Meta para conexão guiada | Autoriza sua própria conta empresarial e número; conexão isolada por estabelecimento |
| Google Calendar | Previsto, sem integração executável | Futuramente habilitará API e cliente OAuth | Futuramente autorizará sua conta e escolherá agenda |
| Avaliações Google | Previsto na documentação de domínio | Não há integração Google Business Profile implementada | Não confundir com avaliações internas do LineUp |
| Redis | Provisionado no Compose, sem uso identificado no código da aplicação | Mantém serviço exigido pelo Compose atual | Nenhuma configuração |
| Supabase Storage Free | Implementado para novas fotos de perfil; ativação depende das credenciais | Cria projeto gratuito e bucket privado; configura chave secreta | Usa o upload do perfil; não cria conta Supabase |
| Pagamentos externos, armazenamento S3 e Evolution API | Nenhum conector ativo identificado | Não há chaves a configurar | Cadastros financeiros internos não representam cobrança em gateway |

As chaves Resend, segredo OAuth Google, segredo de sessão e chave de criptografia são da plataforma. Não devem aparecer em formulários para barbearias. No WhatsApp, a conexão manual existente é uma alternativa técnica: recebe credenciais do aplicativo Meta próprio do estabelecimento. Nunca fornecer o segredo do aplicativo Meta da plataforma para que o cliente o cole nesse formulário.

## 2. Onde configurar e ordem de implantação

1. Prepare PostgreSQL e o ambiente de aplicação; valide login por senha.
2. Configure URLs e segredo de sessão.
3. Configure Resend e teste recuperação de senha.
4. Se desejado, habilite login Google.
5. Se contratado, habilite WhatsApp e conecte uma barbearia de homologação.
6. Execute os testes da seção 9 antes de liberar o ambiente.

### Desenvolvimento com Docker Compose

Na raiz do repositório, copie `frontend/.env.local.example` para `frontend/.env.local` **somente se o destino ainda não existir**. Edite o arquivo existente quando houver configuração. Crie `backend/.env.local` para configurações exclusivas do backend; o modelo WhatsApp está em `backend/whatsapp.env.example`.

O Compose atual injeta `frontend/.env.local` nos dois serviços e depois `backend/.env.local` no backend. Assim, o segundo arquivo prevalece em valores repetidos no backend. As entradas `environment` do Compose prevalecem sobre ambos. O `.env` da raiz serve à interpolação do Compose e não injeta automaticamente todas as variáveis nos containers. `backend/.env` não está ligado ao Compose atual.

Coloque Resend, `FRONTEND_URL` e WhatsApp em `backend/.env.local`; remova eventuais cópias antigas de Resend do arquivo frontend depois de migrar os valores. O backend precisa apenas do Google Client ID, embora o Compose atual também injete os demais valores do arquivo frontend. Em produção, separe explicitamente os ambientes de cada serviço.

Exemplo de `frontend/.env.local` para desenvolvimento:

```dotenv
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=SUBSTITUIR_POR_SEGREDO_ALEATORIO
BACKEND_INTERNAL_URL=http://localhost:8080
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_DEMO_SWITCHER=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

No Docker, o Compose substitui os dois endereços do backend por `http://backend:8080`. Não use esse hostname para acessar o aplicativo no navegador. Use `http://localhost:3000` de forma consistente durante login e callbacks.

Exemplo de `backend/.env.local`:

```dotenv
FRONTEND_URL=http://localhost:3000
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
WHATSAPP_ENCRYPTION_KEY=
WHATSAPP_GRAPH_VERSION=v23.0
WHATSAPP_PUBLIC_URL=
WHATSAPP_APP_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_CONFIG_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_WORKER_ENABLED=false
```

Campos vazios deixam integrações opcionais indisponíveis; não são credenciais funcionais. Gere valores distintos para sessão, criptografia WhatsApp e verificação do webhook. Com Node instalado, `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"` gera um valor aleatório. Execute em terminal privado e armazene em gerenciador de segredos; não copie a saída para documentação ou chamados.

Depois de editar variáveis de execução:

```sh
docker compose up -d --force-recreate backend frontend
docker compose ps
```

Um simples `docker compose restart` não injeta valores novos do arquivo. Quando mudar o destino dos rewrites, atualize também `build.args.BACKEND_INTERNAL_URL` do frontend e reconstrua com `docker compose up -d --build frontend`. O destino do proxy é resolvido no build.

### Execução fora do Docker

Next.js lê `frontend/.env.local` ao iniciar na pasta frontend. Spring Boot **não carrega automaticamente** `backend/.env.local`: configure as variáveis no ambiente do processo Java ou na configuração de execução da IDE. Use PostgreSQL em `localhost:5432`. Reinicie o processo correspondente após alterações. Não execute `source` em arquivos recebidos de terceiros.

### Produção

Use contas/projetos, banco e credenciais separados de desenvolvimento. Configure os valores no gerenciador de segredos da hospedagem, com acesso apenas pelo serviço responsável. O Compose fornecido é local: publica banco/Redis e fixa credenciais de desenvolvimento; não deve ser exposto como está.

Exemplo de endereçamento: landing `https://example.com`, app `https://app.example.com`, blog `https://blog.example.com`. Configure `NEXTAUTH_URL` no frontend e `FRONTEND_URL` no backend como `https://app.example.com`, sem barra final. Domínio de envio sugerido: `mail.example.com`. `WHATSAPP_PUBLIC_URL=https://app.example.com` funciona quando o proxy desse endereço encaminha os webhooks ao backend; uma origem dedicada de API também é possível. Nunca use a landing ou o blog como callback sem implementar o encaminhamento necessário.

Mantenha HTTPS, saída de rede para Resend/Google/Meta, banco e Redis em rede privada, backups e horário do servidor sincronizado. Configure as credenciais reais do banco também no serviço PostgreSQL; definir a variável apenas no backend não altera a senha do usuário existente. Em volumes já inicializados, mudar `POSTGRES_PASSWORD` também não troca a senha do banco.

**Pendência para produção identificada:** a assinatura JWT do backend ainda usa um segredo de desenvolvimento fixo em código. Não existe variável `JWT_SECRET` implementada. A equipe precisa externalizar esse segredo, definir rotação e invalidar sessões antes da publicação; `NEXTAUTH_SECRET` não substitui a chave JWT do backend. Este guia documenta a situação atual, sem afirmar que essa pendência está resolvida.

## 3. Inventário exato de variáveis

F = processo frontend; B = processo backend; DB = container PostgreSQL. No modo local, use os arquivos descritos acima; em produção, use o ambiente do serviço indicado.

| Variável | Destino | Obrigatoriedade / valor |
|---|---|---|
| `SPRING_DATASOURCE_URL` | B | Obrigatória para banco diferente do padrão; padrão `jdbc:postgresql://localhost:5432/varthex_barber`; Compose substitui por host `postgres` |
| `SPRING_DATASOURCE_USERNAME` | B | Usuário do banco; padrão local `postgres`, substituído pelo Compose |
| `SPRING_DATASOURCE_PASSWORD` | B | Senha do banco; padrão local de desenvolvimento, substituído pelo Compose |
| `POSTGRES_USER` | DB | Nome do usuário inicial; definido no Compose |
| `POSTGRES_PASSWORD` | DB | Senha de inicialização; definida no Compose; substituir na implantação |
| `POSTGRES_DB` | DB | Banco inicial `varthex_barber`; definido no Compose |
| `NEXTAUTH_SECRET` | F | Obrigatória para sessão segura e estável; valor aleatório exclusivo do ambiente |
| `NEXTAUTH_URL` | F | URL canônica externa do app; local `http://localhost:3000` |
| `BACKEND_INTERNAL_URL` | F e build F | Destino interno da API; local `http://localhost:8080`, Compose `http://backend:8080` |
| `NEXT_PUBLIC_API_URL` | F | Fallback do acesso de servidor à API; não contém segredo; rewrites usam `BACKEND_INTERNAL_URL` |
| `NEXT_PUBLIC_DEMO_SWITCHER` | F | Opcional, `false` em produção; seletor de demonstração, não concede acesso |
| `GOOGLE_CLIENT_ID` | F e B | Obrigatória somente para login Google; exatamente o mesmo ID nos dois serviços |
| `GOOGLE_CLIENT_SECRET` | F | Obrigatória somente para login Google; segredo do cliente OAuth |
| `RESEND_API_KEY` | B | Necessária para e-mails reais; vazia não envia |
| `RESEND_FROM_EMAIL` | B | Remetente autorizado; padrão `onboarding@resend.dev`; produção `LineUp <nao-responda@mail.example.com>` |
| `FRONTEND_URL` | B | Origem dos links de recuperação; padrão `http://localhost:3000` |
| `WHATSAPP_ENCRYPTION_KEY` | B | Obrigatória para armazenar credenciais WhatsApp; 32 bytes aleatórios em Base64; preservar em backup |
| `WHATSAPP_GRAPH_VERSION` | B | Versão Graph; padrão atual do projeto `v23.0`; conferir suporte na Meta antes de alterar |
| `WHATSAPP_PUBLIC_URL` | B | Origem HTTPS, sem barra final nem caminho; necessária para receber webhooks |
| `WHATSAPP_APP_ID` | B | ID público do aplicativo Meta da plataforma; necessário para conexão guiada |
| `WHATSAPP_APP_SECRET` | B | Segredo Meta da plataforma; necessário para conexão guiada |
| `WHATSAPP_CONFIG_ID` | B | ID da configuração Facebook Login for Business / Embedded Signup |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | B | Segredo aleatório escolhido pelo operador para verificação do webhook compartilhado |
| `WHATSAPP_WORKER_ENABLED` | B | `true` por padrão; `false` em testes sem envio; habilitar para processar fila/automações |
| `NODE_ENV` | F/runtime | Definido pelo runtime/build; produção usa `production`; não é credencial |
| `SUPABASE_URL` | B | Origem HTTPS do projeto, no formato `https://seu-projeto.supabase.co` |
| `SUPABASE_SECRET_KEY` | B | Chave secreta da plataforma, `sb_secret_...`; nunca enviar ao frontend |
| `SUPABASE_STORAGE_BUCKET` | B | Bucket privado de fotos; padrão `lineup-avatars` |

Não há variáveis ativas de Google Calendar, Redis, Stripe, Mercado Pago ou Evolution API. Não criar nomes presumidos de variáveis esperando que ativem esses serviços. Parâmetros gerais de Spring/Node não utilizados especificamente pelo projeto estão fora deste inventário.

## 4. Resend — e-mails da plataforma

1. O operador cria uma conta no [Resend](https://resend.com) e mantém acesso administrativo da equipe.
2. Em Domains, adicione `mail.example.com` substituindo pelo domínio real. Copie os registros de verificação e envio apresentados no painel para o provedor DNS. Use os nomes, tipos e valores exatos; não invente registros SPF/DKIM nem altere os MX usados pelo e-mail corporativo. Aguarde a verificação. Um subdomínio separa a reputação de envio. Consulte [domínios verificados](https://resend.com/docs/dashboard/domains/introduction).
3. Em API Keys, crie uma chave por ambiente, com permissão de envio e restrição ao domínio quando disponível. Guarde o valor no momento da criação. Configure `RESEND_API_KEY` e `RESEND_FROM_EMAIL` somente no backend. Veja [gestão de chaves](https://resend.com/docs/dashboard/api-keys/introduction).
4. Configure `FRONTEND_URL` com a origem do aplicativo. Não há OAuth, callback ou webhook Resend implementado; o envio é feito pela API HTTPS. Não há variáveis SMTP.
5. Recrie o backend. Na página `/esqueceu-senha`, solicite recuperação para um usuário de teste existente, cujo e-mail você controle. Confira o envio no painel Resend e a mensagem na caixa postal. O link deve abrir `/esqueceu-senha?token=...` no ambiente correto. Troque a senha, faça login e confirme que reutilizar o link falha. O token expira em 30 minutos.

Sem domínio próprio, use o remetente de teste `onboarding@resend.dev` somente dentro das restrições da conta Resend, para o e-mail autorizado de teste. Não serve para clientes reais. Sem chave, o sistema registra que não enviou; a resposta genérica de recuperação não comprova entrega. O código não tem fila/retry de e-mail nem acompanhamento de entrega por webhook; aceite da API não equivale a chegada na caixa postal.

Erros: chave inválida → substituir `RESEND_API_KEY`; domínio/remetente não autorizado → conferir verificação e correspondência do domínio; destinatário bloqueado em teste → usar conta autorizada ou domínio próprio; link aponta para localhost → corrigir `FRONTEND_URL`; mensagem não chegou → verificar eventos Resend, spam e limites da conta, sem expor o token de recuperação em chamados.

Rotação: crie nova chave, atualize o backend, recrie, teste um envio controlado e remova a chave antiga no Resend. Em vazamento, revogue imediatamente e aceite a interrupção até substituir. Para trocar remetente, verifique primeiro o novo domínio e só depois altere `RESEND_FROM_EMAIL`.

## 5. Login com Google — identidade do usuário

1. O operador acessa [Google Cloud Console](https://console.cloud.google.com), cria um projeto para o ambiente e abre Google Auth Platform. Configure Branding (nome LineUp, suporte, contato), Audience e Data Access. Para SaaS aberto a contas externas, configure público externo; durante testes, cadastre os usuários permitidos.
2. Crie um cliente OAuth do tipo aplicação Web. Para desenvolvimento, autorize origem `http://localhost:3000` e retorno `http://localhost:3000/api/auth/callback/google`. Para produção, use origem `https://app.example.com` e retorno `https://app.example.com/api/auth/callback/google`. Os valores devem corresponder exatamente ao endereço usado no navegador. Veja [configuração do provedor NextAuth](https://next-auth.js.org/providers/google).
3. Configure `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` no frontend. Configure o mesmo `GOOGLE_CLIENT_ID` no backend. O backend valida assinatura, audiência e informações do ID token. Configure também `NEXTAUTH_URL` e `NEXTAUTH_SECRET` e recrie os dois serviços.
4. Os escopos de login são `openid email profile`. Não habilite permissões de Calendar apenas para login. O cliente OAuth pertence ao LineUp; cada pessoa só autoriza sua identidade. A configuração de OAuth e URLs é explicada na [documentação Google OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).
5. Em janela privada, abra `/login`, escolha Entrar com Google, autorize com um usuário de teste e confirme retorno ao LineUp. Confira nome, e-mail e portal permitido. Saia e entre novamente; não deve ser criada uma segunda conta apenas por repetir o login. Teste também e-mail/senha para uma conta com senha cadastrada.

Para produção, configure domínios, páginas de privacidade/termos e publicação/verificação exigidas pelo painel Google. Não deixe o SaaS dependente de uma lista privada de testadores. Não há necessidade de cada barbearia criar um projeto Google.

Erros: `redirect_uri_mismatch` → conferir protocolo, host, porta e caminho completo do callback; `invalid_client` → conferir par ID/secret e ambiente; acesso negado → conferir usuário de teste, audiência e políticas Workspace; retorno ao login/validação social falha → conferir mesmo Client ID no backend, conectividade com certificados Google, horário do servidor e acesso frontend→backend. Alternar `localhost` e `127.0.0.1` pode quebrar cookies e retorno.

Rotação: crie/substitua o segredo no cliente OAuth do Console, atualize o frontend, recrie e valide login antes de desativar o anterior quando o provedor permitir sobreposição. Se trocar o Client ID, atualize frontend e backend juntos. O usuário pode revogar acesso ao LineUp nas conexões de terceiros da Conta Google. Isso não apaga sua conta local nem garante encerramento imediato de sessões existentes. Trocar `NEXTAUTH_SECRET` encerra a validade das sessões NextAuth antigas; planeje novo login.

## 6. Google Calendar — previsto, ainda não configurável

O projeto não implementa cliente Calendar, callback de autorização, armazenamento de refresh token, seleção de agenda nem sincronização. Não existem variáveis Calendar reconhecidas. Habilitar a API no Google Cloud ou preencher o login Google não ativa sincronização.

Preparação futura do operador: no projeto Google da plataforma, habilitar Google Calendar API, definir um fluxo OAuth separado do login e cadastrar a URL de retorno **quando ela for implementada e documentada**. Não há callback Calendar utilizável nesta versão.

Fluxo SaaS previsto: administrador/barbeiro escolhe Conectar Google Calendar, autoriza sua própria conta e seleciona a agenda. O operador guarda o segredo OAuth da plataforma; cada conexão guarda tokens segregados por barbearia e usuário, criptografados no backend. A pessoa não cola Client Secret ou chave de serviço.

Para sincronização em segundo plano será necessário acesso offline e renovação de tokens. O escopo deve ser o mínimo para a função: por exemplo, `https://www.googleapis.com/auth/calendar.events` permite operações em eventos; a escolha final depende das agendas e funções implementadas. Consulte [escopos Calendar](https://developers.google.com/workspace/calendar/api/auth) e [OAuth para aplicações Web](https://developers.google.com/identity/protocols/oauth2/web-server).

Aceite futuro: conectar conta A à barbearia A, selecionar agenda, criar/remarcar/cancelar atendimento e conferir o evento correspondente sem duplicatas; comprovar que barbearia B não vê tokens ou eventos de A; testar expiração/renovação e revogação na Conta Google. Falha `invalid_grant` deverá pedir nova autorização; permissões insuficientes deverão orientar reconexão. **Esses testes ainda não podem ser executados no LineUp atual.**

## 7. WhatsApp Business oficial — plataforma e estabelecimento

### Operador: infraestrutura comum

Configure `WHATSAPP_ENCRYPTION_KEY` antes de salvar qualquer conexão. Mantenha essa chave estável e em backup separado do banco. Configure `WHATSAPP_PUBLIC_URL` com origem HTTPS acessível pela Meta e proxy das rotas `/integrations/whatsapp/webhook`. Localhost sozinho não recebe eventos. Em desenvolvimento, testes reais exigem um endpoint HTTPS de homologação ou túnel explicitamente configurado para a aplicação; nunca exponha o servidor da documentação local.

Para conexão guiada, crie a conta de desenvolvedor e aplicativo empresarial da plataforma no [Meta for Developers](https://developers.facebook.com/), configure WhatsApp e Facebook Login for Business / Embedded Signup, portfólio empresarial e os requisitos de publicação/revisão. Copie App ID, App Secret e Configuration ID para `WHATSAPP_APP_ID`, `WHATSAPP_APP_SECRET` e `WHATSAPP_CONFIG_ID`. Cadastre o domínio e origem HTTPS reais do aplicativo na configuração de login da Meta. O fluxo atual usa janela do SDK e troca do código no backend; não existe uma rota fictícia `/callback/meta` para cadastrar.

Solicite as permissões aplicáveis a gerenciamento e envio: `whatsapp_business_management`, `whatsapp_business_messaging` e, quando exigido pelo fluxo de onboarding, `business_management`. Para atender empresas externas, conclua a revisão e o nível de acesso exigido pela Meta; configurar variáveis não concede aprovação. Referência oficial: [Get Started da Meta](https://www.postman.com/meta/whatsapp-business-platform/folder/1bczlus/get-started).

No webhook compartilhado, use `https://app.example.com/integrations/whatsapp/webhook` e o valor de `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, escolhido pelo operador. Assine o campo `messages`. O segredo do aplicativo valida as assinaturas dos eventos; o token de verificação não é token de envio. Reinicie/recrie o backend após alterar variáveis.

### Barbearia: conectar a própria conta

1. Entre como administrador e abra Configurações → WhatsApp Business.
2. Se Continuar com a Meta estiver disponível, autorize a conta empresarial e o número que pertencem ao estabelecimento. O LineUp usa as chaves da plataforma sem mostrá-las ao gerente.
3. Valide o número e confira o nome/telefone no resumo. A validação não envia mensagem.
4. Conclua a etapa de atualizações e confira a verificação do webhook. Sem endereço HTTPS, a pendência deve ser resolvida pelo operador.
5. Em CRM & WhatsApp, sincronize modelos aprovados, registre consentimento e prepare o teste. Modelos com mídia/botões não são suportados pelo incremento atual.

Alternativa manual: um responsável técnico com aplicativo Meta próprio prepara WhatsApp/Cloud API, conta WABA e número registrado. No painel Meta obtenha WABA ID e Phone Number ID (não é o telefone com DDD), token de acesso autorizado aos ativos e App Secret. Para uso contínuo, configure token adequado ao ambiente e permissões, evitando depender de token temporário de desenvolvimento. Informe esses quatro campos na opção de conexão manual do LineUp; não são variáveis globais de ambiente.

Localização das credenciais: no aplicativo Meta, a área WhatsApp → configuração da API apresenta os IDs da conta e do número e o token de teste. O segredo fica nas configurações básicas do aplicativo. Para um token de usuário do sistema, o administrador do portfólio empresarial deve criar/selecionar esse usuário em Configurações do negócio → Usuários do sistema, atribuir os ativos WhatsApp e gerar um token para o aplicativo com as permissões necessárias. Os nomes dos menus podem variar conforme a conta. Não confunda o Business/Portfolio ID com o WABA ID. Registro do número, aprovação do nome, forma de pagamento e elegibilidade são concluídos na Meta, não pelo formulário LineUp.

Ao salvar, copie imediatamente o token de verificação exibido. Configure no aplicativo Meta a URL **exata mostrada pelo LineUp**, no formato `https://app.example.com/integrations/whatsapp/webhook/ID_DA_BARBEARIA`, e esse token; assine `messages` e garanta a assinatura do aplicativo na WABA. Salvar credenciais novamente gera outro token de verificação e exige nova verificação. O token não é recuperável em texto após sair; salvar novamente permite gerar outro. Não reutilize uma conexão entre barbearias.

### Testar e resolver falhas

Use número e destinatário de homologação autorizado. Com `WHATSAPP_WORKER_ENABLED=true`, envie um único modelo aprovado pelo formulário de teste, preenchendo variáveis e ciência dos custos. Confira fila, envio e entrega no histórico; responda pelo telefone destinatário e confirme recebimento no CRM. O teste real pode gerar cobrança Meta. Se o worker estiver desabilitado, permanecer na fila não comprova falha da Meta. A verificação do webhook sozinha não prova entrega; confirme um evento real.

Erros: conexão guiada indisponível → verificar todas as seis configurações necessárias (criptografia, App ID, App Secret, Config ID, origem HTTPS e token compartilhado); `TOKEN_INVALID` → renovar autorização; `NUMBER_NOT_FOUND` → conferir associação WABA/número e acesso aos ativos; webhook sem eventos → conferir URL pública, assinatura `messages`, token de verificação e App Secret correspondente; fila parada → conferir worker, modelo, consentimento e janela de envio; `UNKNOWN` → conferir histórico/eventos antes de reenviar para não duplicar cobrança. A API oficial não usa QR Code de WhatsApp Web nem Evolution API.

Rotação: para token manual do mesmo número, substitua o campo, salve, revalide número e webhook e só então revogue o antigo quando possível. Para trocar conta/número, desconecte e conecte novamente. Desconectar pausa automações e cancela fila pendente, mas não revoga automaticamente permissões no provedor; revogue também no gerenciamento empresarial Meta. Envios em andamento podem terminar.

Trocar `WHATSAPP_APP_SECRET` exige coordenar o segredo usado nas conexões já armazenadas, inclusive as guiadas; mudar a variável não recriptografa nem atualiza registros existentes. Planeje reconexão/migração. **Nunca substituir `WHATSAPP_ENCRYPTION_KEY` isoladamente:** perde-se a leitura das credenciais anteriores. Rotação dessa chave exige migração assistida ou reconexão de todas as barbearias.

## 8. Banco, Redis e serviços não implementados

PostgreSQL: o operador pode usar conta em provedor gerenciado ou container local; crie banco e usuário com acesso às tabelas e migrations do LineUp. Configure as três variáveis `SPRING_DATASOURCE_*`, usando o modo TLS indicado pelo provedor em produção. As migrations Flyway são executadas ao iniciar e Hibernate valida o esquema. Não há callback externo.

Teste local: `docker compose exec postgres pg_isready -U postgres -d varthex_barber`; confirme backend iniciado sem erros de migration e faça login/crie um registro de teste pela aplicação. `connection refused` aponta para rede/host/porta; falha de autenticação aponta para usuário/senha; falha Flyway exige analisar a migration, sem apagar tabelas ou volumes. Rotação exige alterar a senha do papel PostgreSQL no banco e atualizar backend de forma coordenada. Faça backup antes de manutenção.

Redis: `docker compose exec redis redis-cli ping` deve retornar `PONG`. Isso testa o container, não uma funcionalidade do LineUp. Não foi identificado cliente Redis ou variável de conexão na aplicação; o Compose aguarda o healthcheck desse serviço. Não há tutorial de autenticação Redis da aplicação a executar nesta versão.

Avaliações internas são vinculadas aos atendimentos no próprio LineUp; não publicam avaliações no Google. Não há conectores ativos de gateway de pagamentos, storage externo ou Evolution API. Não contratar ou cadastrar chaves desses serviços para tentar ativar funcionalidades previstas em documentos de produto.

## 9. Checklist de homologação e manutenção

- [ ] Ambiente identificado: desenvolvimento, homologação ou produção; domínios e contas correspondem a ele.
- [ ] Banco acessível, migrations concluídas e login por senha funcionando.
- [ ] `NEXTAUTH_SECRET` exclusivo; pendência da chave JWT do backend resolvida antes de produção.
- [ ] Resend: domínio verificado, envio recebido, link aponta para o app correto e só funciona uma vez.
- [ ] Google: usuário autorizado entra e retorna corretamente; login não promete acesso ao Calendar.
- [ ] WhatsApp: número correto, webhook verificado, envio e resposta controlados confirmados; isolamento entre duas barbearias validado.
- [ ] Google Calendar e demais recursos previstos registrados como indisponíveis, sem falso teste aprovado.
- [ ] Segredos fora do Git e do navegador; nenhuma variável `NEXT_PUBLIC_*` contém segredo.
- [ ] Responsável, data de criação/rotação e procedimento de revogação registrados no gerenciador de segredos.
- [ ] Backups de banco e chave de criptografia recuperáveis; documentação permanece local.

Em incidentes, registre serviço, ambiente, horário e código de erro. Remova tokens, cookies, links de recuperação, números e dados pessoais antes de anexar logs. Não use `docker compose config` ou despejo de ambiente em chamados: eles podem revelar valores resolvidos. Nenhuma credencial real foi necessária para produzir este guia; a homologação externa deve ser realizada pelo responsável com contas autorizadas.

### Rastreabilidade do levantamento

Verificados: `backend/src/main/resources/application.properties`, `docker-compose.yml`, exemplos de ambiente, configuração NextAuth, serviços de e-mail/autenticação, módulo WhatsApp, dependências e referências de integrações do frontend/backend. Documentos conceituais de domínio não foram tratados como prova de funcionalidade implementada. Guia técnico complementar: `docs/06-frontend-ux/crm-whatsapp.md`.

## 10. Supabase Storage Free — fotos de perfil

Decisão: começar no plano Free para evitar mensalidade adicional. O projeto usa somente Storage; autenticação e banco de negócio continuam no LineUp. O Free inclui 1 GB de arquivos e franquias separadas de 5 GB de tráfego com cache e 5 GB sem cache. Esses limites não significam uso ilimitado, e o plano gratuito pode sofrer pausas conforme a política do provedor. Confira o painel de uso e a [tabela oficial](https://supabase.com/pricing) antes de liberar clientes reais. Não foi contratado plano pago ou criado projeto automaticamente.

### Configuração pelo operador

1. Crie sua conta em [Supabase](https://supabase.com/dashboard), uma organização no plano Free e um projeto. Escolha uma região adequada ao backend. Guarde a senha de banco solicitada pelo painel; ela não é usada como chave Storage do LineUp.
2. Abra Storage e crie o bucket `lineup-avatars`. Mantenha **Public bucket desativado**, limite cada arquivo a **262144 bytes (256 KB)** e permita somente `image/jpeg`. Não crie políticas de acesso anônimo ou escrita pública.
3. Nas configurações de API/Connect, copie a Project URL. Na área de API Keys, crie uma **secret key** (`sb_secret_...`) para o backend. Não use publishable/anon key neste conector. A chave secreta tem acesso privilegiado: a autorização de usuários e barbearias é feita pelo LineUp antes das operações. Veja [chaves Supabase](https://supabase.com/docs/guides/getting-started/api-keys).
4. Copie os nomes de `backend/supabase.env.example` para `backend/.env.local` sem sobrescrever os demais segredos. Em produção, configure no ambiente do backend. Não coloque a chave em `frontend/.env.local`, variáveis `NEXT_PUBLIC_*`, Git ou chat.

```dotenv
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SECRET_KEY=SUBSTITUIR_PELA_SECRET_KEY
SUPABASE_STORAGE_BUCKET=lineup-avatars
```

5. Execute `docker compose up -d --force-recreate backend`. Não há callback OAuth, webhook ou credenciais por barbearia. O operador mantém uma conta/bucket da plataforma.

### Funcionamento e economia

Ao salvar o perfil, a imagem é comprimida no navegador em JPEG de até 200 px. O backend aceita no máximo 256 KB e 512 × 512 px, valida o conteúdo e usa o usuário autenticado como dono do objeto. O nome é gerado pelo servidor: `avatars/ID_DO_USUARIO/ID_ALEATORIO.jpg`. O cliente não escolhe caminhos de outro usuário.

O banco guarda uma referência ao objeto; as respostas autorizadas geram uma URL de leitura válida por uma hora. O bucket permanece privado. Quem obtiver uma URL assinada poderá acessá-la até expirar; não a compartilhe. Depois da expiração, recarregue a página para obter outra. As consultas de clientes/profissionais mantêm as regras de acesso da barbearia; a foto de uma conta de cliente é global, assim como seu perfil. [Buckets privados](https://supabase.com/docs/guides/storage/buckets/fundamentals).

A foto anterior é excluída após a confirmação da gravação no banco; se a transação for revertida, o novo objeto é removido. Falhas de limpeza são registradas para revisão manual e não há fila automática de repetição. Mantenha um acompanhamento de objetos órfãos para economizar espaço. Fotos antigas em Base64 continuam funcionando e só são substituídas ao enviar uma nova imagem; não há migração em massa automática. Logos, anexos e documentos não foram migrados neste incremento.

Use o painel Storage/Usage para acompanhar espaço e tráfego semanalmente. O limite de 256 KB por upload não é uma cota global: a franquia total é controlada pelo Supabase. Ao se aproximar do limite, remova objetos órfãos e reveja o consumo antes de decidir por qualquer upgrade. Não foram ativadas transformações de imagem pagas.

### Testes e erros

Com uma conta de teste, abra Configurações/Perfil, selecione uma foto e clique em salvar. Recarregue: a imagem deve aparecer e o bucket deve conter um objeto JPEG. Substitua a imagem e confira que a anterior foi removida; remova a foto e confirme ausência do objeto e retorno às iniciais. Teste outra conta: ela não pode substituir a foto da primeira usando `/users/me` ou um caminho enviado manualmente. Um arquivo SVG, conteúdo falso ou imagem acima dos limites deve ser recusado pelo backend.

Sem variáveis, novas fotos retornam orientação para configurar o Storage; o perfil pode ser editado mantendo a foto existente. Erro de credenciais → conferir Project URL e secret key do mesmo projeto; bucket inexistente → conferir nome exato; erro de cota → conferir Usage e plano; imagem ausente após uma hora → recarregar; indisponibilidade do serviço → conferir status/pausa do projeto. Falha de leitura apresenta as iniciais sem expor a chave ou detalhes internos. Testes automatizados usam respostas HTTP simuladas; validação real exige seu projeto configurado.

### Rotação e revogação

Crie outra secret key no Supabase, atualize `SUPABASE_SECRET_KEY`, recrie o backend e teste upload/leitura/exclusão antes de revogar a anterior. Em vazamento, revogue imediatamente. Trocar projeto ou bucket exige copiar os objetos preservando os caminhos antes de mudar as variáveis; não é feito automaticamente. As barbearias não recebem nem revogam a chave da plataforma.
