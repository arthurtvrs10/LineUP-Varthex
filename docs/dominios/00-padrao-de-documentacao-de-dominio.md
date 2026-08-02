# Padrão de Documentação de Domínio

Use este padrão para qualquer domínio novo do Varthex Barber.

## 1. Nome do domínio

Nome claro, no plural ou singular conforme fizer mais sentido.

Exemplos:

- `users`
- `auth`
- `appointments`
- `commissions`
- `inventory-products`

## 2. Objetivo

Explique em linguagem simples o que este domínio resolve.

Exemplo:

> O domínio `users` controla as pessoas que acessam o sistema, seus perfis, status e vínculo com a barbearia.

## 3. Problema de negócio

Explique por que o domínio existe.

Perguntas para responder:

- Qual problema real da barbearia ele resolve?
- O que acontece se esse domínio não existir?
- O que acontece se ele for mal feito?

## 4. Atores impactados

Liste quem usa ou é afetado.

- SuperAdmin
- Admin/Dono
- Barbeiro
- Cliente
- Sistema interno

## 5. Escopo

### Entra no domínio

Liste o que faz parte.

### Não entra no domínio

Liste o que parece relacionado, mas deve ficar em outro domínio.

## 6. Entidades

Liste as entidades do banco.

Para cada entidade, documente:

- nome;
- descrição;
- campos;
- relacionamentos;
- regras;
- se pode ser excluída ou apenas inativada.

## 7. Tipos, enums e status

Liste todos os tipos necessários.

Exemplos:

- `UserRole`
- `UserStatus`
- `AppointmentStatus`
- `PaymentStatus`
- `CommissionStatus`

## 8. DTOs conceituais

DTO não é tabela. DTO é o formato de entrada ou saída da API.

Documente:

- request de criação;
- request de atualização;
- response de listagem;
- response de detalhe;
- filtros.

## 9. Regras de negócio

Regras de negócio são decisões do produto.

Exemplo:

- cliente não pode ocupar horário bloqueado;
- usuário inativo não pode logar;
- comissão só é gerada depois do atendimento concluído.

## 10. Permissões

Defina quem pode fazer cada ação.

Use uma tabela:

| Ação | SuperAdmin | Admin | Barbeiro | Cliente |
|---|---|---|---|---|
| Criar | Sim | Sim | Não | Não |

## 11. Fluxos principais

Descreva o fluxo em passos numerados.

Exemplo:

1. Admin abre tela.
2. Sistema lista registros.
3. Admin preenche dados.
4. Backend valida.
5. Service aplica regras.
6. Repository salva.
7. Controller retorna resposta.
8. Frontend mostra sucesso.

## 12. Endpoints esperados

Liste rotas prováveis.

Não é código obrigatório, é contrato de planejamento.

## 13. Testes no Bruno

Todo processo deve terminar testado.

Para cada endpoint, registre:

- método;
- URL;
- body esperado;
- headers necessários;
- status esperado;
- erro esperado.

## 14. Critérios de aceite

Liste o que precisa estar funcionando para considerar pronto.

## 15. Ordem de implementação recomendada

A ordem padrão é:

1. Entender o domínio.
2. Criar tipos/enums.
3. Criar entidade.
4. Criar repository, se precisar banco.
5. Criar service.
6. Criar DTOs.
7. Criar controller.
8. Criar validações.
9. Criar testes.
10. Testar no Bruno.
11. Atualizar documentação.
12. Fazer commit.

## 16. Quando criar cada classe

### Entity

Crie quando o dado precisa ser salvo no banco.

### Repository

Crie quando a entidade precisa ser consultada ou persistida no banco.

### Service

Crie quando existe regra de negócio, validação de fluxo, cálculo ou orquestração.

### Controller

Crie quando o frontend ou Bruno precisa chamar uma API.

### DTO

Crie para entrada e saída de dados. Não exponha Entity diretamente.

### Mapper

Crie quando a conversão Entity ↔ DTO começar a ficar repetida.

### Test

Crie para validar regra importante, fluxo crítico ou endpoint.
