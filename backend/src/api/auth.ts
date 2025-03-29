import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPool } from '../models/database';
import { logger } from '../utils/logger';
import { z } from 'zod';
import crypto from 'crypto';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  hardwareKey: z.string().optional(),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  teamId: z.string().uuid().optional(),
});

/**
 * Auth routes for user authentication and registration
 */
export default async function (fastify: FastifyInstance) {
  // Login route
  fastify.post<{ Body: z.infer<typeof loginSchema> }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            hardwareKey: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { email, password, hardwareKey } = loginSchema.parse(request.body);
        
        // Get user from database
        const pool = getPool();
        const result = await pool.query(
          'SELECT id, email, password_hash, team_id, role, permissions FROM users WHERE email = $1',
          [email]
        );
        
        const user = result.rows[0];
        
        if (!user) {
          return reply.code(401).send({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password_hash);
        
        if (!isPasswordValid) {
          logger.warn('Failed login attempt', { email, ip: request.ip });
          return reply.code(401).send({ error: 'Invalid credentials' });
        }
        
        // Handle hardware key verification if needed
        if (user.hardware_key_required && !hardwareKey) {
          return reply.code(401).send({ error: 'Hardware key required', requiresHardwareKey: true });
        }
        
        // Generate token
        const token = fastify.jwt.sign(
          {
            id: user.id,
            email: user.email,
            teamId: user.team_id,
            role: user.role,
            permissions: user.permissions,
          },
          { expiresIn: '1d' }
        );
        
        return { token, user: { id: user.id, email: user.email, teamId: user.team_id, role: user.role } };
      } catch (error) {
        logger.error('Login error', error);
        return reply.code(400).send({ error: 'Invalid request' });
      }
    }
  );

  // Register route
  fastify.post<{ Body: z.infer<typeof registerSchema> }>(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 2 },
            teamId: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const { email, password, name, teamId } = registerSchema.parse(request.body);
        
        // Check if user already exists
        const pool = getPool();
        const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        
        if (existingUser.rows.length > 0) {
          return reply.code(409).send({ error: 'User already exists' });
        }
        
        // Hash password
        const passwordHash = await hashPassword(password);
        
        // Insert new user
        const result = await pool.query(
          `INSERT INTO users (email, password_hash, name, team_id, role, permissions) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, team_id, role`,
          [email, passwordHash, name, teamId, 'member', ['read:battles', 'write:battles']]
        );
        
        const newUser = result.rows[0];
        
        // Generate token
        const token = fastify.jwt.sign(
          {
            id: newUser.id,
            email: newUser.email,
            teamId: newUser.team_id,
            role: newUser.role,
            permissions: ['read:battles', 'write:battles'],
          },
          { expiresIn: '1d' }
        );
        
        return { token, user: { id: newUser.id, email: newUser.email, teamId: newUser.team_id, role: newUser.role } };
      } catch (error) {
        logger.error('Registration error', error);
        return reply.code(400).send({ error: 'Invalid request' });
      }
    }
  );

  // Verify token route
  fastify.get('/verify', { onRequest: [fastify.authenticate] }, async (request, reply) => {
    // The authenticate hook will verify the token
    // If we get here, the token is valid
    return { valid: true, user: request.user };
  });

  // Logout route (client-side implementation)
  fastify.post('/logout', { onRequest: [fastify.authenticate] }, async () => {
    return { success: true };
  });
}

/**
 * Hashes a password using bcrypt (simplified implementation)
 */
async function hashPassword(password: string): Promise<string> {
  // In a real application, use bcrypt or Argon2
  // For simplicity, using a basic hash
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verifies a password against a hash (simplified implementation)
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // In a real application, use bcrypt or Argon2
  // For simplicity, using a basic hash comparison
  const computedHash = crypto.createHash('sha256').update(password).digest('hex');
  return computedHash === hash;
}
