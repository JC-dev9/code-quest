import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { Board } from './components/Board';
import { GameUI } from './components/GameUI';

import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';

function App() {
  const { fetchState } = useGameStore();

  useEffect(() => {
    fetchState();
  }, [fetchState]);
  return (
    <div className="w-full h-full relative bg-gray-900">

      {/* 3D Scene */}
      <Canvas shadows camera={{ position: [0, 25, 25], fov: 45 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 20, 10]} intensity={1} castShadow />
          <directionalLight
            position={[-10, 20, -10]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          <group position={[0, -2, 0]}> {/* Lower board slightly */}
            <Board />
          </group>

          <Environment preset="city" />
          <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0} azimuth={0.25} />
          <OrbitControls
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2.5}
            minDistance={10}
            maxDistance={50}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <GameUI />

    </div>
  );
}

export default App;
