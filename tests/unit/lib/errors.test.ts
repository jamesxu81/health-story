/**
 * Unit tests for error utilities
 */

import {
  ApiErrorClass,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  formatError,
  errorToResponse,
} from '../../../src/lib/errors';

describe('Error Classes', () => {
  describe('ApiErrorClass', () => {
    it('should create custom error', () => {
      const error = new ApiErrorClass('Test error', 'TEST_ERROR', 400);
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.status).toBe(400);
    });
  });

  describe('ValidationError', () => {
    it('should create 400 validation error', () => {
      const error = new ValidationError('Invalid input', { field: 'name' });
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details?.field).toBe('name');
    });
  });

  describe('AuthenticationError', () => {
    it('should create 401 auth error', () => {
      const error = new AuthenticationError('Invalid token');
      expect(error.status).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('should create 404 not found error', () => {
      const error = new NotFoundError('Illness');
      expect(error.status).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toContain('Illness');
    });
  });

  describe('formatError', () => {
    it('should format ApiErrorClass', () => {
      const error = new ValidationError('Test', { field: 'test' });
      const formatted = formatError(error);
      expect(formatted.status).toBe(400);
      expect(formatted.code).toBe('VALIDATION_ERROR');
      expect(formatted.details).toBeDefined();
    });

    it('should format generic Error', () => {
      const error = new Error('Generic error');
      const formatted = formatError(error);
      expect(formatted.status).toBe(500);
      expect(formatted.code).toBe('INTERNAL_ERROR');
    });

    it('should handle unknown error types', () => {
      const formatted = formatError('unknown');
      expect(formatted.status).toBe(500);
      expect(formatted.error).toBe('Unknown error');
    });
  });

  describe('errorToResponse', () => {
    it('should convert to HTTP response', () => {
      const error = new ValidationError('Test');
      const response = errorToResponse(error);
      expect(response.status).toBe(400);
      expect(response.body.code).toBe('VALIDATION_ERROR');
    });
  });
});
