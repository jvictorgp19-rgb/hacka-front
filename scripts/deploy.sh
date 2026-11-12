#!/usr/bin/env bash
# Publicação manual opcional em host Linux com Node 22, git, flock e pm2.
# Não executado pelo CI; AWS/S3/CloudFront não utilizam este script.
# Cada build fica em release própria. Builds anteriores nunca são removidos.
# DEPLOY_DIR deve ser uma pasta exclusiva de publicação, fora do checkout de trabalho.
# Config: DEPLOY_BRANCH=main DEPLOY_DIR=~/deploy-bbts/hacka-front PM2_APP=hacka-front
# PORT=3000 PREVIEW_HOST=127.0.0.1 NEXT_PUBLIC_DATA_MODE=demo|api
# NEXT_PUBLIC_API_URL é obrigatório no modo api. FORCE=1 permite reconstruir o mesmo SHA.
set -euo pipefail

main() {
  local repo_url="${REPO_URL:-https://github.com/jvictorgp19-rgb/hacka-front.git}"
  local branch="${DEPLOY_BRANCH:-main}"
  local deploy_root="${DEPLOY_DIR:-$HOME/deploy-bbts/hacka-front}"
  local app_name="${PM2_APP:-hacka-front}"
  local preview_port="${PORT:-3000}"
  local data_mode="${NEXT_PUBLIC_DATA_MODE:-demo}"
  local api_url="${NEXT_PUBLIC_API_URL:-}"
  [[ "$app_name" =~ ^[A-Za-z0-9_-]+$ ]] || { echo '[deploy] PM2_APP inválido'; return 1; }
  [[ "$preview_port" =~ ^[0-9]+$ ]] && ((preview_port > 0 && preview_port <= 65535)) || { echo '[deploy] PORT inválida'; return 1; }
  [[ "$data_mode" = demo || "$data_mode" = api ]] || { echo '[deploy] modo inválido'; return 1; }
  [[ "$data_mode" != api || "$api_url" = https://* ]] || { echo '[deploy] modo api requer URL HTTPS explícita'; return 1; }
  for binary in git npm node pm2 flock; do
    command -v "$binary" >/dev/null || { echo "[deploy] falta $binary"; return 1; }
  done
  # Não converter checkouts existentes em diretório de publicação.
  [[ ! -e "$deploy_root/.git" ]] || { echo '[deploy] use outra DEPLOY_DIR exclusiva; checkout existente preservado'; return 1; }
  mkdir -p "$deploy_root/releases"
  deploy_root="$(cd "$deploy_root" && pwd -P)"
  exec 9>"$deploy_root/deploy.lock"
  flock -n 9 || { echo '[deploy] publicação já em andamento'; return 0; }

  local mirror="$deploy_root/repository.git"
  [[ -d "$mirror" ]] || git clone --mirror "$repo_url" "$mirror"
  git --git-dir="$mirror" fetch --quiet origin "$branch"
  local new_sha release_dir running_sha=''
  new_sha="$(git --git-dir="$mirror" rev-parse FETCH_HEAD)"
  [[ ! -f "$deploy_root/current.sha" ]] || running_sha="$(cat "$deploy_root/current.sha")"
  if [[ "$new_sha" = "$running_sha" && "${FORCE:-0}" != 1 ]] && pm2 describe "$app_name" >/dev/null 2>&1; then
    echo "[deploy] ${new_sha:0:7} já publicado; FORCE=1 para alterar configuração do build"
    return 0
  fi

  release_dir="$(mktemp -d "$deploy_root/releases/${new_sha:0:12}.XXXXXX")"
  git --git-dir="$mirror" archive "$new_sha" | tar -x -C "$release_dir"
  (
    cd "$release_dir"
    npm ci --no-audit --no-fund
    NEXT_PUBLIC_DATA_MODE="$data_mode" NEXT_PUBLIC_API_URL="$api_url" npm run build
    [[ -f out/index.html && -f scripts/serve.mjs ]] || { echo '[deploy] release incompatível com preview estático'; exit 1; }
  )
  RELEASE_DIR="$release_dir" PM2_APP="$app_name" PREVIEW_PORT="$preview_port" PREVIEW_HOST="${PREVIEW_HOST:-127.0.0.1}" node --input-type=module <<'JS'
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
const root = process.env.RELEASE_DIR;
const config = { apps: [{
  name: process.env.PM2_APP,
  cwd: root,
  script: join(root, 'scripts/serve.mjs'),
  interpreter: process.execPath,
  env: { PREVIEW_DIR: join(root, 'out'), PREVIEW_PORT: process.env.PREVIEW_PORT, PREVIEW_HOST: process.env.PREVIEW_HOST }
}] };
writeFileSync(join(root, 'deploy.config.cjs'), 'module.exports = ' + JSON.stringify(config) + ';\n');
JS
  # O processo anterior continua lendo sua própria release durante todo o build.
  # Restart PM2 é uma troca de processo e não promete disponibilidade sem interrupção.
  pm2 startOrRestart "$release_dir/deploy.config.cjs" --update-env
  printf '%s\n' "$new_sha" > "$deploy_root/current.sha"
  echo "[deploy] ${new_sha:0:7} publicado; release preservada em $release_dir"
}

main "$@"; exit $?
