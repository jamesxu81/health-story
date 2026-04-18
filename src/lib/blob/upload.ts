/**
 * Vercel Blob Storage Client
 * Handles file uploads to Vercel Blob storage (or local public/ in development when no token).
 */

import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import { put, del } from '@vercel/blob';
import { PHOTO_CONSTRAINTS } from '@/types/photo';

const ALLOWED_TYPES: readonly string[] = PHOTO_CONSTRAINTS.ALLOWED_TYPES;

export function resolveMimeType(file: File): string {
  if (file.type && ALLOWED_TYPES.includes(file.type)) {
    return file.type;
  }
  const lower = file.name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return file.type || '';
}

function getBlobReadWriteToken(): string | null {
  const raw = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!raw || raw === 'your_token_here') {
    return null;
  }
  return raw;
}

async function uploadToLocalPublic(
  pathname: string,
  file: File
): Promise<{ url: string; pathname: string }> {
  const root = process.cwd();
  const fullPath = path.join(root, 'public', pathname);
  await mkdir(path.dirname(fullPath), { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buf);
  const url = '/' + pathname.replace(/\\/g, '/');
  return { url, pathname };
}

/**
 * Upload a file to Vercel Blob, or under public/ when developing without a token.
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

  const mime = resolveMimeType(file);
  if (!mime || !ALLOWED_TYPES.includes(mime)) {
    throw new Error(
      `File type not allowed. Allowed types: images (JPEG, PNG, WebP, GIF) or PDF`
    );
  }

  const token = getBlobReadWriteToken();

  if (token) {
    try {
      const blob = await put(pathname, file, {
        access: 'private',
        token,
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
      };
    } catch (error) {
      console.error('Blob upload error:', error);
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Blob upload failed: ${detail}. Check BLOB_READ_WRITE_TOKEN and that Vercel Blob is enabled for this project.`
      );
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.warn(
      '[blob] BLOB_READ_WRITE_TOKEN not set — saving upload under public/ (dev only).'
    );
    return uploadToLocalPublic(pathname, file);
  }

  throw new Error(
    'Blob storage is not configured. Add BLOB_READ_WRITE_TOKEN to your environment (Vercel: Storage → Blob → connect store, then set the read-write token).'
  );
}

/**
 * Remove a stored attachment: local file (`/photos/...`) or Vercel Blob (`https://...`).
 */
export async function deleteStoredBlob(blobUrl: string): Promise<void> {
  if (blobUrl.startsWith('/')) {
    const relative = blobUrl.replace(/^\//, '');
    if (relative.includes('..')) {
      throw new Error('Invalid storage path');
    }
    const base = path.resolve(process.cwd(), 'public');
    const fullPath = path.resolve(path.join(process.cwd(), 'public', relative));
    if (!fullPath.startsWith(base)) {
      throw new Error('Invalid storage path');
    }
    try {
      await unlink(fullPath);
    } catch {
      /* file may already be gone */
    }
    return;
  }

  const token = getBlobReadWriteToken();
  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[blob] BLOB_READ_WRITE_TOKEN not set; skipping remote blob delete');
      return;
    }
    throw new Error('Blob storage is not configured (BLOB_READ_WRITE_TOKEN).');
  }

  try {
    await del(blobUrl, { token });
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
