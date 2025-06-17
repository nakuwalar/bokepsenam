// src/utils/videoData.ts
import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { Buffer } from 'buffer'; // Penting: Tambahkan ini untuk tipe Buffer

interface VideoData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  thumbAsli: string;
  duration: string;
  videoUrl: string;
  category: string;
}

const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'thumbnails');
const THUMBNAIL_BASE_URL = '/thumbnails/';

async function ensureDirExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(dirPath, { recursive: true });
      console.log(`[INFO] Direktori '${dirPath}' dibuat.`);
    } else {
      throw error;
    }
  }
}

async function processThumbnail(videoId: string, thumbnailUrl: string): Promise<string | null> {
  const outputFileName = `${videoId}.webp`;
  const outputPath = path.join(THUMBNAIL_DIR, outputFileName);
  const publicPath = THUMBNAIL_BASE_URL + outputFileName;

  try {
    await fs.access(outputPath);
    return publicPath;
  } catch {
    // Lanjutkan jika file tidak ditemukan
  }

  try {
    console.log(`[INFO] Mengunduh & mengkonversi thumbnail untuk ID ${videoId} dari: ${thumbnailUrl}`);
    const response = await fetch(thumbnailUrl);

    if (!response.ok) {
      console.error(`[ERROR] Gagal mengunduh thumbnail ${thumbnailUrl}: Status ${response.status}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await sharp(buffer)
      .resize(320)
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log(`[INFO] Thumbnail untuk ID ${videoId} berhasil disimpan di: ${outputPath}`);
    return publicPath;
  } catch (error) {
    console.error(`[ERROR] Gagal memproses thumbnail untuk ID ${videoId} dari ${thumbnailUrl}:`, error);
    return null;
  }
}

export async function getAllVideos(): Promise<VideoData[]> {
  const results: VideoData[] = [];
  const csvFilePath = path.resolve(process.cwd(), 'src/data/videos.csv');

  await ensureDirExists(THUMBNAIL_DIR);

  return new Promise((resolve, reject) => {
    createReadStream(csvFilePath)
      .pipe(csv({ separator: ';' }))
      .on('data', async (data: any) => {
        const thumbAsliUrl = data.thumbnail;
        let localThumbnailPath: string | null = null;

        if (thumbAsliUrl) {
          localThumbnailPath = await processThumbnail(data.id, thumbAsliUrl);
        }

        results.push({
          id: data.id,
          title: data.title,
          description: data.description,
          thumbnail: localThumbnailPath || thumbAsliUrl || '/placeholder.webp',
          thumbAsli: thumbAsliUrl || '',
          duration: data.duration,
          videoUrl: data.videoUrl,
          category: data.category,
        });
      })
      .on('end', () => {
        console.log(`[INFO] Selesai membaca CSV & memproses thumbnail. Total video: ${results.length}`);
        resolve(results);
      })
      .on('error', (error) => {
        console.error("[ERROR] Gagal membaca file CSV:", error);
        reject(error);
      });
  });
}