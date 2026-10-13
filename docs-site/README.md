# Vermeil documentation site

Starlight (Astro) site for the public theme documentation. Pages live in `src/content/docs/`.
`settings-reference.md` is generated from the theme: run `npm run docs` in the repo root after changing any
setting, label or default.

## Local

```bash
npm install
npm run dev
```

## Cloudflare Pages

- Root directory: `docs-site`
- Build command: `npm run build`
- Build output directory: `dist`
- Node version comes from `.node-version`

Variables (**Settings > Variables and secrets**, Production):

| Name | Type | Value |
|---|---|---|
| `DOCS_SITE_URL` | Text | `https://doc-vermeil-store.tochukwu.dev` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Text | Turnstile widget site key |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile widget secret key |
| `RESEND_API_KEY` | Secret | Resend API key with sending access |
| `SUPPORT_FROM` | Text | `Vermeil Support <support@tochukwu.dev>` (a verified Resend domain) |
| `SUPPORT_INBOX` | Text | `support@tochukwu.dev` |

## Support form

`/contact/` posts to the Pages Function in `functions/api/support.js`. It checks Turnstile, emails the request
with attachments to `SUPPORT_INBOX` (reply-to: the merchant), and sends the merchant a confirmation. Errors
redirect back to the form with a fragment (`#error-invalid`, `#error-files`, `#error-verification`,
`#error-delivery`) that shows the matching message without JavaScript.
