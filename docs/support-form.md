# Support form and email

How the merchant support form on the docs site works, every service it depends on, and how it was set up
(2026-10-13). No secrets are stored in this repo; keys live only in Cloudflare and Resend.

## What it does

A merchant fills in the form at <https://doc-vermeil-store.tochukwu.dev/contact/>. On submit:

1. The browser posts the form (`multipart/form-data`) to `/api/support`, a Cloudflare Pages Function.
2. The function validates the fields and attachments, then checks the Turnstile token with Cloudflare.
3. It sends the request to the support inbox through Resend, with attachments and **reply-to set to the
   merchant**, so replying from Gmail answers the merchant directly.
4. It sends the merchant an automatic confirmation through Resend, with reply-to set to the support inbox.
5. It redirects to `/contact/sent/`. On failure it redirects back to `/contact/#error-…`, and the matching
   message shows through CSS `:target` (no JavaScript needed).

If the request reaches the inbox but the confirmation fails, the merchant still sees "Message sent" (the
failure is logged), so they don't resend and create a duplicate.

This meets the Theme Store support form rules: first and last name, email, store URL with an example, problem
description, file upload, automatic reply, mobile friendly and linkable. Shopify recommends a help desk or CRM
for the long term; this keeps support in Gmail until that's worth paying for.

## Components

| Piece | Where | Role |
|---|---|---|
| Form | `docs-site/src/components/SupportForm.astro` | Fields, Turnstile widget, error messages |
| Contact page | `docs-site/src/content/docs/contact.mdx` | Renders the form; linked from the sidebar, docs home and `theme_info.theme_support_url` |
| Sent page | `docs-site/src/content/docs/contact/sent.md` | Success page (excluded from search) |
| Function | `docs-site/functions/api/support.js` | Validation, Turnstile check, both emails |
| Cloudflare Pages | project `vermeil-store`, production branch `master`, root `docs-site` | Builds the site and runs the function |
| Cloudflare Turnstile | widget for `doc-vermeil-store.tochukwu.dev` and `vermeil-store.pages.dev` | Spam check |
| Resend | domain `tochukwu.dev` | Sends both emails |
| Cloudflare Email Routing | `support@tochukwu.dev` → `onwunalitochukwu63@gmail.com` | Receives support mail and merchant replies |

### Function limits

- Fields are trimmed and capped: names 80 characters, email and store URL 200, message 10,000.
- Up to 5 attachments, 5 MB each; images, videos and PDFs only.
- Error fragments: `#error-invalid` (missing or bad fields), `#error-files` (attachments),
  `#error-verification` (Turnstile), `#error-delivery` (the inbox email failed).

## Setup, step by step

### 1. Docs site on Cloudflare Pages
- Project connected to `tochukwu19/Masterpiece`, production branch `master`.
- Root directory `docs-site`, build command `npm run build`, output `dist`. Node version from
  `docs-site/.node-version` (22).
- Custom domain `doc-vermeil-store.tochukwu.dev`.

### 2. Inbox: Cloudflare Email Routing
- Cloudflare dashboard → `tochukwu.dev` → **Email → Email Routing**, enabled.
- Rule: `support@tochukwu.dev` → **Send to an email** → `onwunalitochukwu63@gmail.com` (destination verified
  through the email Cloudflare sends).
- Cloudflare adds the receiving DNS records itself (MX and SPF on the root).

### 3. Sending: Resend
- Resend → **Domains** → `tochukwu.dev`, with its DNS records added in Cloudflare; status Verified.
- Resend → **API Keys** → a key with **sending access**, stored only as a Cloudflare secret.

### 4. DMARC
- Cloudflare DNS → `TXT` `_dmarc` → `v=DMARC1; p=none;` so Gmail trusts the confirmations. `p=none` only
  requests reports and blocks nothing.

### 5. Spam check: Cloudflare Turnstile
- Cloudflare dashboard → **Turnstile → Add widget**, Managed mode, hostnames
  `doc-vermeil-store.tochukwu.dev` and `vermeil-store.pages.dev`.

### 6. Pages variables
Pages project → **Settings → Variables and secrets**, Production:

| Name | Type | Value |
|---|---|---|
| `DOCS_SITE_URL` | Text | `https://doc-vermeil-store.tochukwu.dev` (sitemap and canonical links) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Text | Turnstile site key. Must be Text: the build writes it into the page |
| `TURNSTILE_SECRET_KEY` | Secret | Turnstile secret key |
| `RESEND_API_KEY` | Secret | Resend API key |
| `SUPPORT_FROM` | Text | `Vermeil Support <support@tochukwu.dev>` |
| `SUPPORT_INBOX` | Text | `support@tochukwu.dev` |

Changing a variable needs a new deployment to take effect (push a commit, or retry the latest deployment).

## DNS records on `tochukwu.dev`

Checked on 2026-10-13:

| Name | Type | Value | Purpose |
|---|---|---|---|
| `tochukwu.dev` | MX | `route1/2/3.mx.cloudflare.net` | Email Routing (receive) |
| `tochukwu.dev` | TXT | `v=spf1 include:_spf.mx.cloudflare.net ~all` | Email Routing SPF |
| `resend._domainkey` | TXT | `p=…` (DKIM public key) | Resend signing |
| `send` | MX | `feedback.forge.rmta.net` | Resend bounces |
| `send` | TXT | `v=spf1 …` | Resend SPF |
| `_dmarc` | TXT | `v=DMARC1; p=none;` | DMARC |
| `doc-vermeil-store` | CNAME | the Pages project | Docs custom domain |

## Testing

- **Locally:** the function was tested in Node with stubbed Turnstile and Resend (valid request with an
  attachment, missing fields, bad email, too many files, wrong type, oversized file, failed Turnstile, failed
  inbox send, failed confirmation).
- **Preview builds:** use Cloudflare's always-pass test site key `1x00000000000000000000AA` in
  `PUBLIC_TURNSTILE_SITE_KEY` to see the widget locally.
- **Live (2026-10-13):** a text-only request delivered both emails to Gmail.

## Known issue

- **A request with an image attachment stays pending** (backlog B12). Text-only requests work. Next steps:
  check file size, type and count in the browser before upload so bad files never leave the page; replace the
  JavaScript base64 loop with the runtime's native encoding to stay within the free plan's per-request CPU
  limit; then retest with an image and read the Pages Functions log stream (Deployments → latest → Functions →
  Begin log stream).

## Troubleshooting

- **No emails at all:** check the Functions log stream. `Resend 401/403` means a bad key; `Resend 422` usually
  means `SUPPORT_FROM` isn't on the verified domain.
- **The form returns with the robot message:** the Turnstile secret doesn't match the site key, or the hostname
  isn't listed on the widget.
- **The confirmation lands in spam:** check that the DMARC and Resend DNS records still resolve.
- **The inbox email arrives but replies don't reach the merchant:** reply-to is the merchant's email from the
  form. Check what they typed.
