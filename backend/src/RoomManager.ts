import { GameState } from './gameState';

export interface Room {
    code: string;
    hostSocketId: string;
    playerSockets: Set<string>;
    gameState: GameState;
    createdAt: Date;
}

export class RoomManager {
    private rooms: Map<string, Room> = new Map();

    // Generate unique 6-character room code
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

    createRoom(hostSocketId: string): Room {
        const code = this.generateRoomCode();
        const room: Room = {
            code,
            hostSocketId,
            playerSockets: new Set([hostSocketId]),
            gameState: new GameState(),
            createdAt: new Date()
        };
        this.rooms.set(code, room);

        // Auto-cleanup after 2 hours
        setTimeout(() => {
            if (this.rooms.has(code)) {
                this.removeRoom(code);
            }
        }, 2 * 60 * 60 * 1000);

        return room;
    }

    joinRoom(code: string, socketId: string): Room | null {
        const room = this.rooms.get(code);
        if (!room) return null;

        // Check if room is full (max 2 players for now)
        if (room.playerSockets.size >= 2) {
            return null;
        }

        room.playerSockets.add(socketId);
        return room;
    }

    getRoom(code: string): Room | null {
        return this.rooms.get(code) || null;
    }

    getRoomBySocket(socketId: string): Room | null {
        for (const room of this.rooms.values()) {
            if (room.playerSockets.has(socketId)) {
                return room;
            }
        }
        return null;
    }

    removePlayerFromRoom(socketId: string): void {
        for (const [code, room] of this.rooms.entries()) {
            if (room.playerSockets.has(socketId)) {
                room.playerSockets.delete(socketId);

                // Remove room if empty
                if (room.playerSockets.size === 0) {
                    this.removeRoom(code);
                }
                break;
            }
        }
    }

    private removeRoom(code: string): void {
        this.rooms.delete(code);
        console.log(`🗑️  Room ${code} removed`);
    }

    getRoomCount(): number {
        return this.rooms.size;
    }
}
