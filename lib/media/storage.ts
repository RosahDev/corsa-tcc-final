import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { buildTiledWatermarkSvg } from "../brand/logo";
import {
  deleteMediaObjects,
  downloadMediaObject,
  isMediaNotFound,
  isSupabaseStorageEnabled,
  uploadMediaObject,
} from "./supabase-storage";

const STORAGE_ROOT = join(process.cwd(), "storage");
const ORIGINALS_DIR = join(STORAGE_ROOT, "originals");
const PREVIEWS_DIR = join(STORAGE_ROOT, "previews");

export async function ensureStorageDirs(): Promise<void> {
  await mkdir(ORIGINALS_DIR, { recursive: true });
  await mkdir(PREVIEWS_DIR, { recursive: true });
}

export function getOriginalPath(key: string): string {
  return join(ORIGINALS_DIR, key);
}

export function getPreviewPath(key: string): string {
  return join(PREVIEWS_DIR, key);
}

export async function savePhotoFromBuffer(
  buffer: Buffer,
): Promise<{
  originalKey: string;
  previewKey: string;
  width: number;
  height: number;
}> {
  const image = sharp(buffer).rotate().pipelineColourspace("srgb");
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height || !metadata.format) {
    throw new Error("Arquivo inválido: selecione uma imagem JPG, PNG ou WEBP válida.");
  }

  const width = metadata.width;
  const height = metadata.height;
  const ext = metadata.format === "jpeg" ? "jpg" : metadata.format;
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const originalKey = `${id}.${ext}`;
  const previewKey = `${id}-preview.webp`;

  const previewWidth = Math.min(width, 1200);
  const resized = await image
    .clone()
    .resize({ width: previewWidth, withoutEnlargement: true })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .toFormat("webp", { quality: 75 })
    .toBuffer();

  const resizedMeta = await sharp(resized).metadata();
  const previewHeight = resizedMeta.height ?? Math.round((height * previewWidth) / width);
  const watermarkSvg = buildTiledWatermarkSvg(previewWidth, previewHeight);

  const previewBuffer = await sharp(resized)
    .pipelineColourspace("srgb")
    .composite([{ input: watermarkSvg, blend: "over" }])
    .toColourspace("srgb")
    .webp({ quality: 75 })
    .toBuffer();

  if (isSupabaseStorageEnabled()) {
    const originalUploadedKey = `originals/${originalKey}`;
    try {
      await uploadMediaObject(
        originalUploadedKey,
        buffer,
        `image/${ext === "jpg" ? "jpeg" : ext}`,
      );
      await uploadMediaObject(`previews/${previewKey}`, previewBuffer, "image/webp");
    } catch (error) {
      try {
        await deleteMediaObjects([originalUploadedKey]);
      } catch (cleanupError) {
        console.error("Could not clean up a partial media upload", cleanupError);
      }
      throw error;
    }
  } else {
    await ensureStorageDirs();
    await writeFile(getOriginalPath(originalKey), buffer);
    await writeFile(getPreviewPath(previewKey), previewBuffer);
  }

  return { originalKey, previewKey, width, height };
}

export async function readPreview(key: string): Promise<Buffer> {
  if (isSupabaseStorageEnabled()) {
    return downloadMediaObject(`previews/${key}`);
  }
  return readFile(getPreviewPath(key));
}

export async function readOriginal(key: string): Promise<Buffer> {
  if (isSupabaseStorageEnabled()) {
    return downloadMediaObject(`originals/${key}`);
  }
  return readFile(getOriginalPath(key));
}

export async function deletePhotoFiles(
  originalKey: string,
  previewKey: string,
): Promise<void> {
  if (isSupabaseStorageEnabled()) {
    await deleteMediaObjects([
      `originals/${originalKey}`,
      `previews/${previewKey}`,
    ]);
    return;
  }

  await Promise.all([
    unlink(getOriginalPath(originalKey)).catch((error: unknown) => {
      if (!isMediaNotFound(error)) throw error;
    }),
    unlink(getPreviewPath(previewKey)).catch((error: unknown) => {
      if (!isMediaNotFound(error)) throw error;
    }),
  ]);
}

export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
