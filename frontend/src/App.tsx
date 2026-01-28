import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { Board } from './components/game/Board';
import { GameHUD } from './components/game/GameHUD';
import { MainMenu } from './components/game/MainMenu';
import { RoomLobby } from './components/game/RoomLobby';
import { InitialRollOverlay } from './components/game/InitialRollOverlay';

import { useGameStore } from './store/gameStore';

function App() {
  const {
    viewState,
    roomCode,
    isHost,
    players,
    isLoading,
    error,
    connectSocket,
    disconnectSocket,
    createRoom,
    joinRoom,
    leaveRoom,
    startGame
  } = useGameStore();

  // Connect socket on mount
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  // Render based on view state
  if (viewState === 'menu') {
    return (
      <MainMenu
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  if (viewState === 'lobby') {
    return (
      <RoomLobby
        roomCode={roomCode || ''}
        players={players}
        isHost={isHost}
        onStartGame={startGame}
        onLeaveRoom={leaveRoom}
      />
    );
  }

  // Game view
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
      <InitialRollOverlay />
      <GameHUD />

    </div>
  );
}

export default App;
