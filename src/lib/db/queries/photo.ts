/**
 * Photo / attachment records linked to an illness
 */

import { queryOne } from '@/lib/db';
import { PhotoRow } from '@/types/photo';

export async function insertPhoto(params: {
  illness_id: string;
  blob_url: string;
  filename: string;
  size_bytes: number;
  mime_type: string;
}): Promise<PhotoRow> {
  const row = await queryOne<PhotoRow>(
    `
    INSERT INTO photos (illness_id, blob_url, filename, size_bytes, mime_type)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, illness_id, blob_url, filename, size_bytes, mime_type,
      uploaded_at, created_at, updated_at
    `,
    [
      params.illness_id,
      params.blob_url,
      params.filename,
      params.size_bytes,
      params.mime_type,
    ]
  );

  if (!row) throw new Error('Failed to save attachment');
  return row;
}
