# Visão do produto

**ID:** DOC-PRO-001  
**Status:** aprovado  
**Fonte canônica para:** propósito, público, objetivos e limites do produto

## 1. Definição

O Varthex Barber é um SaaS B2B2C para organizar a operação de barbearias e melhorar a experiência de seus clientes. A plataforma centraliza agenda, equipe, clientes, caixa, comissão, estoque, fidelidade, relacionamento e indicadores, com isolamento entre empresas e recursos liberados conforme o plano contratado.

## 2. Problemas que resolve

- conflitos e lacunas na agenda;
- faltas por ausência de confirmação e lembrete;
- atendimento manual excessivo pelo WhatsApp;
- falta de histórico e recorrência do cliente;
- cálculo de comissão informal;
- caixa e estoque sem rastreabilidade;
- dificuldade para avaliar ocupação, receita e desempenho;
- baixa retenção de clientes;
- ausência de visão consolidada para gestores;
- pouca padronização em redes e unidades.

## 3. Proposta de valor

> Uma operação organizada, com agenda confiável, relacionamento automatizado e números claros para o dono, o profissional e o cliente.

## 4. Público-alvo

### Primário

- barbeiros autônomos em transição para equipe;
- barbearias de uma unidade com 2 a 15 profissionais;
- barbearias com recepção, estoque e controle de comissão;
- gestores que desejam profissionalizar atendimento e recorrência.

### Expansão

- empresas com múltiplas unidades;
- redes e franquias;
- operações que necessitam API, webhooks e relatórios consolidados.

## 5. Personas

| Persona | Objetivo | Dor principal | Canal principal |
|---|---|---|---|
| Dono/Admin | Controlar operação e resultado | Dados dispersos | Desktop e celular |
| Barbeiro | Ver agenda e comissão | Mudanças e cálculos informais | Celular |
| Recepcionista | Agendar e receber com rapidez | Conflitos e retrabalho | Desktop/tablet |
| Cliente | Marcar e alterar sem fricção | Dependência de resposta manual | Celular |
| Super Admin | Operar o SaaS | Falta de visão de tenants e consumo | Desktop |

## 6. Resultados esperados

- reduzir no-show;
- aumentar ocupação de horários;
- aumentar retorno dentro do ciclo de corte;
- reduzir tempo operacional em mensagens;
- fechar caixa e comissão com rastreabilidade;
- aumentar retenção das barbearias assinantes;
- fornecer dados suficientes para decisões de preço, equipe e estoque.

## 7. Princípios do produto

1. **Agenda não pode mentir:** conflito e fuso são tratados no domínio e no banco.
2. **Acesso mínimo:** cada perfil enxerga apenas o necessário.
3. **Automação auditável:** toda mensagem, integração e ajuste crítico possui status e histórico.
4. **Configuração antes de customização:** regras variáveis ficam em configuração.
5. **Mobile para execução; desktop para gestão:** barbeiro e cliente priorizam celular.
6. **Operação continua quando fornecedor falha:** integrações não apagam o registro interno.
7. **Dados pertencem ao contexto correto:** tenant é derivado da autenticação.
8. **Evolução cumulativa:** MVP valida o núcleo; níveis posteriores não reescrevem sua base.

## 8. Canais

- dashboard administrativo;
- painel operacional do barbeiro;
- recepção e caixa;
- página pública de agendamento;
- portal do cliente;
- área do Super Admin;
- mensagens transacionais;
- API pública somente na release final.

## 9. Não objetivos do MVP

- contabilidade fiscal completa;
- prontuário de saúde;
- folha de pagamento;
- marketplace de profissionais;
- franquias;
- aplicativo nativo;
- inteligência artificial;
- integração direta com todos os adquirentes.

## 10. Métricas norteadoras

As fórmulas oficiais estão em [`02-modelo-negocio-kpis.md`](02-modelo-negocio-kpis.md). O produto acompanhará:

- ativação de tenant;
- agendamentos concluídos;
- taxa de no-show;
- ocupação;
- retorno de clientes;
- uso das automações;
- receita processada;
- tempo de resposta;
- disponibilidade;
- retenção e cancelamento do SaaS.

