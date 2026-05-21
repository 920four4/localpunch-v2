# Auth email setup (magic links, etc.)

## How it works

| Piece | Role |
|-------|------|
| **Resend SMTP** | Delivers the email (`smtp.resend.com`, `auth@localpunchcard.io`) |
| **Supabase mailer templates** | HTML body + subject (what the user sees) |
| **Resend dashboard templates** | **Not used** for Supabase Auth unless you build a custom Auth Hook |

Configuring custom SMTP only routes mail through Resend. It does **not** automatically use Resend `template_id` designs.

Branded HTML for production lives in `supabase/templates/*.html` and must be synced to the **hosted** Supabase project.

## Push branded templates to production

```bash
python3 scripts/supabase-email-templates-push.py
```

Requires `SUPABASE_ACCESS_TOKEN` in `.env.local`.

## Configure SMTP (Resend)

```bash
python3 scripts/supabase-smtp-config.py
```

Requires `SUPABASE_ACCESS_TOKEN` and `RESEND_SMTP_PASSWORD` (Resend API key) in `.env.local`.

## Templates included

- Magic link (business sign-in)
- Confirm signup
- Email change
- Recovery
- Invite
- Reauthentication

Subjects match `supabase/config.toml`.

## Loops vs Supabase

- **Supabase Auth emails** → magic link, confirm email (this doc)
- **Loops** → merchant drip + transactional after signup/billing (`docs/LOOPS_SETUP.md`)
