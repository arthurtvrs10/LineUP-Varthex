# Audit Logs — Auditoria e Rastreabilidade

## 1. Objetivo do domínio

Registrar ações importantes para saber quem fez, quando fez e o que mudou.

## 2. Problema de negócio

Sistemas com financeiro, agenda e permissões precisam rastrear alterações. Sem auditoria, é difícil resolver conflito e investigar erro.

## 3. Atores impactados

- SuperAdmin
- Admin
- Sistema interno
- Suporte

## 4. Escopo

### Entra neste domínio

- Log de ações críticas
- Usuário responsável
- Entidade afetada
- Antes/depois quando necessário
- IP/UserAgent

### Não entra neste domínio

- Observabilidade completa
- Tracing distribuído
- SIEM

## 5. Entidades e dados principais

### AuditLog

Registro de ação relevante.

**Campos principais:**

  - `id`: UUID
  - `barbershopId`: barbearia opcional
  - `userId`: usuário responsável
  - `action`: ação
  - `resourceType`: tipo de recurso
  - `resourceId`: id do recurso
  - `beforeData`: estado anterior opcional
  - `afterData`: estado novo opcional
  - `ipAddress`: IP
  - `createdAt`: data

**Relacionamentos:**

  - Nenhum relacionamento obrigatório nesta fase.

**Observações:**



## 6. Tipos, enums e status

- AuditAction: CREATE, UPDATE, DELETE, STATUS_CHANGE, LOGIN, LOGOUT, PAYMENT, COMMISSION_ADJUST
- ResourceType: USER, APPOINTMENT, PRODUCT, COMMISSION, BARBERSHOP

## 7. DTOs conceituais

DTOs servem para entrada e saída da API. Eles não devem ser confundidos com entidades do banco.

- AuditLogResponse
- AuditLogFilter

## 8. Regras de negócio

- Ações críticas devem gerar log.
- AuditLog não deve ser editado pelo usuário comum.
- Dados sensíveis como senha nunca entram no log.
- Consulta deve respeitar barbershopId.

## 9. Permissões

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Ver logs globais | Sim | Não | Não | Não |
| Ver logs da barbearia | Sim | Sim | Não | Não |
| Criar log manual | Sistema | Sistema | Sistema | Sistema |
| Alterar log | Não | Não | Não | Não |

## 10. Fluxos principais

- Usuário executa ação crítica.
- Service conclui operação.
- AuditService registra log.
- Admin consulta logs quando necessário.

## 11. Endpoints esperados

| Método | Rota conceitual | Finalidade | Proteção |
|---|---|---|---|
| GET | /audit-logs | Listar logs | Admin/SuperAdmin |


## 12. Testes obrigatórios no Bruno

Cada processo deste domínio só deve ser considerado concluído depois de testado no Bruno ou ferramenta equivalente.

### Consultar logs

- **Objetivo:** Validar auditoria
- **Método/rota:** `GET /audit-logs?resourceType=APPOINTMENT`
- **Pré-condição:** Token Admin
- **Entrada:** filtros
- **Resultado esperado:** HTTP 200
- **Erros que precisam ser testados:** logs de outra barbearia, sem permissão

## 13. Critérios de aceite

- Log criado para ação crítica.
- Senha não aparece em log.
- Admin vê logs da própria barbearia.
- SuperAdmin vê logs globais.

## 14. Ordem de implementação recomendada por domínio

- Criar AuditLog.
- Criar AuditService.
- Integrar em ações críticas.
- Criar endpoint de consulta.
- Testar no Bruno.

## 15. Observações para desenvolvimento

Auditoria é transversal; não coloque regra de negócio principal dentro dela.

## 16. Commit sugerido

```bash
git add .
git commit -m "feat: implementa dominio audit-logs"
```

Se for apenas documentação:

```bash
git add docs/dominios
git commit -m "docs: documenta dominio audit-logs"
```
