import { Server, Socket } from 'socket.io';
import { RoomService, Room } from '../services/RoomService';
import { GameService } from '../services/GameService';

export class GameController {
    private io: Server;
    private roomService: RoomService;

    constructor(io: Server) {
        this.io = io;
        this.roomService = new RoomService();
    }

    public handleConnection(socket: Socket): void {
        console.log('Utilizador conectado:', socket.id);

        this.setupRoomHandlers(socket);
        this.setupGameHandlers(socket);
        this.setupDisconnectHandler(socket);
    }

    // ============================================================
    // Handlers de Sala (criar, entrar, reconectar)
    // ============================================================

    private setupRoomHandlers(socket: Socket): void {
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

        socket.on('join-room', (roomCode: string) => {
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

        socket.on('rejoin-room', async ({ roomCode, playerId }: { roomCode: string; playerId: number }) => {
            console.log(`🔄 Tentativa de reconexão: Player ${playerId} na sala ${roomCode}`);

            // Tentar recuperar a sala (memória ou Supabase)
            const room = await this.roomService.recoverRoom(roomCode);

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
            } else {
                socket.emit('error', { message: "Jogador não encontrado nesta sala" });
            }
        });
    }

    // ============================================================
    // Handlers de Jogo (ações de gameplay)
    // ============================================================

    private setupGameHandlers(socket: Socket): void {
        /** Helper para executar ações no contexto de uma sala */
        const withGame = (action: (room: Room, gameService: GameService) => void): void => {
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

        socket.on('answer-question', (optionIndex: number) => {
            withGame((_, gameService) => gameService.answerQuestion(socket.id, optionIndex));
        });

        socket.on('sell-property', (propertyId: number) => {
            withGame((_, gameService) => gameService.sellProperty(socket.id, propertyId));
        });

        socket.on('next-turn', () => {
            withGame((_, gameService) => gameService.nextTurn(socket.id));
        });

        // Novo: Chat GPT — escolher casa de destino
        socket.on('chatgpt-choose-space', (targetSpaceId: number) => {
            withGame((_, gameService) => gameService.processChatGPTChoice(socket.id, targetSpaceId));
        });
    }

    // ============================================================
    // Handler de Desconexão
    // ============================================================

    private setupDisconnectHandler(socket: Socket): void {
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
