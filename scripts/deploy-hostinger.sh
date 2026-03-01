#!/usr/bin/env bash
# Deploy AfriGig dist/ to Hostinger via rsync over SSH.
# Usage: npm run deploy   (after setting env vars below)
#
# Required env (or .env.deploy): DEPLOY_HOST, DEPLOY_USER, DEPLOY_PATH
# Optional: DEPLOY_PORT=65002, DEPLOY_SSH_KEY=~/.ssh/my_deploy_key
# Do not commit .env.deploy; add it to .gitignore.

set -e
cd "$(dirname "$0")/.."

# Load env from .env.deploy if present
if [ -f .env.deploy ]; then
  set -a
  source .env.deploy
  set +a
fi

: "${DEPLOY_HOST:?Set DEPLOY_HOST (Hostinger server IP)}"
: "${DEPLOY_USER:?Set DEPLOY_USER (e.g. u847362951)}"
: "${DEPLOY_PATH:?Set DEPLOY_PATH (e.g. /home/u123/domains/yourdomain.com/public_html)}"
DEPLOY_PORT="${DEPLOY_PORT:-65002}"
SSH_KEY="${DEPLOY_SSH_KEY:-}"

echo "Building..."
npm run build

echo "Deploying dist/ to $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH ..."
RSYNC_RSH="ssh -p $DEPLOY_PORT -o StrictHostKeyChecking=no"
[ -n "$SSH_KEY" ] && RSYNC_RSH="$RSYNC_RSH -i $SSH_KEY"
export RSYNC_RSH

rsync -avz --delete dist/ "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH/"

echo "Done. Open https://yourdomain.com to verify."
