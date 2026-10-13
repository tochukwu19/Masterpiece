import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: process.env.DOCS_SITE_URL,
  integrations: [
    starlight({
      title: 'Vermeil',
      description: 'Documentation for Vermeil, a Shopify theme for jewelry and fine accessories.',
      customCss: ['@fontsource/gloock/400.css', '@fontsource-variable/figtree', './src/styles/vermeil.css'],
      sidebar: [
        { label: 'Getting started', link: '/getting-started/' },
        { label: 'Pages', link: '/pages/' },
        { label: 'Settings reference', link: '/settings-reference/' },
        { label: 'FAQ', link: '/faq/' },
        { label: 'Support', link: '/support/' },
        { label: 'Release notes', link: '/release-notes/' },
      ],
      lastUpdated: true,
      pagination: false,
    }),
  ],
});
