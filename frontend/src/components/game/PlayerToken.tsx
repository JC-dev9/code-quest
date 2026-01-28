import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

interface PlayerProps {
    id: number;
}

export const PlayerToken: React.FC<PlayerProps> = ({ id }) => {
    const player = useGameStore((state) => state.players.find(p => p.id === id));
    const meshRef = useRef<THREE.Mesh>(null);

    // Helper to get 3D pos from board index (reusing logic or passing it in?)
    // Ideally, Board should export this or we calculate it here.
    // Let's duplicate the calc for MVP simplicity or move to utils.
    // For now, duplicate logic from Board loop.
    const getPosition = (index: number): [number, number, number] => {
        let x = 0, z = 0;
        // Normalized for 0-39
        const i = index % 40;

        if (i <= 10) { // Bottom
            x = 10 - i * 2;
            z = 10;
        } else if (i <= 20) { // Left
            x = -10;
            z = 10 - (i - 10) * 2;
        } else if (i <= 30) { // Top
            x = -10 + (i - 20) * 2;
            z = -10;
        } else { // Right
            x = 10;
            z = -10 + (i - 30) * 2;
        }
        return [x, 0.5 + 0.5, z]; // y = board height/2 + player height/2. Board h=0.5, Player h=1?
    };

    if (!player) return null;

    const targetPos = getPosition(player.position);
    const color = player.color;

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Smooth lerp to target
            meshRef.current.position.lerp(new THREE.Vector3(...targetPos), delta * 5);

            // Idle animation: bounce or spin
            meshRef.current.rotation.y += delta;
            meshRef.current.position.y = targetPos[1] + Math.sin(state.clock.elapsedTime * 5) * 0.2;
        }
    });

    return (
        <mesh ref={meshRef} position={targetPos} castShadow>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};
