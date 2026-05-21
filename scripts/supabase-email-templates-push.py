#!/usr/bin/env python3
"""Push branded auth email HTML from supabase/templates/ to hosted Supabase.

Supabase sends auth mail through custom SMTP (Resend) but the *body* comes from
Supabase mailer_templates_* fields — NOT Resend template IDs in the Resend dashboard.

Usage:
  python3 scripts/supabase-email-templates-push.py
  python3 scripts/supabase-email-templates-push.py --dry-run
"""
from __future__ import annotations

import json
import ssl
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "supabase" / "templates"
PROJECT_REF = "qomtxvkytwaycyhlmtql"
URL = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/config/auth"

# file stem -> (content field, subject field, subject line)
MAP = {
    "magic_link": (
        "mailer_templates_magic_link_content",
        "mailer_subjects_magic_link",
        "Your LocalPunch sign-in link",
    ),
    "confirm_signup": (
        "mailer_templates_confirmation_content",
        "mailer_subjects_confirmation",
        "Confirm your email — LocalPunch",
    ),
    "email_change": (
        "mailer_templates_email_change_content",
        "mailer_subjects_email_change",
        "Confirm your new email — LocalPunch",
    ),
    "recovery": (
        "mailer_templates_recovery_content",
        "mailer_subjects_recovery",
        "Reset your LocalPunch password",
    ),
    "invite": (
        "mailer_templates_invite_content",
        "mailer_subjects_invite",
        "You're invited to LocalPunch",
    ),
    "reauthentication": (
        "mailer_templates_reauthentication_content",
        "mailer_subjects_reauthentication",
        "Your LocalPunch verification code",
    ),
}


def _ssl_context():
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k] = v.strip().strip('"').strip("'")
    return env


def main() -> None:
    dry = "--dry-run" in sys.argv
    env = load_env(ROOT / ".env.local")
    token = env.get("SUPABASE_ACCESS_TOKEN")
    if not token:
        sys.exit("Missing SUPABASE_ACCESS_TOKEN in .env.local")

    patch: dict[str, str] = {}
    for stem, (content_key, subject_key, subject) in MAP.items():
        html_path = TEMPLATES / f"{stem}.html"
        if stem == "confirm_signup":
            html_path = TEMPLATES / "confirm_signup.html"
        if not html_path.exists():
            print(f"skip missing {html_path.name}")
            continue
        html = html_path.read_text()
        patch[content_key] = html
        patch[subject_key] = subject
        print(f"  {stem}: {len(html)} chars → {content_key}")

    if dry:
        print("\n--dry-run: would PATCH", len(patch), "fields")
        return

    data = json.dumps(patch).encode()
    req = urllib.request.Request(
        URL,
        data=data,
        method="PATCH",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
    )
    with urllib.request.urlopen(req, context=_ssl_context()) as resp:
        out = json.load(resp)

    ml = out.get("mailer_templates_magic_link_content", "")
    print("\nPushed OK.")
    print("magic_link subject:", out.get("mailer_subjects_magic_link"))
    print("magic_link content length:", len(ml))
    print("magic_link starts with:", repr(ml[:60]))


if __name__ == "__main__":
    main()
