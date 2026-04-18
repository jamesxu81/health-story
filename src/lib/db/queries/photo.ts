/**
 * Photo / attachment records linked to an illness
 */

import { queryOne, query } from '@/lib/db';
import { PhotoRow } from '@/types/photo';
import { deleteStoredBlob } from '@/lib/blob/upload';

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

export async function getPhotoIfOwnedByUser(
  photoId: string,
  userId: string
): Promise<{
  blob_url: string;
  mime_type: string;
  filename: string;
} | null> {
  return queryOne<{
    blob_url: string;
    mime_type: string;
    filename: string;
  }>(
    `
    SELECT p.blob_url, p.mime_type, p.filename
    FROM photos p
    INNER JOIN illnesses i ON i.id = p.illness_id
    WHERE p.id = $1 AND i.user_id = $2
    `,
    [photoId, userId]
  );
}

/**
 * Delete an attachment if it belongs to the user's illness. Removes blob/local file then DB row.
 */
export async function deletePhotoIfOwnedByUser(
  photoId: string,
  userId: string
): Promise<boolean> {
  const row = await getPhotoIfOwnedByUser(photoId, userId);
  if (!row) return false;

  await deleteStoredBlob(row.blob_url);

  const result = await query(
    `
    DELETE FROM photos p
    USING illnesses i
    WHERE p.id = $1 AND p.illness_id = i.id AND i.user_id = $2
    `,
    [photoId, userId]
  );

  return (result.rowCount ?? 0) > 0;
}
