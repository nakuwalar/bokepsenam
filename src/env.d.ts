/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SITE: string; // Tambahkan ini
  // Anda bisa menambahkan variabel lingkungan lainnya di sini
  // readonly PUBLIC_ANOTHER_VARIABLE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}