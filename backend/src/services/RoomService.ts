import { GameService } from './GameService';
import { ROOM_TIMEOUT_MS, MAX_PLAYERS } from '../config/constants';
import SupabaseService from './SupabaseService';

export interface Room {
    code: string;
    hostSocketId: string;
    playerSockets: Set<string>;
    gameService: GameService;
    createdAt: Date;
    mode: 'online' | 'split-screen';
}

export class RoomService {
    private rooms: Map<string, Room> = new Map();
    private supabase: SupabaseService;

    constructor() {
        this.supabase = SupabaseService.getInstance();
    }

    private generateRoomCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code: string;
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));
        return code;
    }

    public createRoom(hostSocketId: string, mode: 'online' | 'split-screen' = 'online'): Room {
        const code = this.generateRoomCode();
        const gameService = new GameService();
        gameService.setRoomCode(code);

        const room: Room = {
            code,
            hostSocketId,
            playerSockets: new Set([hostSocketId]),
            gameService,
            createdAt: new Date(),
            mode
        };
        this.rooms.set(code, room);

        // Persistir sala no Supabase
        this.supabase.saveRoomState(code, gameService.getState(), 'WAITING', 0);

        // Limpeza automática após timeout (2 horas)
        setTimeout(() => {
            if (this.rooms.has(code)) {
                this.removeRoom(code);
            }
        }, ROOM_TIMEOUT_MS);

        return room;
    }

    public joinRoom(code: string, socketId: string): Room | null {
        const room = this.rooms.get(code);
        if (!room) return null;

        if (room.playerSockets.size >= MAX_PLAYERS) {
            return null;
        }

        room.playerSockets.add(socketId);
        return room;
    }

    public addPlayerSocket(code: string, socketId: string): boolean {
        const room = this.rooms.get(code);
        if (!room) return false;

        room.playerSockets.add(socketId);
        return true;
    }

    public getRoom(code: string): Room | null {
        return this.rooms.get(code) || null;
    }

    /** Tentar recuperar uma sala do Supabase se não existir em memória */
    public async recoverRoom(code: string): Promise<Room | null> {
        // Primeiro verifica memória
        const memRoom = this.rooms.get(code);
        if (memRoom) return memRoom;

        // Tentar carregar do Supabase
        const dbRoom = await this.supabase.loadRoomState(code);
        if (!dbRoom || dbRoom.status === 'FINISHED') return null;

        // Recriar a sala em memória a partir do estado do Supabase
        const gameService = new GameService();
        gameService.setRoomCode(code);
        gameService.restoreFromState(dbRoom.game_state);

        const room: Room = {
            code,
            hostSocketId: '', // Será atualizado quando o host reconectar
            playerSockets: new Set(),
            gameService,
            createdAt: new Date(dbRoom.created_at),
            mode: (gameService.getState() as any).mode || 'online'
        };

        this.rooms.set(code, room);
        console.log(`♻️ Sala ${code} recuperada do Supabase`);

        // Auto-cleanup após timeout
        setTimeout(() => {
            if (this.rooms.has(code) && this.rooms.get(code)!.playerSockets.size === 0) {
                this.removeRoom(code);
            }
        }, ROOM_TIMEOUT_MS);

        return room;
    }

    public getRoomBySocket(socketId: string): Room | null {
        for (const room of this.rooms.values()) {
            if (room.playerSockets.has(socketId)) {
                return room;
            }
        }
        return null;
    }

    public removePlayerFromRoom(socketId: string): void {
        for (const [code, room] of this.rooms.entries()) {
            if (room.playerSockets.has(socketId)) {
                room.playerSockets.delete(socketId);

                // Remover sala se estiver vazia após grace period
                if (room.playerSockets.size === 0) {
                    console.log(`⏳ Sala ${code} vazia. Agendando remoção em 2 min...`);
                    setTimeout(() => {
                        if (this.rooms.has(code) && this.rooms.get(code)!.playerSockets.size === 0) {
                            this.removeRoom(code);
                        } else {
                            console.log(`♻️ Sala ${code} recuperada ou já removida.`);
                        }
                    }, 2 * 60 * 1000);
                }
                break;
            }
        }
    }

    private removeRoom(code: string): void {
        this.rooms.delete(code);
        // Remover também do Supabase
        this.supabase.removeRoom(code);
        console.log(`🗑️ Sala ${code} removida`);
    }
}
