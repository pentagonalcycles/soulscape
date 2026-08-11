import { supabase } from "@/lib/supabase";

const PHOTOS_BUCKET = "unseen-photos";

export async function uploadPhoto(userId: string, file: File): Promise<string | null> {
  const client = supabase();
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { error } = await client.storage
    .from(PHOTOS_BUCKET)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Photo upload error:", error);
    return null;
  }

  return fileName;
}

export async function getSignedUrl(storagePath: string): Promise<string | null> {
  const client = supabase();

  const { data, error } = await client.storage
    .from(PHOTOS_BUCKET)
    .createSignedUrl(storagePath, 3600); // 1 hour expiry

  if (error) {
    console.error("Signed URL error:", error);
    return null;
  }

  return data.signedUrl;
}

export async function deletePhoto(storagePath: string): Promise<boolean> {
  const client = supabase();

  const { error } = await client.storage
    .from(PHOTOS_BUCKET)
    .remove([storagePath]);

  return !error;
}

export async function getBlurredPhotoUrl(storagePath: string): Promise<string | null> {
  // For discovery, we use a tiny resized version + CSS blur
  // The actual photo is only accessible via signed URL during reveal
  const client = supabase();

  const { data } = client.storage
    .from(PHOTOS_BUCKET)
    .getPublicUrl(storagePath, {
      transform: {
        width: 20,
        height: 20,
        resize: "cover",
      },
    });

  // Note: This requires the bucket to allow public access to transformed images
  // Or we use signed URLs with transform
  return data?.publicUrl || null;
}
