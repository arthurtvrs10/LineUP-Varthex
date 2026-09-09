#!/usr/bin/env bash
# Cria as contas de teste padrão do LineUp num ambiente Docker Compose novo.
# Idempotente: pode rodar de novo sem duplicar nada (pula o que já existe).
#
# Uso:
#   docker compose up -d
#   ./scripts/seed-test-users.sh
#
# No Windows, o jeito mais simples é rodar o wrapper (acha o Git Bash
# sozinho, não importa onde foi instalado) direto do PowerShell:
#   .\scripts\seed-test-users.ps1
#
# Se preferir rodar este arquivo direto, precisa ser num terminal Git Bash
# de verdade — não no PowerShell/cmd nem num terminal "bash" que caia no
# WSL (dá erro tipo "execvpe(/bin/bash) failed"). No VS Code: abra o
# terminal (Ctrl+`), clique na seta ao lado do "+" no canto do painel do
# terminal e escolha "Git Bash".
#
# Cria:
#   admin@gmail.com      admin123   (ADMIN da "Barbearia Teste")
#   barbeiro@gmail.com   admin123   (BARBER)
#   cliente@gmail.com    admin123   (CLIENT, já vinculado a um Customer)
#   superadmin@gmail.com admin123   (SUPER_ADMIN da plataforma)
#
# Opcional: promove um e-mail extra (ex.: sua própria conta Google) a
# SUPER_ADMIN — só funciona se você já tiver feito login uma vez com essa
# conta (login social cria o usuário automaticamente como CLIENT):
#   ./scripts/seed-test-users.sh seu-email@gmail.com

set -euo pipefail

API="http://localhost:8080"
SENHA="admin123"
PROMOTE_EMAIL="${1:-}"

# Roda um comando sem valor de retorno relevante (DDL/DML simples).
psql_exec() {
  docker compose exec -T postgres psql -U postgres -d varthex_barber -v ON_ERROR_STOP=1 -c "$1" >/dev/null
}

# Roda uma query de valor único e devolve só o valor (sem cabeçalho/rodapé).
psql_query() {
  docker compose exec -T postgres psql -U postgres -d varthex_barber -v ON_ERROR_STOP=1 -tAc "$1" | tr -d '\r'
}

echo "==> Esperando o backend responder em $API ..."
for i in $(seq 1 60); do
  if curl -s -o /dev/null "$API/services"; then
    break
  fi
  sleep 2
  if [ "$i" -eq 60 ]; then
    echo "Backend não respondeu a tempo. Rode 'docker compose up -d' e tente de novo." >&2
    exit 1
  fi
done

echo "==> Garantindo extensão pgcrypto (hash de senha via SQL)..."
psql_exec "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

echo "==> Criando tenant + admin (Barbearia Teste)..."
CREATE_TENANT_STATUS=$(curl -s -o /tmp/tenant_resp.json -w "%{http_code}" -X POST "$API/tenants" \
  -H "Content-Type: application/json" \
  -d '{
        "tradeName": "Barbearia Teste",
        "legalName": "Barbearia Teste LTDA",
        "document": null,
        "defaultTimeZone": "America/Sao_Paulo",
        "locale": "pt-BR",
        "currency": "BRL",
        "admin": { "email": "admin@gmail.com", "fullName": "Admin Teste", "role": "ADMIN" },
        "initialUnit": {
          "name": "Unidade Principal",
          "document": null, "email": null, "phone": null,
          "street": null, "number": null, "complement": null, "district": null,
          "city": null, "state": null, "country": "BR",
          "timeZone": "America/Sao_Paulo",
          "active": true
        }
      }')

if [ "$CREATE_TENANT_STATUS" = "201" ]; then
  echo "    tenant criado."
elif [ "$CREATE_TENANT_STATUS" = "409" ]; then
  echo "    admin@gmail.com já existe, pulando criação do tenant."
else
  echo "Falha ao criar tenant (HTTP $CREATE_TENANT_STATUS):" >&2
  cat /tmp/tenant_resp.json >&2
  exit 1
fi

echo "==> Definindo senha de admin.teste (POST /tenants gera senha aleatória)..."
psql_exec "UPDATE users SET password_hash = '{bcrypt}' || crypt('$SENHA', gen_salt('bf')) WHERE email = 'admin@gmail.com';"

echo "==> Login como admin.teste..."
LOGIN_JSON=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@gmail.com\",\"password\":\"$SENHA\"}")
ADMIN_TOKEN=$(echo "$LOGIN_JSON" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "Não consegui logar como admin.teste. Resposta: $LOGIN_JSON" >&2
  exit 1
fi

UNIT_ID=$(curl -s "$API/unit" -H "Authorization: Bearer $ADMIN_TOKEN" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "    unitId = $UNIT_ID"

create_user() {
  local email="$1" name="$2" role="$3"
  local status
  status=$(curl -s -o /tmp/user_resp.json -w "%{http_code}" -X POST "$API/users" \
    -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "{\"name\":\"$name\",\"email\":\"$email\",\"password\":\"$SENHA\",\"role\":\"$role\"}")
  if [ "$status" = "200" ] || [ "$status" = "201" ]; then
    echo "    $email criado."
  elif [ "$status" = "409" ] || grep -qi "já cadastrado" /tmp/user_resp.json 2>/dev/null; then
    echo "    $email já existe, pulando."
  else
    echo "Falha ao criar $email (HTTP $status):" >&2
    cat /tmp/user_resp.json >&2
  fi
}

echo "==> Criando barbeiro.teste (BARBER)..."
create_user "barbeiro@gmail.com" "Barbeiro Teste" "BARBER"

BARBER_USER_ID=$(psql_query "SELECT id FROM users WHERE email = 'barbeiro@gmail.com';")

if [ -n "$BARBER_USER_ID" ]; then
  BARBER_EXISTS=$(psql_query "SELECT count(*) FROM barber_profiles WHERE user_id = '$BARBER_USER_ID';")
  if [ "$BARBER_EXISTS" = "0" ]; then
    echo "==> Criando perfil de barbeiro..."
    curl -s -o /tmp/barber_resp.json -w "    HTTP %{http_code}\n" -X POST "$API/barbers" \
      -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" \
      -d "{\"userId\":\"$BARBER_USER_ID\",\"unitId\":\"$UNIT_ID\",\"displayName\":\"Barbeiro Teste\",\"bio\":null,\"defaultCommissionPercent\":40}"
  else
    echo "==> Perfil de barbeiro já existe, pulando."
  fi
fi

echo "==> Criando cliente.teste (CLIENT)..."
create_user "cliente@gmail.com" "Cliente Teste" "CLIENT"

CLIENT_USER_ID=$(psql_query "SELECT id FROM users WHERE email = 'cliente@gmail.com';")

CUSTOMER_EXISTS=$(psql_query "SELECT count(*) FROM customers WHERE email = 'cliente@gmail.com';")
if [ "$CUSTOMER_EXISTS" = "0" ]; then
  echo "==> Criando registro de cliente (Customer)..."
  curl -s -o /tmp/customer_resp.json -w "    HTTP %{http_code}\n" -X POST "$API/customers" \
    -H "Content-Type: application/json" -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{"fullName":"Cliente Teste","email":"cliente@gmail.com","phone":"11999990000","birthDate":null,"notes":null,"version":0}'
else
  echo "==> Registro de cliente já existe, pulando."
fi

if [ -n "$CLIENT_USER_ID" ]; then
  echo "==> Vinculando o Customer ao User de cliente.teste..."
  psql_exec "UPDATE customers SET user_id = '$CLIENT_USER_ID' WHERE email = 'cliente@gmail.com' AND user_id IS NULL;"
fi

echo "==> Garantindo superadmin.teste (SUPER_ADMIN)..."
psql_exec "
INSERT INTO users (id, name, email, password_hash, role, status, tenant_id, created_at, updated_at, provider, failed_login_attempts)
SELECT gen_random_uuid(), 'Super Admin Teste', 'superadmin@gmail.com', '{bcrypt}' || crypt('$SENHA', gen_salt('bf')), 'SUPER_ADMIN', 'ACTIVE', NULL, now(), now(), 'LOCAL', 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'superadmin@gmail.com');
"

if [ -n "$PROMOTE_EMAIL" ]; then
  echo "==> Promovendo $PROMOTE_EMAIL a SUPER_ADMIN..."
  EXISTING=$(psql_query "SELECT count(*) FROM users WHERE email = '$PROMOTE_EMAIL';")
  if [ "$EXISTING" = "0" ]; then
    echo "    Nenhum usuário com esse e-mail ainda — faça login uma vez (Google ou cadastro) e rode o script de novo passando o e-mail."
  else
    psql_exec "UPDATE users SET role = 'SUPER_ADMIN', tenant_id = NULL WHERE email = '$PROMOTE_EMAIL';"
    echo "    $PROMOTE_EMAIL agora é SUPER_ADMIN."
  fi
fi

echo ""
echo "==> Pronto! Contas de teste (senha para todas: $SENHA):"
echo "    admin@gmail.com      (ADMIN)"
echo "    barbeiro@gmail.com   (BARBER)"
echo "    cliente@gmail.com    (CLIENT)"
echo "    superadmin@gmail.com (SUPER_ADMIN)"
