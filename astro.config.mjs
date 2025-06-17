// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap'; // Import sitemap

// https://astro.build/config
export default defineConfig({
  output: 'static',
  publicDir: './public',
  server: {
    host: true,
    port: 4321,
  },
  integrations: [
    sitemap({
      hostname: import.meta.env.PUBLIC_SITE, // Menggunakan variabel lingkungan PUBLIC_SITE
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@components': new URL('./src/components', import.meta.url).pathname,
        '@layouts': new URL('./src/layouts', import.meta.url).pathname,
        '@data': new URL('./src/data', import.meta.url).pathname,
        '@utils': new URL('./src/utils', import.meta.url).pathname,
        '@pages': new URL('./src/pages', import.meta.url).pathname,
      },
    },
    ssr: {
      noExternal: ['sharp', 'node-fetch', 'csv-parser'], // Pastikan ini ada
    },
  },
});