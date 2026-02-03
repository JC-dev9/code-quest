import { GameService } from './GameService';
import { ROOM_TIMEOUT_MS, MAX_PLAYERS } from '../config/constants';

export interface Room {
    code: string;
    hostSocketId: string;
    playerSockets: Set<string>;
    gameService: GameService;
    createdAt: Date;
}

export class RoomService {
    private rooms: Map<string, Room> = new Map();

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

    public createRoom(hostSocketId: string): Room {
        const code = this.generateRoomCode();
        const room: Room = {
            code,
            hostSocketId,
            playerSockets: new Set([hostSocketId]),
            gameService: new GameService(),
            createdAt: new Date()
        };
        this.rooms.set(code, room);

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
        console.log(`🗑️  Sala ${code} removida`);
    }
}
