# Vermeil

An editorial Shopify Online Store 2.0 theme for jewelry and fine accessories. Version 1.0.0 was submitted to
the Shopify Theme Store on 2026-10-13.

- Documentation and support form: <https://doc-vermeil-store.tochukwu.dev/>
- Demo store: `vermeil-6sitmu3d.myshopify.com` (password-protected)
- Changes: [`CHANGELOG.md`](CHANGELOG.md)

The repository keeps its old name, Masterpiece.

## Stack

Original OS 2.0 code: JSON templates, sections and shared theme blocks, vanilla CSS on settings-driven tokens,
Alpine.js (vendored, pinned) for interaction, and Shopify's Ajax Cart and Section Rendering APIs. No Tailwind,
no build step for the theme, no third-party scripts from CDNs, no app dependencies.

## Commands

```bash
npm install
npm run dev          # shopify theme dev against the dev store, with theme editor sync
npm run check        # schema validator + Theme Check, fails on errors
npm run check:all    # also fails on warnings
npm run package      # Theme Store ZIP from a clean worktree of HEAD (or a given ref)
npm run docs         # regenerate the settings reference on the docs site
npm run kit          # regenerate the design system reference (docs/design-system/index.html)
npm run vendor       # re-copy the pinned Alpine build and social icons into the theme
npm run lighthouse   # Lighthouse for home, collection and product
```

## Layout

| Path | What |
|---|---|
| `assets/`, `blocks/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, `templates/` | The theme |
| `docs-site/` | Documentation site (Starlight on Cloudflare Pages) and the support form function |
| `docs/` | Project docs: Theme Store checklist, roadmap, backlog, listing copy, support form setup, design language |
| `scripts/` | Schema validator, packaging, settings reference and design kit generators, Lighthouse runner |

## Branches

- `master`: the release line. Pushing it redeploys the docs site; `npm run package` ships from it.
- `demo`: `master` plus the demo store's home and product templates, connected to the demo store's theme
  through the Shopify GitHub integration. Refresh it by merging `master` into it.
- Work happens on short branches off `master`, fast-forwarded in. Releases are tagged (`v1.0.0`).

Template JSON edited in the theme editor during `npm run dev` shows up as uncommitted changes to
`templates/*.json`. That's demo content: it belongs on `demo`, never on a feature branch.

## Releasing an update

1. Bump `theme_version` in `config/settings_schema.json` and `version` in `package.json`.
2. Add the changes to `CHANGELOG.md` and the merchant release notes
   (`docs-site/src/content/docs/release-notes.md`).
3. `npm run docs` if any setting changed, then `npm run check:all`.
4. Merge to `master`, tag the version, `npm run package <tag>`, upload the ZIP in the Partner Dashboard. Updates
   also carry `release-notes.md` in the ZIP root (see `docs/roadmap.md`, Phase 8).
5. Merge `master` into `demo`.
