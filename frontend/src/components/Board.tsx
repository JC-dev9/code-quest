import React from 'react';
import { Space } from './Space';
import { PlayerToken } from './PlayerToken';
import { useGameStore } from '../store/gameStore';

export const Board: React.FC = () => {
    const { boardConfig, players } = useGameStore();

    const getPosition = (index: number): [number, number, number] => {
        let x = 0, z = 0;
        const i = index;

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
        return [x, 0, z];
    };

    return (
        <group>
            {/* Board Spaces */}
            {boardConfig.map((space) => {
                const owner = space.ownerId ? players.find(p => p.id === space.ownerId) : null;
                return (
                    <Space
                        key={space.id}
                        position={getPosition(space.id)}
                        color={space.color}
                        name={space.name}
                        isCorner={space.type === 'corner'}
                        price={space.price}
                        level={space.level}
                        isImportant={space.isImportant}
                        ownerColor={owner?.color}
                    />
                );
            })}

            {/* Center Decoration */}
            <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[18, 18]} />
                <meshStandardMaterial color="#222" />
            </mesh>

            {/* Players */}
            {players.map(p => (
                <PlayerToken key={p.id} id={p.id} />
            ))}
        </group>
    );
};
