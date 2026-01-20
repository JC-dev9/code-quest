import { useRef } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface SpaceProps {
    position: [number, number, number];
    color: string;
    name: string;
    isCorner: boolean;
    price?: number;
    rent?: number;
    level?: number;
    ownerColor?: string | null;
}

export const Space: React.FC<SpaceProps> = ({ position, color, name, isCorner, price, rent, level, ownerColor }) => {
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
            {(price !== undefined || rent !== undefined) && (
                <Text
                    position={[0, height / 2 + 0.02, 0.4]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.2}
                    color="rgba(255,255,255,0.8)"
                    anchorX="center"
                    anchorY="middle"
                >
                    {ownerColor ? `Rent: $${(rent || 0) * (level || 1)}` : `$${price}`}
                </Text>
            )}

            {/* Level Indicator */}
            {level !== undefined && level > 1 && (
                <Text
                    position={[0, height / 2 + 0.02, 0.7]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={0.15}
                    color="#FFD700"
                    anchorX="center"
                    anchorY="middle"
                >
                    Lvl {level}
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
