import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.pozza-maud-psy-angers.com',
  integrations: [
    tailwind({ config: { applyBaseStyles: true } }),
    sitemap()
  ]
});

