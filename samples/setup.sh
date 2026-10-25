#!/usr/bin/env bash
# Sets up a fresh clone: checks Node, installs, links the project.
set -euo pipefail

readonly REQUIRED_NODE=24
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log() { printf '[%s] %s\n' "$(date +%H:%M:%S)" "$*"; }

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is not installed" >&2
  exit 1
fi

major=$(node -v | sed -E 's/^v([0-9]+).*/\1/')
if (( major < REQUIRED_NODE )); then
  log "Node ${major} found; ${REQUIRED_NODE}+ required"
  exit 1
fi

cd "$PROJECT_DIR"
corepack enable && pnpm install --frozen-lockfile

for env_file in .env.example .env.local; do
  [[ -f "$env_file" ]] && log "found $env_file"
done

cat <<EOF > .env.local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF

git switch -c "feat/$(whoami)-setup" 2>/dev/null || git switch main
log "Done. Run: pnpm dev"
