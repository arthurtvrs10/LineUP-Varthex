# Changelog

Todas as mudanças relevantes do projeto são documentadas aqui.

## [v2.0.0] — 2026-09-09 — MVP completo

Release que fecha o escopo do **Nível 1 (MVP)** definido em
[`docs/12-roadmap/01-plano-tres-niveis.md`](docs/12-roadmap/01-plano-tres-niveis.md): os seis
domínios que faltavam desde a v1.1.0 (Comissão, Relatórios/Resumo, Disponibilidade,
Notificação, Auth completo e Fila de espera) foram implementados, testados e ligados ao
frontend, e todo dado fabricado nas telas foi removido ou substituído por dado real.

### Novos domínios de backend

- **Comissão** — regras por barbeiro/serviço com precedência, cálculo automático ao concluir
  atendimento, ajustes manuais e resumo por período (`/commission-rules`,
  `/commissions/summary`, `/commission-adjustments`).
- **Relatórios/Resumo** — `GET /dashboard/overview` com totais reais do dia (agendados,
  concluídos, cancelados, faltas, faturamento, comissão).
- **Disponibilidade** — jornada semanal por barbeiro, bloqueios/férias/ausências e cálculo real
  de horários livres (`GET /barbers/{id}/availability`), substituindo a janela fixa 08h–18h.
- **Notificação essencial** — notificações in-app + e-mail (via Resend) para confirmação e
  cancelamento de agendamento, com preferências por usuário.
- **Auth completo** — refresh token com rotação, logout (individual e de todas as sessões),
  listagem/revogação de sessões, recuperação e troca de senha por e-mail, rate limit de login.
- **Fila de espera** — entrada na fila, oferta de vaga, aceite transacional (primeira aceitação
  vence) e **reoferta automática para o próximo da fila** quando uma oferta é recusada.

### Frontend

- Portal **Cliente** integrado por completo (agendamento, histórico, perfil, configurações,
  fila de espera).
- Dashboards e agendas de **Admin** e **Barbeiro** ligados a dado real, com modal único de
  detalhes de agendamento (`AppointmentDetailModal`) substituindo botões minúsculos e telas sem
  feedback de erro.
- Visualização **"Dia"** na agenda do Barbeiro.
- Lembrete de agendamentos pendentes de confirmação no início do Barbeiro.
- Rebrand completo para **LINEUP** (tokens de design, tipografia, paleta).
- **10 telas que exibiam dado fabricado** (Financeiro, Estoque, Fidelidade, CRM, Avaliações no
  Admin; Planos, Assinaturas, Métricas, Auditorias, Saúde do Sistema no SuperAdmin) agora mostram
  um aviso honesto de "fora do MVP atual" em vez de números inventados.
- Relatórios do Admin e Dashboard do SuperAdmin recalculados 100% a partir de dado real.

### Correções

- Fuso horário do backend (estava em UTC, agora `America/Sao_Paulo`) — corrigia horários de
  disponibilidade, expiração de sessão e bloqueio de login calculados ~3h errado.
- Disponibilidade não oferece mais horários que já passaram no dia atual.
- `ResponseStatusException` de endpoints públicos (ex.: cadastro com e-mail duplicado) não é
  mais mascarado como 401 — retorna o status correto (409, 400 etc.).
- Isolamento por tenant reforçado e bloqueio de elevação de privilégio em `Users`.
- Diversos ajustes de UX (menu mobile, tela de auth, foto de perfil real em listas).

### Cobertura de testes

Suíte de backend com **78 testes automatizados**, cobrindo os seis domínios novos e os já
existentes — 100% passando nesta release.

---

## [v1.1.0] — 2026-08-28

Marco anterior: núcleo de Agendamentos, Tenant/Unit/Customers/Services, sessão real, rebrand
inicial e integração dos portais Admin/SuperAdmin/Barbeiro/Cliente com dado real.

## [v1.0.0] — 2026-08-15

Primeiro marco versionado do projeto.
