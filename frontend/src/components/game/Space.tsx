import { useRef } from 'react';
import { useLoader } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import type { SpaceLevel } from '../../store/gameStore';

interface SpaceProps {
    position: [number, number, number];
    color: string;
    name: string;
    isCorner: boolean;
    price?: number;
    level?: SpaceLevel;
    isImportant?: boolean;
    ownerColor?: string | null;
    imageUrl?: string;
}

export const Space: React.FC<SpaceProps> = ({ position, color, name, isCorner, price, ownerColor, imageUrl }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const texture = imageUrl ? useLoader(THREE.TextureLoader, imageUrl) : null;

    const width = 2;
    const depth = 2;
    const height = isCorner ? 0.6 : 0.5;

    return (
        <group position={position}>
            {/* The Block */}
            <mesh ref={meshRef} receiveShadow>
                <boxGeometry args={[width * 0.95, height, depth * 0.95]} />
                <meshStandardMaterial color={ownerColor || "#1e293b"} />
            </mesh>
            
            {/* Color Strip (Top) */}
            {!isCorner && (
                <mesh position={[0, height / 2 + 0.001, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[width * 0.95, 0.4]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )}

            {/* Logo Texture */}
            {texture && (
                <mesh position={[0, height / 2 + 0.01, 0]} rotation={[-Math.PI / 2, 0, Math.PI]}>
                    <planeGeometry args={[1.2, 1.2]} />
                    <meshBasicMaterial map={texture} transparent />
                </mesh>
            )}

            {/* Corner Text/Name if no logo */}
            {(!texture || isCorner) && (
                <Text
                    position={[0, height / 2 + 0.02, isCorner ? 0 : 0]}
                    rotation={[-Math.PI / 2, 0, Math.PI]}
                    fontSize={isCorner ? 0.3 : 0.25}
                    color="white"
                    maxWidth={1.8}
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    fontWeight="bold"
                >
                    {name}
                </Text>
            )}

            {/* Price */}
            {price !== undefined && (
                <Text
                    position={[0, height / 2 + 0.02, 0.7]}
                    rotation={[-Math.PI / 2, 0, Math.PI]}
                    fontSize={0.2}
                    color="rgba(255,255,255,0.8)"
                    anchorX="center"
                    anchorY="middle"
                >
                    {ownerColor ? `Rent: $${Math.floor(price * 0.5)}` : `$${price}`}
                </Text>
            )}

             {/* Owner Indicator badge */}
             {ownerColor && (
                <mesh position={[0.7, height / 2 + 0.05, -0.7]} rotation={[-Math.PI / 2, 0, 0]}>
                    <circleGeometry args={[0.2, 32]} />
                    <meshStandardMaterial color={ownerColor} emissive={ownerColor} emissiveIntensity={0.8} />
                </mesh>
            )}
        </group>
    );
};
