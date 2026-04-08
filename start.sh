#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN} Magistrates Recruitment Application    ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check Node.js
if ! command -v node &>/dev/null; then
  echo -e "${RED}Node.js is not installed. Please install Node 20+.${NC}"
  exit 1
fi
echo -e "  Node: ${GREEN}$(node -v)${NC}"
echo ""

# Install dependencies if needed
cd "$ROOT_DIR/ui-hmcts-magistrates"
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install --silent
  echo ""
fi

# Start
echo -e "${YELLOW}Starting...${NC}"
echo ""
node server.js
