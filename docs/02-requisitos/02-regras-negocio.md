# Catálogo de regras de negócio

**ID:** DOC-REQ-002  
**Status:** aprovado  
**Fonte canônica para:** comportamento e cálculos do domínio

## 1. Tenant e identidade

| ID | Regra |
|---|---|
| `RN-TEN-001` | O `tenantId` efetivo vem da sessão autenticada ou de contexto explícito do Super Admin; valores recebidos do cliente são ignorados como autoridade. |
| `RN-TEN-002` | Toda consulta de entidade tenant-owned deve incluir tenant; ausência do filtro é falha de segurança. |
| `RN-TEN-003` | Desativar tenant bloqueia nova operação e login de membros, preservando exportação, cobrança e ações de suporte autorizadas. |
| `RN-USR-001` | Um usuário pode pertencer a mais de um tenant, mas cada requisição possui um único contexto ativo. |
| `RN-USR-002` | Remover vínculo revoga sessões daquele contexto sem apagar autoria histórica. |
| `RN-AUT-001` | Mensagens de login e recuperação não confirmam se a conta existe. |
| `RN-AUT-002` | Refresh token é de uso único, rotativo, armazenado em hash e ligado a uma sessão. Reutilização revoga a família da sessão. |
| `RN-AUT-003` | Ações sensíveis podem exigir reautenticação mesmo com sessão válida. |

## 2. Clientes, profissionais e serviços

| ID | Regra |
|---|---|
| `RN-CLI-001` | Cliente é único por tenant; duplicidade potencial é detectada por telefone e e-mail normalizados, mas união exige ação humana. |
| `RN-CLI-002` | Arquivamento impede seleção em novos fluxos, mas não remove agenda, pagamento ou auditoria. |
| `RN-CLI-003` | Cliente autenticado somente acessa registros ligados ao próprio `customerId`. |
| `RN-BAR-001` | Profissional desativado não recebe novas reservas após a vigência, mas reservas futuras existentes devem ser remanejadas ou canceladas explicitamente. |
| `RN-SER-001` | Preço e duração efetivos seguem: sobrescrita válida do profissional/unidade, depois valor do serviço. |
| `RN-SER-002` | Alterar preço ou duração não altera itens já congelados em agendamentos existentes, salvo edição explícita antes da conclusão. |
| `RN-SER-003` | Serviço inativo permanece legível no histórico e não aparece em novas reservas. |

## 3. Tempo e disponibilidade

| ID | Regra |
|---|---|
| `RN-DIS-001` | Disponibilidade = jornada aplicável − pausas − exceções − bloqueios − agendamentos que ocupam agenda. |
| `RN-DIS-002` | Faixas usam intervalo semiaberto `[início, fim)`; o fim de uma pode coincidir com o início da próxima. |
| `RN-DIS-003` | O slot deve acomodar duração dos itens e buffers configurados. |
| `RN-DIS-004` | Cálculos usam o fuso IANA da unidade; persistência usa UTC. |
| `RN-DIS-005` | Antecedência mínima e horizonte máximo são configurações do tenant, com possibilidade de sobrescrita por canal. |
| `RN-DIS-006` | Bloqueio não pode apagar agendamento; conflito existente exige resolução explícita. |

## 4. Agenda

| ID | Regra |
|---|---|
| `RN-AGE-001` | Para o mesmo profissional, agendamentos em estado que ocupa agenda não podem se sobrepor. A garantia ocorre na transação e no banco. |
| `RN-AGE-002` | Estados que ocupam agenda inicialmente: `PENDING`, `CONFIRMED`, `CHECKED_IN` e `IN_PROGRESS`. |
| `RN-AGE-003` | Fluxo principal: `PENDING → CONFIRMED → CHECKED_IN → IN_PROGRESS → COMPLETED`. |
| `RN-AGE-004` | `PENDING` ou `CONFIRMED` pode virar `CANCELED`; atendimento esperado pode virar `NO_SHOW`; `COMPLETED`, `CANCELED` e `NO_SHOW` são finais, salvo correção administrativa auditada. |
| `RN-AGE-005` | `endAt` é calculado a partir de `startAt`, itens e buffers; alteração manual exige permissão e justificativa. |
| `RN-AGE-006` | Preço, duração e comissão aplicáveis são copiados para snapshots do agendamento; alterações de catálogo não reescrevem o passado. |
| `RN-AGE-007` | Reagendamento preserva histórico de horário, profissional, autor e motivo. |
| `RN-AGE-008` | Cancelamento aplica janela configurada e registra origem: cliente, profissional, recepção, sistema ou integração. |
| `RN-AGE-009` | Falta somente pode ser marcada depois do início previsto acrescido da tolerância configurada. |
| `RN-AGE-010` | Encaixe não ignora conflito; ele ignora apenas restrições comerciais explicitamente configuradas e autorizadas. |
| `RN-AGE-011` | Criação recorrente gera instâncias até o menor entre quantidade, data final e horizonte. Conflitos são listados e não sobrescrevem reservas. |
| `RN-AGE-012` | Alteração recorrente exige escopo explícito: somente esta, esta e futuras ou série inteira ainda não iniciada. |
| `RN-AGE-013` | Idempotency key é obrigatória em criação por integração e pagamento; repetição retorna o resultado original dentro da retenção. |
| `RN-AGE-014` | Conclusão exige pelo menos um item válido e valor final definido, mesmo quando zero por cortesia autorizada. |
| `RN-AGE-015` | Exclusão física de agendamento não é permitida em operação normal. |
| `RN-AGE-016` | A política de sinal é congelada no agendamento. Em modo percentual, sinal = total × percentual ÷ 100, arredondado para centavos; em modo fixo, não excede o total. Sem confirmação até `depositDueAt`, o sinal vira `EXPIRED` e o agendamento é cancelado pelo sistema, liberando o slot. `WAIVED` exige permissão e motivo; pagamento idempotente muda o sinal para `PAID`. |

## 5. Fila de espera e notificações

| ID | Regra |
|---|---|
| `RN-FIL-001` | Entrada é elegível quando serviço, unidade, profissional opcional e faixa de horário combinam com a vaga. |
| `RN-FIL-002` | Ordenação padrão é FIFO por criação entre candidatos compatíveis; prioridade manual exige permissão e motivo. |
| `RN-FIL-003` | Uma oferta reserva temporariamente o slot pelo prazo configurado; expiração libera o próximo candidato. |
| `RN-FIL-004` | A primeira aceitação transacional válida cria o agendamento; aceitações posteriores recebem indisponibilidade. |
| `RN-NOT-001` | Evento de negócio cria solicitação de notificação; entrega externa ocorre de forma assíncrona. |
| `RN-NOT-002` | Retry usa backoff e limite por canal; erro permanente não é repetido automaticamente. |
| `RN-NOT-003` | Chave de deduplicação impede mensagem repetida para evento, destinatário, canal e template. |
| `RN-NOT-004` | Comunicação de marketing respeita consentimento, descadastro e frequência; mensagens essenciais seguem base e política aprovadas. |
| `RN-NOT-005` | Solicitação de avaliação somente ocorre após atendimento concluído e nunca oferece vantagem em troca de avaliação. |

## 6. Comissão e financeiro

| ID | Regra |
|---|---|
| `RN-COM-001` | Regra efetiva é a mais específica vigente: item/profissional, serviço/profissional, profissional e, por último, padrão do tenant. |
| `RN-COM-002` | Base de comissão de serviço = valor bruto do item − desconto atribuído ao item. Gorjeta e taxa do meio de pagamento ficam fora, salvo regra futura explícita. |
| `RN-COM-003` | Comissão provisionada = base × taxa percentual + valor fixo, arredondada para centavos ao final de cada item. |
| `RN-COM-004` | Taxa, base, fórmula e origem são congeladas no lançamento. |
| `RN-COM-005` | No MVP a comissão é provisionada na conclusão; no intermediário seu estado de pagamento acompanha a política financeira configurada. |
| `RN-COM-006` | Reembolso cria lançamento inverso proporcional; o original não é editado. |
| `RN-COM-007` | Ajuste manual gera lançamento separado com valor, motivo, autor e aprovação quando exigida. |
| `RN-CXA-001` | Só existe um caixa aberto por unidade e escopo operacional configurado. |
| `RN-CXA-002` | Fechamento congela saldo esperado, contado e diferença; correção posterior usa reabertura excepcional ou ajuste. |
| `RN-PAG-001` | Soma de pagamentos confirmados menos reembolsos deve cobrir o total devido para estado `PAID`; tolerância zero salvo configuração explícita. |
| `RN-PAG-002` | Pagamento, reembolso e movimento de caixa são imutáveis; correções usam movimentos compensatórios. |
| `RN-PAG-003` | Desconto acima do limite do papel exige aprovação superior. |
| `RN-PAG-004` | Webhook financeiro é validado, idempotente e reconciliado pelo ID externo, nunca apenas pelo valor. |
| `RN-PAG-005` | Um comando de recebimento cria um grupo e um lançamento imutável por meio de pagamento na mesma transação. Soma dos lançamentos = total − desconto + acréscimo + gorjeta; a gorjeta permanece componente separado do atendimento. |

## 7. Estoque e fidelidade

| ID | Regra |
|---|---|
| `RN-EST-001` | Saldo = soma algébrica dos movimentos confirmados; produto não possui campo de saldo editável como autoridade. |
| `RN-EST-002` | Estoque negativo é bloqueado por padrão. Exceção configurada precisa de permissão e alerta. |
| `RN-EST-003` | Movimento confirmado é imutável; correção cria movimento inverso. |
| `RN-EST-004` | Inventário gera ajustes para as diferenças; não apaga movimentos anteriores. |
| `RN-EST-005` | Venda e baixa são confirmadas na mesma unidade de trabalho ou por processo idempotente recuperável. |
| `RN-FID-001` | Pontos são creditados somente após pagamento elegível e conclusão do atendimento. |
| `RN-FID-002` | Reembolso ou cancelamento elegível cria estorno de pontos. |
| `RN-FID-003` | Resgate consome primeiro os créditos que vencem antes, salvo regra expressa do programa. |
| `RN-FID-004` | Saldo de fidelidade é derivado de transações imutáveis. |
| `RN-FID-005` | Plano do cliente final e assinatura SaaS são domínios diferentes e não compartilham estados. |

## 8. Assinatura e administração SaaS

| ID | Regra |
|---|---|
| `RN-ASS-001` | Direitos efetivos = plano vigente + adicionais + exceções autorizadas − bloqueios. |
| `RN-ASS-002` | Exceder limite não apaga recursos existentes; bloqueia nova criação ou solicita upgrade conforme política. |
| `RN-ASS-003` | Dois dispositivos por profissional é o padrão inicial configurável; sessão excedente exige revogação ou adicional. |
| `RN-ASS-004` | Webhook do gateway não altera estado se assinatura, tenant, moeda ou valor esperado não puderem ser reconciliados. |
| `RN-ASS-005` | Suspensão por inadimplência aplica período de tolerância configurado e preserva acesso a exportação conforme política. |
| `RN-ASS-006` | Cancelamento não exclui imediatamente os dados; inicia fluxo de retenção e exportação. |
| `RN-ADM-001` | Acesso de suporte ao tenant exige justificativa, duração limitada, identidade original preservada e banner visível. |
| `RN-ADM-002` | Super Admin não pode alterar registros financeiros de tenant sem operação específica auditada. |
