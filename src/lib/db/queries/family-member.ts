import { query, queryOne, queryAll } from '@/lib/db';
import { FamilyMember, FamilyMemberInput } from '@/types/family-member';

export async function getFamilyMembers(
  userId: string
): Promise<FamilyMember[]> {
  return queryAll<FamilyMember>(
    `SELECT id, user_id, name, color, date_of_birth, relationship, created_at, updated_at
     FROM family_members
     WHERE user_id = $1
     ORDER BY created_at ASC`,
    [userId]
  );
}

export async function getFamilyMemberById(
  id: string,
  userId: string
): Promise<FamilyMember | null> {
  return queryOne<FamilyMember>(
    `SELECT id, user_id, name, color, date_of_birth, relationship, created_at, updated_at
     FROM family_members
     WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
}

export async function createFamilyMember(
  userId: string,
  input: FamilyMemberInput
): Promise<FamilyMember> {
  const row = await queryOne<FamilyMember>(
    `INSERT INTO family_members (user_id, name, color, date_of_birth, relationship)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, name, color, date_of_birth, relationship, created_at, updated_at`,
    [
      userId,
      input.name,
      input.color || '#0d9488',
      input.date_of_birth || null,
      input.relationship || null,
    ]
  );
  if (!row) throw new Error('Failed to create family member');
  return row;
}

export async function updateFamilyMember(
  id: string,
  userId: string,
  input: Partial<FamilyMemberInput>
): Promise<FamilyMember> {
  const updates: string[] = [];
  const values: any[] = [id, userId];
  let idx = 3;

  if (input.name !== undefined) {
    updates.push(`name = $${idx++}`);
    values.push(input.name);
  }
  if (input.color !== undefined) {
    updates.push(`color = $${idx++}`);
    values.push(input.color);
  }
  if (input.date_of_birth !== undefined) {
    updates.push(`date_of_birth = $${idx++}`);
    values.push(input.date_of_birth || null);
  }
  if (input.relationship !== undefined) {
    updates.push(`relationship = $${idx++}`);
    values.push(input.relationship || null);
  }

  if (updates.length === 0) {
    const existing = await getFamilyMemberById(id, userId);
    if (!existing) throw new Error('Family member not found');
    return existing;
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');

  const row = await queryOne<FamilyMember>(
    `UPDATE family_members SET ${updates.join(', ')}
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, name, color, date_of_birth, relationship, created_at, updated_at`,
    values
  );
  if (!row) throw new Error('Family member not found');
  return row;
}

export async function deleteFamilyMember(
  id: string,
  userId: string
): Promise<void> {
  const result = await query(
    `DELETE FROM family_members WHERE id = $1 AND user_id = $2`,
    [id, userId]
  );
  if (result.rowCount === 0) {
    throw new Error('Family member not found');
  }
}
