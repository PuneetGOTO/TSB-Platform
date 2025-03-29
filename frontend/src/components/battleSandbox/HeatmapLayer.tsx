import { useRef, useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface HeatPoint {
  x: number;
  z: number;
  intensity: number; // 0-1 value
  type: 'combat' | 'resource' | 'movement' | 'event';
}

interface HeatmapLayerProps {
  data?: {
    points: HeatPoint[];
    maxIntensity?: number;
  };
  resolution?: number;
  height?: number;
  opacity?: number;
}

const HeatmapLayer = ({
  data,
  resolution = 256,
  height = 0.1,
  opacity = 0.7,
}: HeatmapLayerProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { scene } = useThree();
  
  // Create heatmap texture
  useEffect(() => {
    if (!data?.points || !meshRef.current) return;
    
    // Create canvas for heatmap
    const canvas = document.createElement('canvas');
    canvas.width = resolution;
    canvas.height = resolution;
    const ctx = canvas.getContext('2d')!;
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, resolution, resolution);
    
    // Draw heat points
    data.points.forEach((point) => {
      // Map coordinates to canvas space
      const x = ((point.x + 50) / 100) * resolution; // Assuming map is 100x100 centered at origin
      const y = ((point.z + 50) / 100) * resolution;
      
      // Calculate radius based on intensity
      const radius = point.intensity * 25; // Max radius of 25px
      
      // Set color based on type
      let color: string;
      switch (point.type) {
        case 'combat':
          color = 'rgba(255, 0, 0, 1)'; // Red for combat
          break;
        case 'resource':
          color = 'rgba(0, 255, 0, 1)'; // Green for resources
          break;
        case 'movement':
          color = 'rgba(0, 0, 255, 1)'; // Blue for movement
          break;
        case 'event':
          color = 'rgba(255, 255, 0, 1)'; // Yellow for events
          break;
        default:
          color = 'rgba(255, 255, 255, 1)';
      }
      
      // Create radial gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.globalCompositeOperation = 'lighter';
      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.fill();
    });
    
    // Apply the canvas as a texture
    const texture = new THREE.CanvasTexture(canvas);
    
    if (meshRef.current.material) {
      (meshRef.current.material as THREE.MeshBasicMaterial).map = texture;
      (meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
  }, [data, resolution]);
  
  if (!data?.points || data.points.length === 0) return null;
  
  return (
    <mesh 
      ref={meshRef} 
      position={[0, height, 0]} 
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[100, 100, 1, 1]} />
      <meshBasicMaterial 
        transparent={true} 
        opacity={opacity}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
};

export default HeatmapLayer;
