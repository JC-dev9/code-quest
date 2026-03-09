"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const RoomService_1 = require("../services/RoomService");
class GameController {
    constructor(io) {
        this.io = io;
        this.roomService = new RoomService_1.RoomService();
    }
    handleConnection(socket) {
        console.log('Utilizador conectado:', socket.id);
        this.setupRoomHandlers(socket);
        this.setupGameHandlers(socket);
        this.setupDisconnectHandler(socket);
    }
    // ============================================================
    // Handlers de Sala (criar, entrar, reconectar)
    // ============================================================
    setupRoomHandlers(socket) {
        socket.on('create-room', () => {
            const room = this.roomService.createRoom(socket.id);
            const { gameService } = room;
            // Registar callback para atualizações de estado assíncronas
            gameService.setOnStateChange((state) => {
                this.io.to(room.code).emit('game-state-updated', state);
            });
            const playerId = gameService.joinGame(socket.id);
            socket.join(room.code);
            console.log(`🎮 Sala criada: ${room.code} por ${socket.id}`);
            socket.emit('room-created', {
                code: room.code,
                isHost: true,
                playerId,
                gameState: gameService.getState()
            });
            this.io.to(room.code).emit('game-state-updated', gameService.getState());
        });
        socket.on('join-room', (roomCode) => {
            const room = this.roomService.joinRoom(roomCode, socket.id);
            if (!room) {
                const existingRoom = this.roomService.getRoom(roomCode);
                const message = existingRoom ? "Sala cheia" : "Sala não encontrada";
                socket.emit('error', { message });
                return;
            }
            const { gameService } = room;
            // Registar callback se ainda não tiver sido feito
            gameService.setOnStateChange((state) => {
                this.io.to(room.code).emit('game-state-updated', state);
            });
            const playerId = gameService.joinGame(socket.id);
            socket.join(roomCode);
            console.log(`👤 Utilizador ${socket.id} entrou na sala ${roomCode}`);
            socket.emit('room-joined', {
                code: roomCode,
                isHost: false,
                playerId,
                gameState: gameService.getState()
            });
            this.io.to(roomCode).emit('game-state-updated', gameService.getState());
        });
        socket.on('rejoin-room', (_a) => __awaiter(this, [_a], void 0, function* ({ roomCode, playerId }) {
            console.log(`🔄 Tentativa de reconexão: Player ${playerId} na sala ${roomCode}`);
            // Tentar recuperar a sala (memória ou Supabase)
            const room = yield this.roomService.recoverRoom(roomCode);
            if (!room) {
                socket.emit('error', { message: "Sala não encontrada ou expirada" });
                return;
            }
            // Registar callback (pode ter sido perdido se a sala foi recuperada do Supabase)
            room.gameService.setOnStateChange((state) => {
                this.io.to(room.code).emit('game-state-updated', state);
            });
            // Tenta reconectar o jogador no serviço de jogo
            const success = room.gameService.reconnectPlayer(playerId, socket.id);
            if (success) {
                // Adicionar o novo socket à sala
                this.roomService.addPlayerSocket(roomCode, socket.id);
                // Recuperar status de Host se for o Player 1
                if (playerId === 1) {
                    room.hostSocketId = socket.id;
                }
                socket.join(roomCode);
                console.log(`✅ Player ${playerId} reconectado com socket ${socket.id}`);
                socket.emit('room-joined', {
                    code: roomCode,
                    isHost: playerId === 1,
                    playerId,
                    gameState: room.gameService.getState()
                });
                this.io.to(roomCode).emit('game-state-updated', room.gameService.getState());
            }
            else {
                socket.emit('error', { message: "Jogador não encontrado nesta sala" });
            }
        }));
    }
    // ============================================================
    // Handlers de Jogo (ações de gameplay)
    // ============================================================
    setupGameHandlers(socket) {
        /** Helper para executar ações no contexto de uma sala */
        const withGame = (action) => {
            const room = this.roomService.getRoomBySocket(socket.id);
            if (room) {
                action(room, room.gameService);
                this.io.to(room.code).emit('game-state-updated', room.gameService.getState());
            }
        };
        socket.on('start-game', () => {
            withGame((room, gameService) => {
                if (room.hostSocketId === socket.id) {
                    gameService.startGame();
                    console.log(`🚀 Jogo iniciado na sala ${room.code}`);
                    this.io.to(room.code).emit('game-started');
                }
            });
        });
        socket.on('roll-dice', () => {
            withGame((_, gameService) => gameService.rollDice(socket.id));
        });
        socket.on('request-purchase', () => {
            withGame((_, gameService) => gameService.requestPurchase(socket.id));
        });
        socket.on('answer-question', (optionIndex) => {
            withGame((_, gameService) => gameService.answerQuestion(socket.id, optionIndex));
        });
        socket.on('sell-property', (propertyId) => {
            withGame((_, gameService) => gameService.sellProperty(socket.id, propertyId));
        });
        socket.on('next-turn', () => {
            withGame((_, gameService) => gameService.nextTurn(socket.id));
        });
        // Novo: Chat GPT — escolher casa de destino
        socket.on('chatgpt-choose-space', (targetSpaceId) => {
            withGame((_, gameService) => gameService.processChatGPTChoice(socket.id, targetSpaceId));
        });
    }
    // ============================================================
    // Handler de Desconexão
    // ============================================================
    setupDisconnectHandler(socket) {
        socket.on('disconnect', () => {
            console.log('👋 Utilizador desconectado:', socket.id);
            const room = this.roomService.getRoomBySocket(socket.id);
            if (room) {
                this.roomService.removePlayerFromRoom(socket.id);
                this.io.to(room.code).emit('player-disconnected', { socketId: socket.id });
            }
        });
    }
}
exports.GameController = GameController;
