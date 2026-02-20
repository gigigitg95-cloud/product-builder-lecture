#!/usr/bin/env bash
set -euo pipefail

# Ninanoo deployment checklist runner
# Usage examples:
#   scripts/deploy-checklist.sh
#   scripts/deploy-checklist.sh --check-only
#   scripts/deploy-checklist.sh --worker-only
#   scripts/deploy-checklist.sh --firebase-only
#   FIREBASE_PROJECT=your-project-id scripts/deploy-checklist.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKER_DIR="$ROOT_DIR/workers/polar-checkout-worker"
FIREBASE_PROJECT="${FIREBASE_PROJECT:-productai-8845e}"
API_HEALTH_URL="${API_HEALTH_URL:-https://api.ninanoo.com/health}"
SITE_HEALTH_URL="${SITE_HEALTH_URL:-https://ninanoo.com/}"
DEPLOY_FIRESTORE_INDEXES=0

DO_CHECKS=1
DO_WORKER=1
DO_FIREBASE=1

for arg in "$@"; do
  case "$arg" in
    --check-only)
      DO_CHECKS=1
      DO_WORKER=0
      DO_FIREBASE=0
      ;;
    --worker-only)
      DO_CHECKS=1
      DO_WORKER=1
      DO_FIREBASE=0
      ;;
    --firebase-only)
      DO_CHECKS=1
      DO_WORKER=0
      DO_FIREBASE=1
      ;;
    --with-indexes)
      DEPLOY_FIRESTORE_INDEXES=1
      ;;
    --no-checks)
      DO_CHECKS=0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Allowed: --check-only --worker-only --firebase-only --with-indexes --no-checks"
      exit 1
      ;;
  esac
done

run() {
  echo ""
  echo ">>> $*"
  "$@"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

warn_dirty_worktree() {
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "⚠️  Working tree has uncommitted changes."
    echo "    Continue only if you understand what will be deployed."
  fi
}

echo "============================================================"
echo "Ninanoo Deploy Checklist"
echo "Root:             $ROOT_DIR"
echo "Worker:           $WORKER_DIR"
echo "Firebase project: $FIREBASE_PROJECT"
echo "Checks:           $DO_CHECKS"
echo "Worker deploy:    $DO_WORKER"
echo "Firebase deploy:  $DO_FIREBASE"
echo "Indexes deploy:   $DEPLOY_FIRESTORE_INDEXES"
echo "============================================================"

cd "$ROOT_DIR"
require_cmd git
require_cmd npm
require_cmd node
require_cmd curl
if [[ "$DO_FIREBASE" -eq 1 ]]; then
  require_cmd firebase
fi
warn_dirty_worktree

if [[ "$DO_CHECKS" -eq 1 ]]; then
  echo ""
  echo "### 1) Pre-flight checks"
  run firebase --version
  run firebase projects:list --json
  run git status --short
  run npm run build
  run node scripts/check-dom-contract.js
  run npm --prefix "$WORKER_DIR" run check
fi

if [[ "$DO_WORKER" -eq 1 ]]; then
  echo ""
  echo "### 2) Deploy Cloudflare Worker"
  run npm --prefix "$WORKER_DIR" run deploy
fi

if [[ "$DO_FIREBASE" -eq 1 ]]; then
  echo ""
  echo "### 3) Deploy Firebase (rules -> indexes(optional) -> hosting)"
  run firebase deploy --only firestore:rules --project "$FIREBASE_PROJECT"
  if [[ "$DEPLOY_FIRESTORE_INDEXES" -eq 1 ]]; then
    run firebase deploy --only firestore:indexes --project "$FIREBASE_PROJECT"
  else
    echo ""
    echo ">>> Skip firestore:indexes (use --with-indexes when indexes file is configured)"
  fi
  run firebase deploy --only hosting --project "$FIREBASE_PROJECT"
fi

echo ""
echo "### 4) Post-deploy smoke checks"
run curl -i "$API_HEALTH_URL"
run curl -I "$SITE_HEALTH_URL"

echo ""
echo "✅ Deploy checklist completed."
echo ""
echo "Tip:"
echo "  - Worker secrets update (when needed):"
echo "    cd workers/polar-checkout-worker && npx wrangler secret put <SECRET_NAME>"
echo "  - Firebase preview channel (optional):"
echo "    firebase hosting:channel:deploy preview --project $FIREBASE_PROJECT"
