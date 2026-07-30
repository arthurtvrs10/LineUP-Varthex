# Catálogo de requisitos funcionais

**ID:** DOC-REQ-001  
**Status:** aprovado  
**Fonte canônica para:** funcionalidades e release-alvo  
**Detalhamento lógico:** [`02-regras-negocio.md`](02-regras-negocio.md)

## 1. Leitura

- `MVP`: piloto controlado.
- `INTERMEDIARIO`: versão comercial.
- `FINAL`: plataforma completa planejada.
- “Aceite” resume o resultado observável; regras numéricas ficam no catálogo de regras ou configurações.

## 2. Autenticação e sessão

| ID | Release | Requisito | Aceite resumido |
|---|---|---|---|
| `RF-AUT-001` | MVP | Autenticar usuário por e-mail e senha. | Credenciais válidas criam sessão; inválidas retornam erro genérico. |
| `RF-AUT-002` | MVP | Renovar sessão com refresh token rotativo. | Token usado é invalidado e substituído sem expor seu valor persistido. |
| `RF-AUT-003` | MVP | Encerrar sessão atual. | Refresh token e cookies da sessão deixam de funcionar. |
| `RF-AUT-004` | MVP | Encerrar todas as sessões. | Todas as sessões ativas do usuário são revogadas. |
| `RF-AUT-005` | MVP | Solicitar e concluir recuperação de senha. | Link de uso único expira e não revela se o e-mail existe. |
| `RF-AUT-006` | MVP | Alterar senha autenticado. | Exige senha atual ou reautenticação e revoga sessões configuradas. |
| `RF-AUT-007` | MVP | Bloquear tentativas abusivas. | Rate limit e bloqueio temporário são registrados. |
| `RF-AUT-008` | MVP | Consultar sessões e dispositivos. | Usuário visualiza e revoga sessões próprias. |
| `RF-AUT-009` | INTERMEDIARIO | Verificar e-mail e telefone. | Códigos expiram e status de verificação é auditável. |
| `RF-AUT-010` | FINAL | Exigir autenticação reforçada em perfis sensíveis. | Super Admin e ações críticas suportam segundo fator. |

## 3. Tenant, unidade e usuários

| ID | Release | Requisito | Aceite resumido |
|---|---|---|---|
| `RF-TEN-001` | MVP | Cadastrar barbearia e sua unidade inicial. | Tenant e unidade são criados de forma atômica. |
| `RF-TEN-002` | MVP | Configurar nome, documento, endereço, fuso e contato. | Dados válidos ficam disponíveis apenas ao tenant. |
| `RF-TEN-003` | MVP | Configurar horários gerais de funcionamento. | Agenda utiliza a configuração vigente. |
| `RF-TEN-004` | MVP | Ativar ou desativar a barbearia. | Desativação impede nova operação sem excluir histórico. |
| `RF-TEN-005` | MVP | Personalizar logo e identidade básica. | Arquivos são validados e exibidos nos canais aprovados. |
| `RF-TEN-006` | MVP | Isolar dados por tenant. | Testes demonstram que IDs externos não atravessam tenants. |
| `RF-TEN-007` | FINAL | Cadastrar múltiplas unidades. | Cada unidade possui agenda, equipe e caixa próprios. |
| `RF-TEN-008` | FINAL | Consolidar unidades. | Gestor autorizado consulta indicadores consolidados. |
| `RF-TEN-009` | FINAL | Transferir profissional entre unidades. | Vínculo preserva histórico e respeita vigência. |
| `RF-TEN-010` | FINAL | Transferir estoque entre unidades. | Saída e entrada correlacionadas são auditáveis. |
| `RF-USR-001` | MVP | Convidar usuário para o tenant. | Convite único expira e vincula papel autorizado. |
| `RF-USR-002` | MVP | Ativar, bloquear e desativar usuário. | Acesso muda sem apagar registros históricos. |
| `RF-USR-003` | MVP | Atribuir papéis padrão. | Permissões efetivas correspondem à matriz canônica. |
| `RF-USR-004` | MVP | Editar perfil próprio. | Usuário altera apenas campos permitidos. |
| `RF-USR-005` | MVP | Listar equipe conforme permissão. | Dados sensíveis não aparecem para perfis não autorizados. |
| `RF-USR-006` | MVP | Revogar acesso ao tenant. | Sessões do vínculo são invalidadas. |
| `RF-USR-007` | INTERMEDIARIO | Disponibilizar gerente, recepção e caixa. | Papéis atuam segundo matriz sem privilégio administrativo indevido. |
| `RF-USR-008` | INTERMEDIARIO | Restringir acesso por unidade. | Usuário acessa apenas unidades vinculadas. |
| `RF-USR-009` | INTERMEDIARIO | Registrar trilha de alterações de permissão. | Antes, depois, autor e data ficam auditados. |
| `RF-USR-010` | FINAL | Criar papéis personalizados. | Conjunto de permissões é validado e versionado. |

## 4. Clientes, profissionais e serviços

| ID | Release | Requisito | Aceite resumido |
|---|---|---|---|
| `RF-CLI-001` | MVP | Cadastrar cliente sem login. | Nome e meio de contato mínimo criam perfil no tenant. |
| `RF-CLI-002` | MVP | Editar cliente. | Alteração respeita permissão e gera auditoria quando sensível. |
| `RF-CLI-003` | MVP | Consultar histórico de atendimentos. | Somente registros do tenant são exibidos em ordem. |
| `RF-CLI-004` | MVP | Registrar preferências e observações operacionais. | Campo possui limite, acesso restrito e orientação contra excesso. |
| `RF-CLI-005` | MVP | Identificar cadastro possivelmente duplicado. | E-mail/telefone normalizado gera alerta, sem união automática. |
| `RF-CLI-006` | MVP | Arquivar cliente. | Perfil sai de seleções novas e mantém histórico. |
| `RF-CLI-007` | MVP | Permitir login do cliente vinculado. | Cliente autenticado acessa apenas seus dados e agendamentos. |
| `RF-CLI-008` | INTERMEDIARIO | Importar clientes por arquivo. | Prévia, validação, relatório de erro e idempotência são oferecidos. |
| `RF-CLI-009` | INTERMEDIARIO | Exportar clientes conforme autorização. | Exportação é auditada e respeita filtros e privacidade. |
| `RF-CLI-010` | FINAL | Unificar duplicidades com revisão humana. | Histórico é associado e operação permanece reversível por suporte. |
| `RF-BAR-001` | MVP | Criar perfil profissional para usuário. | Perfil fica vinculado ao tenant e unidade. |
| `RF-BAR-002` | MVP | Configurar nome público, bio e especialidades. | Informações aparecem nos canais definidos. |
| `RF-BAR-003` | MVP | Ativar e desativar profissional. | Novos agendamentos respeitam vigência; histórico permanece. |
| `RF-BAR-004` | MVP | Associar serviços executáveis. | Agenda oferece apenas serviços autorizados. |
| `RF-BAR-005` | MVP | Consultar agenda própria. | Profissional vê detalhes permitidos e alterações atualizadas. |
| `RF-BAR-006` | MVP | Consultar comissão própria. | Somente lançamentos do profissional autenticado são exibidos. |
| `RF-SER-001` | MVP | Cadastrar categoria de serviço. | Nome é único no tenant entre registros ativos. |
| `RF-SER-002` | MVP | Cadastrar serviço. | Nome, duração, preço e status são obrigatórios conforme catálogo. |
| `RF-SER-003` | MVP | Configurar duração e buffers. | Disponibilidade considera todos os minutos configurados. |
| `RF-SER-004` | MVP | Associar serviço a profissionais. | Vínculo pode sobrescrever duração ou preço quando autorizado. |
| `RF-SER-005` | MVP | Desativar serviço. | Serviço não entra em novos agendamentos e histórico permanece. |
| `RF-SER-006` | MVP | Ordenar serviços na jornada de reserva. | Ordem configurada é respeitada nos canais disponíveis da release. |
| `RF-SER-007` | INTERMEDIARIO | Criar combos e adicionais. | Preço, duração e itens ficam discriminados. |
| `RF-SER-008` | FINAL | Definir catálogo por unidade. | Disponibilidade e preço seguem a unidade do agendamento. |

## 5. Disponibilidade, agenda e fila de espera

| ID | Release | Requisito | Aceite resumido |
|---|---|---|---|
| `RF-DIS-001` | MVP | Configurar jornada semanal do profissional. | Faixas não se sobrepõem e respeitam a unidade. |
| `RF-DIS-002` | MVP | Configurar pausas recorrentes. | Pausas retiram horários da disponibilidade. |
| `RF-DIS-003` | MVP | Criar bloqueio pontual ou por período. | Intervalo bloqueado não pode receber agendamento ativo. |
| `RF-DIS-004` | MVP | Registrar férias, ausência ou feriado. | Motivo e vigência ficam registrados. |
| `RF-DIS-005` | MVP | Consultar slots disponíveis. | Resultado considera jornada, serviço, buffer, bloqueio e agenda. |
| `RF-DIS-006` | MVP | Configurar antecedência e horizonte de reserva. | Slots fora da janela não são oferecidos. |
| `RF-AGE-001` | MVP | Criar agendamento interno. | Transação cria reserva sem conflito e registra autor. |
| `RF-AGE-002` | MVP | Criar agendamento pelo cliente. | Cliente seleciona unidade, serviço, profissional e slot válido. |
| `RF-AGE-003` | MVP | Editar agendamento. | Nova combinação é revalidada antes de persistir. |
| `RF-AGE-004` | MVP | Reagendar. | Histórico preserva horário anterior, autor e motivo. |
| `RF-AGE-005` | MVP | Cancelar. | Política vigente é aplicada e motivo é registrado. |
| `RF-AGE-006` | MVP | Confirmar. | Status válido muda e gera evento de confirmação. |
| `RF-AGE-007` | MVP | Registrar check-in. | Horário e responsável ficam registrados. |
| `RF-AGE-008` | MVP | Iniciar atendimento. | Somente transição permitida altera o status. |
| `RF-AGE-009` | MVP | Concluir atendimento. | Itens e valores são congelados para comissão e relatórios. |
| `RF-AGE-010` | MVP | Registrar falta. | Política e evento de no-show são aplicados. |
| `RF-AGE-011` | MVP | Criar encaixe. | Encaixe continua sujeito a disponibilidade e permissão. |
| `RF-AGE-012` | MVP | Agendar múltiplos serviços. | Duração, preço e itens são calculados e preservados. |
| `RF-AGE-013` | MVP | Criar série recorrente. | Instâncias são geradas até o horizonte e conflitos são relatados. |
| `RF-AGE-014` | MVP | Alterar uma instância ou série. | Usuário escolhe escopo e sistema informa impacto. |
| `RF-AGE-015` | MVP | Visualizar agenda diária e semanal. | Filtros por profissional e status funcionam. |
| `RF-AGE-016` | INTERMEDIARIO | Exibir agenda mensal e busca avançada. | Intervalo, cliente, profissional e status podem ser combinados. |
| `RF-AGE-017` | INTERMEDIARIO | Reservar sem criar conta. | Identidade mínima e consentimentos aplicáveis são coletados. |
| `RF-AGE-018` | INTERMEDIARIO | Aplicar política de sinal. | Reserva sinalizada possui prazo, pagamento e expiração. |
| `RF-FIL-001` | MVP | Incluir cliente na fila de espera. | Preferências de serviço, profissional e faixa são registradas. |
| `RF-FIL-002` | MVP | Localizar candidatos para vaga. | Somente entradas compatíveis e ativas são retornadas. |
| `RF-FIL-003` | MVP | Enviar oferta de vaga. | Oferta possui validade e status. |
| `RF-FIL-004` | MVP | Aceitar oferta e converter em agendamento. | Primeira aceitação válida reserva o slot de forma atômica. |
| `RF-FIL-005` | MVP | Expirar ou remover entrada. | Registro deixa de concorrer e mantém histórico. |

## 6. Comissão, dashboard e notificações do MVP

| ID | Release | Requisito | Aceite resumido |
|---|---|---|---|
| `RF-COM-001` | MVP | Configurar regra percentual por profissional. | Regra possui vigência e não altera histórico anterior. |
| `RF-COM-002` | MVP | Configurar regra por serviço. | Regra mais específica prevalece segundo catálogo. |
| `RF-COM-003` | MVP | Calcular comissão ao concluir atendimento. | Snapshot da base, taxa e resultado é persistido. |
| `RF-COM-004` | MVP | Consultar comissão por período. | Admin vê equipe; barbeiro vê apenas seus lançamentos. |
| `RF-COM-005` | MVP | Ajustar lançamento com justificativa. | Operação exige permissão e auditoria. |
| `RF-REL-001` | MVP | Exibir resumo do dia. | Agenda, concluídos, cancelados, faltas e valor são consistentes. |
| `RF-REL-002` | MVP | Exibir comissão diária, semanal e mensal. | Períodos usam fuso da unidade e dados provisionados. |
| `RF-REL-003` | MVP | Filtrar dashboard por profissional. | Somente dados autorizados aparecem. |
| `RF-REL-004` | MVP | Exportar resumo operacional. | Arquivo respeita filtro, tenant e permissão. |
| `RF-NOT-001` | MVP | Criar notificação interna por evento. | Destinatário, tipo, status e referência são registrados. |
| `RF-NOT-002` | MVP | Marcar notificação como lida. | Usuário altera apenas notificações próprias. |
| `RF-NOT-003` | MVP | Enviar e-mail transacional essencial. | Solicitação, entrega ou falha ficam registradas. |
| `RF-NOT-004` | MVP | Configurar preferências permitidas. | Notificações obrigatórias não podem ser desativadas indevidamente. |
| `RF-ADM-001` | MVP | Super Admin listar tenants. | Busca e status funcionam sem expor dados excessivos. |
| `RF-ADM-002` | MVP | Super Admin suspender e reativar tenant. | Motivo, autor e vigência são auditados. |
| `RF-ADM-003` | MVP | Super Admin consultar saúde operacional. | Métricas técnicas agregadas ficam disponíveis. |

## 7. Caixa, pagamentos, estoque e fidelidade

| ID | Release | Requisito | Aceite resumido |
|---|---|---|---|
| `RF-CXA-001` | INTERMEDIARIO | Abrir caixa por unidade. | Apenas um caixa ativo por escopo configurado. |
| `RF-CXA-002` | INTERMEDIARIO | Registrar saldo inicial. | Valor e responsável são auditados. |
| `RF-CXA-003` | INTERMEDIARIO | Registrar suprimento e sangria. | Tipo, valor, motivo e autor são obrigatórios. |
| `RF-CXA-004` | INTERMEDIARIO | Fechar caixa. | Esperado, informado e diferença ficam congelados. |
| `RF-CXA-005` | INTERMEDIARIO | Reabrir caixa excepcionalmente. | Exige permissão elevada e justificativa. |
| `RF-CXA-006` | INTERMEDIARIO | Consultar movimentos do caixa. | Todos os movimentos possuem origem e correlação. |
| `RF-PAG-001` | INTERMEDIARIO | Registrar pagamento de atendimento. | Meio, valor, estado e caixa são persistidos. |
| `RF-PAG-002` | INTERMEDIARIO | Dividir pagamento entre meios. | Soma confirmada corresponde ao total exigido. |
| `RF-PAG-003` | INTERMEDIARIO | Aplicar desconto e acréscimo. | Motivo e permissão seguem limite configurado. |
| `RF-PAG-004` | INTERMEDIARIO | Registrar gorjeta. | Gorjeta fica separada da receita de serviço. |
| `RF-PAG-005` | INTERMEDIARIO | Estornar ou reembolsar. | Movimento inverso mantém trilha e ajusta dependências. |
| `RF-PAG-006` | INTERMEDIARIO | Emitir comprovante não fiscal. | Documento identifica itens, pagamentos e estabelecimento. |
| `RF-PAG-007` | FINAL | Receber sinal ou pagamento online. | Webhook idempotente confirma ou expira a cobrança. |
| `RF-PAG-008` | FINAL | Conciliar gateway e registros internos. | Divergências são listadas sem alteração silenciosa. |
| `RF-EST-001` | INTERMEDIARIO | Cadastrar produto e categoria. | SKU é único por tenant quando informado. |
| `RF-EST-002` | INTERMEDIARIO | Cadastrar fornecedor. | Dados comerciais respeitam acesso e tenant. |
| `RF-EST-003` | INTERMEDIARIO | Registrar entrada. | Quantidade, custo, origem e autor são obrigatórios. |
| `RF-EST-004` | INTERMEDIARIO | Registrar venda de produto. | Pagamento e baixa de estoque são correlacionados. |
| `RF-EST-005` | INTERMEDIARIO | Registrar consumo em serviço. | Regra do serviço gera movimento auditável. |
| `RF-EST-006` | INTERMEDIARIO | Registrar perda ou ajuste. | Motivo e permissão são obrigatórios. |
| `RF-EST-007` | INTERMEDIARIO | Alertar estoque mínimo. | Alerta evita duplicidade enquanto condição persistir. |
| `RF-EST-008` | INTERMEDIARIO | Realizar inventário. | Diferenças geram movimentos, não edição do passado. |
| `RF-EST-009` | INTERMEDIARIO | Consultar posição e movimentação. | Saldo reproduz movimentos confirmados. |
| `RF-EST-010` | INTERMEDIARIO | Calcular margem estimada. | Receita e custo adotado ficam explicitados. |
| `RF-EST-011` | FINAL | Criar pedido de compra. | Itens evoluem de planejado a recebido. |
| `RF-EST-012` | FINAL | Transferir estoque entre unidades. | Saída e entrada compartilham correlação. |
| `RF-EST-013` | FINAL | Sugerir reposição. | Cálculo apresenta premissas e não compra automaticamente. |
| `RF-FID-001` | INTERMEDIARIO | Criar conta de fidelidade. | Uma conta por cliente e programa. |
| `RF-FID-002` | INTERMEDIARIO | Creditar pontos após pagamento. | Crédito é idempotente e referencia a origem. |
| `RF-FID-003` | INTERMEDIARIO | Resgatar pontos. | Saldo e validade são validados em transação. |
| `RF-FID-004` | INTERMEDIARIO | Estornar pontos. | Movimento inverso mantém rastreabilidade. |
| `RF-FID-005` | INTERMEDIARIO | Criar pacote de serviços. | Créditos, validade e preço são configuráveis. |
| `RF-FID-006` | INTERMEDIARIO | Consumir crédito do pacote. | Consumo referencia atendimento concluído. |
| `RF-FID-007` | INTERMEDIARIO | Criar plano recorrente do cliente. | Estado e ciclo são separados da assinatura SaaS. |
| `RF-FID-008` | INTERMEDIARIO | Consultar extrato de fidelidade. | Origem, validade e saldo são reproduzíveis. |

## 8. CRM, integrações e assinatura SaaS

| ID | Release | Requisito | Aceite resumido |
|---|---|---|---|
| `RF-CRM-001` | INTERMEDIARIO | Identificar aniversariantes e inativos. | Segmentos usam critérios configurados e dados do tenant. |
| `RF-CRM-002` | INTERMEDIARIO | Agendar lembrete de novo corte. | Próxima data considera serviço e preferência. |
| `RF-CRM-003` | INTERMEDIARIO | Registrar consentimento e descadastro. | Finalidade, origem, data e prova são mantidas. |
| `RF-CRM-004` | INTERMEDIARIO | Consultar histórico de comunicações. | Status por canal e referência ficam visíveis. |
| `RF-CRM-005` | INTERMEDIARIO | Configurar templates transacionais. | Variáveis permitidas são validadas. |
| `RF-CRM-006` | INTERMEDIARIO | Medir clique e conversão quando permitido. | Evento não coleta dado desnecessário. |
| `RF-CRM-007` | FINAL | Criar campanhas segmentadas. | Público é congelado ou recalculado conforme escolha explícita. |
| `RF-CRM-008` | FINAL | Criar automações por evento. | Gatilho, atraso, condição e limite são auditáveis. |
| `RF-CRM-009` | FINAL | Aplicar frequência máxima de contato. | Motor impede excesso por canal. |
| `RF-CRM-010` | FINAL | Comparar resultado de campanhas. | Métricas usam atribuição documentada. |
| `RF-NOT-005` | INTERMEDIARIO | Enviar confirmação pelo WhatsApp. | Template e status do provedor são registrados. |
| `RF-NOT-006` | INTERMEDIARIO | Enviar lembrete pelo WhatsApp. | Janela e opt-out são respeitados. |
| `RF-NOT-007` | INTERMEDIARIO | Enviar oferta da fila. | Oferta possui expiração e link de uso único. |
| `RF-NOT-008` | INTERMEDIARIO | Enviar solicitação de avaliação. | Somente atendimento concluído e política de frequência permitem envio. |
| `RF-NOT-009` | INTERMEDIARIO | Reprocessar entrega temporariamente falha. | Backoff e limite evitam duplicidade. |
| `RF-NOT-010` | INTERMEDIARIO | Controlar franquia de mensagens. | Consumo por tenant e período fica disponível. |
| `RF-INT-001` | INTERMEDIARIO | Conectar Google Calendar por OAuth. | Consentimento, escopos e tokens são protegidos. |
| `RF-INT-002` | INTERMEDIARIO | Sincronizar eventos de agenda. | Criação, alteração e cancelamento são idempotentes. |
| `RF-INT-003` | INTERMEDIARIO | Configurar link de avaliação Google. | Link validado pode ser usado nos templates. |
| `RF-INT-004` | INTERMEDIARIO | Receber webhooks de fornecedores. | Assinatura, replay e idempotência são verificados. |
| `RF-INT-005` | INTERMEDIARIO | Exibir estado da integração. | Conectado, degradado, expirado e desconectado são distinguíveis. |
| `RF-INT-006` | FINAL | Oferecer API pública com chaves. | Escopo, limite e auditoria são aplicados. |
| `RF-INT-007` | FINAL | Permitir webhooks de saída. | Assinatura, retries e desativação por falha existem. |
| `RF-ASS-001` | INTERMEDIARIO | Criar trial. | Início, fim, plano e limites são registrados. |
| `RF-ASS-002` | INTERMEDIARIO | Assinar plano mensal ou anual. | Cobrança confirmada ativa direitos. |
| `RF-ASS-003` | INTERMEDIARIO | Alterar plano. | Vigência, prorrateio do provedor e direitos são auditados. |
| `RF-ASS-004` | INTERMEDIARIO | Suspender por inadimplência. | Política configurada e período de tolerância são aplicados. |
| `RF-ASS-005` | INTERMEDIARIO | Cancelar assinatura. | Data de efeito e exportação são informadas. |
| `RF-ASS-006` | INTERMEDIARIO | Aplicar limite de profissionais. | Inclusão acima do limite é bloqueada ou oferecida como adicional. |
| `RF-ASS-007` | INTERMEDIARIO | Aplicar limite de dispositivos. | Nova sessão acima do limite exige revogação ou adicional. |
| `RF-ASS-008` | INTERMEDIARIO | Aplicar limite de mensagens. | Uso e excedente seguem configuração do plano. |
| `RF-ASS-009` | INTERMEDIARIO | Usar feature flags por plano e tenant. | Direito efetivo é calculado e auditável. |
| `RF-ASS-010` | INTERMEDIARIO | Processar webhooks de cobrança. | Eventos repetidos não duplicam cobrança ou estado. |

## 9. Administração, relatórios e capacidades finais

| ID | Release | Requisito | Aceite resumido |
|---|---|---|---|
| `RF-ADM-004` | INTERMEDIARIO | Gerenciar planos e limites. | Alteração possui vigência e histórico. |
| `RF-ADM-005` | INTERMEDIARIO | Consultar consumo por tenant. | Usuários, dispositivos, mensagens e armazenamento são exibidos. |
| `RF-ADM-006` | INTERMEDIARIO | Acessar tenant em modo suporte controlado. | Exige motivo, prazo, banner e auditoria; pode ser desativado. |
| `RF-ADM-007` | INTERMEDIARIO | Gerenciar cupons. | Validade, elegibilidade e uso máximo são aplicados. |
| `RF-ADM-008` | INTERMEDIARIO | Consultar assinaturas e inadimplência. | Estado e ações permitidas são claros. |
| `RF-REL-005` | INTERMEDIARIO | Relatar caixa por período. | Aberturas, fechamentos e divergências são conciliáveis. |
| `RF-REL-006` | INTERMEDIARIO | Relatar pagamentos e reembolsos. | Totais são decomponíveis até o movimento. |
| `RF-REL-007` | INTERMEDIARIO | Relatar comissão detalhada. | Base, taxa, ajuste e estorno são apresentados. |
| `RF-REL-008` | INTERMEDIARIO | Relatar estoque e margem. | Saldo e custo seguem movimentos. |
| `RF-REL-009` | INTERMEDIARIO | Relatar clientes novos e recorrentes. | Critérios são exibidos no relatório. |
| `RF-REL-010` | INTERMEDIARIO | Relatar ocupação e no-show. | Minutos disponíveis e reservados são reproduzíveis. |
| `RF-REL-011` | INTERMEDIARIO | Comparar períodos. | Períodos equivalentes usam o fuso da unidade. |
| `RF-REL-012` | INTERMEDIARIO | Exportar CSV/PDF operacional. | Filtros e permissão são preservados. |
| `RF-REL-013` | FINAL | Consolidar múltiplas unidades. | Totais podem ser detalhados por unidade. |
| `RF-REL-014` | FINAL | Criar metas por profissional e unidade. | Período, alvo e realizado são rastreáveis. |
| `RF-REL-015` | FINAL | Disponibilizar BI e indicadores preditivos. | Modelo apresenta fonte, atualização e nível de confiança. |
| `RF-REL-016` | FINAL | Sugerir reposição e horários. | Sugestão nunca executa ação sem confirmação. |
| `RF-REL-017` | FINAL | Personalizar dashboards. | Widgets respeitam permissão e salvam preferência. |
