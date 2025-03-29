import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

interface TeamBaseProps {
  position: THREE.Vector3;
  team: {
    id: string;
    name: string;
    color: string;
    resources: number;
    tacticalScore: number;
    logoUrl?: string;
  };
  isSelected?: boolean;
  onClick?: () => void;
}

const TeamBase = ({ position, team, isSelected = false, onClick }: TeamBaseProps) => {
  const baseRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Optional: Load 3D model for team base
  // In production, we'd use different models based on team type/level
  const { scene: baseModel } = useGLTF('/assets/models/base.glb', true);
  
  // Animation effects
  useEffect(() => {
    if (baseRef.current) {
      // Animate on selection
      if (isSelected) {
        gsap.to(baseRef.current.position, {
          y: 0.5,
          duration: 0.5,
          ease: 'elastic.out(1, 0.5)'
        });
        
        gsap.to(baseRef.current.scale, {
          x: 1.2,
          y: 1.2,
          z: 1.2,
          duration: 0.5,
          ease: 'back.out(1.5)'
        });
      } else {
        gsap.to(baseRef.current.position, {
          y: 0,
          duration: 0.3,
          ease: 'power2.out'
        });
        
        gsap.to(baseRef.current.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  }, [isSelected]);
  
  // Glow pulse animation
  useFrame((state, delta) => {
    if (glowRef.current) {
      // Pulse effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      glowRef.current.scale.set(scale, scale, scale);
      
      // Rotate slowly
      baseRef.current?.rotateY(delta * 0.3);
    }
  });
  
  // Color conversions
  const teamColor = new THREE.Color(team.color || '#1e88e5');
  const glowColor = teamColor.clone().multiplyScalar(1.5);
  
  return (
    <group
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Base Platform */}
      <mesh receiveShadow castShadow position={[0, -0.25, 0]}>
        <cylinderGeometry args={[2, 2.2, 0.5, 32]} />
        <meshStandardMaterial color={teamColor} metalness={0.7} roughness={0.2} />
      </mesh>
      
      {/* Team base model/structure */}
      <group ref={baseRef} position={[0, 0, 0]}>
        {baseModel ? (
          <primitive object={baseModel.clone()} scale={[0.5, 0.5, 0.5]} position={[0, 0, 0]} />
        ) : (
          // Fallback if model not loaded
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 2, 1.5]} />
            <meshStandardMaterial color={teamColor} metalness={0.5} roughness={0.5} />
          </mesh>
        )}
        
        {/* Energy core/center */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.5, 16, 16]} />
          <meshStandardMaterial 
            color={teamColor}
            emissive={teamColor} 
            emissiveIntensity={2} 
            toneMapped={false}
          />
        </mesh>
        
        {/* Glow effect */}
        <mesh ref={glowRef} position={[0, 1, 0]}>
          <sphereGeometry args={[0.7, 16, 16]} />
          <meshBasicMaterial 
            color={glowColor} 
            transparent={true} 
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
        
        {/* Resource indicators */}
        <group position={[0, 2.5, 0]}>
          {Array(Math.min(5, Math.ceil(team.resources / 20)))
            .fill(0)
            .map((_, i) => (
              <mesh key={i} position={[i * 0.3 - 0.6, 0, 0]}>
                <boxGeometry args={[0.1, 0.1 + i * 0.1, 0.1]} />
                <meshBasicMaterial color={teamColor} />
              </mesh>
            ))}
        </group>
      </group>
      
      {/* Team name label */}
      <Text
        position={[0, -1, 0]}
        color="white"
        fontSize={0.5}
        maxWidth={10}
        textAlign="center"
        anchorY="bottom"
      >
        {team.name}
      </Text>
      
      {/* Info popup on hover */}
      {(hovered || isSelected) && (
        <Html position={[0, 3, 0]} center distanceFactor={10}>
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              width: '150px',
              textAlign: 'center',
              pointerEvents: 'none',
              transform: 'translate3d(-50%, -50%, 0)',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{team.name}</div>
            <div>资源: {team.resources}</div>
            <div>战术评分: {team.tacticalScore}</div>
          </div>
        </Html>
      )}
    </group>
  );
};

export default TeamBase;
