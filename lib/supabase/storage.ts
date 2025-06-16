import { createClient } from '@/lib/supabase/client';
import { logger } from '@/lib/utils/logger';

/**
 * Supabase Storage configuration and utilities
 */

export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  PROJECTS: 'project-images',
  CERTIFICATES: 'certificates',
  COMPANIES: 'company-logos',
} as const;

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface UploadOptions {
  bucket: keyof typeof STORAGE_BUCKETS;
  path: string;
  file: File;
  upsert?: boolean;
}

export interface UploadResult {
  success: boolean;
  publicUrl?: string;
  error?: string;
}

/**
 * Validates file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Generates a unique file path with timestamp
 */
export function generateFilePath(
  userId: string,
  filename: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const parts = [userId];

  if (prefix) {
    parts.push(prefix);
  }

  parts.push(`${timestamp}_${sanitizedFilename}`);

  return parts.join('/');
}

/**
 * Uploads a file to Supabase Storage
 */
export async function uploadFile({
  bucket,
  path,
  file,
  upsert = true,
}: UploadOptions): Promise<UploadResult> {
  try {
    const supabase = createClient();

    if (!supabase) {
      return {
        success: false,
        error: 'Storage service not available',
      };
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error,
      };
    }

    // Upload file
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .upload(path, file, {
        upsert,
        cacheControl: '3600',
      });

    if (error) {
      logger.error('Storage upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(path);

    return {
      success: true,
      publicUrl,
    };
  } catch (error) {
    logger.error('Unexpected storage upload error:', error as Error);
    return {
      success: false,
      error: 'Failed to upload file',
    };
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFile(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    if (!supabase) {
      logger.warn('Storage service not available');
      return false;
    }

    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucket])
      .remove([path]);

    if (error) {
      logger.error('Storage delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    logger.error('Unexpected storage delete error:', error as Error);
    return false;
  }
}

/**
 * Gets the public URL for a file
 */
export function getPublicUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string
): string | null {
  const supabase = createClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(path);

  return publicUrl;
}
