# Modelo de negócio e KPIs

**ID:** DOC-PRO-002  
**Status:** aprovado com valores comerciais configuráveis  
**Fonte canônica para:** estrutura de planos, medição e fórmulas

## 1. Modelo de receita

O Varthex Barber será vendido por assinatura mensal ou anual. Recursos e limites são configurados por plano e adicionais; nenhum preço ou limite deve ser fixado no código.

## 2. Matriz proposta de planos

| Capacidade | Essencial | Profissional | Rede |
|---|---:|---:|---:|
| Release mínima | MVP | Intermediário | Final |
| Unidades incluídas | 1 | 1 | Configurável |
| Profissionais | Configurável | Configurável | Configurável |
| Dispositivos por profissional | 2 | 2 | Configurável |
| Agenda e clientes | Sim | Sim | Sim |
| Comissão básica | Sim | Sim | Sim |
| Caixa, estoque e fidelidade | Não | Sim | Sim |
| CRM e WhatsApp | Adicional ou não | Sim/limite | Sim/limite |
| Relatórios avançados | Não | Sim | Sim |
| Multiunidade | Não | Não | Sim |
| API e webhooks | Não | Não | Opcional |

Preços, quantidades finais e franquias são configurados no catálogo comercial e dependem de `PEND-COM-001` e `PEND-COM-002`.

## 3. Regras comerciais estruturais

- assinatura possui estado `TRIAL`, `ACTIVE`, `PAST_DUE`, `SUSPENDED` ou `CANCELED`;
- downgrade não remove histórico;
- excedente pode bloquear nova utilização ou gerar adicional, conforme configuração;
- limite de dispositivos é por usuário ou profissional e precisa ser revogável;
- CRM/WhatsApp deve medir uso por tenant e período;
- alteração de plano é auditada;
- permissões comerciais são expressas por feature flags e limites;
- cobrança do SaaS é separada do caixa da barbearia.

## 4. Funil de ativação

Um tenant é considerado ativado quando, dentro da janela configurada:

1. concluiu cadastro da empresa;
2. cadastrou pelo menos um profissional;
3. cadastrou pelo menos um serviço;
4. definiu disponibilidade;
5. criou ou recebeu o primeiro agendamento;
6. concluiu o primeiro atendimento.

## 5. KPIs de produto

| ID | Indicador | Fórmula |
|---|---|---|
| `KPI-ATV-001` | Taxa de ativação | tenants ativados / tenants criados elegíveis |
| `KPI-AGE-001` | Conversão de agendamento | agendamentos confirmados / tentativas válidas |
| `KPI-AGE-002` | Taxa de ocupação | minutos reservados válidos / minutos disponíveis |
| `KPI-AGE-003` | No-show | atendimentos marcados como falta / agendamentos esperados |
| `KPI-CLI-001` | Retorno no ciclo | clientes que retornaram no prazo / clientes elegíveis |
| `KPI-FIL-001` | Conversão da fila | ofertas aceitas / ofertas entregues |
| `KPI-NOT-001` | Entrega de mensagens | mensagens entregues / mensagens enviadas |
| `KPI-NOT-002` | Falha definitiva | mensagens com falha final / mensagens solicitadas |
| `KPI-SAA-001` | Conversão de trial | trials convertidos / trials encerrados |
| `KPI-SAA-002` | Churn de clientes | tenants cancelados no período / tenants ativos no início |

## 6. KPIs operacionais da barbearia

| ID | Indicador | Fórmula |
|---|---|---|
| `KPI-FIN-001` | Receita líquida operacional | pagamentos confirmados - reembolsos - descontos não incorporados |
| `KPI-FIN-002` | Ticket médio | receita líquida / atendimentos pagos |
| `KPI-COM-001` | Comissão provisionada | soma dos lançamentos de comissão não estornados |
| `KPI-EST-001` | Giro de estoque | custo dos itens vendidos / estoque médio a custo |
| `KPI-CRM-001` | Clientes inativos | clientes sem atendimento concluído após limiar configurado |

## 7. KPIs técnicos

- disponibilidade por ambiente;
- latência p50, p95 e p99;
- taxa de erro por operação;
- jobs atrasados;
- falha de webhook;
- tempo de recuperação;
- sucesso de backup;
- custo mensal por tenant ativo;
- incidentes por release.

## 8. Instrumentação

Eventos de produto usam nome estável, por exemplo:

- `tenant.activated`;
- `appointment.created`;
- `appointment.completed`;
- `waitlist.offer.accepted`;
- `payment.confirmed`;
- `notification.delivered`;
- `subscription.plan_changed`.

Eventos analíticos não substituem registros transacionais e não devem transportar dados pessoais desnecessários.
