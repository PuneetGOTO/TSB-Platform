import axios from 'axios';
import { API_BASE_URL } from '../config';

// Types for battle data
export interface HeatPoint {
  x: number;
  z: number;
  intensity: number;
  type: 'combat' | 'resource' | 'movement' | 'event';
}

export interface ResourceTransfer {
  from: { x: number; z: number };
  to: { x: number; z: number };
  amount: number;
  type: 'energy' | 'materials' | 'intel' | 'troops';
  progress?: number;
}

export interface PathPoint {
  x: number;
  z: number;
  timestamp: number;
}

export interface Strategy {
  id: string;
  teamId: string;
  name: string;
  color: string;
  path: PathPoint[];
  active: boolean;
  success?: number;
}

export interface Team {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number };
  resources: number;
  tacticalScore: number;
}

export interface BattleData {
  id: string;
  timestamp: string;
  status: 'pending' | 'active' | 'completed';
  teams: Team[];
  heatmap: {
    points: HeatPoint[];
  };
  resources: {
    transfers: ResourceTransfer[];
  };
  strategies: Strategy[];
  metadata?: Record<string, any>;
}

// Battle event subscription
type BattleEventCallback = (event: any) => void;
let eventSource: EventSource | null = null;
const eventCallbacks: BattleEventCallback[] = [];

/**
 * Battle service for interacting with battle data
 */
const battleService = {
  /**
   * Get the latest battle data
   */
  getLatestBattle: async (): Promise<BattleData> => {
    try {
      const response = await axios.get<BattleData>(`${API_BASE_URL}/api/battles/latest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest battle data:', error);
      throw error;
    }
  },

  /**
   * Submit new battle strategy
   */
  submitStrategy: async (data: {
    teamId: string;
    coordinates: [number, number][];
    strategyHash: string;
    resources?: number;
    metadata?: Record<string, any>;
  }): Promise<{ success: boolean; battleId: string; txHash: string }> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/battles`, data);
      return response.data;
    } catch (error) {
      console.error('Error submitting battle strategy:', error);
      throw error;
    }
  },

  /**
   * Subscribe to battle events using Server-Sent Events
   */
  subscribeToBattleEvents: (callback: BattleEventCallback): () => void => {
    // Add the callback to our array
    eventCallbacks.push(callback);
    
    // Set up the event source if it doesn't exist yet
    if (!eventSource) {
      eventSource = new EventSource(`${API_BASE_URL}/api/battles/events`);
      
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          // Notify all registered callbacks
          eventCallbacks.forEach(cb => cb(data));
        } catch (error) {
          console.error('Error parsing battle event:', error);
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('Battle event stream error:', error);
        // Try to reconnect after a delay
        if (eventSource) {
          eventSource.close();
          eventSource = null;
          
          setTimeout(() => {
            if (eventCallbacks.length > 0) {
              battleService.subscribeToBattleEvents(() => {}); // Reinitialize connection
            }
          }, 5000);
        }
      };
    }
    
    // Return unsubscribe function
    return () => {
      const index = eventCallbacks.indexOf(callback);
      if (index !== -1) {
        eventCallbacks.splice(index, 1);
      }
      
      // Close the event source if no callbacks remain
      if (eventCallbacks.length === 0 && eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  },

  /**
   * Generate a random strategy hash for development purposes
   */
  generateStrategyHash: (): string => {
    // In a real implementation, this would be a cryptographic hash
    // For development, we'll just generate a random hex string
    return '0x' + Array.from({ length: 64 })
      .map(() => Math.floor(Math.random() * 16).toString(16))
      .join('');
  },

  /**
   * Generate random battle data for development and testing
   */
  generateRandomBattleData: (): BattleData => {
    // Generate random teams
    const teams: Team[] = Array.from({ length: 4 }).map((_, i) => ({
      id: `team-${i + 1}`,
      name: `Team ${i + 1}`,
      color: ['#ff4444', '#44ff44', '#4444ff', '#ffcc00'][i],
      position: { x: (Math.random() * 80) - 40, y: (Math.random() * 80) - 40 },
      resources: Math.floor(Math.random() * 1000),
      tacticalScore: Math.floor(Math.random() * 100)
    }));
    
    // Generate heatmap points
    const heatmapPoints: HeatPoint[] = Array.from({ length: 20 }).map(() => ({
      x: (Math.random() * 80) - 40,
      z: (Math.random() * 80) - 40,
      intensity: Math.random(),
      type: ['combat', 'resource', 'movement', 'event'][Math.floor(Math.random() * 4)] as any
    }));
    
    // Generate resource transfers
    const resourceTransfers: ResourceTransfer[] = teams.map(team => ({
      from: { x: team.position.x, z: team.position.y },
      to: { 
        x: (Math.random() * 80) - 40, 
        z: (Math.random() * 80) - 40 
      },
      amount: Math.floor(Math.random() * 50) + 10,
      type: ['energy', 'materials', 'intel', 'troops'][Math.floor(Math.random() * 4)] as any,
      progress: Math.random()
    }));
    
    // Generate strategies
    const strategies: Strategy[] = teams.map(team => {
      // Generate random path
      const pathPoints: PathPoint[] = Array.from({ length: 10 }).map((_, i) => ({
        x: team.position.x + (Math.random() * 40) - 20,
        z: team.position.y + (Math.random() * 40) - 20,
        timestamp: Date.now() - (i * 60000) // Timestamps in reverse order
      }));
      
      return {
        id: `strategy-${team.id}`,
        teamId: team.id,
        name: `${team.name} Strategy`,
        color: team.color,
        path: pathPoints,
        active: Math.random() > 0.3, // 70% chance of being active
        success: Math.random()
      };
    });
    
    return {
      id: `battle-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'active',
      teams,
      heatmap: { points: heatmapPoints },
      resources: { transfers: resourceTransfers },
      strategies
    };
  }
};

export default battleService;
