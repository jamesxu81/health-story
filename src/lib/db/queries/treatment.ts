/**
 * Treatment Database Queries
 * Handles all database operations related to treatments
 */

import { queryOne, queryAll, query } from '@/src/lib/db';
import { Treatment, CreateTreatmentPayload, UpdateTreatmentPayload } from '@/types/treatment';

/**
 * Get all treatments for a specific illness with optional filtering
 */
export async function getTreatmentsForIllness(
  illnessId: string,
  effectiveness?: 'effective' | 'ineffective',
  limit: number = 50,
  offset: number = 0
): Promise<{ treatments: Treatment[]; total: number }> {
  // Build query with optional effectiveness filter
  let whereClause = 'WHERE t.illness_id = $1';
  let paramCount = 1;
  const params: any[] = [illnessId];

  if (effectiveness) {
    paramCount++;
    whereClause += ` AND t.effectiveness = $${paramCount}`;
    params.push(effectiveness);
  }

  // Get total count
  const countQuery = `SELECT COUNT(*) as count FROM treatments t ${whereClause}`;
  const countResult = await queryOne<{ count: number }>(countQuery, params);
  const total = countResult?.count || 0;

  // Get paginated results
  paramCount++;
  const limitParam = paramCount;
  paramCount++;
  const offsetParam = paramCount;

  const dataQuery = `
    SELECT 
      t.id,
      t.illness_id,
      t.name,
      t.type,
      t.effectiveness,
      t.started_at,
      t.ended_at,
      t.notes,
      t.created_at,
      t.updated_at
    FROM treatments t
    ${whereClause}
    ORDER BY t.started_at DESC
    LIMIT $${limitParam} OFFSET $${offsetParam}
  `;

  const treatmentParams = [...params, limit, offset];
  const treatments = await queryAll<Treatment>(dataQuery, treatmentParams);

  return {
    treatments: treatments || [],
    total,
  };
}

/**
 * Get a single treatment by ID with verification of illness ownership
 */
export async function getTreatmentById(
  treatmentId: string,
  illnessId: string
): Promise<Treatment | null> {
  const query = `
    SELECT 
      t.id,
      t.illness_id,
      t.name,
      t.type,
      t.effectiveness,
      t.started_at,
      t.ended_at,
      t.notes,
      t.created_at,
      t.updated_at
    FROM treatments t
    WHERE t.id = $1 AND t.illness_id = $2
  `;

  return await queryOne<Treatment>(query, [treatmentId, illnessId]);
}

/**
 * Create a new treatment for an illness
 */
export async function createTreatment(
  illnessId: string,
  payload: CreateTreatmentPayload
): Promise<Treatment> {
  const insertQuery = `
    INSERT INTO treatments (
      illness_id,
      name,
      type,
      effectiveness,
      started_at,
      ended_at,
      notes,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING 
      id,
      illness_id,
      name,
      type,
      effectiveness,
      started_at,
      ended_at,
      notes,
      created_at,
      updated_at
  `;

  const params = [
    illnessId,
    payload.name,
    payload.type,
    payload.effectiveness,
    payload.started_at,
    payload.ended_at || null,
    payload.notes || null,
  ];

  const treatment = await queryOne<Treatment>(insertQuery, params);
  if (!treatment) throw new Error('Failed to create treatment');

  return treatment;
}

/**
 * Update a treatment record
 */
export async function updateTreatment(
  treatmentId: string,
  illnessId: string,
  payload: UpdateTreatmentPayload
): Promise<Treatment> {
  // Build dynamic UPDATE query
  const updates: string[] = [];
  const params: any[] = [];
  let paramCount = 1;

  if (payload.name !== undefined) {
    paramCount++;
    updates.push(`name = $${paramCount}`);
    params.push(payload.name);
  }

  if (payload.effectiveness !== undefined) {
    paramCount++;
    updates.push(`effectiveness = $${paramCount}`);
    params.push(payload.effectiveness);
  }

  if (payload.ended_at !== undefined) {
    paramCount++;
    updates.push(`ended_at = $${paramCount}`);
    params.push(payload.ended_at);
  }

  if (payload.notes !== undefined) {
    paramCount++;
    updates.push(`notes = $${paramCount}`);
    params.push(payload.notes);
  }

  // Always update the updated_at timestamp
  updates.push('updated_at = NOW()');

  if (updates.length === 1) {
    // Only updated_at was set, so just return the current record
    const current = await getTreatmentById(treatmentId, illnessId);
    if (!current) throw new Error('Treatment not found');
    return current;
  }

  paramCount++;
  const idParam = paramCount;
  paramCount++;
  const illnessIdParam = paramCount;

  const updateQuery = `
    UPDATE treatments
    SET ${updates.join(', ')}
    WHERE id = $${idParam} AND illness_id = $${illnessIdParam}
    RETURNING 
      id,
      illness_id,
      name,
      type,
      effectiveness,
      started_at,
      ended_at,
      notes,
      created_at,
      updated_at
  `;

  params.push(treatmentId, illnessId);
  const treatment = await queryOne<Treatment>(updateQuery, params);
  if (!treatment) throw new Error('Treatment not found or not updated');

  return treatment;
}

/**
 * Delete a treatment record
 */
export async function deleteTreatment(treatmentId: string, illnessId: string): Promise<boolean> {
  const deleteQuery = `
    DELETE FROM treatments
    WHERE id = $1 AND illness_id = $2
  `;

  const result = await query(deleteQuery, [treatmentId, illnessId]);
  return (result?.rowCount || 0) > 0;
}

/**
 * Get treatment counts by effectiveness for an illness
 */
export async function getTreatmentStats(illnessId: string): Promise<{
  total: number;
  effective: number;
  ineffective: number;
  unknown: number;
}> {
  const statsQuery = `
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN effectiveness = 'effective' THEN 1 END) as effective,
      COUNT(CASE WHEN effectiveness = 'ineffective' THEN 1 END) as ineffective,
      COUNT(CASE WHEN effectiveness = 'unknown' THEN 1 END) as unknown
    FROM treatments
    WHERE illness_id = $1
  `;

  const stats = await queryOne<{
    total: number;
    effective: number;
    ineffective: number;
    unknown: number;
  }>(statsQuery, [illnessId]);

  return {
    total: stats?.total || 0,
    effective: stats?.effective || 0,
    ineffective: stats?.ineffective || 0,
    unknown: stats?.unknown || 0,
  };
}
