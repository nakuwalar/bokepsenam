// src/utils/relatedVideos.ts
import { slugify } from './slugify'; // Asumsikan slugify ada di folder utils yang sama

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  videoUrl: string;
  category: string;
}

/**
 * Mencari video terkait berdasarkan kesamaan kata kunci di judul dan kategori.
 * @param {VideoData} currentVideo - Video yang sedang dilihat.
 * @param {VideoData[]} allVideos - Semua video yang tersedia.
 * @param {number} limit - Jumlah maksimum video terkait yang akan dikembalikan.
 * @returns {VideoData[]} - Array video terkait yang sudah diurutkan berdasarkan relevansi.
 */
export function findRelatedVideos(currentVideo: VideoData, allVideos: VideoData[], limit: number = 20): VideoData[] {
  if (!currentVideo || !allVideos || allVideos.length <= 1) {
    return []; // Tidak ada video terkait jika hanya ada satu atau tidak ada video lain
  }

  // 1. Ekstrak kata kunci dari video saat ini
  const currentVideoTitleKeywords = new Set(
    slugify(currentVideo.title).split('-').filter(Boolean)
  );
  const currentVideoCategoryKeyword = slugify(currentVideo.category);

  const scoredVideos = allVideos
    .filter(video => video.id !== currentVideo.id) // Kecualikan video yang sedang dilihat
    .map(video => {
      let score = 0;

      // 2. Evaluasi kesamaan Judul
      const otherVideoTitleKeywords = slugify(video.title).split('-').filter(Boolean);
      otherVideoTitleKeywords.forEach(keyword => {
        if (currentVideoTitleKeywords.has(keyword)) {
          score += 2; // Tambah skor untuk setiap kata kunci judul yang cocok
        }
      });

      // 3. Evaluasi kesamaan Kategori (dengan bobot lebih tinggi)
      const otherVideoCategoryKeyword = slugify(video.category);
      if (currentVideoCategoryKeyword && currentVideoCategoryKeyword === otherVideoCategoryKeyword) {
        score += 5; // Bobot lebih tinggi untuk kategori yang sama persis
      }

      return { video, score };
    })
    .filter(item => item.score > 0) // Hanya sertakan video yang memiliki skor relevansi positif
    .sort((a, b) => b.score - a.score); // Urutkan berdasarkan skor (tertinggi di depan)

  return scoredVideos.slice(0, limit).map(item => item.video); // Ambil sejumlah video sesuai limit
}