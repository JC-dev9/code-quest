import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
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
    startGame,
    gameMode,
    addLocalPlayer
  } = useGameStore();

  // Connect socket on mount
  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
    exit: { opacity: 0, scale: 1.05, transition: { duration: 0.3 } }
  };

  return (
    <AnimatePresence mode="wait">
      {viewState === 'menu' && (
        <motion.div
          key="menu"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full absolute inset-0"
        >
          <MainMenu
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            isLoading={isLoading}
            error={error}
          />
        </motion.div>
      )}

      {viewState === 'lobby' && (
        <motion.div
          key="lobby"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full absolute inset-0"
        >
          <RoomLobby
            roomCode={roomCode || ''}
            players={players}
            isHost={isHost}
            gameMode={gameMode}
            onStartGame={startGame}
            onLeaveRoom={leaveRoom}
            onAddLocalPlayer={addLocalPlayer}
          />
        </motion.div>
      )}

      {viewState === 'game' && (
        <motion.div
          key="game"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full h-full relative bg-gray-900 absolute inset-0"
        >
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
              <Sky distance={450000} sunPosition={[1, 0.1, 1]} azimuth={0.25} />
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
