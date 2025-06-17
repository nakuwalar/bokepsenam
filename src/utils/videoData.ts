// src/utils/videoData.ts
import path from 'path';
import { createReadStream } from 'fs';
import { access } from 'fs/promises';
import csv from 'csv-parser';

export interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbAsli: string; // Menyimpan URL asli thumbnail jika diperlukan
  duration: string;
  videoUrl: string;
  category: string;
}

const PLACEHOLDER_THUMBNAIL = '/placeholder.webp'; // Pastikan file ini ada di /public

export async function getAllVideos(): Promise<VideoData[]> {
  const results: VideoData[] = [];
  const csvFilePath = path.resolve(process.cwd(), 'src/data/videos.csv');

  try {
    await access(csvFilePath);
  } catch (err) {
    console.error(`[ERROR] File CSV tidak ditemukan atau tidak dapat dibaca: ${csvFilePath}`, err);
    return [];
  }

  return new Promise((resolve, reject) => {
    createReadStream(csvFilePath)
      .pipe(csv({ separator: ';' })) // Pastikan ini cocok dengan pemisah di CSV Anda
      .on('data', (data: any) => {
        const video: VideoData = {
          id: data.id || '',
          title: data.title || 'Judul Tidak Diketahui',
          description: data.description || 'Deskripsi tidak tersedia.',
          thumbnail: data.thumbnail || PLACEHOLDER_THUMBNAIL,
          thumbAsli: data.thumbnail || PLACEHOLDER_THUMBNAIL,
          duration: data.duration || '00:00',
          videoUrl: data.videoUrl || '',
          category: data.category ? data.category.trim() : 'Umum', // Trim kategori
        };
        results.push(video);
      })
      .on('end', () => {
        if (results.length === 0) {
          console.warn("[WARN] Tidak ada data video yang diurai dari file CSV. Periksa konten dan format CSV Anda.");
        }
        resolve(results);
      })
      .on('error', (error) => {
        console.error("[ERROR] Gagal membaca atau memproses stream CSV:", error);
        reject(error);
      });
  });
}

export async function getVideoById(id: string): Promise<VideoData | undefined> {
  const allVideos = await getAllVideos();
  return allVideos.find(video => video.id === id);
}

export async function getUniqueCategories(): Promise<string[]> {
  const allVideos = await getAllVideos();
  const categories = allVideos.map(video => video.category.trim());
  return [...new Set(categories)].sort(); // Mengembalikan kategori unik yang diurutkan
}