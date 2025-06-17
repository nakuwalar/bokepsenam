// src/utils/slugify.ts

/**
 * Mengubah string menjadi slug yang SEO-friendly.
 * - Mengubah semua menjadi huruf kecil.
 * - Mengganti karakter non-alfanumerik dengan hiphen.
 * - Menghilangkan spasi/hiphen berlebihan.
 * @param {string} text - Teks yang akan di-slug.
 * @returns {string} - Slug yang dihasilkan.
 */
export function slugify(text: string): string {
  return text
    .toString()                     // Ubah menjadi string
    .normalize('NFD')               // Normalisasi Unicode (misal: "é" -> "e")
    .replace(/[\u0300-\u036f]/g, '') // Hapus diakritik
    .toLowerCase()                  // Ubah semua menjadi huruf kecil
    .trim()                         // Hapus spasi di awal/akhir
    .replace(/\s+/g, '-')           // Ganti spasi dengan hiphen
    .replace(/[^\w-]+/g, '')       // Hapus semua karakter non-kata kecuali hiphen
    .replace(/--+/g, '-');          // Ganti hiphen berulang dengan satu hiphen
}