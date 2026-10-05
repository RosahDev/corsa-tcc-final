const BUCKET = "corsa-media";

type StorageConfig = {
  baseUrl: string;
  serviceKey: string;
};

export class MediaObjectNotFoundError extends Error {
  constructor() {
    super("Media object was not found");
    this.name = "MediaObjectNotFoundError";
  }
}

export function isMediaNotFound(error: unknown): boolean {
  return (
    error instanceof MediaObjectNotFoundError ||
    (typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ENOENT")
  );
}

export function isSupabaseStorageEnabled(): boolean {
  const hasUrl = Boolean(process.env.SUPABASE_URL);
  const hasKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (hasUrl !== hasKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be configured",
    );
  }

  if (!hasUrl && process.env.NODE_ENV === "production") {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production",
    );
  }

  return hasUrl;
}

function getConfig(): StorageConfig {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase Storage credentials are not configured");
  }

  const parsedUrl = new URL(supabaseUrl);
  if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
    throw new Error("SUPABASE_URL must use HTTPS");
  }

  return {
    baseUrl: parsedUrl.origin,
    serviceKey,
  };
}

function headers(config: StorageConfig): HeadersInit {
  return {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
  };
}

function encodeObjectPath(key: string): string {
  if (
    !key ||
    key.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new Error("Invalid media object key");
  }
  return key.split("/").map(encodeURIComponent).join("/");
}

function objectUrl(config: StorageConfig, key: string): string {
  return `${config.baseUrl}/storage/v1/object/${BUCKET}/${encodeObjectPath(key)}`;
}

let bucketReady: Promise<void> | undefined;

export async function ensureMediaBucket(): Promise<void> {
  const config = getConfig();
  if (!bucketReady) {
    bucketReady = (async () => {
      const response = await fetch(
        `${config.baseUrl}/storage/v1/bucket`,
        {
          method: "POST",
          headers: {
            ...headers(config),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: BUCKET,
            name: BUCKET,
            public: false,
          }),
        },
      );

      if (response.status === 409) {
        const existingBucket = await fetch(
          `${config.baseUrl}/storage/v1/bucket/${BUCKET}`,
          { headers: headers(config) },
        );
        if (!existingBucket.ok) {
          throw new Error(
            `Could not verify Supabase Storage bucket (HTTP ${existingBucket.status})`,
          );
        }
        const details: { public?: boolean } = await existingBucket.json();
        if (details.public) {
          throw new Error("The corsa-media bucket must be private");
        }
      } else if (!response.ok) {
        throw new Error(
          `Could not create Supabase Storage bucket (HTTP ${response.status})`,
        );
      }
    })().catch((error: unknown) => {
      bucketReady = undefined;
      throw error;
    });
  }
  await bucketReady;
}

export async function uploadMediaObject(
  key: string,
  buffer: Buffer,
  contentType: string,
): Promise<void> {
  const config = getConfig();
  await ensureMediaBucket();

  const response = await fetch(objectUrl(config, key), {
    method: "POST",
    headers: {
      ...headers(config),
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: new Uint8Array(buffer),
  });

  if (!response.ok) {
    throw new Error(
      `Could not upload media to Supabase Storage (HTTP ${response.status})`,
    );
  }
}

export async function downloadMediaObject(key: string): Promise<Buffer> {
  const config = getConfig();
  const response = await fetch(
    `${config.baseUrl}/storage/v1/object/authenticated/${BUCKET}/${encodeObjectPath(key)}`,
    { headers: headers(config) },
  );

  if (response.status === 404) {
    throw new MediaObjectNotFoundError();
  }
  if (!response.ok) {
    throw new Error(
      `Could not read media from Supabase Storage (HTTP ${response.status})`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function deleteMediaObjects(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  const config = getConfig();
  const response = await fetch(
    `${config.baseUrl}/storage/v1/object/${BUCKET}`,
    {
      method: "DELETE",
      headers: {
        ...headers(config),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: keys.map(encodeObjectPath) }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Could not delete media from Supabase Storage (HTTP ${response.status})`,
    );
  }
}
