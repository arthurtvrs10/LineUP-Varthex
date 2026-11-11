# Assinatura do LineUp — Asaas

Implementação do MVP em 04/10/2026. A integração vem **desabilitada**. Nenhuma cobrança real ou implantação foi realizada.

## Escopo implementado

- Catálogo público usa planos ativos, preço e limite cadastrados pelo Super Admin.
- Seleção na landing preserva o plano no cadastro/login e abre Minha assinatura.
- Cartão recorrente em checkout hospedado; Pix em assinatura mensal com pagamento manual de cada fatura.
- Atualização do cartão existente pela API específica da assinatura, sem cobrança imediata.
- Cliente externo próprio por barbearia, com CPF/CNPJ informado pelo administrador, sem armazenar o documento na integração.
- Valor e periodicidade determinados no backend. Na contratação, o Asaas coleta o cartão. Na atualização, os dados transitam pelo backend via HTTPS e são enviados ao Asaas; não são persistidos, retornados ou incluídos na auditoria. Esse segundo fluxo amplia o escopo PCI e precisa de revisão da configuração de logs e da operação antes de produção.
- Reserva persistente antes de chamadas externas e chave de operação para impedir novas criações após timeout.
- Inbox persistente de webhooks autenticados, deduplicados pelo ID. Armazena apenas identificadores, não payload bruto.
- Worker consulta o estado atual no provedor e concilia cobranças, tarifas, valores líquidos e reembolsos.
- Pagamento confirmado/recebido ativa vigência e limite do plano; callback do navegador não concede acesso.
- Tela Minha assinatura acessível após suspensão; novo cadastro fica sem acesso operacional quando `ASAAS_ENABLED=true`.
- Contas legadas sem assinatura mantêm a regra anterior. Concessão manual existente permanece até o primeiro pagamento integrado.
- Cancelamento inativa a recorrência e mantém o período pago. Não solicita reembolso nem elimina automaticamente faturas pendentes.
- Super Admin consulta cobranças e solicita reembolso total/parcial; devolução concluída depende do estado externo.
- Avisos in-app sobre vencimento/atraso; e-mail depende de Resend configurado. Falhas de entrega não são registradas como sucesso.

## Política provisória

Sem teste gratuito. Mensalidade sem parcelamento. Tolerância de três dias (`ASAAS_GRACE_DAYS`) somente para renovação após período pago, com cobrança pendente/vencida do ciclo seguinte. Primeira mensalidade não paga não libera acesso. Cancelamento não estende tolerância.

A vigência de uma mensalidade é calculada pelo vencimento até o dia anterior ao próximo mês. Pagamento atrasado quita o ciclo original; não desloca automaticamente a data de renovação. Reembolso parcial preserva acesso; reembolso integral ou contestação retira a cobertura do ciclo afetado. Pagamento futuro não substitui a vigência atual antes de seu vencimento.

O catálogo inicial é criado pela V32 (Individual e Gestão); a V33 acrescenta profissional extra no Gestão. Consulte [planos-lineup.md](planos-lineup.md). Assinaturas integradas não podem receber alterações manuais pela tela antiga. A V34 permite trocar plano, profissionais extras e forma de pagamento durante a assinatura ativa. Prorrateio continua fora do escopo.

## Configuração e homologação

1. Criar conta sandbox Asaas e obter API key. Usar `backend/.env.example` como referência para variáveis do backend.
   No Docker Compose, adicionar as variáveis a `backend/.env`, já carregado somente no backend. Em execução direta, exportar as variáveis no processo Java.
2. Aplicar a migração `V31__asaas_saas_billing.sql` em banco de homologação. Não usar base de produção nos testes.
3. Configurar `ASAAS_ENVIRONMENT=sandbox`, API key e um token independente de webhook com 32–255 caracteres.
4. Configurar webhook HTTPS apontando para `POST /billing/webhook`; o token configurado como `authToken` deve coincidir com `ASAAS_WEBHOOK_TOKEN`.
5. Assinar eventos `PAYMENT_*` pertinentes: criação, atualização, confirmação, recebimento, vencimento, remoção/restauração, recusa de cartão, reembolso e contestação; eventos `SUBSCRIPTION_CREATED/UPDATED/INACTIVATED/DELETED`; e `CHECKOUT_PAID/CANCELED/EXPIRED`.
6. Definir `FRONTEND_URL` com a URL da aplicação. Configurar Resend se desejar avisos por e-mail. Notificações automáticas do Asaas são desabilitadas na criação do cliente para evitar duplicidade/custos não escolhidos.
7. Cadastrar planos ativos pelo Super Admin, confirmar preços e habilitar `ASAAS_ENABLED=true` no ambiente de homologação.
8. Testar contratação, renovação, atraso, tolerância, cancelamento, checkout expirado, reembolso parcial/total, duplicidade, timeout e isolamento de barbearias.
9. Antes de produção, confirmar contrato, tarifas, tokenização/recorrência e funcionamento dos webhooks. Mudar ambiente/key explicitamente; manter o piloto restrito aos clientes escolhidos.

Não reutilizar API key como token do webhook. API key nunca deve ir para o frontend. A API usa apenas hosts oficiais definidos pelo ambiente; links externos exibidos são limitados aos hosts Asaas.

## Rotas

| Rota | Acesso | Finalidade |
| --- | --- | --- |
| GET `/billing/plans` | Público | Catálogo e disponibilidade |
| GET `/billing/subscription` | ADMIN da própria conta | Assinatura e cobranças |
| POST `/billing/checkout` | ADMIN da própria conta | Contratar plano, com `planId`, `method`, `cpfCnpj`, `requestKey` |
| POST `/billing/sync` | ADMIN da própria conta | Atualizar conciliação |
| POST `/billing/sandbox/charges/{id}/confirm` | ADMIN da própria conta | Simular confirmação Pix somente em sandbox, com flag explícita |
| POST `/billing/cancel` | ADMIN da própria conta | Interromper renovação/checkout |
| POST `/billing/card` | ADMIN da própria conta | Atualizar cartão existente, sem cobrança imediata |
| POST `/billing/changes/preview` | ADMIN da própria conta | Revisar plano, extras, pagamento, valor e início do ciclo; validade de 10 minutos |
| POST `/billing/changes/confirm` | ADMIN da própria conta | Confirmar `quoteId`, com `card` transitório apenas na migração Pix → cartão |
| POST `/billing/webhook` | Token Asaas | Receber eventos |
| GET `/platform/billing` | SUPER_ADMIN | Relatório financeiro |
| POST `/platform/billing/charges/{id}/refund` | SUPER_ADMIN | Solicitar reembolso com `amount`, `reason`, `requestKey` |

Telas: `/admin/assinatura` (contratação/regularização), `/admin/configuracoes?secao=assinatura` (gestão unificada) e `/superadmin/cobrancas`. O endereço antigo `/admin/assinatura/gerenciar` redireciona às configurações.

Atualização de 06/10/2026: [assistente de configuração e roteiro Sandbox](testar-contratacao-online.md). A contratação aceita `addonId` e `addonQuantity` opcionais; o servidor valida elegibilidade, calcula plano + adicionais e registra preço/capacidade da contratação. Extras não geram assinaturas separadas. O catálogo não libera WhatsApp/IA. Contas de cobrança guardam `environment` para impedir operações entre sandbox e produção.

## Operação e limitações

- Resposta incerta de criação não é repetida automaticamente. Consultas recuperam cliente/assinatura existentes; casos sem recurso identificável permanecem pendentes para investigação no provedor.
- Eventos de recursos ainda não vinculados permanecem na inbox para recuperação. Monitorar backlog e tentativas; não há painel específico da inbox neste MVP.
- Conciliação periódica ocorre a cada hora e processamento de eventos a cada 15 segundos; tempos configuráveis por propriedades `asaas.*`.
- A conciliação serializa leitura/escrita pela conta de cobrança para evitar sobrescrever estados recentes com snapshots concorrentes; transações de caixa não usam esse bloqueio.
- Um reembolso incerto bloqueia nova solicitação até confirmação ou investigação. Rejeição definitiva permite uma nova operação com nova chave.
- INACTIVE impede novas cobranças, mas não remove cobranças existentes. Confirmar com o cliente a destinação das mensalidades pendentes ao cancelar.
- Atualização de cartão em produção exige `request.isSecure()` e configuração correta do proxy confiável para HTTPS e IP real do pagador. Não habilitar logging de corpos para `/billing/card` ou `/billing/changes/confirm`; não enviar dados dessa tela a analytics/session replay. Revisar requisitos PCI com o provedor. Uma falha de atualização não cria outra assinatura nem cobra mensalidade adicional.
- Reativação de recorrência cancelada ainda exige fluxo adicional. Não criar outra assinatura para contornar esse estado.
- Pix Automático, plano anual, cupons, prorrateio e pagamentos de atendimentos são evoluções separadas.
- Os relatórios mostram valores do provedor; não equivalem a lucro nem comprovam repasse bancário. Emissão fiscal permanece separada.
- Validar migrações em PostgreSQL e integração real no sandbox antes de publicar. Testes locais com H2 e provedor simulado não substituem essa homologação.

## Fontes oficiais

- [Checkout recorrente](https://docs.asaas.com/docs/checkout-com-assinatura-recorrente)
- [Assinaturas](https://docs.asaas.com/docs/assinaturas)
- [Webhooks](https://docs.asaas.com/docs/sobre-os-webhooks)
- [Estornos](https://docs.asaas.com/docs/estornos)
- [Preços e taxas](https://www.asaas.com/precos-e-taxas)

## Validação local deste incremento

- 19 testes de integração de cobrança passaram com H2 descartável e Asaas simulado; outros 48 testes de regressão de contratos comerciais, contas e autenticação também passaram.
- TypeScript e lint dos arquivos alterados nesta implementação passaram; os 13 testes existentes do frontend passaram.
- Lint geral ainda acusa problemas anteriores em Google Calendar e no modal de agendamento.
- Build Next.js local encontrou bloqueio de rede ao baixar Archivo/Work Sans do Google Fonts.
- O compilador Java deste ambiente apresentou `AccessDeniedException` no fechamento dos JARs. A compilação direta gerou classes e os testes executaram; Maven completo deve ser confirmado no CI.
- Foram corrigidos imports das entidades e o valor padrão da URL de frontend no código de Google Calendar já existente, necessários à inicialização do backend em testes.
- Contratos manuais básicos disponíveis em `bruno/LINEUP-API/Billing`; não foram executados contra a conta Asaas.
- PostgreSQL e sandbox real permanecem como gates de homologação, junto à revisão do fluxo de atualização do cartão e das condições comerciais.


## Alterações de assinatura — 07/10/2026

- Configurações reúne conta, barbearia, regras comerciais, Google Calendar, WhatsApp e assinatura. Menu lateral pesquisável e conteúdo com rolagem própria ocupam a largura disponível.
- Plano e adicionais compõem uma única mensalidade; valores e elegibilidade são calculados pelo servidor. A prévia informa o novo limite e a data de vigência.
- Alterações afetam o próximo ciclo **ainda não emitido**, informado pelo Asaas em `nextDueDate`. Não há débito proporcional imediato, crédito proporcional ou alteração das faturas emitidas (`updatePendingPayments=false`). Se o ciclo mudar durante a confirmação, é necessário revisar novamente.
- A capacidade nova só é liberada no início do ciclo correspondente e após pagamento confirmado. Cada fatura guarda a versão de preço/plano/limite usada para validar o acesso; pagamentos antigos continuam válidos pelo contrato daquele ciclo.
- Redução é recusada se a quantidade de profissionais cadastrados (inclusive inativos) exceder o novo limite. Nenhum profissional é removido automaticamente. Após programar redução, novos cadastros já respeitam o menor limite; assinatura e criação de profissionais compartilham o bloqueio da barbearia.
- Só uma alteração pode ficar programada ou em conciliação por vez. A confirmação repetida da mesma prévia aplicada não repete a chamada de alteração. Timeout preserva a operação como incerta; usar Atualizar assinatura. O sistema concilia pela referência única no Asaas e não reenvia a alteração automaticamente. Resultado indefinido sem referência confirmada exige investigação operacional.
- Pix → cartão exige dados do titular, tokenizados transitoriamente no Asaas; token/PAN/CVV não são persistidos nem retornados. Em produção, habilitar tokenização com o Asaas e configurar HTTPS/IP real corretamente. Cartão → Pix troca as próximas cobranças para pagamento manual. Substituição de cartão existente é uma ação separada, que pode afetar pendências conforme a API específica do Asaas.
- Mudanças exigem assinatura ativa e renovação habilitada. Não há alteração de uma assinatura inadimplente ou cancelada por este fluxo.

Referências: [atualizar assinatura](https://docs.asaas.com/reference/atualizar-assinatura-existente), [tokenizar cartão](https://docs.asaas.com/reference/tokenizacao-de-cartao-de-credito), [substituir cartão da assinatura](https://docs.asaas.com/reference/atualizar-cartao-de-credito-assinatura).

Validação deste incremento: 69 testes do backend passaram em banco H2 temporário e Asaas simulado, incluindo nove cenários novos de mudanças, mais proteção do limite programado. TypeScript, lint dos componentes alterados e 19 testes do frontend passaram. Essas verificações não substituem o teste da mudança numa assinatura real do Sandbox.

Docker local atualizado em 07/10/2026: frontend e backend reconstruídos e recriados; PostgreSQL confirmou V34 aplicada. O catálogo respondeu `available=true`, `environment=sandbox`. Verificação visual com dados fictícios em 1440×900 e 390×844: revisão de plano/extras e abertura do formulário de cartão, sem erros de JavaScript e sem rolagem da página inteira. Chamadas de cobrança foram interceptadas neste teste visual; não houve mudança da assinatura existente no Asaas.
