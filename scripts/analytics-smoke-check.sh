#!/usr/bin/env bash
set -euo pipefail

# Analytics smoke checker
# Usage:
#   scripts/analytics-smoke-check.sh
#   SITE_URL=https://staging.ninanoo.com scripts/analytics-smoke-check.sh

SITE_URL="${SITE_URL:-https://ninanoo.com}"

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
echo "Analytics Smoke Check"
echo "SITE_URL: $SITE_URL"
echo "============================================================"

require_cmd curl
require_cmd rg

echo ""
echo "### 1) Core page availability"
run curl -I "$SITE_URL/"
run curl -I "$SITE_URL/pages/auth.html"
run curl -I "$SITE_URL/pages/signup.html"
run curl -I "$SITE_URL/pages/report-intake.html"
run curl -I "$SITE_URL/pages/payment.html"
run curl -I "$SITE_URL/pages/report-result.html"

echo ""
echo "### 2) analytics.js include checks"
run curl -s "$SITE_URL/" | rg -n "analytics\\.js"
run curl -s "$SITE_URL/pages/auth.html" | rg -n "analytics\\.js|auth-page\\.js"
run curl -s "$SITE_URL/pages/signup.html" | rg -n "analytics\\.js|signup-page\\.js"
run curl -s "$SITE_URL/pages/report-intake.html" | rg -n "analytics\\.js|premium-report-intake\\.js"
run curl -s "$SITE_URL/pages/payment.html" | rg -n "analytics\\.js|polar-worker-checkout\\.js"
run curl -s "$SITE_URL/pages/report-result.html" | rg -n "analytics\\.js|report-result\\.js"

echo ""
echo "### 3) Manual queue verification"
echo "Run in browser DevTools console:"
echo "  window.NinanooAnalytics && window.NinanooAnalytics.track('qa_ping',{source:'smoke'})"
echo "  JSON.parse(localStorage.getItem('ninanoo.analytics.queue.v1')||'[]').slice(-3)"
echo "  JSON.parse(localStorage.getItem('ninanoo.analytics.user.v1')||'{}')"
echo ""
echo "Reference: docs/analytics-qa-checklist.md"
echo "✅ Analytics smoke check completed."
