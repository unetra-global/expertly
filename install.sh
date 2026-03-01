#!/bin/bash
set -e
cd "$(dirname "$0")/apps/api"
export PATH=/Users/shreyans/.nvm/versions/node/v22.14.0/bin:$PATH
pnpm install
echo "Install complete"
