# Avaliações de atendimentos

Implementado em 28/09/2026. A referência SVG não estava disponível; a tela usa os componentes e tokens do design system existente.

## Cliente

- Atendimento concluído sem avaliação é uma pendência persistente no banco, consultada por `GET /commercial/reviews/pending` no contexto da barbearia e do cliente autenticado.
- Ao entrar em `/clientes/agendamento`, o portal oferece a pendência mais recente. Enquanto o portal permanece aberto, consulta a cada 30 segundos e ao recuperar foco para detectar novas conclusões. Não consulta enquanto a aba está oculta.
- O modal permite nota de 1 a 5, comentário opcional de até 1000 caracteres, “Agora não”, Escape ou fechar. Adiar não altera o atendimento e não impede agendar.
- No máximo um pedido automático por sessão da aba/login, mesmo recarregando ou navegando. `sessionStorage` guarda somente uma marca associada ao hash do token; não guarda o token. Nova sessão da aba ou novo login permite reapresentar a pendência ao entrar no agendamento. Se o armazenamento estiver bloqueado, a supressão funciona em memória enquanto a página permanece carregada.
- O histórico também permite avaliar os atendimentos pendentes. Enviar remove a pendência; fechar ou sair sem enviar a preserva.

## Administração e isolamento

`/admin/avaliacoes` lista avaliações da barbearia autenticada, com cliente, profissional, estrelas, comentário e resposta. Inclui nota média, quantidade, avaliações sem resposta, busca e filtros por nota/resposta.

O servidor obtém cliente, barbearia e profissional a partir da autenticação e do atendimento. A avaliação referencia o atendimento, que mantém o vínculo com o profissional. Somente o próprio cliente pode avaliar um atendimento concluído. O bloqueio transacional existente por barbearia e o índice único `(tenant_id, appointment_id)` impedem duplicidade, inclusive concorrente. Respostas administrativas também são restritas à barbearia.

Não foi necessária migração: atendimentos concluídos e avaliações existentes já representam a pendência durável.
