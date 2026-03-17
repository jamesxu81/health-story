/**
 * Zod validation schemas
 * Schema validation for all entity types
 */

import { z } from 'zod';

/**
 * Symptom validation schema
 */
export const symptomSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  severity: z.enum(['mild', 'moderate', 'severe']),
  duration: z.string().max(100).optional().nullable(),
});

/**
 * Illness creation/update schema
 */
export const illnessSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  date_started: z.string().date(), // ISO date format
  date_ended: z.string().date().nullable().optional(),
  symptoms: z.array(symptomSchema).min(0).max(50),
  cause: z.string().max(1000).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

/**
 * Illness update schema (all fields optional)
 */
export const illnessUpdateSchema = illnessSchema.partial();

/**
 * Treatment creation/update schema
 */
export const treatmentSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  type: z.enum(['medicine', 'home_remedy', 'doctor_recommendation', 'other']),
  effectiveness: z.enum(['effective', 'ineffective', 'unknown']),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().nullable().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

/**
 * Treatment update schema (all fields optional)
 */
export const treatmentUpdateSchema = treatmentSchema.omit({ started_at: true }).partial();

/**
 * Pagination query parameters schema
 */
export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

/**
 * Treatment filter query parameters schema
 */
export const treatmentFilterSchema = paginationSchema.extend({
  effectiveness: z.enum(['effective', 'ineffective']).optional(),
});

/**
 * Illness filter query parameters schema
 */
export const illnessFilterSchema = paginationSchema.extend({
  status: z.enum(['active', 'resolved']).optional().nullable(),
  date_from: z.string().date().nullish(),
  date_to: z.string().date().nullish(),
  search: z.string().max(255).nullish(),
});

/**
 * Validate and parse input
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: Record<string, unknown> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.');
      details[path || 'root'] = issue.message;
    });
    throw new Error(`Validation failed: ${JSON.stringify(details)}`);
  }
  return result.data;
}
