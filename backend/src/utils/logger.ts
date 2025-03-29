import pino from 'pino';
import { config } from '../config';

const transport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
  },
});

export const logger = pino(
  {
    level: config.LOG_LEVEL,
    base: {
      env: config.NODE_ENV,
      version: process.env.npm_package_version,
    },
    redact: {
      paths: ['password', 'token', 'secret', 'key', '*.password', '*.token', '*.secret', '*.key'],
      censor: '[REDACTED]',
    },
  },
  config.NODE_ENV === 'production' ? undefined : transport
);

// Export a wrapper to ensure consistent logging across the application
export default {
  info: (message: string, data?: any) => {
    logger.info(data || {}, message);
  },
  warn: (message: string, data?: any) => {
    logger.warn(data || {}, message);
  },
  error: (message: string, error?: any) => {
    logger.error(
      {
        err: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          ...error
        } : error
      },
      message
    );
  },
  debug: (message: string, data?: any) => {
    logger.debug(data || {}, message);
  },
};
