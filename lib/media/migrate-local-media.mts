import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  ensureMediaBucket,
  uploadMediaObject,
} from "./supabase-storage";

const storageRoot = join(process.cwd(), "storage");
const mediaDirectories = [
  { name: "originals", prefix: "originals" },
  { name: "previews", prefix: "previews" },
  { name: "avatars", prefix: "avatars" },
] as const;

function contentType(filename: string, directory: string): string {
  if (directory === "previews" || directory === "avatars") {
    return "image/webp";
  }

  switch (filename.split(".").pop()?.toLowerCase()) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

async function main(): Promise<void> {
  await ensureMediaBucket();

  let total = 0;
  for (const directory of mediaDirectories) {
    let files;
    try {
      files = await readdir(join(storageRoot, directory.name), {
        withFileTypes: true,
      });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        continue;
      }
      throw error;
    }

    let migrated = 0;
    for (const file of files) {
      if (!file.isFile()) continue;

      const buffer = await readFile(join(storageRoot, directory.name, file.name));
      await uploadMediaObject(
        `${directory.prefix}/${file.name}`,
        buffer,
        contentType(file.name, directory.name),
      );
      migrated += 1;
    }

    total += migrated;
    console.log(`Uploaded ${migrated} file(s) from ${directory.name}`);
  }

  if (total === 0) {
    throw new Error("No local media files were found under storage/");
  }

  console.log(`Uploaded ${total} media file(s) to the private corsa-media bucket`);
}

main().catch((error: unknown) => {
  console.error("Local media migration failed", error);
  process.exitCode = 1;
});
