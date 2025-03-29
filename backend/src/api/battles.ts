import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getPool } from '../models/database';
import { getRedisClient, publishMessage } from '../services/redis';
import { logger } from '../utils/logger';
import { verifyBlockchainSignature } from '../services/blockchain';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Validation schemas
const battleSubmissionSchema = z.object({
  teamId: z.string().uuid(),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
  strategyHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  resources: z.number().optional(),
  metadata: z.record(z.unknown()).optional(),
});

// Route handler
export default async function (fastify: FastifyInstance) {
  // Get latest battle data
  fastify.get('/latest', async (request, reply) => {
    try {
      const pool = getPool();
      
      // Get battle metadata
      const battleResult = await pool.query(`
        SELECT id, created_at, status, metadata
        FROM battles
        ORDER BY created_at DESC
        LIMIT 1
      `);
      
      const battle = battleResult.rows[0] || { id: null };
      
      if (!battle.id) {
        return {
          error: 'No battles found',
          heatmap: { points: [] },
          resources: { transfers: [] },
          strategies: []
        };
      }
      
      // Get teams participating in the battle
      const teamsResult = await pool.query(`
        SELECT t.id, t.name, t.color, t.resources, tb.tactical_score
        FROM team_battles tb
        JOIN teams t ON tb.team_id = t.id
        WHERE tb.battle_id = $1
      `, [battle.id]);
      
      // Get heatmap data
      const heatmapResult = await pool.query(`
        SELECT x, z, intensity, type
        FROM battle_heatmap
        WHERE battle_id = $1
      `, [battle.id]);
      
      // Get resource transfers
      const resourcesResult = await pool.query(`
        SELECT from_x, from_z, to_x, to_z, amount, type, progress
        FROM resource_transfers
        WHERE battle_id = $1
      `, [battle.id]);
      
      // Get strategies
      const strategiesResult = await pool.query(`
        SELECT s.id, s.team_id, s.name, t.color, s.active, s.success_rate,
               ARRAY_AGG(json_build_object('x', sp.x, 'z', sp.z, 'timestamp', sp.timestamp) ORDER BY sp.sequence) as path
        FROM strategies s
        JOIN teams t ON s.team_id = t.id
        JOIN strategy_points sp ON s.id = sp.strategy_id
        WHERE s.battle_id = $1
        GROUP BY s.id, s.team_id, s.name, t.color, s.active, s.success_rate
      `, [battle.id]);
      
      // Format response data
      const heatmap = {
        points: heatmapResult.rows.map(point => ({
          x: point.x,
          z: point.z,
          intensity: point.intensity,
          type: point.type
        }))
      };
      
      const resources = {
        transfers: resourcesResult.rows.map(transfer => ({
          from: { x: transfer.from_x, z: transfer.from_z },
          to: { x: transfer.to_x, z: transfer.to_z },
          amount: transfer.amount,
          type: transfer.type,
          progress: transfer.progress
        }))
      };
      
      const strategies = strategiesResult.rows.map(strategy => ({
        id: strategy.id,
        teamId: strategy.team_id,
        name: strategy.name,
        color: strategy.color,
        path: strategy.path,
        active: strategy.active,
        success: strategy.success_rate
      }));
      
      return {
        id: battle.id,
        timestamp: battle.created_at,
        status: battle.status,
        teams: teamsResult.rows,
        heatmap,
        resources,
        strategies,
        metadata: battle.metadata
      };
    } catch (error) {
      logger.error('Error fetching battle data', error);
      return reply.code(500).send({ error: 'Failed to fetch battle data' });
    }
  });

  // Submit new battle data
  fastify.post<{ Body: z.infer<typeof battleSubmissionSchema> }>(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          required: ['teamId', 'coordinates', 'strategyHash'],
          properties: {
            teamId: { type: 'string', format: 'uuid' },
            coordinates: {
              type: 'array',
              items: {
                type: 'array',
                minItems: 2,
                maxItems: 2,
                items: { type: 'number' }
              }
            },
            strategyHash: { type: 'string', pattern: '^0x[a-fA-F0-9]{64}$' },
            resources: { type: 'number' },
            metadata: { type: 'object' }
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const { teamId, coordinates, strategyHash, resources, metadata } = battleSubmissionSchema.parse(request.body);
        
        // Verify blockchain signature
        const isValid = await verifyBlockchainSignature(
          strategyHash,
          coordinates.toString()
        );
        
        if (!isValid) {
          logger.warn('Invalid strategy signature', { teamId, strategyHash });
          return reply.code(400).send({ error: '策略签名无效' });
        }
        
        const pool = getPool();
        
        // Transaction to ensure data consistency
        const client = await pool.connect();
        
        try {
          await client.query('BEGIN');
          
          // Create new battle if this is the first submission
          const battleResult = await client.query(`
            INSERT INTO battles (status, metadata)
            VALUES ('active', $1)
            RETURNING id
          `, [metadata || {}]);
          
          const battleId = battleResult.rows[0].id;
          
          // Add team to battle
          await client.query(`
            INSERT INTO team_battles (battle_id, team_id, tactical_score)
            VALUES ($1, $2, $3)
          `, [battleId, teamId, Math.random() * 100]); // Random score for demonstration
          
          // Process coordinates as strategy points
          const strategyId = uuidv4();
          await client.query(`
            INSERT INTO strategies (id, battle_id, team_id, name, active, success_rate)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [strategyId, battleId, teamId, '新战术', true, Math.random()]);
          
          // Insert strategy points
          for (let i = 0; i < coordinates.length; i++) {
            await client.query(`
              INSERT INTO strategy_points (strategy_id, sequence, x, z, timestamp)
              VALUES ($1, $2, $3, $4, $5)
            `, [strategyId, i, coordinates[i][0], coordinates[i][1], new Date()]);
          }
          
          // Generate heatmap points
          for (let i = 0; i < Math.min(coordinates.length, 5); i++) {
            await client.query(`
              INSERT INTO battle_heatmap (battle_id, x, z, intensity, type)
              VALUES ($1, $2, $3, $4, $5)
            `, [
              battleId,
              coordinates[i][0],
              coordinates[i][1],
              Math.random(),
              ['combat', 'resource', 'movement', 'event'][Math.floor(Math.random() * 4)]
            ]);
          }
          
          // Create resource transfer if resources specified
          if (resources && resources > 0) {
            const startPoint = coordinates[0];
            const endPoint = coordinates[coordinates.length - 1];
            
            await client.query(`
              INSERT INTO resource_transfers (battle_id, from_x, from_z, to_x, to_z, amount, type, progress)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `, [
              battleId,
              startPoint[0],
              startPoint[1],
              endPoint[0],
              endPoint[1],
              resources,
              ['energy', 'materials', 'intel', 'troops'][Math.floor(Math.random() * 4)],
              Math.random()
            ]);
          }
          
          await client.query('COMMIT');
          
          // Publish update to Redis for real-time notifications
          await publishMessage('battle-updates', JSON.stringify({
            battleId,
            teamId,
            timestamp: new Date().toISOString(),
            type: 'new-strategy',
            data: { strategyId }
          }));
          
          // Write to blockchain (async)
          const txHash = await writeToBlockchain({
            battleId,
            teamId,
            timestamp: new Date().toISOString(),
            strategyHash
          });
          
          return { 
            success: true, 
            battleId, 
            txHash 
          };
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        } finally {
          client.release();
        }
      } catch (error) {
        logger.error('Battle submission error', error);
        return reply.code(400).send({ error: 'Invalid battle submission' });
      }
    }
  );

  // Battle events stream (SSE)
  fastify.get('/events', (request, reply) => {
    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    // Send initial connection message
    reply.raw.write(`data: ${JSON.stringify({ connected: true })}\n\n`);
    
    // Subscribe to battle updates
    const redis = getRedisClient();
    const subscriber = redis.duplicate();
    
    subscriber.subscribe('battle-updates', (err) => {
      if (err) {
        logger.error('Redis subscription error', err);
        reply.raw.end();
        return;
      }
      
      // Handle incoming messages
      subscriber.on('message', (channel, message) => {
        reply.raw.write(`data: ${message}\n\n`);
      });
    });
    
    // Handle client disconnect
    request.raw.on('close', () => {
      subscriber.unsubscribe();
      subscriber.quit();
    });
  });
}

// Placeholder for blockchain integration
async function writeToBlockchain(record: any): Promise<string> {
  // In a production environment, this would write to the actual blockchain
  // For development, we'll return a mock transaction hash
  
  logger.info('Writing to blockchain', record);
  
  // Simulate blockchain delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return `0x${Math.random().toString(16).substr(2, 64)}`;
}
