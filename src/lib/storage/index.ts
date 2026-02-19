import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service role key for server-side storage operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const STORAGE_BUCKET = "cascade-images";

/**
 * Upload a buffer to Supabase Storage.
 * Returns the public URL of the uploaded file.
 */
export async function uploadImage(
  derivativeId: string,
  filename: string,
  buffer: Buffer,
  contentType = "image/png"
): Promise<string> {
  const path = `${derivativeId}/${filename}`;

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload image ${path}: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

/**
 * Get the public URL for an existing image.
 */
export function getImageUrl(derivativeId: string, filename: string): string {
  const path = `${derivativeId}/${filename}`;
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Ensure the storage bucket exists (call once during setup).
 */
export async function ensureBucket() {
  const { error } = await supabase.storage.createBucket(STORAGE_BUCKET, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ["image/png", "image/jpeg"],
  });

  // Ignore "already exists" error
  if (error && !error.message.includes("already exists")) {
    console.warn(`[storage] Bucket creation warning: ${error.message}`);
  }
}
