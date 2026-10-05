import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import {
  deleteMediaObjects,
  downloadMediaObject,
  isMediaNotFound,
  isSupabaseStorageEnabled,
  uploadMediaObject,
} from "./supabase-storage";

const AVATARS_DIR = join(process.cwd(), "storage", "avatars");
const AVATAR_SIZE = 400;

export function getAvatarPath(key: string): string {
  return join(AVATARS_DIR, key);
}

async function ensureAvatarsDir(): Promise<void> {
  await mkdir(AVATARS_DIR, { recursive: true });
}

export async function saveAvatarFromBuffer(buffer: Buffer): Promise<string> {
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const image = await sharp(buffer)
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "centre" })
    .webp({ quality: 85 })
    .toBuffer();

  if (isSupabaseStorageEnabled()) {
    await uploadMediaObject(`avatars/${key}`, image, "image/webp");
  } else {
    await ensureAvatarsDir();
    await writeFile(getAvatarPath(key), image);
  }

  return key;
}

export async function readAvatar(key: string): Promise<Buffer> {
  if (isSupabaseStorageEnabled()) {
    return downloadMediaObject(`avatars/${key}`);
  }
  return readFile(getAvatarPath(key));
}

export async function deleteAvatarFile(key: string): Promise<void> {
  if (isSupabaseStorageEnabled()) {
    await deleteMediaObjects([`avatars/${key}`]);
    return;
  }
  await unlink(getAvatarPath(key)).catch((error: unknown) => {
    if (!isMediaNotFound(error)) throw error;
  });
}
