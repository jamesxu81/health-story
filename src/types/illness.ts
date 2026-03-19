/**
 * Illness type definitions
 * Core data model for illness records with symptoms
 */

export interface Symptom {
  name: string; // 1-100 chars
  severity: 'mild' | 'moderate' | 'severe';
  duration: string | null; // 1-100 chars, optional
}

export interface Illness {
  id: string; // UUID
  user_id: string; // UUID of authenticated user
  name: string; // 1-255 chars
  date_started: Date;
  date_ended: Date | null;
  status: 'active' | 'resolved';
  symptoms: Symptom[];
  cause: string | null;
  notes: string | null;
  family_member_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Normalized illness record for API responses
 * Includes aggregated counts for related entities
 */
export interface IllnessWithCounts extends Illness {
  photo_count: number;
  treatment_count: number;
  recovery_days: number | null; // null if still active
  family_member_name?: string | null;
  family_member_color?: string | null;
}

/**
 * Database row type (matches SQL schema)
 * Symptoms stored as JSON, dates as timestamps
 */
export interface IllnessRow {
  id: string;
  user_id: string;
  name: string;
  date_started: string; // ISO date
  date_ended: string | null; // ISO date
  status: 'active' | 'resolved';
  symptoms: string; // JSON stringified
  cause: string | null;
  notes: string | null;
  family_member_id: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Input validation schema for creating/updating illness
 */
export interface IllnessInput {
  name: string;
  date_started: string; // ISO date
  date_ended?: string | null; // ISO date
  symptoms: Array<{
    name: string;
    severity: 'mild' | 'moderate' | 'severe';
    duration?: string | null;
  }>;
  cause?: string | null;
  notes?: string | null;
  family_member_id?: string | null;
}
