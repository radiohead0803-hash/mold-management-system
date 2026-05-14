#!/bin/bash
set -euo pipefail

# Claude Code on the web에서만 실행
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}/billiards-game"

# 의존성 설치 (idempotent: node_modules가 최신이면 빠르게 종료)
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  npm install --no-audit --no-fund --loglevel=error
fi
