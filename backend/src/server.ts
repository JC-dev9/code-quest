import express from 'express';
import cors from 'cors';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { GameState } from './gameState';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this MVP
        methods: ["GET", "POST"]
    }
});

// Store active game states: RoomCode -> GameState
const rooms = new Map<string, GameState>();

// Helper to generate room code
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

app.get('/gamestate', (req, res) => {
    // Legacy support for single player dev testing if needed
    res.json({ message: "Use Socket.IO for multiplayer" });
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create-room', () => {
        const roomCode = generateRoomCode();
        const gameState = new GameState();
        
        // Register callback for async state updates (e.g. initial roll timeout)
        gameState.setOnStateChange((state) => {
            io.to(roomCode).emit('game-state-updated', state);
        });

        // Auto-join host as player 1
        // We use socket.id as clientId for simplicity in this session
        const playerId = gameState.joinGame(socket.id);

        rooms.set(roomCode, gameState);
        socket.join(roomCode);

        console.log(`Room created: ${roomCode} by ${socket.id}`);

        socket.emit('room-created', {
            code: roomCode,
            isHost: true,
            playerId,
            gameState: gameState.getState()
        });

        // Broadcast that a player joined (the host)
        io.to(roomCode).emit('game-state-updated', gameState.getState());
    });

    socket.on('join-room', (roomCode) => {
        const gameState = rooms.get(roomCode);
        if (!gameState) {
            socket.emit('error', { message: "Sala não encontrada" });
            return;
        }

        const playerId = gameState.joinGame(socket.id);
        if (playerId === null) {
            socket.emit('error', { message: "Sala cheia" });
            return;
        }

        socket.join(roomCode);
        console.log(`User ${socket.id} joined room ${roomCode}`);

        // Notify user they joined
        socket.emit('room-joined', {
            code: roomCode,
            isHost: false,
            playerId,
            gameState: gameState.getState()
        });

        // Notify everyone in room of update
        io.to(roomCode).emit('game-state-updated', gameState.getState());
    });

    socket.on('start-game', () => {
        // Find room and broadcast start
        for (const roomCode of socket.rooms) {
            if (rooms.has(roomCode)) {
                const gameState = rooms.get(roomCode)!;
                gameState.startGame();
                console.log(`🚀 Game started in room ${roomCode}`);
                io.to(roomCode).emit('game-started');
                io.to(roomCode).emit('game-state-updated', gameState.getState());
                return;
            }
        }
    });

    // Handle game actions
    const handleGameAction = (action: (gameState: GameState) => void) => {
        // Find which room this socket is in
        // In Socket.IO v4, socket.rooms is a Set containing the socket ID and joined rooms
        // We assume a user is in only one game room for this MVP
        for (const roomCode of socket.rooms) {
            if (rooms.has(roomCode)) {
                const gameState = rooms.get(roomCode)!;
                action(gameState);
                io.to(roomCode).emit('game-state-updated', gameState.getState());
                return;
            }
        }
    };

    socket.on('roll-dice', () => {
        handleGameAction((gs) => gs.rollDice(socket.id));
    });

    socket.on('request-purchase', () => {
        handleGameAction((gs) => gs.requestPurchase(socket.id));
    });

    socket.on('answer-question', (optionIndex) => {
        handleGameAction((gs) => gs.answerQuestion(socket.id, optionIndex));
    });

    socket.on('sell-property', (propertyId) => {
        handleGameAction((gs) => gs.sellProperty(socket.id, propertyId));
    });

    socket.on('next-turn', () => {
        handleGameAction((gs) => gs.nextTurn(socket.id));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Handle cleanup if needed, or wait for reconnect
    });
});

httpServer.listen(port, '0.0.0.0', () => {
    console.log(`🎮 Bananapoly backend listening at http://localhost:${port}`);
    console.log(`🌐 Network access: http://10.2.3.140:${port}`);
    console.log(`📱 Para jogar em rede, o amigo deve conectar ao IP acima`);
});
