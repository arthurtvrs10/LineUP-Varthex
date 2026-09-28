# Cadastro, login e escolha de barbearia

Implementado em 28/09/2026. Documento interno versionado; não cria página pública de documentação.

## Jornada

- `/cadastro/cliente` cria uma conta CLIENT sem estabelecimento. `/cadastro` continua sendo o cadastro da barbearia e de seu administrador.
- Após cadastro/login, uma conta CLIENT sem escolha salva nem cadastro prévio pela equipe abre `/clientes/barbearias`. A tela permite buscar pelo nome, escolher e seguir para `/clientes/agendamento`.
- Sem resultados, oferece limpar a busca. Sem barbearias disponíveis, explica que a conta está pronta e orienta tentar mais tarde ou obter o link do estabelecimento. Falhas de carregamento oferecem nova tentativa.
- O administrador pode copiar seu link nas configurações: `/agendar/{tenantId}`. Também são aceitos slugs existentes. O link passa a escolha por `?barbearia=...` durante cadastro, login por senha e callback do Google. No primeiro acesso, um link indisponível abre a seleção com uma orientação. Uma escolha salva ou cadastro prévio pela equipe tem prioridade sobre o link.
- A troca fica exclusivamente em **Configurações → Minha barbearia**, em `/clientes/configuracoes/barbearia`. A escolha é salva na conta (`users.preferred_tenant_id`, migração V28) e persiste entre sessões e dispositivos. O `sessionStorage` serve apenas como contexto das chamadas do portal. Uma nova escolha recarrega o portal para descartar dados anteriores.
- Antes da primeira reserva, o cliente já pode consultar serviços, profissionais e horários. Seu vínculo com o estabelecimento é criado somente na transação que grava o agendamento.

Cadastros ativos feitos pela equipe com o mesmo e-mail identificam a barbearia inicial automaticamente, sem apresentar a seleção. Vínculos já associados à conta têm prioridade; entre múltiplos cadastros, usa-se o mais antigo. Isso não libera histórico sem comprovação do e-mail. A preferência escolhida em Configurações tem prioridade. A página `/clientes/ajuda` explica a escolha inicial, a troca, links e a confirmação de e-mail.

## Vínculo e proteção de dados

Uma conta `users` pode ter um registro `customers` por estabelecimento. A migração **V26** substitui a unicidade global de `user_id` pela unicidade `(tenant_id, user_id)`. Não duplica a conta de login nem compartilha notas, telefone local, avaliações ou agendamentos entre estabelecimentos.

O primeiro agendamento bloqueia a linha da conta enquanto procura/cria o vínculo. Requisições concorrentes reutilizam o mesmo cliente. Erros de horário, serviço ou profissional revertem o vínculo novo junto com a reserva. Um `customerId` enviado pelo cliente é ignorado: a identidade vem da autenticação.

Um cadastro prévio com o mesmo e-mail é reaproveitado somente dentro da barbearia escolhida. Comparação ignora maiúsculas e espaços externos. Cadastros ambíguos ou já vinculados a outra conta geram conflito; cadastros arquivados não são reativados automaticamente.

Para reaproveitar um histórico anterior, a posse do e-mail deve estar confirmada. A migração **V27** adiciona `users.email_verified`; login Google com token validado e conclusão da recuperação por e-mail confirmam a posse. Uma simples troca de senha com a senha atual não confirma o e-mail. A recuperação foi conectada aos endpoints reais, incluindo o formulário do link recebido; o envio depende do Resend configurado. Sem histórico prévio, um cliente novo agenda normalmente sem essa etapa.

## Contrato de API

| Operação | Contrato |
|---|---|
| Cadastro do cliente | `POST /auth/register-client`: `fullName`, `email`, `password`. Papel CLIENT definido no servidor; não aceita escolha de papel/tenant. |
| Descoberta autenticada | `GET /me/barbershops?q=...`: apenas `id`, `name`, `slug`; filtra estabelecimentos disponíveis e vigência da assinatura quando existente. |
| Contexto do cliente | `X-Barbershop-Id: UUID` nas chamadas autenticadas do portal. Só CLIENT pode selecionar um contexto; staff mantém seu tenant assinado. |
| Preferência da conta | `GET /me/barbershop-selection`: escolha salva ou cadastro inicial; 204 quando inexistente. `POST /me/barbershop-selection` com `tenantId` salva uma barbearia disponível. |
| Consulta do vínculo | `GET /me/customer`: 400 sem escolha, 404 sem vínculo naquele estabelecimento; isso não impede criar a primeira reserva. |
| Reserva | `POST /appointments`: valida os recursos do tenant e cria/reutiliza o vínculo na mesma transação. |

Perfil local do cliente, reservas, fila, ofertas, resumo comercial, avaliações e notificações usam o contexto do estabelecimento. Administradores continuam restritos ao tenant autenticado mesmo que tentem enviar outro cabeçalho. Descoberta e acesso à conta permanecem disponíveis quando a barbearia anterior fica suspensa.

## Validação

`ClientOnboardingTest` cobre cadastro, duplicidade de e-mail, dois estabelecimentos por conta, reaproveitamento de cadastro, comprovação de e-mail, isolamento, seleção inválida, indisponibilidade, rollback e concorrência. Os testes de autenticação refletem que o login não cria vínculos. O frontend testa o destino após login e a separação da escolha por conta.

Em 28/09/2026, V26/V27 foram homologadas no PostgreSQL 16.14 em container isolado: atualização de V25 com cadastro legado fictício preservado, 28 testes de cadastro/autenticação/isolamento aprovados e instalação completa de V1 a V27 em banco vazio com validação Hibernate aprovada. O CI também executa esses 28 testes no PostgreSQL descartável.

O fluxo OAuth preserva o parâmetro no callback, mas a autorização real no Google depende das credenciais e URLs de callback do ambiente.

### Ambiente Docker local

A mensagem antiga “Você ainda não é cliente de nenhuma barbearia” persistia porque os containers tinham sido construídos em 22/09, antes do commit `9012730`. Atualizar o código no Git não atualiza uma imagem Docker já em execução.

Após a homologação e backup do banco local, frontend/backend foram reconstruídos e recriados em 28/09/2026. Flyway aplicou V26/V27 com sucesso no banco local e o backend iniciou com validação de esquema. Os volumes do PostgreSQL e Redis foram preservados.

Para próximas alterações locais, após os testes:

```sh
docker compose build backend frontend
docker compose up -d --no-deps backend frontend
```

Atualize a aba do navegador para carregar os novos arquivos. Contas CLIENT sem escolha seguem para `/clientes/barbearias`; contas ADMIN, BARBER e SUPER_ADMIN continuam em seus respectivos portais.

A atualização V28 foi validada com 31 testes no PostgreSQL isolado, além de 113 testes no backend e 9 no frontend. Lint e build do frontend aprovados. A migração V28 foi aplicada no Docker local após backup do banco.
