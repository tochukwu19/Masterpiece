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
- Environment variable: `DOCS_SITE_URL` set to the site's public URL, for example `https://docs.example.com`
- Node version comes from `.node-version`
