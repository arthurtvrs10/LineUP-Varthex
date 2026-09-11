#!/usr/bin/env bash
# Popula a "Barbearia Teste" (criada pelo seed-test-users.sh) com dados
# fictícios: mais 2 barbeiros, jornada de trabalho, categoria e serviços,
# 10 clientes e um histórico de ~30 agendamentos passados (a maioria
# concluída, alguns cancelados, algumas faltas) + uns 6 agendamentos
# futuros e 2 entradas na fila de espera.
#
# Sem isso, o Dashboard, os Relatórios, Comissões e a Agenda aparecem
# praticamente vazios numa apresentação — este script deixa tudo com
# número de verdade pra mostrar.
#
# Pré-requisito: já ter rodado ./scripts/seed-test-users.sh (precisa do
# admin@gmail.com / Barbearia Teste existindo).
#
# Uso:
#   docker compose up -d
#   ./scripts/seed-test-users.sh
#   ./scripts/seed-demo-data.sh
#
# No Windows, use o wrapper (acha o Git Bash sozinho):
#   .\scripts\seed-demo-data.ps1
#
# Mesma observação do seed-test-users.sh: precisa rodar num terminal Git
# Bash de verdade, não no PowerShell/cmd puro nem num "bash" que caia no WSL.
#
# Idempotência parcial: categoria/serviços/clientes fictícios usam nomes
# fixos e são pulados se já existirem. Os AGENDAMENTOS não são — cada
# execução soma mais um lote de histórico fictício por cima do anterior.
# Rodar 2-3 vezes é normal (só deixa a base de demonstração mais rica);
# rodar dezenas de vezes deixa a Agenda poluída sem necessidade.

set -euo pipefail

API="http://localhost:8080"
SENHA="admin123"
REQ_FILE=$(mktemp)
RESP_FILE=$(mktemp)
trap 'rm -f "$REQ_FILE" "$RESP_FILE"' EXIT

json_field() {
  # json_field '<json>' 'campo' -> valor de "campo":"valor" (string) no 1o nível
  echo "$1" | grep -o "\"$2\":\"[^\"]*\"" | head -1 | cut -d'"' -f4
}

psql_query() {
  docker compose exec -T postgres psql -U postgres -d varthex_barber -v ON_ERROR_STOP=1 -tAc "$1" | tr -d '\r'
}

# Manda o corpo por arquivo (--data-binary), não por "-d" direto — no Git
# Bash do Windows, "-d" com acento (á, ã, ç...) corrompe o UTF-8 na hora de
# passar como argumento pro curl.exe e a API responde 400 "JSON parse
# error: Invalid UTF-8 middle byte". Por arquivo, os bytes chegam intactos.
api_call() {
  local method="$1" path="$2" body="$3"
  printf '%s' "$body" > "$REQ_FILE"
  curl -s -o "$RESP_FILE" -w "%{http_code}" -X "$method" "$API$path" \
    -H "$AUTH_HEADER" -H "Content-Type: application/json" --data-binary @"$REQ_FILE"
}

resp_body() {
  cat "$RESP_FILE"
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

echo "==> Login como admin@gmail.com..."
LOGIN_JSON=$(curl -s -X POST "$API/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@gmail.com\",\"password\":\"$SENHA\"}")
TOKEN=$(json_field "$LOGIN_JSON" accessToken)
if [ -z "$TOKEN" ]; then
  echo "Não consegui logar como admin@gmail.com. Rode ./scripts/seed-test-users.sh primeiro." >&2
  exit 1
fi
AUTH_HEADER="Authorization: Bearer $TOKEN"

UNIT_ID=$(curl -s "$API/unit" -H "$AUTH_HEADER" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "    unitId = $UNIT_ID"

# ---------------------------------------------------------------------------
# Serviços
# ---------------------------------------------------------------------------
echo "==> Categoria de serviços..."
api_call POST /service-categories '{"name":"Cortes e Barba","sortOrder":1,"active":true}' > /dev/null
CATEGORY_ID=$(json_field "$(resp_body)" id)
if [ -z "$CATEGORY_ID" ]; then
  CATEGORY_ID=$(psql_query "SELECT id FROM service_categories WHERE tenant_id = (SELECT tenant_id FROM users WHERE email='admin@gmail.com') AND name = 'Cortes e Barba' LIMIT 1;")
fi
echo "    categoryId = $CATEGORY_ID"

echo "==> Serviços..."
SERVICE_NAMES=("Corte Masculino" "Barba" "Corte + Barba" "Sobrancelha" "Luzes")
SERVICE_TYPES=("SERVICE" "SERVICE" "COMBO" "SERVICE" "SERVICE")
SERVICE_DURATIONS=(30 20 45 10 90)
SERVICE_PRICES=("40.00" "25.00" "60.00" "15.00" "120.00")
SERVICE_IDS=()

for i in "${!SERVICE_NAMES[@]}"; do
  name="${SERVICE_NAMES[$i]}"
  body="{\"unitId\":\"$UNIT_ID\",\"categoryId\":\"$CATEGORY_ID\",\"serviceType\":\"${SERVICE_TYPES[$i]}\",\"name\":\"$name\",\"description\":null,\"durationMinutes\":${SERVICE_DURATIONS[$i]},\"bufferBeforeMinutes\":0,\"bufferAfterMinutes\":5,\"price\":\"${SERVICE_PRICES[$i]}\",\"sortOrder\":$i,\"active\":true}"
  api_call POST /services "$body" > /dev/null
  id=$(json_field "$(resp_body)" id)
  if [ -z "$id" ]; then
    id=$(psql_query "SELECT id FROM services WHERE unit_id = '$UNIT_ID' AND name = '$name' LIMIT 1;")
  fi
  SERVICE_IDS+=("$id")
  echo "    $name -> $id"
done

# ---------------------------------------------------------------------------
# Barbeiros (o barbeiro@gmail.com já existe; cria mais 2 pra Agenda/Comissões
# terem mais de um profissional pra comparar)
# ---------------------------------------------------------------------------
create_barber() {
  local email="$1" name="$2" bio="$3" commission="$4"
  local user_status user_id barber_id body

  body="{\"name\":\"$name\",\"email\":\"$email\",\"password\":\"$SENHA\",\"role\":\"BARBER\"}"
  user_status=$(api_call POST /users "$body")

  user_id=$(psql_query "SELECT id FROM users WHERE email = '$email';")
  if [ -z "$user_id" ]; then
    echo "Não consegui criar/achar o usuário $email (HTTP $user_status)." >&2
    resp_body >&2
    return 1
  fi

  barber_id=$(psql_query "SELECT id FROM barber_profiles WHERE user_id = '$user_id';")
  if [ -z "$barber_id" ]; then
    body="{\"userId\":\"$user_id\",\"unitId\":\"$UNIT_ID\",\"displayName\":\"$name\",\"bio\":\"$bio\",\"defaultCommissionPercent\":$commission}"
    api_call POST /barbers "$body" > /dev/null
    barber_id=$(json_field "$(resp_body)" id)
    if [ -z "$barber_id" ]; then
      echo "Não consegui criar o perfil de barbeiro pra $email:" >&2
      resp_body >&2
      return 1
    fi
  fi

  echo "$barber_id"
}

set_work_schedule() {
  local barber_id="$1"
  local body='[
    {"weekday":0,"startTime":"09:00:00","endTime":"12:00:00"},
    {"weekday":0,"startTime":"13:00:00","endTime":"19:00:00"},
    {"weekday":1,"startTime":"09:00:00","endTime":"12:00:00"},
    {"weekday":1,"startTime":"13:00:00","endTime":"19:00:00"},
    {"weekday":2,"startTime":"09:00:00","endTime":"12:00:00"},
    {"weekday":2,"startTime":"13:00:00","endTime":"19:00:00"},
    {"weekday":3,"startTime":"09:00:00","endTime":"12:00:00"},
    {"weekday":3,"startTime":"13:00:00","endTime":"19:00:00"},
    {"weekday":4,"startTime":"09:00:00","endTime":"12:00:00"},
    {"weekday":4,"startTime":"13:00:00","endTime":"19:00:00"},
    {"weekday":5,"startTime":"09:00:00","endTime":"13:00:00"}
  ]'
  api_call PUT "/barbers/$barber_id/work-schedules" "$body" > /dev/null
}

echo "==> Barbeiro principal (barbeiro@gmail.com) — jornada de trabalho..."
BARBER_ID_MAIN=$(psql_query "SELECT bp.id FROM barber_profiles bp JOIN users u ON u.id = bp.user_id WHERE u.email = 'barbeiro@gmail.com';")
if [ -z "$BARBER_ID_MAIN" ]; then
  echo "barbeiro@gmail.com não tem perfil de barbeiro. Rode ./scripts/seed-test-users.sh primeiro." >&2
  exit 1
fi
set_work_schedule "$BARBER_ID_MAIN"
echo "    barberId = $BARBER_ID_MAIN"

echo "==> Barbeiro fictício: Carlos Mendes..."
BARBER_ID_2=$(create_barber "carlos.mendes.demo@lineup.dev" "Carlos Mendes" "Especialista em cortes clássicos e navalha." 35)
set_work_schedule "$BARBER_ID_2"
echo "    barberId = $BARBER_ID_2"

echo "==> Barbeiro fictício: Rafael Souza..."
BARBER_ID_3=$(create_barber "rafael.souza.demo@lineup.dev" "Rafael Souza" "Foco em coloracao e visagismo masculino." 40)
set_work_schedule "$BARBER_ID_3"
echo "    barberId = $BARBER_ID_3"

BARBER_IDS=("$BARBER_ID_MAIN" "$BARBER_ID_2" "$BARBER_ID_3")

# ---------------------------------------------------------------------------
# Clientes fictícios (+ reaproveita o cliente@gmail.com pra ele também ter
# histórico quando o time logar como cliente na demo)
# ---------------------------------------------------------------------------
echo "==> Clientes fictícios..."
CUSTOMER_NAMES=("Marina Alves" "Joao Pedro Lima" "Fernanda Costa" "Bruno Tavares" "Camila Rocha" \
  "Diego Fernandes" "Larissa Martins" "Eduardo Pires" "Juliana Barros" "Thiago Nunes")
CUSTOMER_PHONES=("11988880001" "11988880002" "11988880003" "11988880004" "11988880005" \
  "11988880006" "11988880007" "11988880008" "11988880009" "11988880010")
CUSTOMER_IDS=()

CLIENTE_TESTE_ID=$(psql_query "SELECT id FROM customers WHERE email = 'cliente@gmail.com';")
if [ -n "$CLIENTE_TESTE_ID" ]; then
  CUSTOMER_IDS+=("$CLIENTE_TESTE_ID")
fi

for i in "${!CUSTOMER_NAMES[@]}"; do
  name="${CUSTOMER_NAMES[$i]}"
  email="cliente.demo$((i+1))@lineup.dev"
  existing=$(psql_query "SELECT id FROM customers WHERE email = '$email';")
  if [ -n "$existing" ]; then
    CUSTOMER_IDS+=("$existing")
    continue
  fi
  body="{\"fullName\":\"$name\",\"email\":\"$email\",\"phone\":\"${CUSTOMER_PHONES[$i]}\",\"birthDate\":null,\"notes\":null,\"version\":0}"
  api_call POST /customers "$body" > /dev/null
  id=$(json_field "$(resp_body)" id)
  CUSTOMER_IDS+=("$id")
  echo "    $name -> $id"
done

# ---------------------------------------------------------------------------
# Agendamentos — histórico passado (concluído / cancelado / falta) + futuros
# ---------------------------------------------------------------------------
create_appointment() {
  local barber_id="$1" customer_id="$2" service_id="$3" start_at="$4"
  local body="{\"unitId\":\"$UNIT_ID\",\"customerId\":\"$customer_id\",\"barberId\":\"$barber_id\",\"startAt\":\"$start_at\",\"items\":[{\"serviceId\":\"$service_id\"}],\"channel\":\"ADMIN\",\"notes\":null}"
  api_call POST /appointments "$body"
}

transition() {
  local id="$1" action="$2"
  api_call POST "/appointments/$id/$action" '{}' > /dev/null
}

n_barbers=${#BARBER_IDS[@]}
n_customers=${#CUSTOMER_IDS[@]}
n_services=${#SERVICE_IDS[@]}
HOURS=("10:00:00" "11:00:00" "14:00:00" "15:30:00" "17:00:00")
n_hours=${#HOURS[@]}

echo "==> Gerando histórico dos últimos 21 dias..."
created=0
completed=0
canceled=0
noshow=0
skipped=0

for day_offset in $(seq 21 -1 1); do
  weekday=$(date -d "-${day_offset} days" +%u)  # 1=segunda ... 7=domingo
  if [ "$weekday" = "7" ]; then
    continue  # domingo fechado
  fi
  date_str=$(date -d "-${day_offset} days" +%Y-%m-%d)

  # 1 a 2 agendamentos por dia, espalhados entre os barbeiros
  slots_today=$(( (RANDOM % 2) + 1 ))
  for _ in $(seq 1 $slots_today); do
    barber="${BARBER_IDS[$((RANDOM % n_barbers))]}"
    customer="${CUSTOMER_IDS[$((RANDOM % n_customers))]}"
    service="${SERVICE_IDS[$((RANDOM % n_services))]}"
    hour="${HOURS[$((RANDOM % n_hours))]}"

    status=$(create_appointment "$barber" "$customer" "$service" "${date_str}T${hour}")
    if [ "$status" != "201" ]; then
      skipped=$((skipped+1))
      continue
    fi

    id=$(json_field "$(resp_body)" id)
    created=$((created+1))

    # Distribuição: ~75% concluído, ~15% cancelado, ~10% falta
    roll=$((RANDOM % 100))
    if [ "$roll" -lt 75 ]; then
      transition "$id" confirm
      transition "$id" check-in
      transition "$id" start
      transition "$id" complete
      completed=$((completed+1))
    elif [ "$roll" -lt 90 ]; then
      transition "$id" cancel
      canceled=$((canceled+1))
    else
      transition "$id" confirm
      transition "$id" no-show
      noshow=$((noshow+1))
    fi
  done
done

echo "    ${created} agendamentos passados criados (${skipped} pulados por conflito de horário)"
echo "    -> ${completed} concluídos, ${canceled} cancelados, ${noshow} faltas"

echo "==> Gerando agendamentos futuros (próximos 5 dias)..."
future_created=0
for day_offset in 1 2 2 3 4 5; do
  weekday=$(date -d "+${day_offset} days" +%u)
  if [ "$weekday" = "7" ]; then
    continue
  fi
  date_str=$(date -d "+${day_offset} days" +%Y-%m-%d)
  barber="${BARBER_IDS[$((RANDOM % n_barbers))]}"
  customer="${CUSTOMER_IDS[$((RANDOM % n_customers))]}"
  service="${SERVICE_IDS[$((RANDOM % n_services))]}"
  hour="${HOURS[$((RANDOM % n_hours))]}"

  status=$(create_appointment "$barber" "$customer" "$service" "${date_str}T${hour}")
  if [ "$status" != "201" ]; then
    continue
  fi
  id=$(json_field "$(resp_body)" id)
  future_created=$((future_created+1))

  # Metade confirmada, metade fica pendente (pra aparecer o lembrete de
  # confirmação pendente no dashboard do barbeiro)
  if [ $((RANDOM % 2)) -eq 0 ]; then
    transition "$id" confirm
  fi
done
echo "    ${future_created} agendamentos futuros criados"

# ---------------------------------------------------------------------------
# Fila de espera
# ---------------------------------------------------------------------------
echo "==> Fila de espera..."
for i in 0 1; do
  customer="${CUSTOMER_IDS[$(( (i+2) % n_customers ))]}"
  service="${SERVICE_IDS[$((i % n_services))]}"
  window_start=$(date -d "+2 days" +%Y-%m-%dT09:00:00)
  window_end=$(date -d "+3 days" +%Y-%m-%dT19:00:00)
  body="{\"unitId\":\"$UNIT_ID\",\"customerId\":\"$customer\",\"serviceId\":\"$service\",\"preferredBarberId\":null,\"windowStartAt\":\"$window_start\",\"windowEndAt\":\"$window_end\",\"notes\":\"Prefere periodo da manha\"}"
  api_call POST /waitlist-entries "$body" > /dev/null
done
echo "    2 entradas criadas"

echo ""
echo "==> Pronto! Dados fictícios prontos pra apresentação:"
echo "    3 barbeiros (barbeiro@gmail.com + Carlos Mendes + Rafael Souza), com jornada configurada"
echo "    5 serviços em 1 categoria"
echo "    ${n_customers} clientes"
echo "    ${completed} agendamentos concluídos (geram comissão e entram nos relatórios)"
echo "    ${canceled} cancelados, ${noshow} faltas, ${future_created} futuros"
echo "    2 entradas na fila de espera"
