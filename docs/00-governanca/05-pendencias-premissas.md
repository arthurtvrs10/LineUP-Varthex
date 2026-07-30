# Pendências, premissas e riscos

**ID:** DOC-GOV-005  
**Fonte canônica para:** decisões ainda externas à implementação

Pendências são explícitas para evitar decisões improvisadas no código. Nenhuma delas permite duplicar ou contradizer contratos aprovados.

## 1. Pendências comerciais

| ID | Decisão necessária | Prazo | Responsável | Bloqueia |
|---|---|---|---|---|
| `PEND-COM-001` | Preços dos planos SaaS e adicionais | Antes do nível intermediário | Product Owner | Cobrança real |
| `PEND-COM-002` | Limites finais de profissionais, unidades e mensagens | Antes do nível intermediário | Produto + Comercial | Matriz de planos |
| `PEND-COM-003` | Política de trial, desconto e inadimplência | Antes do nível intermediário | Produto + Financeiro | Assinatura |
| `PEND-COM-004` | Horários e canais de suporte | Antes da primeira venda | Produto + Suporte | SLA |

## 2. Pendências de fornecedores

| ID | Decisão necessária | Critérios | Bloqueia |
|---|---|---|---|
| `PEND-INT-001` | Provedor oficial de WhatsApp | API oficial, webhooks, custo, suporte, LGPD | Envio em produção |
| `PEND-INT-002` | Gateway de pagamento SaaS | PIX/cartão, assinaturas, webhooks, split não obrigatório | Cobrança |
| `PEND-OPS-001` | Provedor de nuvem | região, custo, banco gerenciado, backup, observabilidade | Produção |
| `PEND-OPS-002` | Provedor de e-mail | reputação, templates, webhook, custo | E-mails reais |

## 3. Pendências jurídicas

| ID | Decisão necessária | Responsável |
|---|---|---|
| `PEND-LEG-001` | Revisão dos papéis de controlador e operador | Assessoria jurídica/LGPD |
| `PEND-LEG-002` | Termos de uso, privacidade e contrato SaaS | Assessoria jurídica |
| `PEND-LEG-003` | Prazos legais de retenção por categoria | Jurídico + Contabilidade |
| `PEND-LEG-004` | Política de cancelamento e reembolso | Jurídico + Comercial |

## 4. Premissas aprovadas

- Primeira operação comercial no Brasil, moeda BRL e idioma pt-BR.
- A primeira release atende uma unidade por tenant.
- Multiunidade entra na release final.
- Cliente pode existir sem login; login é uma extensão da mesma pessoa.
- A barbearia controla sua operação e a Varthex controla assinatura, segurança da plataforma e suporte.
- Informações clínicas detalhadas não fazem parte do produto.
- Observações do cliente devem ser livres de dados excessivos e possuir controle de acesso.
- Valores de plano e limites são configuráveis, nunca constantes de código.

## 5. Riscos prioritários

| ID | Risco | Resposta |
|---|---|---|
| `RIS-SEG-001` | Vazamento entre tenants | Contexto confiável, consultas filtradas e testes negativos |
| `RIS-AGE-001` | Duplo agendamento concorrente | Transação e restrição de sobreposição no banco |
| `RIS-DAD-001` | Divergência entre migration e Entity | Flyway validate, Testcontainers e catálogo canônico |
| `RIS-INT-001` | Dependência de WhatsApp/Google | Adapters, fila, retries e contingência |
| `RIS-FIN-001` | Comissão incorreta | Snapshot da regra, razão contábil e testes manuais |
| `RIS-OPS-001` | Backup não restaurável | Exercício periódico de restauração |
| `RIS-ESC-001` | Escopo excessivo no MVP | Gate de release e aprovação do Product Owner |
| `RIS-DOC-001` | Documentação voltar a divergir | Validação, PR obrigatório e fontes canônicas |

