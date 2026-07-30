# Segurança, privacidade e LGPD

**ID:** DOC-SEG-001  
**Status:** baseline técnica aprovada; revisão jurídica pendente  
**Fonte canônica para:** controles de segurança e tratamento de dados

Este documento orienta engenharia e operação. Não substitui assessoria jurídica.

## 1. Modelo de responsabilidade

Proposta a validar:

- a barbearia decide finalidades do cadastro e relacionamento com seus clientes;
- a Varthex opera os dados necessários para prestar o SaaS;
- a Varthex decide finalidades próprias de conta, cobrança, segurança e melhoria autorizada;
- fornecedores são subprocessadores ou operadores conforme contrato e fluxo.

`PEND-LEG-001` deve confirmar os papéis e contratos.

## 2. Classificação

| Classe | Exemplos | Controle |
|---|---|---|
| Pública | nome público, logo, serviço e preço público | Integridade |
| Interna | IDs, regras, agenda sem contato | Acesso por função |
| Pessoal | nome, telefone, e-mail, nascimento, endereço | Necessidade, acesso e retenção |
| Sensível | Não previsto por padrão | Avaliação e aprovação prévia |
| Secreta | senha hash, token, credencial, segredo de webhook | Criptografia, mínimo acesso e rotação |

Campos são classificados no catálogo CSV.

## 3. Inventário de finalidades

| Finalidade | Dados mínimos | Titular | Retenção |
|---|---|---|---|
| Autenticar | e-mail, hash, sessões | Usuário | Enquanto conta/sessão for necessária |
| Operar agenda | cliente, contato, serviço, horários | Cliente | Contrato + política aprovada |
| Notificar | contato, template e status | Cliente/usuário | Janela operacional e auditoria mínima |
| Calcular comissão | profissional, item e valores | Profissional | Política financeira aprovada |
| Cobrar SaaS | empresa, contato e IDs do gateway | Cliente B2B | Obrigação contratual/legal |
| Segurança | IP pseudonimizado, evento, correlation ID | Usuário | Janela de investigação definida |
| Suporte | dados estritamente necessários | Usuário/cliente | Duração do chamado e auditoria |

Prazo numérico definitivo depende de `PEND-LEG-003`. O sistema deve permitir políticas configuráveis e hold jurídico.

## 4. Direitos e solicitações

Processo documentado para:

- confirmação e acesso;
- correção;
- portabilidade/exportação;
- informação sobre compartilhamento;
- oposição/descadastro quando aplicável;
- eliminação quando possível;
- revisão de decisão automatizada futura;
- autenticação do solicitante;
- prazo e evidência de atendimento.

Pedido do cliente final é encaminhado ao tenant quando ele for o responsável pela finalidade, sem impedir obrigações da Varthex.

## 5. Autenticação

- senha nunca é logada ou devolvida;
- hash resistente e rehash progressivo;
- access token curto;
- refresh token rotativo e hash;
- cookies HttpOnly, Secure e SameSite;
- proteção CSRF;
- rate limit por IP pseudonimizado e identidade;
- recuperação de senha com token único, curto e hash;
- sessão e dispositivo revogáveis;
- nenhum Super Admin acessa produção sem MFA: até o MFA nativo de `RF-AUT-010` entrar na Final, o MVP e o Intermediário usam MFA obrigatório no provedor de identidade ou na camada de acesso administrativo, com auditoria.

## 6. Autorização e tenant

- backend autoriza toda ação;
- tenant não vem do body;
- repository sempre filtra;
- FK é validada no mesmo tenant;
- cache inclui tenant;
- exportação exige permissão;
- suporte usa fluxo controlado;
- testes negativos para IDOR;
- 404 evita confirmar existência externa.

## 7. Segurança de aplicação

Controles orientados pelo OWASP ASVS:

- validação allowlist;
- encoding de saída;
- CSP no frontend;
- queries parametrizadas/JPA;
- proteção contra mass assignment por DTO;
- limite de upload e inspeção de tipo;
- SSRF bloqueado em URLs configuráveis;
- rate limit;
- CORS estrito;
- headers de segurança;
- dependências verificadas;
- erros sem detalhes internos;
- serialização controlada;
- desativação de endpoints de desenvolvimento.

## 8. Segredos e criptografia

- segredo somente em secret manager/variável protegida;
- `.env.example` contém nomes, nunca valores reais;
- chaves separadas por ambiente;
- rotação documentada;
- TLS obrigatório;
- banco e backup criptografados no provedor;
- credencial externa é criptografada ou referenciada;
- hashes não são usados como criptografia reversível;
- acesso a segredo é auditado.

## 9. Logs e auditoria

Nunca registrar:

- senha;
- token completo;
- cookie;
- segredo;
- cartão;
- payload de webhook não sanitizado;
- observação de cliente sem necessidade.

Auditar:

- login e falhas agregadas;
- senha e sessão;
- permissão;
- suspensão;
- exportação;
- acesso de suporte;
- caixa, pagamento, estorno;
- comissão;
- estoque;
- consentimento;
- integração;
- configuração de plano.

## 10. Threat model resumido

| Ameaça | Ativo | Controle principal |
|---|---|---|
| IDOR entre tenants | Dados de clientes | Contexto, repository e testes |
| Roubo de sessão | Conta | Cookie seguro, rotação e revogação |
| CSRF | Mutação | Token CSRF e SameSite |
| XSS | Sessão/dados | CSP, encoding e sem HTML livre |
| SQL injection | Banco | ORM, parâmetros e revisão |
| Duplo agendamento | Agenda | Transação e constraint |
| Webhook forjado | Financeiro/integração | Assinatura, replay e idempotência |
| Abuso do Super Admin | Todos | MFA, menor privilégio e auditoria |
| Exfiltração por exportação | Dados pessoais | Permissão, log, expiração de link |
| Dependência comprometida | Aplicação | lockfile, scan e atualização |

## 11. Incidente de segurança

1. detectar e classificar;
2. preservar evidência;
3. conter acesso;
4. revogar/rotacionar;
5. avaliar tenants e titulares afetados;
6. acionar responsáveis e jurídico;
7. comunicar quando exigido;
8. recuperar e monitorar;
9. registrar causa;
10. implementar correção e teste de regressão.

O runbook operacional mantém contatos e tempos; o documento jurídico define comunicações.

## 12. Fornecedores

Antes da contratação:

- finalidade e dados;
- região;
- subprocessadores;
- contrato e segurança;
- retenção e exclusão;
- exportação;
- notificação de incidente;
- SLA;
- estratégia de saída.

## 13. Gate de segurança

MVP:

- autenticação, tenant, secrets e logs validados;
- backup restaurado;
- testes de acesso cruzado.

Intermediário:

- ASVS nível 2 planejado e controles críticos verificados;
- MFA administrativo;
- scanner de dependência e container;
- exercício de incidente.

Final:

- teste de intrusão independente periódico;
- recuperação de desastre;
- revisão de API pública;
- gestão formal de vulnerabilidades.
