import path from 'path';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import csv from 'csv-parser';
import sharp from 'sharp';
import fetch from 'node-fetch';
import { Buffer } from 'buffer';

export interface VideoData {
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
const PLACEHOLDER_THUMBNAIL = '/placeholder.webp';

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

  console.log(`[DEBUG_VIDEO_DATA] Trying to read CSV from: ${csvFilePath}`);

  try {
    await fs.access(csvFilePath);
    console.log(`[DEBUG_VIDEO_DATA] CSV file exists: ${csvFilePath}`);
  } catch (err) {
    console.error(`[ERROR_VIDEO_DATA] CSV file does not exist or is unreadable: ${csvFilePath}`, err);
    return [];
  }

  await ensureDirExists(THUMBNAIL_DIR);

  return new Promise((resolve, reject) => {
    createReadStream(csvFilePath)
      .pipe(csv({ separator: ';' }))
      .on('data', async (data: any) => {
        const videoData: VideoData = {
          id: data.id || '',
          title: data.title || 'Judul Tidak Diketahui',
          description: data.description || 'Deskripsi tidak tersedia.',
          thumbnail: data.thumbnail || '',
          thumbAsli: data.thumbnail || '',
          duration: data.duration || '10',
          videoUrl: data.videoUrl || '',
          category: data.category || 'Umum',
        };

        let localThumbnailPath: string | null = null;
        if (videoData.thumbnail) {
          localThumbnailPath = await processThumbnail(videoData.id, videoData.thumbnail);
        }

        videoData.thumbnail = localThumbnailPath || videoData.thumbAsli || PLACEHOLDER_THUMBNAIL;
        results.push(videoData);
      })
      .on('end', () => {
        console.log(`[INFO_VIDEO_DATA] Selesai membaca CSV & memproses thumbnail. Total video: ${results.length}`);
        if (results.length === 0) {
            console.warn("[WARN_VIDEO_DATA] No video data was parsed from the CSV file. Check CSV content and format.");
        }
        resolve(results);
      })
      .on('error', (error) => {
        console.error("[ERROR_VIDEO_DATA] Gagal membaca atau memproses stream CSV:", error);
        reject(error);
      });
  });
}

export async function getVideoById(id: string): Promise<VideoData | undefined> {
  const allVideos = await getAllVideos();
  return allVideos.find(video => video.id === id);
}