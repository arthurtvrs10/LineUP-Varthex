# CRM e WhatsApp oficial

Implementação baseada no SVG `CRM e WhatsApp (1).svg`, mantendo componentes e tokens do LineUp.

## Gerente da barbearia

Em **Configurações → Integrações → WhatsApp**, cada ADMIN cadastra sua própria WABA, Phone Number ID, token e segredo do aplicativo Meta. Os segredos são criptografados com AES-256-GCM e vinculados ao tenant; nunca retornam na consulta. O token de verificação do webhook é mostrado uma única vez ao salvar. Salvar credenciais exige testar novamente a conexão.

O teste consulta os números da WABA e confirma que o número selecionado pertence a ela. Não envia mensagens. Um teste de mensagem é uma ação separada, exige confirmação de autorização/custos e um modelo aprovado. A conexão validada não comprova faturamento habilitado nem garante entrega: o resultado definitivo vem dos eventos da Meta.

O CRM contém indicadores, automações, modelos, campanhas, conversas de texto e autorizações. Os indicadores/histórico usam os últimos 500 registros; não representam faturamento nem conversões em agendamentos. Leituras só aparecem quando informadas pela Meta.

## Modelos, campanhas e consentimento

Sincronização importa modelos e status da Meta, percorrendo páginas. Criação submete modelos de texto para aprovação; a Meta pode rejeitar ou recategorizar. O envio desta versão aceita corpo de texto com variáveis posicionais, cabeçalho fixo de texto e rodapé; mídia, botões e variáveis nomeadas aparecem como não suportados. Alterações de modelos existentes devem ser feitas no Gerenciador da Meta e sincronizadas.

Campanhas aceitam até 500 clientes ativos selecionados da própria barbearia e removem telefones duplicados. Todas as variáveis preenchidas manualmente são compartilhadas pelos destinatários da campanha; automações usam variáveis do cliente/atendimento. A autorização é registrada por telefone, separando serviço e marketing, com origem/evidência. Não se presume autorização a partir do cadastro do cliente.

Mensagens recebidas contendo SAIR, PARAR, STOP, CANCELAR ou DESCADASTRAR bloqueiam envios e cancelam a fila desse telefone. Respostas livres exigem uma mensagem recebida nas últimas 24h e destinatário não bloqueado. Mídia recebida é representada por indicação de tipo, sem download/renderização.

## Automações e entrega

- Lembrete: janela de 23–24h antes do horário.
- Confirmação: novos cadastros de agendamentos confirmados após ativar a automação.
- Pós-atendimento: entre 2h e 26h após a conclusão.
- Retorno/inatividade: no 25º/60º dia desde o último atendimento concluído.
- Aniversário: uma ocorrência por ano para cada automação/cliente.

Envios automáticos e campanhas respeitam 8h–20h no fuso da barbearia. Marketing é limitado a uma mensagem por telefone em 24h; excedentes são cancelados com código de frequência. O worker revalida consentimento, modelo, assinatura da barbearia e cancelamento do atendimento antes do envio. Não garante recuperação de gatilhos perdidos durante longas indisponibilidades.

A fila usa chave única por tenant/operação. O processamento assume a mensagem sob bloqueio da barbearia e confirma SENDING antes da chamada externa. Timeout, interrupção ou resposta ambígua viram UNKNOWN; não há repetição automática, evitando cobranças/envios duplicados. Webhooks podem reconciliar o resultado pelo identificador de correlação. Eventos repetidos são idempotentes e a leitura não regride para enviada por eventos fora de ordem.

## Configuração do operador

Copiar os nomes de `backend/whatsapp.env.example` para `backend/.env.local` ou para o gerenciador de segredos do ambiente. O Compose lê esse arquivo apenas no backend. A chave `WHATSAPP_ENCRYPTION_KEY` deve conter 32 bytes aleatórios em Base64 e ser preservada em backup seguro; trocá-la sem recriptografar torna as credenciais anteriores ilegíveis. Nunca versionar chaves reais.

Para conexão manual, criar/configurar a conta, o número registrado na Cloud API, faturamento e permissões na Meta. Configurar URL pública HTTPS, copiar o token de verificação gerado e assinar `messages` no aplicativo Meta. Localhost sozinho não recebe webhooks. Nenhuma URL pública é criada automaticamente.

Para habilitar **Conectar com a Meta**, configurar aplicativo Meta apto para Embedded Signup, App ID, segredo, configuração de login, domínios autorizados, URL HTTPS e token de verificação compartilhado. O frontend recebe somente IDs públicos. O backend troca o código, valida a associação conta/número e assina a WABA. Registro/ativação de números novos e elegibilidade/coexistência dependem da Meta; a conexão não contorna esses requisitos. Webhook compartilhado: `/integrations/whatsapp/webhook`; manual: `/integrations/whatsapp/webhook/{tenantId}`.

POSTs de webhook são validados por HMAC SHA-256 sobre o corpo bruto. O ID da WABA e o Phone Number ID precisam corresponder à conexão antes de processar os eventos. Apenas ADMIN acessa configurações e CRM; não confia em tenant enviado pelo navegador.

Desconectar remove credenciais, invalida modelos e cancela mensagens ainda na fila, preservando histórico. Uma chamada já iniciada na Meta pode terminar.

## Custos e validação

### Fluxo guiado de configuração

A configuração apresenta quatro etapas: conectar a conta, validar o número, receber atualizações e começar a usar. A etapa inicial é escolhida conforme o estado salvo da integração. O gerente pode revisar etapas anteriores sem perder o preenchimento do formulário.

A conexão manual fica recolhida e explica os identificadores solicitados. O resumo lateral mostra credenciais, número e atualizações separadamente. Quando falta a URL pública HTTPS ou a habilitação da conexão guiada, a tela identifica a pendência como responsabilidade da equipe do LineUp. As instruções de webhook ficam nos detalhes técnicos. O teste de número não envia mensagens; o envio de teste exige confirmação de autorização e dos possíveis custos.

A interface informa possíveis custos por mensagem e remete à tabela vigente da Meta, sem prometer valores fixos ou gratuidade. Custos Meta são separados do plano LineUp.

Testes automatizados usam respostas simuladas da Meta. Conexão, aprovação, cobrança e entrega reais precisam ser homologadas com uma conta autorizada e webhook HTTPS. Nenhuma mensagem real foi enviada durante a implementação.

Validação local: 127 testes de backend aprovados, incluindo 10 cenários WhatsApp; esses 10 também passaram no PostgreSQL 16 com a migração V29 e validação Hibernate. Frontend: lint, build e 11 testes aprovados. CRM e configurações conferidos no navegador com conta fictícia e worker desativado em ambiente isolado.

Referências: [Meta Cloud API](https://www.postman.com/meta/whatsapp-business-platform/overview), [exemplos oficiais de webhook](https://github.com/fbsamples/whatsapp-api-examples), [preços oficiais](https://whatsappbusiness.com/products/platform-pricing/).
