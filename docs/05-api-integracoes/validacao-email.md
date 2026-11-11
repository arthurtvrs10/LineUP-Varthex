# Confirmação de e-mail no cadastro

Novos cadastros de estabelecimento e cliente exigem confirmação do e-mail antes de login por senha ou emissão de sessão. Contas anteriores à migração V35 continuam acessíveis; não são marcadas como verificadas artificialmente. O login Google usa o e-mail verificado pelo provedor. A recuperação de senha também comprova a posse do e-mail e mantém o comportamento existente.

## Fluxo

1. Cadastro cria a conta e registra um token aleatório de 256 bits; somente o hash SHA-256 é armazenado.
2. Após a transação do cadastro confirmar, o Resend recebe o pedido de envio do link. Falha no envio não desfaz o cadastro; é possível reenviar.
3. A tela `/confirmar-email` orienta a conferir caixa de entrada e spam. O token fica no fragmento da URL, evitando envio em requisições de página/referrer.
4. A confirmação exige clicar em **Confirmar meu e-mail**; abrir o link por GET (inclusive por scanner de e-mail) não consome o token.
5. Link válido por 30 minutos, uso único. Reenvio disponível a cada 60 segundos por conta, substituindo o link anterior. Conta inexistente ou já verificada recebe resposta genérica.
6. Após confirmar, entrar com e-mail e senha. O cadastro não realiza mais login automático. Plano/barbearia selecionados são preservados no navegador quando o armazenamento de sessão está disponível.

## Configuração

O backend usa `RESEND_API_KEY`, `RESEND_FROM_EMAIL` e `FRONTEND_URL`, já utilizados pelos outros e-mails. Não colocar credenciais no frontend. Usar remetente/domínio autorizado no Resend. Chave configurada não comprova entrega: conferir eventos do provedor e a caixa do destinatário. No localhost, abrir o link na mesma máquina que executa o Docker; um celular não acessa o localhost do computador.

Não há bypass de verificação, token em log ou endpoint público que devolva links. Token/PAN/segredos não devem entrar em analytics, gravação de sessão ou logs de corpo. O envio ao Resend ocorre após o commit, mas não possui fila persistente de retries: se o processo cair nessa etapa ou houver falha de rede, usar reenvio.

## Rotas públicas

- `POST /auth/email-verification/confirm`: `{ "token": "..." }`.
- `POST /auth/email-verification/resend`: `{ "email": "..." }`.
- Login por senha de conta pendente retorna 403 com `EMAIL_NOT_VERIFIED`; o frontend leva à confirmação.

## Testes

Testes com provedor de e-mail simulado cobrem estabelecimento e cliente, bloqueio antes da confirmação, uso único, expiração, concorrência, reenvio, rollback, falha de envio e compatibilidade das contas existentes. Nenhum e-mail real é enviado pela suíte.
