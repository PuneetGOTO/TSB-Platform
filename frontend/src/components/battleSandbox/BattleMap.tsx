import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Plane, useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface BattleMapProps {
  mapSize?: number;
  mapTexture?: string;
  heightData?: number[][];
}

const BattleMap = ({
  mapSize = 100,
  mapTexture = '/assets/textures/battleground_map.jpg',
  heightData
}: BattleMapProps) => {
  const mapRef = useRef<THREE.Mesh>(null);
  const { } = useThree();

  // Load textures
  const textures = useTexture({
    map: mapTexture,
    // If textures aren't available, we'll use placeholder colors
    // These would normally be proper textures
    normalMap: '/assets/textures/normal_map.jpg',
    roughnessMap: '/assets/textures/roughness_map.jpg',
    aoMap: '/assets/textures/ao_map.jpg',
  });

  // Create terrain geometry based on height data if provided
  useEffect(() => {
    if (heightData && mapRef.current) {
      const geometry = mapRef.current.geometry as THREE.PlaneGeometry;
      const position = geometry.attributes.position;
      
      // Apply height data to create terrain
      for (let i = 0; i < position.count; i++) {
        const x = Math.floor((i % 100) / 100 * heightData.length);
        const y = Math.floor(Math.floor(i / 100) / 100 * heightData[0].length);
        
        if (heightData[x] && heightData[x][y] !== undefined) {
          // Apply height value to y coordinate
          position.setY(i, heightData[x][y]);
        }
      }
      
      position.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  }, [heightData]);

  useFrame(() => {
    // Add any animations here if needed
  });

  return (
    <group>
      {/* Skybox - would be cubemap texture in production */}
      <color attach="background" args={['#000']} />
      
      {/* Main terrain */}
      <Plane
        ref={mapRef}
        rotation={[-Math.PI / 2, 0, 0]}
        args={[mapSize, mapSize, 99, 99]} // Higher resolution for terrain deformation
        position={[0, -0.5, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          {...textures}
          side={THREE.DoubleSide}
          roughness={0.8}
          metalness={0.2}
          envMapIntensity={0.2}
        />
      </Plane>
      
      {/* Add grid for better spatial reference */}
      <gridHelper args={[mapSize, 50, '#444', '#222']} position={[0, 0.01, 0]} />
      
      {/* Add simple lighting */}
      <directionalLight position={[50, 50, 25]} intensity={0.8} castShadow />
      <hemisphereLight args={['#7ad', '#839', 0.5]} />
    </group>
  );
};

export default BattleMap;
