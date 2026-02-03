import React, { useRef, Suspense, useEffect, useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { getModelPath, getModelScale } from '../../config/modelConfig';
import * as THREE from 'three';

const BOARD_SIZE = 40;
const MOVE_SPEED = 8; // Velocidade de movimento entre slots (maior = mais rápido)
const ARRIVAL_THRESHOLD = 0.1; // Distância mínima para considerar que chegou ao waypoint

// -----------------------------------------------------------------------------
// Componente de carregamento do Modelo (Puro, pode suspender ou lançar erro)
// -----------------------------------------------------------------------------
interface ModelLoaderProps {
    path: string;
    scale: number;
}

function ModelLoader({ path, scale }: ModelLoaderProps) {
    // Hooks devem ser incondicionais
    const { scene } = useGLTF(path);
    // Devemos clonar a cena para permitir múltiplas instâncias do mesmo modelo
    const clone = React.useMemo(() => scene.clone(), [scene]);

    return <primitive object={clone} scale={scale} />;
}

// -----------------------------------------------------------------------------
// Componente de Fallback (Cubo)
// -----------------------------------------------------------------------------
function CubeFallback({ color }: { color: string }) {
    return (
        <mesh castShadow>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
}

// -----------------------------------------------------------------------------
// Error Boundary Simples (Classe para capturar erros de carregamento)
// -----------------------------------------------------------------------------
class GLBErrorBoundary extends React.Component<
    { fallback: React.ReactNode; children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        console.warn("GLB Model load failed, using fallback:", error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback;
        }
        return this.props.children;
    }
}

// -----------------------------------------------------------------------------
// Helper: Gerar waypoints entre posição atual e destino (slot a slot)
// -----------------------------------------------------------------------------
function generateWaypoints(fromSlot: number, toSlot: number): number[] {
    const waypoints: number[] = [];

    if (fromSlot === toSlot) return waypoints;

    // Calcular quantos slots andar (sempre para a frente no tabuleiro)
    let steps = toSlot - fromSlot;
    if (steps < 0) {
        steps += BOARD_SIZE; // Passou pelo início
    }

    // Gerar cada slot intermédio
    for (let i = 1; i <= steps; i++) {
        const slot = (fromSlot + i) % BOARD_SIZE;
        waypoints.push(slot);
    }

    return waypoints;
}

// -----------------------------------------------------------------------------
// Helper: Obter posição 3D a partir do índice do tabuleiro
// -----------------------------------------------------------------------------
function getPosition(index: number): [number, number, number] {
    let x = 0, z = 0;
    const i = index % 40;
    if (i <= 10) { x = 10 - i * 2; z = 10; }
    else if (i <= 20) { x = -10; z = 10 - (i - 10) * 2; }
    else if (i <= 30) { x = -10 + (i - 20) * 2; z = -10; }
    else { x = 10; z = -10 + (i - 30) * 2; }
    return [x, 1.0, z]; // y = 1.0 (altura base do peão)
}

// -----------------------------------------------------------------------------
// Componente Principal PlayerToken
// -----------------------------------------------------------------------------
interface PlayerProps {
    id: number;
}

export const PlayerToken: React.FC<PlayerProps> = ({ id }) => {
    const player = useGameStore((state) => state.players.find(p => p.id === id));
    const groupRef = useRef<THREE.Group>(null);

    // Estado da animação
    const [waypoints, setWaypoints] = useState<number[]>([]);
    const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
    const [lastKnownPosition, setLastKnownPosition] = useState<number>(0);
    const [isMoving, setIsMoving] = useState(false);

    // Quando a posição do jogador muda, gerar novos waypoints
    useEffect(() => {
        if (!player) return;

        const targetSlot = player.position;

        // Se a posição mudou, calcular caminho
        if (targetSlot !== lastKnownPosition) {
            const newWaypoints = generateWaypoints(lastKnownPosition, targetSlot);

            if (newWaypoints.length > 0) {
                setWaypoints(newWaypoints);
                setCurrentWaypointIndex(0);
                setIsMoving(true);
            }

            setLastKnownPosition(targetSlot);
        }
    }, [player?.position, lastKnownPosition]);

    // Callback para avançar para o próximo waypoint
    const advanceWaypoint = useCallback(() => {
        if (currentWaypointIndex < waypoints.length - 1) {
            setCurrentWaypointIndex(prev => prev + 1);
        } else {
            // Chegou ao destino final
            setIsMoving(false);
            setWaypoints([]);
            setCurrentWaypointIndex(0);
        }
    }, [currentWaypointIndex, waypoints.length]);

    if (!player) return null;

    const color = player.color;
    const modelPath = getModelPath(color);
    const modelScale = getModelScale(color);

    // Determinar a posição alvo atual
    const getCurrentTargetPosition = (): [number, number, number] => {
        if (isMoving && waypoints.length > 0) {
            return getPosition(waypoints[currentWaypointIndex]);
        }
        return getPosition(player.position);
    };

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const targetPos = getCurrentTargetPosition();
        const targetVec = new THREE.Vector3(...targetPos);
        const currentPos = groupRef.current.position.clone();

        // Calcular distância até ao waypoint atual
        const distanceXZ = Math.sqrt(
            Math.pow(targetVec.x - currentPos.x, 2) +
            Math.pow(targetVec.z - currentPos.z, 2)
        );

        // Se está perto o suficiente do waypoint atual, avançar para o próximo
        if (isMoving && distanceXZ < ARRIVAL_THRESHOLD) {
            advanceWaypoint();
        }

        // Interpolar suavemente em direção ao waypoint atual
        groupRef.current.position.lerp(targetVec, delta * MOVE_SPEED);

        // Rotação contínua do peão
        groupRef.current.rotation.y += delta * (isMoving ? 3 : 1); // Roda mais rápido quando a mover

        // Efeito de bounce vertical
        const bounceAmplitude = isMoving ? 0.3 : 0.15; // Bounce maior quando a mover
        const bounceSpeed = isMoving ? 8 : 5;
        groupRef.current.position.y = targetPos[1] + Math.sin(state.clock.elapsedTime * bounceSpeed) * bounceAmplitude;
    });

    // Posição inicial do grupo
    const initialPos = getPosition(lastKnownPosition);

    return (
        <group ref={groupRef} position={initialPos}>
            {/* Decisão: Renderizar Modelo ou Fallback */}
            {modelPath ? (
                <GLBErrorBoundary fallback={<CubeFallback color={color} />}>
                    <Suspense fallback={<CubeFallback color={color} />}>
                        <ModelLoader path={modelPath} scale={modelScale} />
                    </Suspense>
                </GLBErrorBoundary>
            ) : (
                <CubeFallback color={color} />
            )}
        </group>
    );
};
