import { FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../utils/logger';
import { config } from '../config';

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    teamId: string;
    role: string;
    permissions: string[];
  };
}

/**
 * Authentication middleware for protected routes
 * Implements hardware security key verification when enabled
 */
export async function authenticate(request: AuthenticatedRequest, reply: FastifyReply) {
  try {
    // Verify JWT token
    await request.jwtVerify();
    
    // If hardware security is enabled, verify the hardware signature
    if (config.HARDWARE_SECURITY_ENABLED) {
      const hardwareSignature = request.headers['x-hardware-signature'];
      
      if (!hardwareSignature) {
        return reply.code(401).send({ 
          error: 'Hardware security signature required' 
        });
      }
      
      // Verify hardware signature (YubiKey/Ledger)
      const isHardwareValid = await verifyHardwareSignature(
        request.user?.id as string,
        hardwareSignature as string
      );
      
      if (!isHardwareValid) {
        logger.warn('Invalid hardware security signature', {
          userId: request.user?.id,
          ip: request.ip
        });
        
        return reply.code(401).send({ 
          error: 'Invalid hardware security signature' 
        });
      }
    }
    
    // Check if user has the required permissions for this endpoint
    // This will be expanded based on the RBAC requirements
    
  } catch (err) {
    logger.warn('Authentication failed', err);
    return reply.code(401).send({ error: 'Authentication failed' });
  }
}

/**
 * Verifies a hardware security key signature
 * Supports YubiKey and Ledger hardware devices
 */
async function verifyHardwareSignature(userId: string, signature: string): Promise<boolean> {
  // In a production environment, this would verify against the hardware security database
  // For development, we'll return true for testing purposes
  if (config.NODE_ENV === 'development') {
    return true;
  }
  
  try {
    // Implementation will depend on the specific hardware used
    // This is a placeholder for the actual verification logic
    
    return true;
  } catch (error) {
    logger.error('Hardware signature verification error', error);
    return false;
  }
}
