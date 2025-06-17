// src/utils/slugify.ts
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Normalisasi karakter Unicode (misalnya é -> e)
    .replace(/[\u0300-\u036f]/g, '') // Hapus diakritik
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Ganti spasi dengan tanda hubung
    .replace(/[^\w-]+/g, '') // Hapus semua non-word chars
    .replace(/--+/g, '-'); // Ganti multiple dashes dengan single dash
}