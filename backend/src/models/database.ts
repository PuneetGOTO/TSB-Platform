import { Pool } from 'pg';
import { neon } from '@neon-tech/serverless';
import { config } from '../config';
import { logger } from '../utils/logger';

let pool: Pool;

/**
 * Establishes connection to the PostgreSQL database
 * Uses Neon Serverless for optimal Railway deployment
 */
export async function connectDatabase() {
  try {
    if (config.DATABASE_URL.includes('neon.tech')) {
      // Using Neon serverless Postgres
      const sql = neon(config.DATABASE_URL);
      logger.info('Connected to Neon serverless Postgres');
      
      // Create a regular pool to maintain the same interface
      pool = new Pool({
        connectionString: config.DATABASE_URL,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
    } else {
      // Using standard PostgreSQL
      pool = new Pool({
        connectionString: config.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      
      // Test connection
      const client = await pool.connect();
      client.release();
      logger.info('Connected to PostgreSQL database');
    }
    
    return pool;
  } catch (error) {
    logger.error('Database connection error:', error);
    throw error;
  }
}

/**
 * Returns the database pool for query execution
 */
export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
}

/**
 * Closes the database connection
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    logger.info('Database connection closed');
  }
}
