import { useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { SpaceLevel } from '../store/gameStore';

interface SpaceProps {
    position: [number, number, number];
    color: string;
    name: string;
    isCorner: boolean;
    price?: number;
    level?: SpaceLevel;
    isImportant?: boolean;
    ownerColor?: string | null;
}

export const Space: React.FC<SpaceProps> = ({ position, color, name, isCorner, price, level, isImportant, ownerColor }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    const width = 2;
    const depth = 2;
    const height = isCorner ? 0.6 : 0.5;

    return (
        <group position={position}>
            {/* The Block */}
            <mesh ref={meshRef} receiveShadow>
                <boxGeometry args={[width * 0.95, height, depth * 0.95]} />
                <meshStandardMaterial color={ownerColor || color} />
            </mesh>

            {/* Label - facing up */}
            <Text
                position={[0, height / 2 + 0.02, -0.2]}
                rotation={[-Math.PI / 2, 0, 0]} // Face up
                fontSize={0.25}
                color="white"
                maxWidth={1.8}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                fontWeight="bold"
            >
                {name}
            </Text>

            {/* Price or Rent */}
            {price !== undefined && (
                <Text
                    position={[0, height / 2 + 0.02, 0.4]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.2}
                    color="rgba(255,255,255,0.8)"
                    anchorX="center"
                    anchorY="middle"
                >
                    {ownerColor ? `Rent: $${Math.floor(price * 0.5)}` : `$${price}`}
                </Text>
            )}

            {/* Level Indicator */}
            {level && level !== 'Corner' && (
                <Text
                    position={[0, height / 2 + 0.02, 0.7]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.15}
                    color={isImportant ? "#FFD700" : "white"}
                    anchorX="center"
                    anchorY="middle"
                >
                    {level} {isImportant ? '★' : ''}
                </Text>
            )}

            {/* Owner Indicator badge */}
            {ownerColor && (
                <mesh position={[0.7, height / 2 + 0.03, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.15, 32]} />
                    <meshStandardMaterial color={ownerColor} emissive={ownerColor} emissiveIntensity={0.5} />
                </mesh>
            )}
        </group>
    );
};
