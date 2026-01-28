"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const GameService_1 = require("./GameService");
const constants_1 = require("../config/constants");
class RoomService {
    constructor() {
        this.rooms = new Map();
    }
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code;
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));
        return code;
    }
    createRoom(hostSocketId) {
        const code = this.generateRoomCode();
        const room = {
            code,
            hostSocketId,
            playerSockets: new Set([hostSocketId]),
            gameService: new GameService_1.GameService(),
            createdAt: new Date()
        };
        this.rooms.set(code, room);
        // Limpeza automática após timeout (2 horas)
        setTimeout(() => {
            if (this.rooms.has(code)) {
                this.removeRoom(code);
            }
        }, constants_1.ROOM_TIMEOUT_MS);
        return room;
    }
    joinRoom(code, socketId) {
        const room = this.rooms.get(code);
        if (!room)
            return null;
        if (room.playerSockets.size >= constants_1.MAX_PLAYERS) {
            return null;
        }
        room.playerSockets.add(socketId);
        return room;
    }
    getRoom(code) {
        return this.rooms.get(code) || null;
    }
    getRoomBySocket(socketId) {
        for (const room of this.rooms.values()) {
            if (room.playerSockets.has(socketId)) {
                return room;
            }
        }
        return null;
    }
    removePlayerFromRoom(socketId) {
        for (const [code, room] of this.rooms.entries()) {
            if (room.playerSockets.has(socketId)) {
                room.playerSockets.delete(socketId);
                // Remover sala se estiver vazia
                if (room.playerSockets.size === 0) {
                    this.removeRoom(code);
                }
                break;
            }
        }
    }
    removeRoom(code) {
        this.rooms.delete(code);
        console.log(`🗑️  Sala ${code} removida`);
    }
}
exports.RoomService = RoomService;
