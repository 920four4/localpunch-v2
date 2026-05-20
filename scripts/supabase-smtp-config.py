#!/usr/bin/env python3
"""Surgically configure Supabase Auth custom SMTP (Resend) on the linked
hosted project via the Management API.

Why this exists instead of `supabase config push`: `config push` is
all-or-nothing and would overwrite production site_url, redirect URLs, and
SMS/Twilio settings from the dev-oriented config.toml — breaking customer
phone-OTP login. This touches ONLY the SMTP fields + the email rate limit.

Reads SUPABASE_ACCESS_TOKEN and RESEND_SMTP_PASSWORD from .env.local.
Never prints secrets. Prints a before/after snapshot of safe fields so the
change is verifiable and reversible.

Usage:
  python3 scripts/supabase-smtp-config.py           # apply
  python3 scripts/supabase-smtp-config.py --dry-run  # snapshot only, no write
"""
import json
import os
import ssl
import sys
import urllib.request


def _ssl_context():
    """A verifying SSL context. python.org macOS builds ship no system trust,
    so fall back to certifi or the macOS OpenSSL CA bundle. Verification is
    never disabled."""
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        pass
    for ca in ("/etc/ssl/cert.pem", "/usr/local/etc/openssl/cert.pem"):
        if os.path.exists(ca):
            return ssl.create_default_context(cafile=ca)
    return ssl.create_default_context()

PROJECT_REF = "qomtxvkytwaycyhlmtql"
URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth"

# Only these are touched. Everything else (SMS, site_url, redirects) untouched.
PATCH = {
    "smtp_host": "smtp.resend.com",
    "smtp_port": "587",
    "smtp_user": "resend",
    "smtp_admin_email": "localpunch@920four.com",
    "smtp_sender_name": "LocalPunch",
    "rate_limit_email_sent": 30,
}

SAFE_FIELDS = [
    "smtp_host", "smtp_port", "smtp_user", "smtp_admin_email",
    "smtp_sender_name", "rate_limit_email_sent", "external_email_enabled",
    "mailer_autoconfirm", "sms_provider", "external_phone_enabled", "site_url",
]


def load_env(path=".env.local"):
    env = {}
    for line in open(path):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k] = v.strip().strip('"').strip("'")
    return env


def api(method, token, body=None):
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        URL, data=data, method=method,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, context=_ssl_context()) as resp:
        return json.load(resp)


def snapshot(label, cfg):
    print(f"{label} (safe fields only):")
    print(json.dumps({k: cfg.get(k) for k in SAFE_FIELDS}, indent=2))
    print(f"  smtp_pass set: {bool(cfg.get('smtp_pass'))}")


def main():
    dry = "--dry-run" in sys.argv
    env = load_env()
    token = env["SUPABASE_ACCESS_TOKEN"]
    key = env.get("RESEND_SMTP_PASSWORD", "")
    if not key:
        sys.exit("RESEND_SMTP_PASSWORD missing/empty in .env.local")

    before = api("GET", token)
    snapshot("BEFORE", before)

    if dry:
        print("\n--dry-run: no changes written.")
        return

    body = dict(PATCH)
    body["smtp_pass"] = key  # secret, never logged
    api("PATCH", token, body)

    after = api("GET", token)
    snapshot("\nAFTER", after)
    print("\nSMTP configured. Send a magic link to verify end-to-end.")


if __name__ == "__main__":
    main()
