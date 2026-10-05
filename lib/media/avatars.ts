import { mkdir, readFile, writeFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const AVATARS_DIR = join(process.cwd(), "storage", "avatars");
const AVATAR_SIZE = 400;

export function getAvatarPath(key: string): string {
  return join(AVATARS_DIR, key);
}

async function ensureAvatarsDir(): Promise<void> {
  await mkdir(AVATARS_DIR, { recursive: true });
}

export async function saveAvatarFromBuffer(buffer: Buffer): Promise<string> {
  await ensureAvatarsDir();
  const key = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

  await sharp(buffer)
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, { fit: "cover", position: "centre" })
    .webp({ quality: 85 })
    .toFile(getAvatarPath(key));

  return key;
}

export async function readAvatar(key: string): Promise<Buffer> {
  return readFile(getAvatarPath(key));
}

export async function deleteAvatarFile(key: string): Promise<void> {
  await unlink(getAvatarPath(key)).catch(() => undefined);
}
