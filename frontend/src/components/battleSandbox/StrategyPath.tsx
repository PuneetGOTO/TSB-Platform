import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Line, Sphere } from '@react-three/drei';

interface PathPoint {
  x: number;
  z: number;
  timestamp: number;
}

interface Strategy {
  id: string;
  teamId: string;
  name: string;
  color: string;
  path: PathPoint[];
  active: boolean;
  success?: number; // 0-1 success rate
}

interface StrategyPathProps {
  data?: {
    strategies: Strategy[];
  };
  height?: number;
  animation?: {
    speed: number;
    trail: number; // Length of trail, 0-1
  };
}

const StrategyPath = ({ 
  data,
  height = 0.3,
  animation = { speed: 0.5, trail: 0.7 }
}: StrategyPathProps) => {
  const markerRef = useRef<THREE.Group>(null);
  const animationProgressRef = useRef<number[]>([]);
  
  // Initialize animation progress for each strategy
  useEffect(() => {
    if (data?.strategies) {
      animationProgressRef.current = data.strategies.map(() => 0);
    }
  }, [data?.strategies?.length]);
  
  // Generate strategy paths
  const strategyLines = useMemo(() => {
    if (!data?.strategies) return [];
    
    return data.strategies.map((strategy) => {
      // Prepare path points for line
      const points = strategy.path.map(point => 
        new THREE.Vector3(point.x, height, point.z)
      );
      
      // Set color based on team with opacity based on success rate
      const color = new THREE.Color(strategy.color || '#ffffff');
      const opacity = strategy.active ? 0.9 : 0.4;
      
      // Line width based on importance
      const lineWidth = strategy.active ? 2 : 1;
      
      return {
        id: strategy.id,
        points,
        color,
        opacity,
        dashed: !strategy.active,
        lineWidth,
        success: strategy.success || 0.5
      };
    });
  }, [data, height]);
  
  // Animate the strategy paths
  useFrame((state, delta) => {
    if (!data?.strategies || !markerRef.current) return;
    
    // Update animation progress for each strategy
    data.strategies.forEach((strategy) => {
      if (!strategy.active) return;
      
      // Increment progress
      const index = data.strategies.indexOf(strategy);
      animationProgressRef.current[index] += delta * animation.speed;
      if (animationProgressRef.current[index] > 1) {
        animationProgressRef.current[index] = 0;
      }
      
      // Update marker positions based on progress
      const markerGroup = markerRef.current?.children[index];
      if (markerGroup) {
        const progress = animationProgressRef.current[index];
        const pathPoints = strategy.path;
        
        if (pathPoints.length < 2) return;
        
        // Calculate position along the path
        const pathIndex = Math.floor(progress * (pathPoints.length - 1));
        const nextIndex = Math.min(pathIndex + 1, pathPoints.length - 1);
        const subProgress = (progress * (pathPoints.length - 1)) % 1;
        
        const point1 = new THREE.Vector3(
          pathPoints[pathIndex].x,
          height,
          pathPoints[pathIndex].z
        );
        const point2 = new THREE.Vector3(
          pathPoints[nextIndex].x,
          height,
          pathPoints[nextIndex].z
        );
        
        // Interpolate between points
        const position = point1.clone().lerp(point2, subProgress);
        markerGroup.position.copy(position);
        
        // Calculate direction for arrow rotation
        if (nextIndex > pathIndex) {
          const direction = point2.clone().sub(point1).normalize();
          if (direction.length() > 0) {
            const angle = Math.atan2(direction.x, direction.z);
            markerGroup.rotation.y = angle;
          }
        }
        
        // Update pulse scale
        const pulse = markerGroup.children[0];
        if (pulse) {
          const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.2;
          pulse.scale.set(scale, scale, scale);
        }
      }
    });
  });
  
  if (!data?.strategies || strategyLines.length === 0) return null;
  
  return (
    <group>
      {/* Strategy Path Lines */}
      {strategyLines.map((line) => (
        <group key={line.id}>
          <Line
            points={line.points}
            color={line.color}
            lineWidth={line.lineWidth}
            opacity={line.opacity}
            transparent
            dashed={line.dashed}
          />
          
          {/* Add key waypoints along path */}
          {line.points.filter((_, i) => i % 5 === 0 || i === line.points.length - 1).map((point, i) => (
            <Sphere key={i} args={[0.2, 8, 8]} position={point}>
              <meshBasicMaterial 
                color={line.color} 
                transparent 
                opacity={0.7}
              />
            </Sphere>
          ))}
        </group>
      ))}
      
      {/* Animated markers for active strategies */}
      <group ref={markerRef}>
        {data.strategies.map((strategy) => (
          <group key={strategy.id} visible={strategy.active}>
            {/* Pulsing effect for marker */}
            <mesh>
              <sphereGeometry args={[0.4, 16, 16]} />
              <meshBasicMaterial 
                color={strategy.color} 
                transparent 
                opacity={0.5}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
            
            {/* Direction arrow */}
            <mesh position={[0, 0.1, 0]}>
              <coneGeometry args={[0.3, 0.8, 8]} />
              <meshBasicMaterial color={strategy.color} />
            </mesh>
            
            {/* Success indicator ring */}
            <mesh rotation={[Math.PI/2, 0, 0]}>
              <ringGeometry args={[0.5, 0.6, 32]} />
              <meshBasicMaterial 
                color={strategy.success && strategy.success > 0.6 ? '#44ff44' : strategy.success && strategy.success > 0.3 ? '#ffcc00' : '#ff4444'} 
                transparent 
                opacity={0.8}
              />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};

export default StrategyPath;
