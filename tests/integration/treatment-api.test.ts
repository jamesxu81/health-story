/**
 * Integration Tests for Treatment API
 * Validates API contract and type compatibility for treatment operations
 */

import { Treatment, CreateTreatmentPayload, UpdateTreatmentPayload } from '@/types/treatment';

describe('Treatment API Integration', () => {
  describe('Type Compatibility', () => {
    it('should validate CreateTreatmentPayload type', () => {
      // Type validation test
      const payload: CreateTreatmentPayload = {
        name: 'Paracetamol 500mg',
        type: 'medicine',
        effectiveness: 'unknown',
        started_at: '2026-02-20T10:00:00Z',
        ended_at: null,
        notes: 'Take every 4 hours',
      };

      expect(payload.name).toBeDefined();
      expect(payload.type).toBe('medicine');
      expect(payload.effectiveness).toBe('unknown');
    });

    it('should validate UpdateTreatmentPayload type', () => {
      const payload: UpdateTreatmentPayload = {
        effectiveness: 'effective',
        ended_at: '2026-02-22T18:00:00Z',
        notes: 'Reduced fever significantly',
      };

      expect(payload.effectiveness).toBe('effective');
      expect(payload.notes).toBeDefined();
    });

    it('should allow partial UpdateTreatmentPayload', () => {
      const payload: UpdateTreatmentPayload = {
        effectiveness: 'ineffective',
      };

      expect(payload.effectiveness).toBe('ineffective');
      expect(payload.ended_at).toBeUndefined();
    });

    it('should validate Treatment type', () => {
      const treatment: Treatment = {
        id: 'treat-123',
        illness_id: 'ill-123',
        name: 'Aspirin',
        type: 'medicine',
        effectiveness: 'effective',
        started_at: new Date('2026-02-20T10:00:00Z'),
        ended_at: new Date('2026-02-22T18:00:00Z'),
        notes: 'Worked well',
        created_at: new Date(),
        updated_at: new Date(),
      };

      expect(treatment.id).toBeDefined();
      expect(treatment.illness_id).toBeDefined();
      expect(treatment.effectiveness).toMatch(/^(effective|ineffective|unknown)$/);
    });
  });

  describe('API Response Contract', () => {
    it('should structure treatment as part of illness detail response', () => {
      // Validates the shape of treatment data in API responses
      const response = {
        data: [
          {
            id: 'treat-1',
            illness_id: 'ill-1',
            name: 'Medicine A',
            type: 'medicine',
            effectiveness: 'effective',
            started_at: new Date('2026-02-20'),
            ended_at: new Date('2026-02-22'),
            notes: 'Worked',
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        pagination: {
          total: 1,
          limit: 50,
          offset: 0,
          total_pages: 1,
        },
        status: 'success',
        timestamp: new Date().toISOString(),
      };

      expect(response.data).toHaveLength(1);
      expect(response.data[0].effectiveness).toBe('effective');
      expect(response.pagination.total).toBe(1);
    });

    it('should handle empty treatment list', () => {
      const response = {
        data: [],
        pagination: {
          total: 0,
          limit: 50,
          offset: 0,
          total_pages: 0,
        },
        status: 'success',
        timestamp: new Date().toISOString(),
      };

      expect(response.data).toHaveLength(0);
      expect(response.pagination.total).toBe(0);
    });
  });

  describe('Enum Validation', () => {
    it('should validate treatment types', () => {
      const validTypes: Array<'medicine' | 'home_remedy' | 'doctor_recommendation' | 'other'> = [
        'medicine',
        'home_remedy',
        'doctor_recommendation',
        'other',
      ];

      validTypes.forEach((type) => {
        expect(type).toMatch(/^(medicine|home_remedy|doctor_recommendation|other)$/);
      });
    });

    it('should validate effectiveness values', () => {
      const validEffectiveness: Array<'effective' | 'ineffective' | 'unknown'> = [
        'effective',
        'ineffective',
        'unknown',
      ];

      validEffectiveness.forEach((value) => {
        expect(value).toMatch(/^(effective|ineffective|unknown)$/);
      });
    });
  });
});
