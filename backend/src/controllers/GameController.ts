import { Server, Socket } from 'socket.io';
import { RoomService } from '../services/RoomService';

export class GameController {
    private io: Server;
    private roomService: RoomService;

    constructor(io: Server) {
        this.io = io;
        this.roomService = new RoomService();
    }

    public handleConnection(socket: Socket) {
        console.log('Utilizador conectado:', socket.id);

        this.setupRoomHandlers(socket);
        this.setupGameHandlers(socket);
        this.setupDisconnectHandler(socket);
    }

    private setupRoomHandlers(socket: Socket) {
        socket.on('create-room', () => {
            const room = this.roomService.createRoom(socket.id);
            const { gameService } = room;

            // Registrar callback para atualizações de estado assíncronas
            gameService.setOnStateChange((state) => {
                this.io.to(room.code).emit('game-state-updated', state);
            });

            const playerId = gameService.joinGame(socket.id);
            socket.join(room.code);

            console.log(`Sala criada: ${room.code} por ${socket.id}`);

            socket.emit('room-created', {
                code: room.code,
                isHost: true,
                playerId,
                gameState: gameService.getState()
            });

            // Broadcast para a sala (apenas o host por enquanto)
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
            const playerId = gameService.joinGame(socket.id);

            // Se for recomeçar lógica de callback, garantir que está setado (já deve estar pelo create-room)
            // Mas se o host desconectou e reconectou, talvez precisasse reatribuir. 
            // Para este MVP, assumimos que a instância da sala mantém o callback.

            socket.join(roomCode);
            console.log(`Utilizador ${socket.id} entrou na sala ${roomCode}`);

            socket.emit('room-joined', {
                code: roomCode,
                isHost: false, // Quem entra nunca é host neste modelo simplificado
                playerId,
                gameState: gameService.getState()
            });

            this.io.to(roomCode).emit('game-state-updated', gameService.getState());
        });
    }

    private setupGameHandlers(socket: Socket) {
        // Helper para injeção de dependência da sala
        const withGame = (action: (room: any, gameService: any) => void) => {
            const room = this.roomService.getRoomBySocket(socket.id);
            if (room) {
                action(room, room.gameService);
                this.io.to(room.code).emit('game-state-updated', room.gameService.getState());
            }
        };

        socket.on('start-game', () => {
            withGame((room, gameService) => {
                // Verificação de host poderia ser mais robusta, mas validamos se a sala existe
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
    }

    private setupDisconnectHandler(socket: Socket) {
        socket.on('disconnect', () => {
            console.log('Utilizador desconectado:', socket.id);
            const room = this.roomService.getRoomBySocket(socket.id);
            
            if (room) {
                this.roomService.removePlayerFromRoom(socket.id);
                this.io.to(room.code).emit('player-disconnected', { socketId: socket.id });
                
                // Opcional: Pausar jogo ou remover jogador do estado do jogo
                // Para MVP, mantemos o estado mas o jogador fica "offline" no socket
            }
        });
    }
}
