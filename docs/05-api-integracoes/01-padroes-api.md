# Padrões de API

**ID:** DOC-API-001  
**Status:** aprovado  
**Contrato canônico:** [`openapi.yaml`](openapi.yaml)

## 1. Princípios

- REST JSON sob `/api/v1`;
- recursos no plural;
- OpenAPI alterado junto do requisito;
- DTOs, não Entities;
- tenant derivado da sessão;
- paginação em toda coleção potencialmente grande;
- idempotência em operações críticas;
- erros previsíveis e seguros;
- datas ISO 8601 em UTC;
- dinheiro em string decimal no JSON;
- breaking change exige `/api/v2` ou estratégia compatível aprovada.

## 2. Métodos e status

| Operação | Método | Sucesso |
|---|---|---:|
| Criar | `POST` | 201 |
| Consultar | `GET` | 200 |
| Atualizar parcialmente | `PATCH` | 200 |
| Substituir configuração | `PUT` | 200 |
| Remover/arquivar | `DELETE` | 204 |
| Ação de domínio | `POST /{id}/actions/{action}` | 200 |

## 3. Erro padrão

```json
{
  "type": "https://docs.varthex.com/errors/appointment-conflict",
  "title": "Horário indisponível",
  "status": 409,
  "code": "APPOINTMENT_CONFLICT",
  "detail": "O horário não está mais disponível.",
  "correlationId": "01J...",
  "fieldErrors": []
}
```

- `detail` é seguro para usuário;
- stack trace nunca sai na resposta;
- `fieldErrors` contém `field`, `code` e `message`;
- código é estável para o frontend;
- 404 é usado quando o registro não existe no tenant, evitando enumeração.

## 4. Paginação

Parâmetros:

- `page`: zero-based, padrão 0;
- `size`: padrão 20, máximo 100;
- `sort`: lista aprovada, exemplo `startAt,desc`;
- filtros específicos por recurso.

Resposta:

```json
{
  "items": [],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 0,
    "totalPages": 0
  }
}
```

## 5. Concorrência

- respostas mutáveis incluem `version`;
- atualização envia `version` ou `If-Match` conforme endpoint;
- versão divergente retorna `409 CONCURRENT_MODIFICATION`;
- agenda retorna `409 APPOINTMENT_CONFLICT`;
- a interface recarrega o recurso e preserva a entrada do usuário quando possível.

## 6. Idempotência

Header `Idempotency-Key`:

- obrigatório para agendamento externo, pagamentos, reembolsos e webhooks;
- 16 a 120 caracteres;
- escopo por tenant, operação e credencial;
- repetição do mesmo payload retorna o resultado original;
- mesma chave com payload diferente retorna conflito;
- retenção mínima definida operacionalmente.

## 7. Autenticação

### Navegador

- cookies seguros e não acessíveis a scripts;
- proteção CSRF em mudança de estado;
- mesma origem por reverse proxy quando possível.

### Integração futura

- `Authorization: Bearer`;
- credencial com escopos;
- rate limit por tenant e chave;
- revogação e auditoria.

## 8. Headers

| Header | Uso |
|---|---|
| `X-Correlation-Id` | Propagação; servidor gera se ausente |
| `Idempotency-Key` | Operação crítica |
| `X-CSRF-Token` | Fluxo web baseado em cookie |
| `Accept-Language` | Preferência de apresentação, sem alterar dados |
| `Retry-After` | Rate limit ou indisponibilidade temporária |

## 9. Campos

Nomes e tipos vêm de [`../03-dominio-dados/catalogo-dados.csv`](../03-dominio-dados/catalogo-dados.csv). O OpenAPI seleciona apenas os campos que podem atravessar a borda.

## 10. Depreciação

- marcar operação/campo como deprecated;
- publicar data e substituto;
- medir consumidores;
- manter janela contratual;
- remover apenas em versão compatível com a política.

