# Testar a contratação online no Asaas Sandbox

O backend já suporta sandbox. Este roteiro não ativa cobrança nem altera credenciais. Para executar o fluxo completo, é necessária uma conta e uma chave de API do Asaas Sandbox.

## Configuração local

### Assistente recomendado (Windows / Docker)

1. Crie uma conta separada em https://sandbox.asaas.com/ (a conta de produção não serve para estes testes).
2. No menu do usuário, abra **Integrações → Chaves API → Gerar chave de API**. Copie a chave, exibida uma única vez.
3. Na raiz do LineUp, execute:

```powershell
./scripts/configure-asaas-sandbox.ps1
```

O assistente solicita a chave com entrada oculta, aceita somente chave sandbox, valida a conexão sem criar cobrança, gera o segredo do webhook e salva em `backend/.env`. As aspas simples preservam o `$` da chave ao carregar o Docker Compose. Não coloque a chave em argumentos de terminal, mensagens ou no frontend.

4. Execute `docker compose up -d --no-deps --force-recreate backend` para carregar a configuração. Se o código ainda não foi compilado, acrescente `--build` e inclua também `frontend`.
5. Confira sem exibir segredos:

```powershell
./scripts/configure-asaas-sandbox.ps1 -CheckOnly
./scripts/configure-asaas-sandbox.ps1 -TestConnection
```

O primeiro comando apenas lê a configuração local; o segundo valida a chave no servidor Sandbox. Ambos não criam cobranças.

### Configuração manual alternativa

Em `backend/.env`, configure as variáveis abaixo preservando as demais configurações. Não versionar esse arquivo nem compartilhar a chave em mensagens.

```dotenv
ASAAS_ENABLED=true
ASAAS_ENVIRONMENT=sandbox
ASAAS_API_KEY=<chave da conta sandbox>
ASAAS_WEBHOOK_TOKEN=<segredo aleatório com pelo menos 32 caracteres>
ASAAS_WORKER_ENABLED=true
ASAAS_SANDBOX_ACTIONS_ENABLED=true
FRONTEND_URL=http://localhost:3000
```

Recrie o container para carregar o arquivo (um restart não carrega alterações de variáveis):

```powershell
docker compose up -d --no-deps --force-recreate backend
```

Depois de o backend iniciar, `http://localhost:3000/billing/plans` deve retornar `available: true`. Esse indicador confirma presença da configuração, não validade da chave ou aprovação da conta.

## Roteiro inicial: Pix simulado

1. Com sandbox habilitado, cadastre uma NOVA barbearia de teste pela landing, escolhendo um plano. Contas criadas antes da habilitação podem não ter assinatura suspensa e não validam o bloqueio inicial.
2. Confirme que o cadastro direciona ao pagamento e preserva o plano escolhido.
3. Em outro cadastro de teste, entre diretamente pelo cadastro e confira a escolha de planos na página de pagamento.
4. Escolha Pix, informe dados destinados à homologação, aceite as condições e continue.
5. Abra a cobrança e confira plano e valor. Ainda não deve haver acesso operacional liberado.
6. No checkout LineUp, confira o aviso **Ambiente de testes · Sandbox** e clique em **Simular pagamento Pix no Sandbox**. O backend confirma pela API oficial sandbox, consulta o pagamento novamente e só então atualiza a assinatura. Como alternativa, confirme na interface do Asaas Sandbox. Não faça transferência Pix real.
7. Retorne ao LineUp e clique em “Já paguei · verificar pagamento”. A consulta ao Asaas deve atualizar a assinatura e oferecer acesso ao painel.
8. Atualize a página e faça login novamente: a assinatura deve continuar ativa.

O Asaas também disponibiliza `POST https://api-sandbox.asaas.com/v3/sandbox/payment/{id}/confirm` para simular confirmação. Não existe equivalente de simulação em produção.

## Homologação automática e casos adicionais

Para testar webhooks, configure no Asaas uma URL HTTPS pública que encaminhe para o backend `/billing/webhook`, com o mesmo token configurado acima. Localhost não é acessível pelo Asaas. O teste manual por “verificar pagamento” permite começar sem expor o servidor.

Validar separadamente: confirmação automática sem clicar em verificar; acesso antes e depois do pagamento; eventos repetidos; cartão aprovado e recusado com cartões oficiais de teste; checkout abandonado/expirado; renovação; cancelamento; atraso e prazo de tolerância. O cancelamento não implica estorno automático.

## Antes de produção

### Webhook e adicionais

Na conta Sandbox, em Integrações → Webhooks, crie um webhook para `https://SEU-ENDERECO-PUBLICO/billing/webhook` (encaminhado ao backend). Configure o token de autenticação com o valor de `ASAAS_WEBHOOK_TOKEN` em `backend/.env`. Mantenha o webhook habilitado e a fila não interrompida. Use os eventos de cobrança, assinatura e checkout listados em [asaas-assinaturas.md](asaas-assinaturas.md). Não cadastre localhost: o Asaas não consegue alcançá-lo.

O botão de simulação valida a confirmação pela API e a ativação local. Para validar o webhook, confirme pela interface Asaas e aguarde o worker, sem usar o botão de verificar. Depois recarregue a página e confira a assinatura. Não considere o webhook homologado só porque a sincronização manual funcionou.

Na nova contratação, selecione Gestão e 2 profissionais extras: R$ 99,90 + 2 × R$ 19,90 = **R$ 139,70/mês**, para até **7 profissionais**. A integração cria uma assinatura, com uma cobrança por ciclo; não cria cobranças avulsas dos extras. O servidor determina os preços e salva a composição contratada. O limite extra depende da vigência paga.

O adicional está disponível somente no Gestão, de 0 a 20 extras por contratação. Alterações em contratos já existentes, troca de plano e prorrateio não estão implementados. A oferta da tela é explícita sobre essa limitação; não ajustar valores no provedor manualmente, pois a conciliação rejeita divergências.

### Separação dos ambientes

Use `ASAAS_SANDBOX_ACTIONS_ENABLED=false` em produção. Mesmo se configurada por engano como true, a simulação é rejeitada pelo backend e pelo cliente HTTP quando o ambiente é production. Cada nova conta de cobrança registra seu ambiente; operações sobre contas de outro ambiente são bloqueadas. Contas de cobrança anteriores à migração V33, sem ambiente, exigem classificação após conferência no provedor; não há classificação automática.

Homologar os cenários acima, configurar conta/chave de produção e webhook de produção, definir FRONTEND_URL com domínio HTTPS e conferir retornos do checkout. Não misturar contas/assinaturas de teste com dados de produção. Chaves sandbox e produção são distintas. A presença do código não significa que o ciclo externo foi homologado.

## Referências oficiais

- Sandbox: https://docs.asaas.com/docs/sandbox
- Confirmar pagamento simulado: https://docs.asaas.com/reference/confirmar-pagamento
- Confirmação pela interface: https://docs.asaas.com/docs/como-adicionar-dinheiro-para-testes

Documentação consultada em 06/10/2026.

## Checkout de cartão em localhost

O Asaas rejeitou as URLs de retorno http://localhost:3000 na homologação. O LineUp oferece Pix para esse ambiente; cartão requer FRONTEND_URL com endereço público HTTPS da aplicação. O botão de nova tentativa só descarta a chave anterior após recusa definitiva (FAILED); timeouts continuam protegidos contra duplicação.
