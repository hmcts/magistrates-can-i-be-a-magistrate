#!/usr/bin/env bash

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${YELLOW}Stopping Magistrates Recruitment Application...${NC}"

# Stop API
if [ -f "$ROOT_DIR/.api.pid" ]; then
  API_PID=$(cat "$ROOT_DIR/.api.pid")
  if kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null
    echo "  Spring Boot API stopped."
  fi
  rm -f "$ROOT_DIR/.api.pid"
fi

# Stop UI
if [ -f "$ROOT_DIR/.ui.pid" ]; then
  UI_PID=$(cat "$ROOT_DIR/.ui.pid")
  if kill -0 "$UI_PID" 2>/dev/null; then
    kill "$UI_PID" 2>/dev/null
    echo "  Express frontend stopped."
  fi
  rm -f "$ROOT_DIR/.ui.pid"
fi

# Kill any remaining processes on the ports
lsof -ti:4550 2>/dev/null | xargs kill -9 2>/dev/null && echo "  Cleared port 4550." || true
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null && echo "  Cleared port 3000." || true

# Stop PostgreSQL container (but keep data)
if docker ps --format '{{.Names}}' | grep -q '^magistrates-db$'; then
  docker stop magistrates-db >/dev/null
  echo "  PostgreSQL stopped (data preserved)."
fi

echo ""
echo -e "${GREEN}All services stopped.${NC}"
echo -e "  To remove the database: ${YELLOW}docker rm magistrates-db${NC}"
echo ""
