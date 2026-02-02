import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { getModelPath, getModelScale } from '../../config/modelConfig';
import * as THREE from 'three';

interface PlayerProps {
    id: number;
}

export const PlayerToken: React.FC<PlayerProps> = ({ id }) => {
    const player = useGameStore((state) => state.players.find(p => p.id === id));
    const groupRef = useRef<THREE.Group>(null);
    const [modelError, setModelError] = useState(false);

    // Get model path for player color
    const modelPath = player ? getModelPath(player.color) : null;
    const modelScale = player ? getModelScale(player.color) : 1.0;

    // Try to load the GLB model
    let model = null;
    try {
        if (modelPath && !modelError) {
            // eslint-disable-next-line react-hooks/rules-of-hooks
            model = useGLTF(modelPath);
        }
    } catch (error) {
        console.warn(`Failed to load model for player ${id}:`, error);
        setModelError(true);
    }

    // Helper to get 3D pos from board index
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
        return [x, 0.5 + 0.5, z]; // y = board height/2 + player height/2
    };

    if (!player) return null;

    const targetPos = getPosition(player.position);
    const color = player.color;

    useFrame((state, delta) => {
        if (groupRef.current) {
            // Smooth lerp to target
            groupRef.current.position.lerp(new THREE.Vector3(...targetPos), delta * 5);

            // Idle animation: bounce or spin
            groupRef.current.rotation.y += delta;
            groupRef.current.position.y = targetPos[1] + Math.sin(state.clock.elapsedTime * 5) * 0.2;
        }
    });

    // Render GLB model if available, otherwise fallback to cube
    return (
        <group ref={groupRef} position={targetPos} castShadow>
            {model && !modelError ? (
                // Render GLB model
                <primitive
                    object={model.scene.clone()}
                    scale={modelScale}
                />
            ) : (
                // Fallback to cube
                <mesh castShadow>
                    <boxGeometry args={[0.8, 0.8, 0.8]} />
                    <meshStandardMaterial color={color} />
                </mesh>
            )}
        </group>
    );
};
