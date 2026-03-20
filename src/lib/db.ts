/**
 * PostgreSQL Connection Pool
 * Manages database connections with connection pooling
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

// Global connection pool instance
let pool: Pool | null = null;

/**
 * Initialize the connection pool
 * Should be called once at application startup
 */
export function initializePool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString =
    process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL or POSTGRES_URL environment variable is not set'
    );
  }

  pool = new Pool({
    connectionString,
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  // Event listeners for pool
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
}

/**
 * Get the connection pool
 */
export function getPool(): Pool {
  if (!pool) {
    return initializePool();
  }
  return pool;
}

/**
 * Execute a query
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  values?: Array<any>
): Promise<QueryResult<T>> {
  const p = getPool();
  try {
    return await p.query<T>(text, values);
  } catch (error) {
    console.error('Database query error:', {
      query: text,
      error,
    });
    throw error;
  }
}

/**
 * Execute a query and return a single row
 */
export async function queryOne<T extends QueryResultRow = any>(
  text: string,
  values?: Array<any>
): Promise<T | null> {
  const result = await query<T>(text, values);
  return result.rows[0] || null;
}

/**
 * Execute a query and return all rows
 */
export async function queryAll<T extends QueryResultRow = any>(
  text: string,
  values?: Array<any>
): Promise<T[]> {
  const result = await query<T>(text, values);
  return result.rows;
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the connection pool
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Check database connection health
 */
export async function checkHealth(): Promise<{
  connected: boolean;
  latency_ms: number;
}> {
  const start = Date.now();
  try {
    await query('SELECT 1');
    const latency = Date.now() - start;
    return {
      connected: true,
      latency_ms: latency,
    };
  } catch (error) {
    console.error('Health check failed:', error);
    return {
      connected: false,
      latency_ms: Date.now() - start,
    };
  }
}
