#!/usr/bin/env bash
set -euo pipefail

# Profile sync smoke checker
# Usage:
#   scripts/profile-sync-smoke-check.sh
#   SITE_URL=https://staging.ninanoo.com scripts/profile-sync-smoke-check.sh
#   API_URL=https://api.ninanoo.com scripts/profile-sync-smoke-check.sh

SITE_URL="${SITE_URL:-https://ninanoo.com}"
API_URL="${API_URL:-https://api.ninanoo.com}"

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
echo "Profile Sync Smoke Check"
echo "SITE_URL: $SITE_URL"
echo "API_URL : $API_URL"
echo "============================================================"

require_cmd curl
require_cmd rg

echo ""
echo "### 1) Runtime config + health endpoints"
run curl -i "$API_URL/health"
run curl -i "$API_URL/runtime-config"

echo ""
echo "### 2) Page availability checks"
run curl -I "$SITE_URL/"
run curl -I "$SITE_URL/pages/mypage.html"
run curl -I "$SITE_URL/pages/report-intake.html"
run curl -I "$SITE_URL/pages/light-meal-plan.html"

echo ""
echo "### 3) Client script presence checks (critical includes)"
run curl -s "$SITE_URL/" | rg -n "runtime-config\\.js|user-profile-store\\.js|app\\.js"
run curl -s "$SITE_URL/pages/mypage.html" | rg -n "supabase-js|runtime-config\\.js|user-profile-store\\.js|mypage\\.js"
run curl -s "$SITE_URL/pages/report-intake.html" | rg -n "supabase-js|runtime-config\\.js|user-profile-store\\.js|premium-report-intake\\.js"
run curl -s "$SITE_URL/pages/light-meal-plan.html" | rg -n "supabase-js|runtime-config\\.js|user-profile-store\\.js|light-meal-plan\\.js"

echo ""
echo "### 4) Manual profile sync QA (browser)"
echo "Run: docs/profile-sync-qa-checklist.md"
echo "- guest(localStorage) flow"
echo "- login(server + cache) flow"
echo "- login/logout transition flow"
echo "- refresh/navigation persistence flow"

echo ""
echo "✅ Profile sync smoke check completed."
