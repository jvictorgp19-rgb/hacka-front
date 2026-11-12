#!/usr/bin/env bash
# CD simples por "pull": busca commits novos da branch, builda e reinicia via pm2.
# Se não houver commit novo (e o app já estiver rodando), não faz nada.
# Se o build falhar, o app antigo continua no ar.
#
# Uso:   ./scripts/deploy.sh                  # deploy se houver novidade
#        FORCE=1 ./scripts/deploy.sh          # força rebuild
# Config (variáveis de ambiente, todas opcionais):
#   DEPLOY_BRANCH (main)  DEPLOY_DIR (~/deploy-bbts/hacka-front)  PM2_APP (hacka-front)
#   PORT (3000)  NEXT_PUBLIC_API_URL (http://localhost:8000)  REPO_URL
set -euo pipefail

main() {
  local REPO_URL="${REPO_URL:-https://github.com/jvictorgp19-rgb/hacka-front.git}"
  local BRANCH="${DEPLOY_BRANCH:-main}"
  local DIR="${DEPLOY_DIR:-$HOME/deploy-bbts/hacka-front}"
  local APP="${PM2_APP:-hacka-front}"
  local PORT="${PORT:-3000}"
  local API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}"

  # Evita dois deploys ao mesmo tempo.
  exec 9>"/tmp/${APP}-deploy.lock"
  flock -n 9 || { echo "[deploy] já existe um deploy em andamento"; return 0; }

  # Checkout dedicado ao deploy (nunca aponte para sua pasta de trabalho: ele faz checkout forçado).
  [ -d "$DIR/.git" ] || git clone --branch "$BRANCH" "$REPO_URL" "$DIR"
  cd "$DIR"

  git fetch --quiet origin "$BRANCH"
  local NEW CUR
  NEW="$(git rev-parse FETCH_HEAD)"
  CUR="$(git rev-parse HEAD 2>/dev/null || true)"

  if [ "$NEW" = "$CUR" ] && [ "${FORCE:-0}" != "1" ] && pm2 describe "$APP" >/dev/null 2>&1; then
    echo "[deploy] ${BRANCH} já está em ${NEW:0:7}, nada a fazer"
    return 0
  fi

  echo "[deploy] ${CUR:0:7} -> ${NEW:0:7} (${BRANCH})"
  git checkout -q -f -B "$BRANCH" "$NEW"

  npm ci --no-audit --no-fund
  # NEXT_PUBLIC_* é embutido no build, então o .env.local é regerado a cada deploy.
  printf 'NEXT_PUBLIC_API_URL=%s\n' "$API_URL" > .env.local
  npm run build

  if pm2 describe "$APP" >/dev/null 2>&1; then
    pm2 restart "$APP" --update-env
  else
    pm2 start npm --name "$APP" -- run start -- -p "$PORT"
  fi
  echo "[deploy] ok: ${NEW:0:7} no ar na porta ${PORT}"
}

# O exit impede o bash de continuar lendo o arquivo caso o git o substitua durante o deploy.
main "$@"; exit $?
