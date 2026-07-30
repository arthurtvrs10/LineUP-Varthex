# Padrão Java e Spring Boot

**ID:** DOC-ARQ-002  
**Status:** aprovado  
**Fonte canônica para:** estrutura, responsabilidades e convenções de implementação

## 1. Pacote raiz

```text
com.varthex.barber
├── shared
├── auth
├── tenants
├── users
├── customers
├── barbers
├── services
├── scheduling
├── waitlist
├── commissions
├── notifications
├── audit
├── outbox
├── cash
├── payments
├── inventory
├── loyalty
├── integrations
├── subscriptions
├── reporting
├── administration
├── crm
└── publicapi
```

## 2. Estrutura de um módulo

```text
scheduling/
├── api/
│   ├── AppointmentController.java
│   └── dto/
├── application/
│   ├── AppointmentService.java
│   ├── command/
│   └── query/
├── domain/
│   ├── Appointment.java
│   ├── AppointmentStatus.java
│   ├── policy/
│   └── event/
├── infrastructure/
│   ├── AppointmentRepository.java
│   └── integration/
└── SchedulingModule.java
```

Os nomes são ilustrativos; a responsabilidade é obrigatória. Não criar pastas globais enormes de `controller`, `service` e `repository`.

## 3. Beans e tipos

Os beans de atributos vêm de [`catalogo-dados.csv`](../03-dominio-dados/catalogo-dados.csv). Exemplos de mapeamento:

- UUID → `java.util.UUID`;
- instante → `java.time.Instant`;
- data civil → `java.time.LocalDate`;
- hora local → `java.time.LocalTime`;
- fuso → `java.time.ZoneId`;
- dinheiro → `java.math.BigDecimal`;
- URI → `java.net.URI`;
- JSON controlado → DTO/record; `JsonNode` somente em payloads explicitamente flexíveis.

## 4. Entity

- nome singular;
- sem sufixo `Entity` quando não houver ambiguidade;
- `@Version` para entidade mutável;
- igualdade baseada no ID depois de atribuído;
- collections não são expostas mutáveis;
- setters públicos indiscriminados são proibidos;
- mudança ocorre por método de domínio ou service;
- relacionamentos `LAZY` por padrão;
- não serializar Entity diretamente;
- `tenantId` obrigatório nas entidades tenant-owned.

## 5. Repository

- interface no módulo proprietário;
- consultas sempre recebem ou derivam tenant;
- retorno opcional para busca singular;
- paginação obrigatória em listagens;
- query explícita para relatório complexo;
- `save()` não substitui método de negócio;
- nenhum controller acessa repository;
- repository de outro módulo não é importado.

## 6. Service

- nome orientado a caso de uso;
- transação delimitada em método de aplicação;
- `readOnly = true` para consulta;
- autorização contextual antes da mudança;
- valida regras do catálogo, não regras inventadas;
- publica evento transacional/outbox;
- não retorna Entity para a borda.

## 7. Controller

- prefixo `/api/v1`;
- DTOs de entrada e saída;
- Bean Validation para forma;
- autorização no service e, quando útil, método;
- status HTTP segundo contrato;
- paginação consistente;
- `ProblemDetail` ou envelope equivalente padronizado;
- correlation ID propagado.

## 8. DTO e mapping

- records imutáveis quando adequados;
- DTO de criação separado do DTO de atualização;
- resposta não expõe segredo nem coluna interna;
- tipos e nomes devem seguir OpenAPI;
- mapper não carrega banco nem aplica regra;
- campos calculados indicam sua origem.

## 9. Validação

1. **Forma:** Bean Validation.
2. **Autorização:** usuário, tenant, unidade e permissão.
3. **Existência:** referências do mesmo tenant.
4. **Negócio:** regras `RN-*`.
5. **Concorrência:** versão e restrições do banco.

Mensagens internas não devem vazar estrutura física.

## 10. Exceções

| Categoria | HTTP |
|---|---:|
| Payload inválido | 400 |
| Não autenticado | 401 |
| Sem permissão | 403 |
| Não encontrado no contexto | 404 |
| Conflito/invariante | 409 |
| Limite de plano | 422 ou 409 conforme contrato |
| Rate limit | 429 |
| Fornecedor indisponível | 503 |
| Erro inesperado | 500 |

## 11. Migrations

- `V<versão>__<descrição>.sql`;
- nunca editar migration aplicada;
- constraint e índice têm nomes previsíveis;
- dados de referência usam migration própria;
- migration destrutiva exige plano em etapas;
- deploy valida compatibilidade entre versão nova e anterior;
- Testcontainers sobe banco vazio e banco migrado.

## 12. Testes do backend

- domínio puro: JUnit;
- repository: PostgreSQL real com Testcontainers;
- controller: contexto Spring e segurança;
- módulo: dependências e eventos;
- API: contrato e serialização;
- integração externa: fake/MockServer e cenários de falha;
- arquitetura: dependências entre pacotes;
- tenant: testes negativos obrigatórios.

## 13. Qualidade

- build reproduzível;
- warnings relevantes tratados;
- análise estática no CI;
- dependências geridas pelo BOM;
- nenhum segredo em `application.yml`;
- configuração por ambiente;
- feature flags não espalhadas; serviço central de direitos.
