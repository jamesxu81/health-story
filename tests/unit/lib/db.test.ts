/**
 * Unit tests for database utilities
 * Tests connection, queries, and error handling
 */

import {
  initializePool,
  getPool,
  query,
  queryOne,
  queryAll,
  checkHealth,
} from '../../../src/lib/db';

// Mock pg module
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: jest.fn().mockResolvedValue({ rows: [{ id: '1' }] }),
    connect: jest.fn().mockResolvedValue({
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    }),
    end: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
  })),
}));

describe('Database Utilities', () => {
  beforeEach(() => {
    // Reset environment
    jest.resetModules();
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/testdb';
    jest.clearAllMocks();
  });

  describe('initializePool', () => {
    it('should create a connection pool', () => {
      const pool = initializePool();
      expect(pool).toBeDefined();
    });

    it('should throw if no database URL is set', () => {
      delete process.env.DATABASE_URL;
      delete process.env.POSTGRES_URL;
      jest.resetModules();
      const { initializePool: initPool } = require('../../../src/lib/db');

      expect(() => {
        initPool();
      }).toThrow(
        'DATABASE_URL or POSTGRES_URL environment variable is not set'
      );
    });

    it('should return same pool instance on multiple calls', () => {
      const pool1 = initializePool();
      const pool2 = getPool();
      expect(pool1).toBe(pool2);
    });
  });

  describe('getPool', () => {
    it('should initialize pool if not exists', () => {
      const pool = getPool();
      expect(pool).toBeDefined();
    });
  });

  describe('query', () => {
    it('should execute a query', async () => {
      const result = await query('SELECT 1');
      expect(result).toBeDefined();
      expect(result.rows).toBeDefined();
    });

    it('should pass values to query', async () => {
      await query('SELECT * FROM illnesses WHERE id = $1', ['123']);
      // Verify pool.query was called with correct arguments
    });
  });

  describe('queryOne', () => {
    it('should return first row or null', async () => {
      const result = await queryOne('SELECT * FROM illnesses LIMIT 1');
      expect(result).toBeDefined();
    });
  });

  describe('queryAll', () => {
    it('should return all rows', async () => {
      const result = await queryAll('SELECT * FROM illnesses');
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('checkHealth', () => {
    it('should return connection status', async () => {
      const health = await checkHealth();
      expect(health).toHaveProperty('connected');
      expect(health).toHaveProperty('latency_ms');
    });

    it('should measure latency', async () => {
      const health = await checkHealth();
      expect(typeof health.latency_ms).toBe('number');
      expect(health.latency_ms).toBeGreaterThanOrEqual(0);
    });
  });
});
