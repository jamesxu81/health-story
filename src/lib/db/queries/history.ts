/**
 * Database queries for illness history/list views
 * Used by US3: View Illness History
 */

import {
  query,
  queryOne,
  queryAll,
} from '@/lib/db';
import { Illness, IllnessWithCounts } from '@/types/illness';

/**
 * Get paginated list of illnesses for a user (T032)
 * Sorted by date_started DESC (most recent first)
 */
export async function getIllnessesForHistory(
  userId: string,
  limit: number = 20,
  offset: number = 0,
  status?: 'active' | 'resolved'
): Promise<{ data: IllnessWithCounts[]; total: number }> {
  let sql = `
    SELECT 
      i.id,
      i.name,
      i.date_started,
      i.date_ended,
      i.status,
      i.symptoms,
      i.cause,
      i.treat,
      i.notes,
      COALESCE(COUNT(DISTINCT t.id), 0)::int as treatment_count,
      COALESCE(COUNT(DISTINCT p.id), 0)::int as photo_count
    FROM illnesses i
    LEFT JOIN treatments t ON t.illness_id = i.id
    LEFT JOIN photos p ON p.illness_id = i.id
    WHERE i.user_id = $1
  `;

  const params: any[] = [userId];
  let paramIndex = 2;

  if (status) {
    sql += ` AND i.status = $${paramIndex}`;
    params.push(status);
    paramIndex++;
  }

  // Count total before pagination
  const countQuery = sql.replace(
    /SELECT[\s\S]*?FROM/,
    'SELECT COUNT(DISTINCT i.id) as total FROM'
  );
  const countResult = await queryOne(countQuery, params);
  const total = countResult?.total || 0;

  // Add group by and ordering
  sql += `
    GROUP BY i.id
    ORDER BY i.date_started DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;

  params.push(limit, offset);

  const rows = await queryAll<IllnessWithCounts>(sql, params);

  return { data: rows, total };
}

/**
 * Get single illness with all related data (T033)
 * Includes treatments and photos for detail view
 */
export async function getIllnessDetailForView(
  illnessId: string,
  userId?: string
): Promise<(Illness & {
  treatments: any[];
  photos: any[];
})> {
  let sql = `
    SELECT 
      i.id,
      i.name,
      i.date_started,
      i.date_ended,
      i.status,
      i.symptoms,
      i.cause,
      i.treat,
      i.notes,
      i.created_at,
      i.updated_at
    FROM illnesses i
    WHERE i.id = $1
  `;

  const params: any[] = [illnessId];

  if (userId) {
    sql += ` AND i.user_id = $2`;
    params.push(userId);
  }

  const illness = await queryOne<Illness>(sql, params);

  if (!illness) {
    throw new Error('Illness not found');
  }

  // Fetch treatments
  const treatmentsQuery = `
    SELECT id, type, effectiveness, notes, created_at
    FROM treatments
    WHERE illness_id = $1
    ORDER BY created_at DESC
  `;
  const treatments = await queryAll(treatmentsQuery, [illnessId]);

  // Fetch photos
  const photosQuery = `
    SELECT id, blob_url AS url, blob_url AS thumbnail_url, mime_type, filename, size_bytes, created_at
    FROM photos
    WHERE illness_id = $1
    ORDER BY created_at DESC
  `;
  const photos = await queryAll(photosQuery, [illnessId]);

  return {
    ...illness,
    treatments,
    photos,
  };
}

/**
 * Get illness statistics for dashboard
 */
export async function getIllnessStats(userId: string) {
  const sql = `
    SELECT 
      COUNT(*) as total_illnesses,
      COUNT(CASE WHEN status = 'active' THEN 1 END) as active_illnesses,
      COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_illnesses,
      COALESCE(COUNT(DISTINCT t.id), 0)::int as total_treatments,
      COALESCE(COUNT(DISTINCT p.id), 0)::int as total_photos
    FROM illnesses i
    LEFT JOIN treatments t ON t.illness_id = i.id
    LEFT JOIN photos p ON p.illness_id = i.id
    WHERE i.user_id = $1
  `;

  return queryOne(sql, [userId]);
}
