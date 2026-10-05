# Integração Google Calendar

O backend sincroniza agendamentos do LineUp para o Google Calendar. Alterações feitas diretamente no Calendar não são importadas.

## Adicionar à agenda pessoal

Cliente e barbeiro têm um botão discreto **Adicionar ao Google Calendar** nos detalhes do atendimento. Somente o clique abre uma nova aba com serviço, início e término preenchidos, no fuso `America/Sao_Paulo`; a pessoa escolhe a conta Google e confirma o salvamento. Essa opção não exige credenciais OAuth do LineUp.

- Cliente: botão no histórico para atendimentos pendentes ou confirmados e no cartão do próximo agendamento.
- Barbeiro e administrador: botão no modal de detalhes para atendimentos pendentes ou confirmados.
- Criação, reagendamento, aceite da fila e carregamento das telas não abrem o Google Calendar nem exibem convites automáticos.
- Um evento adicionado pelo link é uma cópia pessoal: não recebe atualizações ou cancelamentos automáticos. A pessoa deve ajustá-lo no Google Calendar. Se a conexão OAuth já sincronizou aquele evento, não é necessário adicioná-lo novamente.

## Configuração da plataforma

- Ative a Google Calendar API no projeto Google Cloud.
- Configure um cliente OAuth do tipo Web e cadastre `GOOGLE_CALENDAR_CALLBACK_URL` como redirect URI autorizada.
- Defina `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET` e `GOOGLE_CALENDAR_CALLBACK_URL` no backend.
- Configure `GOOGLE_CALENDAR_ENCRYPTION_KEY` (32 bytes em Base64), separada da chave de criptografia do WhatsApp.
- Rode a migration `V30__google_calendar_integration.sql` via Flyway.

## API

Todas as rotas abaixo, exceto callback OAuth, requerem JWT. Use `scope=TENANT` ou `scope=BARBER`; barbeiros só acessam sua própria conexão e o administrador gerencia a conexão do tenant.

- `GET /integrations/google-calendar/status?scope=TENANT|BARBER` → estado, calendário, pendências, falhas e último erro.
- `POST /integrations/google-calendar/connect?scope=...` com `{ "returnTo": "/admin/configuracoes/integracoes/google-calendar" }` → `{ "authorizationUrl": "..." }`.
- `GET /integrations/google-calendar/callback` é o redirect OAuth público e retorna ao caminho permitido com `googleCalendar=connected|error`.
- `GET /integrations/google-calendar/calendars?scope=...` lista agendas disponíveis.
- `PUT /integrations/google-calendar/calendar?scope=...` com `{ "calendarId": "..." }` escolhe a agenda.
- `POST /integrations/google-calendar/retry?scope=...` reprocessa falhas.
- `DELETE /integrations/google-calendar/connection?scope=...` desconecta e interrompe a fila.

## Operação

Uma conexão do tenant tem precedência; quando não existe, usa a conexão do barbeiro do agendamento. A fila persiste mudanças junto com a transação do agendamento, e o worker envia sem bloquear criação/cancelamento. Eventos têm ID determinístico por agendamento e são gravados via PUT, permitindo repetição sem duplicatas. Reagendamento será sincronizado no mesmo formato quando houver operação de reagendamento no ciclo de agendamentos.
