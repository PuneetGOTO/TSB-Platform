import fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import websocket from '@fastify/websocket';
import { config } from './config';
import { logger } from './utils/logger';
import { registerRoutes } from './api';
import { connectDatabase } from './models/database';
import { connectRedis } from './services/redis';

const server = fastify({
  logger: logger,
  trustProxy: true
});

// Register plugins
async function setupServer() {
  // CORS
  await server.register(cors, {
    origin: config.CORS_ORIGINS,
    credentials: true
  });

  // Rate limiting
  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });

  // JWT
  await server.register(jwt, {
    secret: config.JWT_SECRET
  });

  // WebSocket
  await server.register(websocket);

  // Swagger documentation
  await server.register(swagger, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        title: 'TSB Platform API',
        description: 'API documentation for The Strongest Battlegrounds platform',
        version: '1.0.0'
      },
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header'
        }
      }
    },
    exposeRoute: true
  });

  // Connect to database and Redis
  await connectDatabase();
  await connectRedis();

  // Register API routes
  registerRoutes(server);

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return server;
}

// Start the server
async function start() {
  try {
    const app = await setupServer();
    await app.listen({ 
      port: config.PORT, 
      host: config.HOST 
    });
    logger.info(`Server running at http://${config.HOST}:${config.PORT}`);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(err);
  process.exit(1);
});

// Start server if not imported
if (require.main === module) {
  start();
}

export { setupServer };
