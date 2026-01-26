import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { RoomManager } from './RoomManager';

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

const port = 3000;

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        rooms: roomManager.getRoomCount(),
        timestamp: new Date().toISOString()
    });
});

io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Create a new room
    socket.on('create-room', () => {
        const room = roomManager.createRoom(socket.id);

        // Join the socket to the room channel
        socket.join(room.code);

        // Assign player to game
        room.gameState.joinGame(socket.id);

        console.log(`🎮 Room created: ${room.code} by ${socket.id}`);

        socket.emit('room-created', {
            code: room.code,
            isHost: true,
            gameState: room.gameState.getState()
        });
    });

    // Join an existing room
    socket.on('join-room', (code: string) => {
        const room = roomManager.joinRoom(code.toUpperCase(), socket.id);

        if (!room) {
            socket.emit('error', { message: 'Sala não encontrada ou está cheia' });
            return;
        }

        // Join the socket to the room channel
        socket.join(room.code);

        // Assign player to game
        const playerId = room.gameState.joinGame(socket.id);

        console.log(`🎮 ${socket.id} joined room ${room.code}`);

        // Notify the joiner
        socket.emit('room-joined', {
            code: room.code,
            isHost: socket.id === room.hostSocketId,
            playerId,
            gameState: room.gameState.getState()
        });

        // Notify everyone in the room about the updated state
        io.to(room.code).emit('game-state-updated', room.gameState.getState());
    });

    // Roll dice
    socket.on('roll-dice', () => {
        const room = roomManager.getRoomBySocket(socket.id);
        if (!room) return;

        room.gameState.rollDice(socket.id);
        io.to(room.code).emit('game-state-updated', room.gameState.getState());
    });

    // Request purchase
    socket.on('request-purchase', () => {
        const room = roomManager.getRoomBySocket(socket.id);
        if (!room) return;

        const success = room.gameState.requestPurchase(socket.id);
        if (success) {
            io.to(room.code).emit('game-state-updated', room.gameState.getState());
        } else {
            socket.emit('error', { message: 'Não é possível comprar (sem dinheiro, já tem dono, ou já tentou comprar)' });
        }
    });

    // Answer question
    socket.on('answer-question', (optionIndex: number) => {
        const room = roomManager.getRoomBySocket(socket.id);
        if (!room) return;

        const isCorrect = room.gameState.answerQuestion(socket.id, optionIndex);
        io.to(room.code).emit('game-state-updated', room.gameState.getState());

        socket.emit('answer-result', { isCorrect });
    });

    // Sell property
    socket.on('sell-property', (propertyId: number) => {
        const room = roomManager.getRoomBySocket(socket.id);
        if (!room) return;

        const success = room.gameState.sellProperty(socket.id, propertyId);
        if (success) {
            io.to(room.code).emit('game-state-updated', room.gameState.getState());
        }
    });

    // Next turn
    socket.on('next-turn', () => {
        const room = roomManager.getRoomBySocket(socket.id);
        if (!room) return;

        room.gameState.nextTurn(socket.id);
        io.to(room.code).emit('game-state-updated', room.gameState.getState());
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);

        const room = roomManager.getRoomBySocket(socket.id);
        if (room) {
            // Notify other players
            socket.to(room.code).emit('player-disconnected', { socketId: socket.id });

            // Remove player from room
            roomManager.removePlayerFromRoom(socket.id);
        }
    });
});

httpServer.listen(port, () => {
    console.log(`🚀 Code Quest backend listening at http://localhost:${port}`);
});
 
