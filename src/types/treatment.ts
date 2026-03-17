/**
 * Treatment type definitions
 * Track treatments/cures used for illnesses
 */

export interface Treatment {
  id: string; // UUID
  illness_id: string; // Foreign key to illness
  name: string; // 1-255 chars
  type: 'medicine' | 'home_remedy' | 'doctor_recommendation' | 'other';
  effectiveness: 'effective' | 'ineffective' | 'unknown';
  started_at: Date;
  ended_at: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Database row type (matches SQL schema)
 */
export interface TreatmentRow {
  id: string;
  illness_id: string;
  name: string;
  type: string;
  effectiveness: string;
  started_at: string; // ISO timestamp
  ended_at: string | null; // ISO timestamp
  notes: string | null;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * Input validation schema for creating/updating treatment
 */
export interface TreatmentInput {
  name: string;
  type: 'medicine' | 'home_remedy' | 'doctor_recommendation' | 'other';
  effectiveness: 'effective' | 'ineffective' | 'unknown';
  started_at?: string; // ISO timestamp, optional (defaults to now)
  ended_at?: string | null; // ISO timestamp
  notes?: string | null;
}

/**
 * Payload for creating a new treatment
 */
export interface CreateTreatmentPayload {
  name: string;
  type: 'medicine' | 'home_remedy' | 'doctor_recommendation' | 'other';
  effectiveness: 'effective' | 'ineffective' | 'unknown';
  started_at: string; // ISO timestamp, required
  ended_at?: string | null; // ISO timestamp
  notes?: string | null;
}

/**
 * Payload for updating a treatment
 */
export interface UpdateTreatmentPayload {
  name?: string;
  effectiveness?: 'effective' | 'ineffective' | 'unknown';
  ended_at?: string | null;
  notes?: string | null;
}
