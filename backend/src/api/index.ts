import { FastifyInstance } from 'fastify';
import authRoutes from './auth';
import teamRoutes from './teams';
import battleRoutes from './battles';
import strategiesRoutes from './strategies';
import liveStreamRoutes from './livestreams';
import arRoutes from './ar-experience';
import blockchainRoutes from './blockchain';
import { authenticate } from '../middleware/auth';

/**
 * Registers all API routes with the Fastify instance
 */
export function registerRoutes(server: FastifyInstance) {
  // Public routes
  server.register(authRoutes, { prefix: '/api/auth' });
  
  // Protected routes
  server.register(async (instance) => {
    // Apply authentication middleware to all routes in this scope
    instance.addHook('onRequest', authenticate);
    
    // Register protected route groups
    instance.register(teamRoutes, { prefix: '/api/teams' });
    instance.register(battleRoutes, { prefix: '/api/battles' });
    instance.register(strategiesRoutes, { prefix: '/api/strategies' });
    instance.register(liveStreamRoutes, { prefix: '/api/livestreams' });
    instance.register(arRoutes, { prefix: '/api/ar' });
    instance.register(blockchainRoutes, { prefix: '/api/blockchain' });
  });
}
