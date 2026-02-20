#!/usr/bin/env bash
set -euo pipefail

# Firebase-only deployment helper
# Usage:
#   scripts/firebase-deploy-only.sh
#   scripts/firebase-deploy-only.sh --with-indexes
#   FIREBASE_PROJECT=your-project-id scripts/firebase-deploy-only.sh

FIREBASE_PROJECT="${FIREBASE_PROJECT:-productai-8845e}"
SITE_HEALTH_URL="${SITE_HEALTH_URL:-https://ninanoo.com/}"
DO_CHECKS=1
DO_INDEXES=0

for arg in "$@"; do
  case "$arg" in
    --with-indexes)
      DO_INDEXES=1
      ;;
    --no-checks)
      DO_CHECKS=0
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Allowed: --with-indexes --no-checks"
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

echo "============================================================"
echo "Firebase Deploy Only"
echo "Project:          $FIREBASE_PROJECT"
echo "Checks:           $DO_CHECKS"
echo "Indexes deploy:   $DO_INDEXES"
echo "============================================================"

require_cmd firebase
require_cmd node
require_cmd npm
require_cmd curl

if [[ "$DO_CHECKS" -eq 1 ]]; then
  echo ""
  echo "### 1) Pre-flight checks"
  run firebase --version
  run firebase projects:list --json
  run git status --short
  run npm run build
  run node scripts/check-dom-contract.js
fi

echo ""
echo "### 2) Deploy Firestore rules"
run firebase deploy --only firestore:rules --project "$FIREBASE_PROJECT"

if [[ "$DO_INDEXES" -eq 1 ]]; then
  echo ""
  echo "### 3) Deploy Firestore indexes"
  run firebase deploy --only firestore:indexes --project "$FIREBASE_PROJECT"
else
  echo ""
  echo "### 3) Skip Firestore indexes (use --with-indexes)"
fi

echo ""
echo "### 4) Deploy Hosting"
run firebase deploy --only hosting --project "$FIREBASE_PROJECT"

echo ""
echo "### 5) Post-deploy smoke checks"
run curl -I "$SITE_HEALTH_URL"

echo ""
echo "✅ Firebase-only deploy completed."
