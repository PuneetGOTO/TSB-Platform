import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ResourceTransfer {
  from: { x: number; z: number };
  to: { x: number; z: number };
  amount: number; // 0-100 value representing resource amount
  type: 'energy' | 'materials' | 'intel' | 'troops';
  progress?: number; // 0-1 value representing transfer progress
}

interface ResourceFlowProps {
  data?: {
    transfers: ResourceTransfer[];
  };
  height?: number;
}

const ResourceFlow = ({ data, height = 1 }: ResourceFlowProps) => {
  const particlesRef = useRef<THREE.Points>(null);
  const transfersRef = useRef<ResourceTransfer[]>([]);
  
  // Update transfers reference when data changes
  if (data?.transfers) {
    transfersRef.current = data.transfers;
  }
  
  // Generate particles for resource flows
  const { positions, colors, sizes } = useMemo(() => {
    // Default empty arrays
    const positions = new Float32Array(3000);
    const colors = new Float32Array(3000);
    const sizes = new Float32Array(1000);
    
    if (!data?.transfers) return { positions, colors, sizes };
    
    // Create particles for each transfer
    let particleIndex = 0;
    data.transfers.forEach((transfer) => {
      const particleCount = Math.min(Math.ceil(transfer.amount / 2), 100);
      
      // Calculate vectors for directional flow
      const start = new THREE.Vector3(transfer.from.x, height, transfer.from.z);
      const end = new THREE.Vector3(transfer.to.x, height, transfer.to.z);
      const direction = end.clone().sub(start).normalize();
      const length = start.distanceTo(end);
      
      // Get color based on resource type
      const color = new THREE.Color();
      switch (transfer.type) {
        case 'energy':
          color.set('#ffcc00'); // Yellow
          break;
        case 'materials':
          color.set('#44bb44'); // Green
          break;
        case 'intel':
          color.set('#4444ff'); // Blue
          break;
        case 'troops':
          color.set('#ff4444'); // Red
          break;
        default:
          color.set('#ffffff'); // White
      }
      
      // Generate particles along the path
      for (let i = 0; i < particleCount; i++) {
        // Distribute particles along path based on progress
        const progress = transfer.progress || Math.random();
        const offset = i / particleCount * length * progress;
        
        // Add some randomness to particle positions
        const randomOffset = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 2
        );
        
        // Calculate position
        const pos = start.clone().add(
          direction.clone().multiplyScalar(offset)
        ).add(randomOffset.multiplyScalar(0.5));
        
        // Set particle data
        const idx = particleIndex * 3;
        positions[idx] = pos.x;
        positions[idx + 1] = pos.y;
        positions[idx + 2] = pos.z;
        
        colors[idx] = color.r;
        colors[idx + 1] = color.g;
        colors[idx + 2] = color.b;
        
        // Set size based on resource amount
        sizes[particleIndex] = Math.min(transfer.amount / 20, 1) + 0.5;
        
        particleIndex++;
        if (particleIndex >= 1000) break; // Limit total particles
      }
    });
    
    return { positions, colors, sizes };
  }, [data, height]);
  
  // Animate particles
  useFrame((state, delta) => {
    if (!particlesRef.current || !data?.transfers) return;
    
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    
    // Update each particle
    let particleIndex = 0;
    data.transfers.forEach((transfer) => {
      const particleCount = Math.min(Math.ceil(transfer.amount / 2), 100);
      
      // Skip if not enough particles
      if (particleIndex + particleCount >= 1000) return;
      
      // Calculate vectors for flow
      const start = new THREE.Vector3(transfer.from.x, height, transfer.from.z);
      const end = new THREE.Vector3(transfer.to.x, height, transfer.to.z);
      const direction = end.clone().sub(start).normalize();
      const length = start.distanceTo(end);
      
      // Update particles for this transfer
      for (let i = 0; i < particleCount; i++) {
        const idx = particleIndex * 3;
        
        // Get current position
        const pos = new THREE.Vector3(
          positions[idx],
          positions[idx + 1],
          positions[idx + 2]
        );
        
        // Move along path
        pos.add(direction.clone().multiplyScalar(delta * 5));
        
        // Check if particle reached destination
        const distanceFromStart = start.distanceTo(pos);
        if (distanceFromStart > length) {
          // Reset to start with some randomness
          const randomOffset = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
          );
          
          pos.copy(start).add(randomOffset.multiplyScalar(0.5));
        }
        
        // Update position
        positions[idx] = pos.x;
        positions[idx + 1] = pos.y;
        positions[idx + 2] = pos.z;
        
        particleIndex++;
      }
    });
    
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });
  
  if (!data?.transfers || data.transfers.length === 0) return null;
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={colors.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={sizes.length}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={1}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
};

export default ResourceFlow;
