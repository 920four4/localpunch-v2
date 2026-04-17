#!/usr/bin/env bash
# LocalPunch → Loops bootstrap
# =============================
# Idempotent. Run with:
#   LOOPS_API_KEY=... ./scripts/loops-bootstrap.sh
# or if you've already auth'd the CLI for this team:
#   loops auth use localpunch && ./scripts/loops-bootstrap.sh
#
# This script creates every custom contact property LocalPunch uses so we can
# segment Loops campaigns/audiences on real product data. The CLI cannot yet
# create mailing lists or transactional templates — those are UI-only steps,
# see docs/LOOPS_SETUP.md.

set -euo pipefail

if ! command -v loops >/dev/null 2>&1; then
  echo "error: loops CLI not installed. Install with:  brew install loops-so/tap/loops" >&2
  exit 1
fi

# Authenticate sanity check
if ! loops api-key >/dev/null 2>&1; then
  echo "error: loops CLI not authenticated. Run one of:" >&2
  echo "  loops auth login --name localpunch" >&2
  echo "  OR export LOOPS_API_KEY=your_key before running this script" >&2
  exit 1
fi

echo "▶ Creating contact properties for LocalPunch..."
echo ""

# NB: property names are camelCase, types are string|number|boolean|date.
# CLI returns an error if the property already exists; we swallow those so
# the script is safely rerunnable.
create_prop () {
  local name="$1"
  local type="$2"
  local label="$3"
  printf "  %-28s (%-7s)  %s\n" "$name" "$type" "$label"
  loops contact-properties create --name "$name" --type "$type" >/dev/null 2>&1 || true
}

# --- Identity / source ------------------------------------------------------
# userId, userGroup, firstName, lastName, source, subscribed are default
# properties — Loops creates them automatically.

# --- Business / merchant dimensions -----------------------------------------
create_prop "businessId"              "string"  "Supabase business UUID"
create_prop "businessName"            "string"  "Public business name"
create_prop "businessSlug"            "string"  "URL slug"
create_prop "businessAddress"         "string"  "Physical address"
create_prop "businessCreatedAt"       "date"    "When the shop record was created"
create_prop "programCount"            "number"  "Active loyalty programs"

# --- Billing / subscription -------------------------------------------------
create_prop "planInterval"            "string"  "month | year"
create_prop "planPriceCents"          "number"  "6000 or 60000"
create_prop "subscriptionStatus"      "string"  "Stripe sub status"
create_prop "stripeCustomerId"        "string"  "cus_..."
create_prop "stripeSubscriptionId"    "string"  "sub_..."
create_prop "subscriptionStartedAt"   "date"    "First activation timestamp"
create_prop "activatedAt"             "date"    "Last transition to active"
create_prop "currentPeriodEnd"        "date"    "When the current period ends"
create_prop "cancelAtPeriodEnd"       "boolean" "Cancel pending"
create_prop "churnedAt"               "date"    "When they canceled for good"
create_prop "lifetimeValueCents"      "number"  "Total paid in cents"
create_prop "lastPaymentAt"           "date"    "Most recent successful invoice"
create_prop "lastPaymentFailedAt"     "date"    "Most recent failed invoice"

# --- Product usage (for engagement-based segments) --------------------------
create_prop "totalCustomers"          "number"  "Distinct customers punching at this shop"
create_prop "totalPunches"            "number"  "Lifetime punches given"
create_prop "totalRedemptions"        "number"  "Lifetime redemptions"
create_prop "lastPunchAt"             "date"    "Most recent punch event"
create_prop "lastActiveAt"            "date"    "Any activity from merchant session"

# --- Customer-specific ------------------------------------------------------
create_prop "phone"                   "string"  "E.164 phone number"
create_prop "phoneVerified"           "boolean" "OTP completed"
create_prop "marketingConsent"        "boolean" "Opted in for marketing"
create_prop "cardCount"               "number"  "Active punch cards they hold"
create_prop "completedCards"          "number"  "Cards they have redeemed"

# --- Marketing attribution --------------------------------------------------
create_prop "signupSource"            "string"  "direct | google | referral | partner"
create_prop "referrerBusinessSlug"    "string"  "If they came via another shop"

echo ""
echo "✓ Done. Verify with:  loops contact-properties list --custom"
echo ""
echo "Next: create mailing lists and transactional templates in the Loops UI."
echo "     See docs/LOOPS_SETUP.md for the exact list + copy-paste copy."
