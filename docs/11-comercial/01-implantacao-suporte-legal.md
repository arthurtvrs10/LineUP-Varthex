# Implantação, suporte e preparação comercial

**ID:** DOC-COM-001  
**Status:** baseline sujeito a validação jurídica e financeira  
**Fonte canônica para:** processo de entrada/saída do cliente, aceite, suporte e artefatos comerciais

> Este documento é especificação operacional, não parecer jurídico, contábil ou fiscal. Contratos, política de privacidade, termos e obrigações tributárias devem ser aprovados por profissionais habilitados antes da venda.

## 1. Condições para vender

Nenhum plano pode ser comercializado antes de:

- escopo da release e limites do plano estarem publicados;
- ambiente de produção, backup, restauração, monitoramento e suporte estarem operacionais;
- testes de isolamento, segurança, aceite e carga passarem;
- termos, privacidade, tratamento de dados, suboperadores e canal do titular estarem aprovados;
- política de cobrança, cancelamento, reembolso e inadimplência estar definida;
- integração externa usada pelo plano possuir conta, aprovação, custo e contingência;
- piloto controlado atingir os critérios do roadmap.

## 2. Jornada de implantação

| Etapa | Responsável | Entrada | Saída/evidência |
|---|---|---|---|
| 1. Qualificação | P1 | interesse do lead | aderência, porte, dor, integrações e decisão |
| 2. Proposta | P1 | escopo compatível | plano, preço, limites, implantação e validade |
| 3. Contratação | P1 + jurídico | aceite comercial | contrato e anexos assinados |
| 4. Provisionamento | P5 | contratação confirmada | tenant, admin e trilha de criação |
| 5. Configuração | P1 + cliente | ficha de implantação | unidade, equipe, serviços, horários e políticas |
| 6. Migração | P2/P4 | arquivo validado | prévia, relatório, importação e reconciliação |
| 7. Treinamento | P1/P3 | ambiente configurado | gestor e operação treinados |
| 8. Homologação | P4 + cliente | roteiro de aceite | evidências e pendências classificadas |
| 9. Go-live | P5 | checklist aprovado | produção, monitoramento e suporte acompanhando |
| 10. Sucesso inicial | P1 | uso real | revisão em 7 e 30 dias |

O MVP pode iniciar sem importação automatizada (`RF-CLI-008` é intermediário). Nesse caso, cadastro manual ou importação assistida deve ter escopo e responsabilidade explícitos.

## 3. Ficha de implantação

Coletar somente o necessário:

- razão/nome comercial, documento e contatos autorizados;
- unidade, endereço, fuso e horário;
- administradores, equipe e perfis;
- categorias, serviços, duração, buffers e preço;
- jornada, pausas, férias e horizonte de reserva;
- política de cancelamento, atraso, no-show e sinal quando disponível;
- comissão e vigência;
- identidade visual e domínio/link;
- canais transacionais e consentimentos;
- origem, volume e qualidade de eventual migração;
- data-alvo, responsáveis e janela de acompanhamento.

Senhas e tokens nunca entram na ficha. Credenciais são configuradas por canal seguro e ficam no gerenciador de segredos.

## 4. Critérios de aceite do cliente

O aceite de implantação cobre:

1. usuários e permissões;
2. catálogo e profissionais;
3. disponibilidade e bloqueios;
4. criação, alteração, cancelamento e conclusão de agenda;
5. comissão e resumo;
6. notificações contratadas;
7. identidade e canal de reserva contratado — autenticado no MVP; público sem conta a partir do Intermediário;
8. exportação e suporte;
9. desempenho observado no volume acordado;
10. pendências conhecidas e data de correção.

Aceite não elimina garantia ou dever legal. Defeito crítico impede go-live; desvio menor pode entrar em plano aceito com responsável e prazo.

## 5. Suporte

### Canais e prioridade

| Prioridade | Exemplo | Meta inicial proposta |
|---|---|---:|
| P1 | serviço indisponível, acesso cruzado ou risco a dados | resposta em 30 min no horário contratado |
| P2 | agenda/caixa crítico degradado sem alternativa adequada | 2 h úteis |
| P3 | função parcial com alternativa | 8 h úteis |
| P4 | dúvida, melhoria ou cosmético | 2 dias úteis |

As metas são propostas para precificação e precisam constar no contrato com horário, fuso, canais, exclusões, manutenção, forma de medição e eventual crédito. SLO técnico de `RNF-OPS-001` não vira SLA automaticamente.

### Processo

1. identificar solicitante, tenant, impacto, horário e evidência;
2. classificar prioridade sem pedir dado sensível desnecessário;
3. correlacionar incidente e informar protocolo;
4. contornar ou corrigir, mantendo atualizações;
5. validar com o cliente e registrar causa/solução;
6. transformar recorrência em problema, requisito ou ação operacional.

Modo suporte (`RF-ADM-006`) exige autorização, motivo, prazo, banner visível e auditoria. Nunca solicitar a senha do cliente.

## 6. Planos e limites

Antes da precificação final, resolver `PEND-COM-*`. A tabela pública de cada plano deve declarar:

- número de unidades, profissionais, usuários e dispositivos;
- volume ou franquia de mensagens;
- recursos dos níveis MVP, intermediário e final;
- armazenamento, retenção e exportação;
- integrações e custos repassados;
- suporte e implantação incluídos;
- excedentes, reajuste, trial e cancelamento.

Feature flags implementam direitos (`RF-ASS-009`), mas o catálogo comercial é a fonte do que foi vendido. Uma flag não pode revogar silenciosamente direito contratado.

## 7. Encerramento e portabilidade

| Fase | Ação |
|---|---|
| Solicitação | validar autoridade e registrar data de efeito |
| Preparação | informar débitos, integrações, retenção e formato de exportação |
| Exportação | produzir arquivo legível e auditado pelo escopo autorizado |
| Revogação | invalidar sessões, chaves, OAuth e acesso de suporte |
| Retenção | bloquear operação e preservar apenas conforme base/prazo aprovado |
| Exclusão/anonimização | executar política e manter prova sem conservar conteúdo indevido |
| Confirmação | comunicar conclusão e exceções legais aplicáveis |

Backups seguem ciclo próprio documentado; a política deve explicar quando os dados deixam as cópias e como ficam protegidos até lá.

## 8. Pacote jurídico e de privacidade

Revisão jurídica obrigatória antes da venda:

- contrato de licença/SaaS e ordem de serviço;
- termos de uso para gestor, equipe e cliente;
- política de privacidade e cookies;
- anexo de tratamento de dados e papéis de controlador/operador;
- relação de suboperadores e transferências internacionais;
- política de retenção e descarte;
- procedimento de direitos do titular;
- procedimento de incidente e comunicação;
- política de uso aceitável;
- condições de trial, cobrança, reajuste, suspensão e cancelamento;
- autorização de marca/depoimento, quando utilizada;
- termos específicos de WhatsApp, Google e gateway.

## 9. Responsabilidades

| Tema | Varthex | Barbearia cliente |
|---|---|---|
| Plataforma e correções | operar conforme contrato | reportar evidências |
| Configuração | fornecer meios e orientação | validar serviços, preço, agenda e políticas |
| Acessos | controles, auditoria e recuperação | administrar usuários e revogar desligados |
| Dados | proteger e processar instruções válidas | inserir dados lícitos, corretos e minimizados |
| Consentimento/comunicação | implementar controles contratados | definir finalidade e comprovar base aplicável |
| Integrações | manter conector suportado | manter conta, aprovação e custos quando previsto |
| Continuidade | backup e restauração conforme plano | manter procedimentos operacionais alternativos |

## 10. Indicadores de implantação e sucesso

- tempo da assinatura ao go-live;
- percentual de ficha válida na primeira entrega;
- erros de importação e reconciliação;
- usuários treinados/ativos;
- agendamentos criados e concluídos;
- taxa de no-show e ocupação;
- chamados por tenant e tempo de solução;
- ativação em 7/30 dias, retenção e cancelamento;
- NPS/CSAT com método e amostra explícitos.
