import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import { getModelPath, getModelScale } from '../../config/modelConfig';
import * as THREE from 'three';

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
// Componente Principal PlayerToken
// -----------------------------------------------------------------------------
interface PlayerProps {
    id: number;
}

export const PlayerToken: React.FC<PlayerProps> = ({ id }) => {
    const player = useGameStore((state) => state.players.find(p => p.id === id));
    const groupRef = useRef<THREE.Group>(null);

    // Helper to get 3D pos from board index
    const getPosition = (index: number): [number, number, number] => {
        let x = 0, z = 0;
        const i = index % 40;
        if (i <= 10) { x = 10 - i * 2; z = 10; }
        else if (i <= 20) { x = -10; z = 10 - (i - 10) * 2; }
        else if (i <= 30) { x = -10 + (i - 20) * 2; z = -10; }
        else { x = 10; z = -10 + (i - 30) * 2; }
        return [x, 0.5 + 0.5, z];
    };

    if (!player) return null;

    const targetPos = getPosition(player.position);
    const color = player.color;
    const modelPath = getModelPath(color);
    const modelScale = getModelScale(color);

    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.lerp(new THREE.Vector3(...targetPos), delta * 5);
            groupRef.current.rotation.y += delta;
            groupRef.current.position.y = targetPos[1] + Math.sin(state.clock.elapsedTime * 5) * 0.2;
        }
    });

    return (
        <group ref={groupRef} position={targetPos}>
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
