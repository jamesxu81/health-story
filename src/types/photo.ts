/**
 * Photo type definitions
 * Photo metadata for illness records
 */

export interface Photo {
  id: string; // UUID
  illness_id: string; // Foreign key to illness
  blob_url: string; // URL from Vercel Blob
  filename: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Database row type (matches SQL schema)
 */
export interface PhotoRow {
  id: string;
  illness_id: string;
  blob_url: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
  uploaded_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Photo upload request metadata
 */
export interface PhotoUploadRequest {
  file: File;
  illness_id: string;
}

/**
 * Photo upload response
 */
export interface PhotoUploadResponse {
  id: string;
  blob_url: string;
  filename: string;
  size_bytes: number;
}

/**
 * Photo validation constraints
 */
export const PHOTO_CONSTRAINTS = {
  MAX_SIZE_BYTES: 25 * 1024 * 1024, // 25MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
} as const;
