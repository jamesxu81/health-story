/**
 * Vercel Blob Storage Client
 * Handles file uploads to Vercel Blob storage
 */

import { put, del } from '@vercel/blob';
import { PHOTO_CONSTRAINTS } from '@/types/photo';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Upload a file to Vercel Blob
 */
export async function uploadBlob(
  file: File,
  pathname: string
): Promise<{
  url: string;
  pathname: string;
}> {
  // Validate file size
  if (file.size > PHOTO_CONSTRAINTS.MAX_SIZE_BYTES) {
    throw new Error(
      `File size exceeds maximum allowed size of ${PHOTO_CONSTRAINTS.MAX_SIZE_BYTES / 1024 / 1024}MB`
    );
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(
      `File type not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`
    );
  }

  try {
    const blob = await put(pathname, file, {
      access: 'public',
    });

    return {
      url: blob.url,
      pathname: blob.pathname,
    };
  } catch (error) {
    console.error('Blob upload error:', error);
    throw new Error('Failed to upload file to blob storage');
  }
}

/**
 * Delete a file from Vercel Blob
 */
export async function deleteBlob(pathname: string): Promise<void> {
  try {
    await del(pathname);
  } catch (error) {
    console.error('Blob delete error:', error);
    throw new Error('Failed to delete file from blob storage');
  }
}

/**
 * Generate a unique pathname for blob storage
 */
export function generateBlobPathname(
  illness_id: string,
  filename: string
): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `photos/${illness_id}/${timestamp}-${sanitized}`;
}
