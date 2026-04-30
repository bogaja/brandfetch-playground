#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "  ⚠  No .env file found"
  echo "  → cp .env.example .env, then add your keys"
  echo "  → Get free keys at https://developers.brandfetch.com/dashboard"
  exit 1
fi

PORT="${PORT:-3737}"
echo "  🎨 Brandfetch Playground"
echo "  → http://localhost:$PORT"
echo ""
PORT="$PORT" exec bun run server.ts
