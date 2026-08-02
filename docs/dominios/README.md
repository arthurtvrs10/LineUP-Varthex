# Documentação Principal por Domínios — Varthex Barber

Esta pasta organiza a documentação principal do software por **domínio de negócio**.

A ideia é que, antes de implementar uma etapa, você abra o arquivo do domínio correspondente e encontre em um único lugar:

- objetivo do domínio;
- problema que ele resolve;
- atores envolvidos;
- entidades necessárias;
- tipos, enums e status;
- dados/campos principais;
- DTOs conceituais;
- regras de negócio;
- permissões;
- fluxos;
- endpoints esperados;
- validações;
- testes manuais no Bruno;
- critérios de aceite.

## Por que documentação por domínio?

Em vez de separar o projeto apenas em `controllers`, `services` e `repositories`, a documentação será organizada pelo assunto real do sistema.

Exemplo:

```txt
users/
├── User
├── Role
├── UserStatus
├── UserRepository
├── UserService
├── UserController
└── dto/
```

Isso facilita entender o que cada parte do sistema faz e impede que você fique perdido criando classes soltas sem saber o motivo.

## Ordem recomendada de uso

1. Abra o arquivo do domínio que será implementado.
2. Leia primeiro o problema de negócio.
3. Entenda quem usa aquele domínio.
4. Liste entidades, campos, tipos e regras.
5. Desenhe os fluxos antes de codar.
6. Crie a estrutura do domínio no backend.
7. Crie o mínimo necessário no frontend, quando existir tela.
8. Teste no Bruno antes de seguir para outro domínio.
9. Atualize o diário da semana.
10. Faça commit pequeno e claro.

## Arquivos desta pasta

- `00-padrao-de-documentacao-de-dominio.md`
- `00-matriz-de-dominios.md`
- `01-auth.md`
- `02-users.md`
- `03-barbershops.md`
- `04-barbers.md`
- `05-clients.md`
- `06-services.md`
- `07-schedules-availability.md`
- `08-appointments.md`
- `09-blocked-times.md`
- `10-waitlist.md`
- `11-commissions.md`
- `12-dashboard-financial-closing.md`
- `13-inventory-products.md`
- `14-product-sales.md`
- `15-loyalty.md`
- `16-customer-plans.md`
- `17-notifications.md`
- `18-whatsapp-crm.md`
- `19-google-integrations.md`
- `20-saas-plans-billing.md`
- `21-devices.md`
- `22-audit-logs.md`
- `23-shared-kernel.md`

## Regra de ouro

Toda funcionalidade deve nascer dentro de um domínio.

Antes de criar uma classe, responda:

```txt
Este arquivo pertence a qual domínio?
Ele representa dado, regra, entrada, saída, integração ou configuração?
Precisa ser Entity?
Precisa de Repository?
Precisa de Service?
Precisa de Controller?
Precisa de DTO?
Como vou testar no Bruno?
```

## Commit sugerido

```bash
git add docs/dominios
git commit -m "docs: adiciona documentacao principal por dominios"
```
