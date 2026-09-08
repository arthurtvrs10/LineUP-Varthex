# LINEUP API — coleção Bruno

Abra a pasta `bruno/LINEUP-API` no [Bruno](https://www.usebruno.com/) e selecione o ambiente **Local** (`baseUrl` = `http://localhost:8080`, backend rodando via `docker compose up` ou `mvnw spring-boot:run`).

## Fluxo recomendado

1. **Tenants → Create Tenant** — cria tenant + unidade inicial + usuário ADMIN atomicamente (rota pública). O admin criado **não tem senha conhecida** — ainda não existe fluxo de convite/definição de senha (`/auth/password-recovery`), então o login dele falha até você definir uma senha manualmente:

   ```bash
   docker exec varthex-barber-postgres psql -U postgres -d varthex_barber -c \
     "UPDATE users SET password_hash = '{bcrypt}\$2a\$10\$5oQMoCFFwC8EPY9ocWz1guxhHPO.VCFbpjdUzRAVY2ha2yAVuPfoG' WHERE email = 'SEU_EMAIL_AQUI';"
   ```

   Esse hash corresponde à senha `senha123`. Troque `SEU_EMAIL_AQUI` pelo e-mail do admin criado.

2. **Auth → Login** — usa esse e-mail/senha; o script pós-resposta salva `accessToken` como variável da coleção automaticamente.
3. Todas as outras pastas (Tenants, Units, Users, Barbers, Customers, Services) já usam `{{accessToken}}` no header `Authorization`.

## Variáveis capturadas automaticamente

- `accessToken` — setado por **Auth → Login**.
- `customerId`, `serviceId`, `categoryId`, `barberId`, `userId` — setados pelos respectivos `Create ...`, usados pelos requests de leitura/atualização da mesma pasta.
