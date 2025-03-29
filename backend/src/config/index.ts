import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  // Server configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '8080', 10),
  HOST: process.env.HOST || '0.0.0.0',
  
  // CORS
  CORS_ORIGINS: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tsb',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretkey_changeme_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  
  // Blockchain
  BLOCKCHAIN_RPC: process.env.BLOCKCHAIN_RPC || 'https://rpc.ankr.com/eth',
  ADMIN_WALLET: process.env.ADMIN_WALLET || '',
  
  // IPFS
  IPFS_API_URL: process.env.IPFS_API_URL || 'https://ipfs.infura.io:5001',
  IPFS_API_KEY: process.env.IPFS_API_KEY || '',
  IPFS_API_SECRET: process.env.IPFS_API_SECRET || '',
  
  // Security
  HARDWARE_SECURITY_ENABLED: process.env.HARDWARE_SECURITY_ENABLED === 'true',
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  
  // Railway specific
  RAILWAY_STATIC_URL: process.env.RAILWAY_STATIC_URL || '',
  
  // Misc
  AUTO_BACKUP_ENABLED: process.env.AUTO_BACKUP_ENABLED === 'true',
  AUTO_BACKUP_INTERVAL: parseInt(process.env.AUTO_BACKUP_INTERVAL || '86400', 10), // 24 hours in seconds
};
