// astro.config.mjs
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap'; // Import the sitemap integration

// https://astro.build/config
export default defineConfig({
  // Output mode default adalah 'static' (SSG), ini yang kita inginkan
  output: 'static',
  
  // WAJIB: Ganti dengan URL situs Anda yang sebenarnya
  site: 'https://bokepsenam.pages.dev', // Replace with your actual website domain for SEO
  
  trailingSlash: 'never',

  integrations: [
    sitemap(), // Add the sitemap integration here
  ],
});