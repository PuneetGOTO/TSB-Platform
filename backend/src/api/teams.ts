import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPool } from '../models/database';
import { logger } from '../utils/logger';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Validation schemas
const createTeamSchema = z.object({
  name: z.string().min(2).max(50),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  logoUrl: z.string().url().optional(),
  description: z.string().max(500).optional(),
});

const updateTeamSchema = createTeamSchema.partial();

// Route handler
export default async function (fastify: FastifyInstance) {
  // Get all teams
  fastify.get('/', async (request, reply) => {
    try {
      const pool = getPool();
      const result = await pool.query(`
        SELECT id, name, color, position, logo_url, description, resources, active_members,
               created_at, updated_at
        FROM teams
        ORDER BY name ASC
      `);
      
      // Format the teams for the response
      const teams = result.rows.map(team => ({
        id: team.id,
        name: team.name,
        color: team.color,
        position: team.position,
        logoUrl: team.logo_url,
        description: team.description,
        resources: team.resources,
        activeMembers: team.active_members,
        createdAt: team.created_at,
        updatedAt: team.updated_at
      }));
      
      return teams;
    } catch (error) {
      logger.error('Error fetching teams', error);
      return reply.code(500).send({ error: 'Failed to fetch teams' });
    }
  });

  // Get team by ID
  fastify.get('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const { id } = request.params;
      
      const pool = getPool();
      const result = await pool.query(`
        SELECT id, name, color, position, logo_url, description, resources, active_members,
               created_at, updated_at
        FROM teams
        WHERE id = $1
      `, [id]);
      
      if (result.rows.length === 0) {
        return reply.code(404).send({ error: 'Team not found' });
      }
      
      const team = result.rows[0];
      
      // Get team members
      const membersResult = await pool.query(`
        SELECT id, name, email, role
        FROM users
        WHERE team_id = $1
      `, [id]);
      
      // Get team battle stats
      const statsResult = await pool.query(`
        SELECT COUNT(DISTINCT battle_id) as battle_count,
               AVG(tactical_score) as avg_score
        FROM team_battles
        WHERE team_id = $1
      `, [id]);
      
      return {
        id: team.id,
        name: team.name,
        color: team.color,
        position: team.position,
        logoUrl: team.logo_url,
        description: team.description,
        resources: team.resources,
        activeMembers: team.active_members,
        createdAt: team.created_at,
        updatedAt: team.updated_at,
        members: membersResult.rows,
        stats: statsResult.rows[0]
      };
    } catch (error) {
      logger.error('Error fetching team', error);
      return reply.code(500).send({ error: 'Failed to fetch team details' });
    }
  });

  // Create new team
  fastify.post<{ Body: z.infer<typeof createTeamSchema> }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'color', 'position'],
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50 },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            position: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' }
              }
            },
            logoUrl: { type: 'string', format: 'uri' },
            description: { type: 'string', maxLength: 500 }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { name, color, position, logoUrl, description } = createTeamSchema.parse(request.body);
        
        // Check if user is authorized to create a team
        const user = request.user;
        if (user?.role !== 'admin' && user?.role !== 'manager') {
          return reply.code(403).send({ error: 'Insufficient permissions to create team' });
        }
        
        // Check if team name already exists
        const pool = getPool();
        const existingTeam = await pool.query('SELECT id FROM teams WHERE name = $1', [name]);
        
        if (existingTeam.rows.length > 0) {
          return reply.code(409).send({ error: 'Team name already exists' });
        }
        
        // Create new team
        const teamId = uuidv4();
        const result = await pool.query(`
          INSERT INTO teams (id, name, color, position, logo_url, description, resources, active_members)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING id, name, color, position, logo_url, description, resources, active_members, created_at
        `, [
          teamId,
          name,
          color,
          position,
          logoUrl,
          description,
          0, // Initial resources
          0  // Initial active members
        ]);
        
        const newTeam = result.rows[0];
        
        // If user is not admin, assign them to the team as manager
        if (user?.role !== 'admin') {
          await pool.query(`
            UPDATE users SET team_id = $1, role = 'manager'
            WHERE id = $2
          `, [teamId, user.id]);
        }
        
        return {
          id: newTeam.id,
          name: newTeam.name,
          color: newTeam.color,
          position: newTeam.position,
          logoUrl: newTeam.logo_url,
          description: newTeam.description,
          resources: newTeam.resources,
          activeMembers: newTeam.active_members,
          createdAt: newTeam.created_at
        };
      } catch (error) {
        logger.error('Error creating team', error);
        return reply.code(400).send({ error: 'Invalid team data' });
      }
    }
  );

  // Update team
  fastify.put<{ Params: { id: string }; Body: z.infer<typeof updateTeamSchema> }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' }
          }
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 2, maxLength: 50 },
            color: { type: 'string', pattern: '^#[0-9A-Fa-f]{6}$' },
            position: {
              type: 'object',
              properties: {
                x: { type: 'number' },
                y: { type: 'number' }
              }
            },
            logoUrl: { type: 'string', format: 'uri' },
            description: { type: 'string', maxLength: 500 }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const updates = updateTeamSchema.parse(request.body);
        
        // Check if user is authorized to update this team
        const user = request.user;
        if (user?.role !== 'admin' && user?.teamId !== id && user?.role !== 'manager') {
          return reply.code(403).send({ error: 'Insufficient permissions to update team' });
        }
        
        // Check if team exists
        const pool = getPool();
        const existingTeam = await pool.query('SELECT id FROM teams WHERE id = $1', [id]);
        
        if (existingTeam.rows.length === 0) {
          return reply.code(404).send({ error: 'Team not found' });
        }
        
        // Build update query dynamically based on provided fields
        const updateFields = [];
        const queryParams = [id];
        let paramIndex = 2;
        
        if (updates.name !== undefined) {
          updateFields.push(`name = $${paramIndex++}`);
          queryParams.push(updates.name);
        }
        
        if (updates.color !== undefined) {
          updateFields.push(`color = $${paramIndex++}`);
          queryParams.push(updates.color);
        }
        
        if (updates.position !== undefined) {
          updateFields.push(`position = $${paramIndex++}`);
          queryParams.push(updates.position);
        }
        
        if (updates.logoUrl !== undefined) {
          updateFields.push(`logo_url = $${paramIndex++}`);
          queryParams.push(updates.logoUrl);
        }
        
        if (updates.description !== undefined) {
          updateFields.push(`description = $${paramIndex++}`);
          queryParams.push(updates.description);
        }
        
        // If no fields to update, return current team
        if (updateFields.length === 0) {
          return reply.code(400).send({ error: 'No valid fields to update' });
        }
        
        // Update the team
        const result = await pool.query(`
          UPDATE teams
          SET ${updateFields.join(', ')}, updated_at = NOW()
          WHERE id = $1
          RETURNING id, name, color, position, logo_url, description, resources, active_members, updated_at
        `, queryParams);
        
        const updatedTeam = result.rows[0];
        
        return {
          id: updatedTeam.id,
          name: updatedTeam.name,
          color: updatedTeam.color,
          position: updatedTeam.position,
          logoUrl: updatedTeam.logo_url,
          description: updatedTeam.description,
          resources: updatedTeam.resources,
          activeMembers: updatedTeam.active_members,
          updatedAt: updatedTeam.updated_at
        };
      } catch (error) {
        logger.error('Error updating team', error);
        return reply.code(400).send({ error: 'Invalid team data' });
      }
    }
  );

  // Delete team (admin only)
  fastify.delete('/:id', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const { id } = request.params;
      
      // Check if user is authorized to delete teams
      const user = request.user;
      if (user?.role !== 'admin') {
        return reply.code(403).send({ error: 'Only administrators can delete teams' });
      }
      
      const pool = getPool();
      
      // Check if team exists
      const existingTeam = await pool.query('SELECT id FROM teams WHERE id = $1', [id]);
      
      if (existingTeam.rows.length === 0) {
        return reply.code(404).send({ error: 'Team not found' });
      }
      
      // Begin transaction
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Remove team associations from users
        await client.query(`
          UPDATE users SET team_id = NULL
          WHERE team_id = $1
        `, [id]);
        
        // Delete team from team_battles
        await client.query(`
          DELETE FROM team_battles
          WHERE team_id = $1
        `, [id]);
        
        // Delete team strategies
        await client.query(`
          DELETE FROM strategy_points
          WHERE strategy_id IN (
            SELECT id FROM strategies WHERE team_id = $1
          )
        `, [id]);
        
        await client.query(`
          DELETE FROM strategies
          WHERE team_id = $1
        `, [id]);
        
        // Finally delete the team
        await client.query(`
          DELETE FROM teams
          WHERE id = $1
        `, [id]);
        
        await client.query('COMMIT');
        
        return { success: true, message: 'Team deleted successfully' };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      logger.error('Error deleting team', error);
      return reply.code(500).send({ error: 'Failed to delete team' });
    }
  });

  // Get team members
  fastify.get('/:id/members', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const { id } = request.params;
      
      const pool = getPool();
      const result = await pool.query(`
        SELECT id, name, email, role, active, last_login
        FROM users
        WHERE team_id = $1
        ORDER BY role ASC, name ASC
      `, [id]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching team members', error);
      return reply.code(500).send({ error: 'Failed to fetch team members' });
    }
  });

  // Get team battle history
  fastify.get('/:id/battles', async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
    try {
      const { id } = request.params;
      
      const pool = getPool();
      const result = await pool.query(`
        SELECT b.id, b.created_at, b.status, tb.tactical_score,
               (SELECT COUNT(*) FROM team_battles WHERE battle_id = b.id) as team_count
        FROM battles b
        JOIN team_battles tb ON b.id = tb.battle_id
        WHERE tb.team_id = $1
        ORDER BY b.created_at DESC
        LIMIT 20
      `, [id]);
      
      return result.rows;
    } catch (error) {
      logger.error('Error fetching team battles', error);
      return reply.code(500).send({ error: 'Failed to fetch team battle history' });
    }
  });
}
