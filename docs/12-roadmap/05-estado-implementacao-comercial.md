# Estado da implementação comercial

Atualizado em 28/09/2026. Este documento descreve o código implementado; não substitui os gates de homologação e operação do [plano de releases](01-plano-tres-niveis.md).

## Funcionalidades disponíveis

| Área | Implementação |
| --- | --- |
| Cadastro | Criação de barbearia, unidade e administrador; cadastro independente de cliente, escolha/troca de barbearia e vínculo automático no primeiro agendamento. Ver [fluxo de cliente](../06-frontend-ux/fluxo-cliente-barbearia.md). |
| Acesso | Portais separados por perfil; operações comerciais restritas ao administrador da própria barbearia; administração SaaS exclusiva do Super Admin. |
| Clientes | Edição, arquivamento, visitas, último/próximo atendimento e pagamentos efetivamente registrados. Listagem consulta todas as páginas. |
| Equipe | Indicadores de serviços concluídos no mês, avaliações, edição de perfil/comissão/status e seleção dos serviços atendidos. |
| Agenda | Antecedência de reserva e prazo de cancelamento configuráveis para clientes; horários disponíveis respeitam antecedência, fuso da unidade e serviços do profissional. Reservas concorrentes são serializadas por profissional antes da consulta de conflito. |
| Financeiro | Um caixa aberto por barbearia, fundo inicial, suprimento, sangria, recebimentos parciais por dinheiro/Pix/cartão, fechamento com diferença e estorno com histórico. Comprovante não fiscal por atendimento e exportação CSV. |
| Estoque | Cadastro, edição e desativação de produtos; categoria/fornecedor como texto; entradas, consumo manual, perdas e ajustes; saldo e indicação de estoque mínimo; margem estimada por preço menos custo de referência. Venda baixa estoque e registra recebimento na mesma transação; estorno devolve unidades. |
| Fidelidade | Pontos após pagamento de atendimento, resgate com saldo suficiente, extrato e reversão de pontos após estorno. Regra atual: um ponto por real inteiro em **cada pagamento**, sem validade configurável. |
| CRM | Segmentos de aniversariantes do mês e sem atendimento concluído há 60 dias; criação e consulta de rascunhos de campanhas. Nenhuma mensagem é enviada. |
| Avaliações | Cliente avalia uma vez seu próprio atendimento concluído; administrador consulta e responde. |
| Preferências | Antecedência, cancelamento, comissão sugerida e notificações da equipe persistidos; cliente autoriza ou retira autorização para promoções. |
| Planos | Cadastro de preço mensal e limite de profissionais, arquivamento e reativação. Alterar condições comerciais exige novo plano e migração explícita das assinaturas. |
| Assinaturas | Gestão manual de plano, estado e vigência, com justificativa e controle de edição concorrente. Suspensão/expiração bloqueia acesso da barbearia; limite bloqueia criação de profissionais. |
| Métricas | Contagens de barbearias, usuários, assinaturas ativas e valor mensal contratado, explicitamente separado de receita recebida. |
| Auditoria | Eventos das operações comerciais, configurações, consentimento, catálogo de serviços e alterações de assinatura. Tela exibe os 500 mais recentes. |
| Saúde | Consulta pontual do banco, tempo da consulta e tempo de execução da API. |

## Regras operacionais

- Pix e cartão são registros manuais de valores recebidos. Não há geração, confirmação ou conciliação de cobrança externa.
- Operações de caixa, estoque e fidelidade usam bloqueio transacional da barbearia. Identificadores de operação evitam duplicação de pagamentos, vendas, movimentos e resgates; reutilizar a chave com outro conteúdo é rejeitado.
- Fechamentos e movimentos passados permanecem no histórico. Não há exclusão de lançamento nem reabertura de caixa: abra um novo caixa para correções por movimento inverso.
- Estorno de pagamento também desfaz os pontos originais. Se já foram resgatados, o saldo pode ficar negativo; novos resgates permanecem bloqueados até haver saldo suficiente.
- Produtos inativos não podem receber novas vendas, mas continuam nos históricos. O custo mostrado é referência atual, sem cálculo de custo médio por lote.
- Assinaturas existentes continuam vinculadas a planos arquivados. Novos contratos não podem escolher esses planos. Barbearias anteriores sem assinatura cadastrada mantêm o acesso legado; não são consideradas assinaturas pagas.
- O limite de profissionais conta todos os perfis cadastrados, inclusive inativos. Não há cobrança automática de excedente.
- O seletor de perfis de demonstração só aparece com `NEXT_PUBLIC_DEMO_SWITCHER=true`, destinado a ambientes isolados com contas fictícias.

## Pendências externas, conforme decisão de escopo

- Escolha e integração do provedor de cobrança recorrente: checkout, webhooks, prorrateio, conciliação, reembolso remoto e inadimplência automática.
- Escolha e integração de WhatsApp: envio, aprovação de templates, entrega, opt-out e medição permitida.
- Integrações adicionais do roadmap, como Google Calendar, não foram implementadas neste incremento. O e-mail transacional já existente continua dependente da configuração do Resend.

## Roadmap interno que permanece pendente

As dez telas comerciais possuem fluxos ligados à API, mas isso não representa a conclusão integral dos níveis 2 e 3 do catálogo:

- Caixa por unidade, reabertura excepcional, descontos/acréscimos com limite de autorização e gorjetas separadas.
- Cadastro próprio de fornecedores, custo por entrada/lote, inventário assistido, consumo automático por serviço e transferências entre unidades.
- Programas configuráveis de pontos com validade, pacotes de serviços e planos recorrentes de clientes.
- Critérios configuráveis de segmentação, lembretes de novo corte, templates, histórico de comunicação por canal e automações de campanha.
- Limites de sessões/dispositivos, mensagens e funcionalidades por plano; ciclo anual e políticas completas de direitos comerciais.
- Auditoria dos demais módulos, pesquisa paginada de eventos, métricas históricas e monitoramento contínuo com alertas.
- Preferências avançadas da agenda do barbeiro, como regras de encaixe e fila automática. Jornada e bloqueios continuam disponíveis na tela de Disponibilidade.
- Importação com prévia, relatórios avançados e requisitos operacionais de carga, restauração, disponibilidade e revisão independente de segurança.

## Validação e migrações

- Testes de integração Java executados com H2 descartável; nenhuma base real usada.
- Lint, TypeScript e testes Node do frontend executados. Build de produção validado em cópia isolada com fontes locais em cache.
- Verificação de navegador com respostas fictícias: cadastro, restrição de portais, telas comerciais, caixa, edição de produto e responsividade. Isso não substitui um E2E contra PostgreSQL.
- Migrações novas: `V23` (módulos comerciais), `V24` (configurações/consentimento), `V25` (catálogo por profissional).
- O workflow `.github/workflows/ci.yml` verifica frontend, testes H2 e aplicação de todas as migrações com validação do Hibernate em PostgreSQL 16 descartável. O job PostgreSQL ainda precisa executar no CI; não havia servidor PostgreSQL nem Docker ativo no ambiente local.
- Antes de homologar, executar o job PostgreSQL, testar os fluxos integrados em ambiente descartável e aplicar os gates do roadmap. Este incremento não foi implantado nem enviado ao remoto.

Comandos locais, em ambientes de teste sem credenciais externas:

```sh
cd frontend
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

```sh
cd backend
./mvnw test -Dspring.flyway.enabled=false -Dresend.api-key=
```

Os testes Node usam Node.js 24. A suíte H2 gera o esquema temporário pelo Hibernate; ela não valida o SQL específico do PostgreSQL.
