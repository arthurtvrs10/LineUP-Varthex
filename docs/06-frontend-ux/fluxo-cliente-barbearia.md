# Cadastro, login e escolha de barbearia

Implementado em 28/09/2026. Documento interno versionado; não cria página pública de documentação.

## Jornada

- `/cadastro/cliente` cria uma conta CLIENT sem estabelecimento. `/cadastro` continua sendo o cadastro da barbearia e de seu administrador.
- Após cadastro/login, uma conta CLIENT sem escolha nesta sessão abre `/clientes/barbearias`. A tela permite buscar pelo nome, escolher e seguir para `/clientes/agendamento`.
- Sem resultados, oferece limpar a busca. Sem barbearias disponíveis, explica que a conta está pronta e orienta tentar mais tarde ou obter o link do estabelecimento. Falhas de carregamento oferecem nova tentativa.
- O administrador pode copiar seu link nas configurações: `/agendar/{tenantId}`. Também são aceitos slugs existentes. O link passa a escolha por `?barbearia=...` durante cadastro, login por senha e callback do Google. Link indisponível abre a seleção com uma orientação.
- “Trocar barbearia” aparece no menu e no cabeçalho do cliente. A nova escolha abre um documento novo para descartar serviços, profissionais, horários e dados anteriores. A seleção fica no `sessionStorage`, separada por conta e por aba.
- Antes da primeira reserva, o cliente já pode consultar serviços, profissionais e horários. Seu vínculo com o estabelecimento é criado somente na transação que grava o agendamento.

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
| Consulta do vínculo | `GET /me/customer`: 400 sem escolha, 404 sem vínculo naquele estabelecimento; isso não impede criar a primeira reserva. |
| Reserva | `POST /appointments`: valida os recursos do tenant e cria/reutiliza o vínculo na mesma transação. |

Perfil local do cliente, reservas, fila, ofertas, resumo comercial, avaliações e notificações usam o contexto do estabelecimento. Administradores continuam restritos ao tenant autenticado mesmo que tentem enviar outro cabeçalho. Descoberta e acesso à conta permanecem disponíveis quando a barbearia anterior fica suspensa.

## Validação

`ClientOnboardingTest` cobre cadastro, duplicidade de e-mail, dois estabelecimentos por conta, reaproveitamento de cadastro, comprovação de e-mail, isolamento, seleção inválida, indisponibilidade, rollback e concorrência. Os testes de autenticação refletem que o login não cria vínculos. O frontend testa o destino após login e a separação da escolha por conta.

Os testes de integração usam H2 em modo PostgreSQL. Aplicar e homologar V26/V27 no PostgreSQL de homologação antes de produção. O fluxo OAuth preserva o parâmetro no callback, mas a autorização real no Google depende das credenciais e URLs de callback do ambiente.
