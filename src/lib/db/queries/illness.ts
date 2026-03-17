/**
 * Database queries for Illness entity
 * Reusable query functions for CRUD operations
 */

import {
  query,
  queryOne,
  queryAll,
  transaction,
} from '@/lib/db';
import {
  Illness,
  IllnessRow,
  IllnessWithCounts,
  IllnessInput,
} from '@/types/illness';

// Converters from DB row to TypeScript type

function parseIllnessRow(row: IllnessRow): Illness {
  return {
    ...row,
    date_started: new Date(row.date_started),
    date_ended: row.date_ended ? new Date(row.date_ended) : null,
    symptoms: typeof row.symptoms === 'string' ? JSON.parse(row.symptoms) : row.symptoms,
    created_at: new Date(row.created_at),
    updated_at: new Date(row.updated_at),
  };
}

function formatDateForSQL(date: Date | string): string {
  if (typeof date === 'string') return date;
  return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

/**
 * Get all illnesses for a user with filters and pagination
 */
export async function getIllnessesByUser(params: {
  user_id: string;
  status?: 'active' | 'resolved';
  date_from?: string;
  date_to?: string;
  limit: number;
  offset: number;
}): Promise<{
  illnesses: IllnessWithCounts[];
  total: number;
}> {
  let whereClause = 'WHERE user_id = $1';
  const values: any[] = [params.user_id];
  let paramIndex = 2;

  if (params.status) {
    whereClause += ` AND status = $${paramIndex}`;
    values.push(params.status);
    paramIndex++;
  }

  if (params.date_from) {
    whereClause += ` AND date_started >= $${paramIndex}`;
    values.push(params.date_from);
    paramIndex++;
  }

  if (params.date_to) {
    whereClause += ` AND date_started <= $${paramIndex}`;
    values.push(params.date_to);
    paramIndex++;
  }

  // Get total count
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM illnesses ${whereClause}`,
    values
  );
  const total = parseInt(countResult?.count || '0', 10);

  // Get paginated results with counts
  const illnessRows = await queryAll<any>(
    `
    SELECT 
      i.id, i.user_id, i.name, i.date_started, i.date_ended, 
      i.status, i.symptoms, i.cause, i.notes,
      i.created_at, i.updated_at,
      COUNT(DISTINCT t.id) as treatment_count,
      COUNT(DISTINCT p.id) as photo_count
    FROM illnesses i
    LEFT JOIN treatments t ON i.id = t.illness_id
    LEFT JOIN photos p ON i.id = p.illness_id
    ${whereClause}
    GROUP BY i.id
    ORDER BY i.date_started DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `,
    [...values, params.limit, params.offset]
  );

  const illnesses = illnessRows.map((row) => {
    const illness = parseIllnessRow({
      ...row,
      symptoms: row.symptoms,
    } as IllnessRow);
    return {
      ...illness,
      treatment_count: parseInt(row.treatment_count || '0', 10),
      photo_count: parseInt(row.photo_count || '0', 10),
      recovery_days: row.date_ended
        ? Math.floor(
            (new Date(row.date_ended).getTime() -
              new Date(row.date_started).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null,
    };
  });

  return { illnesses, total };
}

/**
 * Get a single illness by ID
 */
export async function getIllnessById(illness_id: string): Promise<Illness | null> {
  const row = await queryOne<IllnessRow>(
    `
    SELECT id, user_id, name, date_started, date_ended, 
           status, symptoms, cause, notes, created_at, updated_at
    FROM illnesses
    WHERE id = $1
    `,
    [illness_id]
  );

  if (!row) return null;
  return parseIllnessRow(row);
}

/**
 * Create a new illness record
 */
export async function createIllness(
  user_id: string,
  input: IllnessInput
): Promise<Illness> {
  const symptomsJson = JSON.stringify(input.symptoms || []);

  const row = await queryOne<IllnessRow>(
    `
    INSERT INTO illnesses
    (user_id, name, date_started, date_ended, status, symptoms, cause, notes)
    VALUES ($1, $2, $3, $4::date, 
            CASE WHEN $4::date IS NOT NULL THEN 'resolved' ELSE 'active' END,
            $5::jsonb, $6, $7)
    RETURNING id, user_id, name, date_started, date_ended, 
              status, symptoms, cause, notes, created_at, updated_at
    `,
    [
      user_id,
      input.name,
      input.date_started,
      input.date_ended || null,
      symptomsJson,
      input.cause || null,
      input.notes || null,
    ]
  );

  if (!row) throw new Error('Failed to create illness');
  return parseIllnessRow(row);
}

/**
 * Update an illness record
 */
export async function updateIllness(
  illness_id: string,
  user_id: string,
  input: Partial<IllnessInput>
): Promise<Illness> {
  // Build dynamic update query
  const updates: string[] = [];
  const values: any[] = [illness_id, user_id];
  let paramIndex = 3;

  if (input.name) {
    updates.push(`name = $${paramIndex}`);
    values.push(input.name);
    paramIndex++;
  }

  if (input.date_started) {
    updates.push(`date_started = $${paramIndex}`);
    values.push(input.date_started);
    paramIndex++;
  }

  if (input.date_ended !== undefined) {
    updates.push(`date_ended = $${paramIndex}`);
    values.push(input.date_ended || null);
    paramIndex++;
  }

  if (input.symptoms) {
    updates.push(`symptoms = $${paramIndex}::jsonb`);
    values.push(JSON.stringify(input.symptoms));
    paramIndex++;
  }

  if (input.cause !== undefined) {
    updates.push(`cause = $${paramIndex}`);
    values.push(input.cause || null);
    paramIndex++;
  }

  if (input.notes !== undefined) {
    updates.push(`notes = $${paramIndex}`);
    values.push(input.notes || null);
    paramIndex++;
  }

  // Update status if date_ended changed
  if (input.date_ended !== undefined) {
    updates.push(`status = CASE WHEN date_ended IS NOT NULL THEN 'resolved' ELSE 'active' END`);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  if (updates.length === 1) {
    // No updates needed
    const existing = await getIllnessById(illness_id);
    if (!existing) throw new Error('Illness not found');
    return existing;
  }

  const row = await queryOne<IllnessRow>(
    `
    UPDATE illnesses
    SET ${updates.join(', ')}
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, name, date_started, date_ended, 
              status, symptoms, cause, notes, created_at, updated_at
    `,
    values
  );

  if (!row) throw new Error('Illness not found or not authorized');
  return parseIllnessRow(row);
}

/**
 * Delete an illness record (and cascade to treatments/photos)
 */
export async function deleteIllness(
  illness_id: string,
  user_id: string
): Promise<void> {
  const result = await query(
    `
    DELETE FROM illnesses
    WHERE id = $1 AND user_id = $2
    `,
    [illness_id, user_id]
  );

  if (result.rowCount === 0) {
    throw new Error('Illness not found or not authorized');
  }
}

/**
 * Get illness with treatments and photos
 */
export async function getIllnessDetail(illness_id: string): Promise<Illness | null> {
  const row = await queryOne<IllnessRow>(
    `
    SELECT id, user_id, name, date_started, date_ended, 
           status, symptoms, cause, notes, created_at, updated_at
    FROM illnesses
    WHERE id = $1
    `,
    [illness_id]
  );

  if (!row) return null;
  return parseIllnessRow(row);
}
