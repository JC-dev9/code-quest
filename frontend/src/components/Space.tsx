import { useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface SpaceProps {
    position: [number, number, number];
    color: string;
    name: string;
    isCorner: boolean;
}

export const Space: React.FC<SpaceProps> = ({ position, color, name, isCorner }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    // Size: Corners slightly larger? No, keep uniform for simplicity or just visual.
    // Standard tile is 2x2. Height 0.5.
    const width = 2;
    const depth = 2;
    const height = isCorner ? 0.6 : 0.5;

    return (
        <group position={position}>
            {/* The Block */}
            <mesh ref={meshRef} receiveShadow>
                <boxGeometry args={[width * 0.95, height, depth * 0.95]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Label - facing up */}
            <Text
                position={[0, height / 2 + 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]} // Face up
                fontSize={0.3}
                color="white"
                maxWidth={1.8}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>
        </group>
    );
};
