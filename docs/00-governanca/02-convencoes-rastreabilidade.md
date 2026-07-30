# Convenções e rastreabilidade

**ID:** DOC-GOV-002  
**Fonte canônica para:** identificadores, nomenclatura e processo de mudança

## 1. Identificadores

| Prefixo | Tipo | Exemplo |
|---|---|---|
| `RF` | Requisito funcional | `RF-AGE-001` |
| `RN` | Regra de negócio | `RN-AGE-001` |
| `RNF` | Requisito não funcional | `RNF-SEG-001` |
| `ENT` | Entidade | `ENT-APPOINTMENT` |
| `FS` | Conjunto reutilizável de campos | `FS-TENANT-AUDIT` |
| `API` | Operação HTTP | `API-AGE-CREATE` |
| `TEL` | Tela | `TEL-AGE-CALENDAR` |
| `CMP` | Componente visual | `CMP-DATA-TABLE` |
| `PER` | Permissão | `PER-AGE-CREATE` |
| `CT` | Caso de teste | `CT-AGE-001` |
| `ADR` | Decisão arquitetural | `ADR-001` |
| `INT` | Integração | `INT-WHATSAPP` |
| `PEND` | Pendência deliberada | `PEND-COM-001` |
| `RIS` | Risco | `RIS-SEG-001` |

## 2. Domínios usados nos IDs

`AUT` autenticação; `TEN` tenant; `USR` usuário; `CLI` cliente; `BAR` barbeiro; `SER` serviço; `DIS` disponibilidade; `AGE` agenda; `FIL` fila de espera; `CXA` caixa; `PAG` pagamento; `COM` comissão; `EST` estoque; `FID` fidelidade; `NOT` notificação; `CRM` relacionamento; `INT` integração; `ASS` assinatura SaaS; `ADM` Super Admin; `REL` relatórios; `SEG` segurança; `OPS` operação.

## 3. Nomenclatura entre camadas

| Contexto | Convenção | Exemplo |
|---|---|---|
| Conceito | português claro | Barbearia do agendamento |
| Java | `camelCase` | `tenantId` |
| Classe Java | `PascalCase` | `Appointment` |
| PostgreSQL | `snake_case` | `tenant_id` |
| JSON/OpenAPI | `camelCase` | `tenantId` |
| TypeScript | `camelCase` | `tenantId` |
| URL | plural e `kebab-case` | `/waitlist-entries` |
| Permissão | domínio, recurso e ação | `appointment:create` |

Nomes diferentes por convenção não representam definições diferentes. O `field_id` do catálogo de dados conecta todas as representações.

### Invariantes verificadas

- `java_name`, `api_name` e a propriedade TypeScript usam exatamente o mesmo nome; `api_name = -` identifica campo que nunca cruza a API.
- `db_column` é a conversão determinística de `java_name` para `snake_case`.
- Exceções semânticas, como o nome público de um snapshot, e exceções físicas para evitar coluna genérica são mínimas e declaradas no validador.
- Renomear um conceito exige migration compatível, atualização do OpenAPI, regeneração TypeScript e teste de contrato no mesmo pull request.
- Um nome que não consta no catálogo não pode ser persistido nem adicionado a um DTO contratual.

## 4. Regras contra redundância

1. Requisitos não contêm tipos SQL.
2. Regras não são copiadas para telas ou services.
3. O catálogo de dados é a única definição de campos.
4. O OpenAPI é a única definição de payload HTTP.
5. O design token é a única definição de cor, medida ou tipografia.
6. O roadmap lista IDs; não copia requisitos.
7. Casos de teste referenciam IDs e descrevem apenas preparação, ação e resultado.
8. Documentos de arquitetura explicam responsabilidades, não redefinem o negócio.
9. Valores configuráveis não são fixados no código.
10. Diagramas são visões; tabelas e contratos continuam canônicos.

## 5. Fluxo de mudança

1. Abrir proposta com motivo e impacto.
2. Identificar requisitos, regras, dados, API, tela e teste afetados.
3. Criar ADR se a arquitetura, tecnologia ou política mudar.
4. Atualizar primeiro a fonte canônica.
5. Atualizar consumidores no mesmo pull request.
6. Executar o validador documental e pipeline de software.
7. Obter aprovações da matriz RACI.
8. Registrar versão e data.

## 6. Matriz mínima por funcionalidade

| Campo | Obrigatório |
|---|---|
| Requisito | Sim |
| Release | Sim |
| Ator | Sim |
| Regra aplicável | Sim |
| Entidade/campo | Quando persistir dados |
| Permissão | Quando restrito |
| Endpoint | Quando houver integração HTTP |
| Tela/consumidor | Quando visível |
| Caso de teste | Sim |
| Métrica/log | Para fluxo crítico |

## 7. Datas, dinheiro e IDs

- Instantes persistidos em UTC.
- Fuso de apresentação vem da unidade.
- Java usa `Instant` para instantes e `LocalDate` para datas civis.
- PostgreSQL usa `timestamptz` para instantes e `date` para datas civis.
- JSON usa ISO 8601.
- Dinheiro usa `BigDecimal`, `numeric(19,2)` e string decimal no contrato quando houver risco de arredondamento do cliente.
- IDs usam UUID gerado pela aplicação.
- Toda entidade mutável usa controle otimista por `version`.
