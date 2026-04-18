/**
 * Unit tests for validation schemas
 * Tests all Zod schemas for correctness
 */

import {
  symptomSchema,
  illnessSchema,
  treatmentSchema,
  paginationSchema,
  illnessFilterSchema,
  validateInput,
} from '../../../src/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('symptomSchema', () => {
    it('should validate a correct symptom', () => {
      const data = {
        name: 'Cough',
        severity: 'moderate',
        duration: '3 days',
      };
      const result = symptomSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const data = {
        name: '',
        severity: 'mild',
      };
      const result = symptomSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject invalid severity', () => {
      const data = {
        name: 'Fever',
        severity: 'extreme',
      };
      const result = symptomSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('illnessSchema', () => {
    it('should validate a complete illness record', () => {
      const data = {
        name: 'Common Cold',
        date_started: '2026-03-01',
        date_ended: '2026-03-05',
        symptoms: [
          { name: 'Cough', severity: 'moderate', duration: '3 days' },
        ],
        cause: 'Exposure at work',
        treat: 'Rest and tea',
        notes: 'Used honey lozenges',
      };
      const result = illnessSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should require name and date_started', () => {
      const data = {
        symptoms: [],
      };
      const result = illnessSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should allow minimal illness record', () => {
      const data = {
        name: 'Headache',
        date_started: '2026-03-01',
        symptoms: [],
      };
      const result = illnessSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const data = {
        name: 'Fever',
        date_started: 'not-a-date',
        symptoms: [],
      };
      const result = illnessSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should limit symptoms to 50', () => {
      const symptoms = Array(51)
        .fill(null)
        .map((_, i) => ({
          name: `Symptom ${i}`,
          severity: 'mild' as const,
        }));

      const data = {
        name: 'Illness',
        date_started: '2026-03-01',
        symptoms,
      };
      const result = illnessSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('treatmentSchema', () => {
    it('should validate a complete treatment', () => {
      const data = {
        name: 'Paracetamol 500mg',
        type: 'medicine',
        effectiveness: 'effective',
        started_at: '2026-02-20T10:00:00Z',
        notes: 'Took morning and evening',
      };
      const result = treatmentSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should reject invalid treatment type', () => {
      const data = {
        name: 'Rest',
        type: 'invalid_type',
        effectiveness: 'effective',
        started_at: '2026-02-20T10:00:00Z',
      };
      const result = treatmentSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('paginationSchema', () => {
    it('should parse valid pagination', () => {
      const data = {
        limit: 20,
        offset: 0,
      };
      const result = paginationSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(20);
    });

    it('should apply defaults', () => {
      const data = {};
      const result = paginationSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(50);
      expect(result.data?.offset).toBe(0);
    });

    it('should enforce max limit of 100', () => {
      const data = {
        limit: 150,
      };
      const result = paginationSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('illnessFilterSchema', () => {
    it('should parse valid filters', () => {
      const data = {
        status: 'active',
        date_from: '2026-01-01',
        date_to: '2026-03-31',
        search: 'cold',
      };
      const result = illnessFilterSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should allow optional filters with defaults', () => {
      const data = {};
      const result = illnessFilterSchema.safeParse(data);
      expect(result.success).toBe(true);
      expect(result.data?.limit).toBe(50);
    });
  });

  describe('validateInput', () => {
    it('should throw on validation error', () => {
      expect(() => {
        validateInput(illnessSchema, {
          name: 'Test',
          // missing date_started
        });
      }).toThrow('Validation failed');
    });

    it('should return parsed data on success', () => {
      const data = {
        name: 'Test Illness',
        date_started: '2026-03-01',
        symptoms: [],
      };
      const result = validateInput(illnessSchema, data);
      expect(result.name).toBe('Test Illness');
    });
  });
});
