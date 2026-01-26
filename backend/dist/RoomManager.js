"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const gameState_1 = require("./gameState");
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    // Generate unique 6-character room code
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
            gameState: new gameState_1.GameState(),
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
    joinRoom(code, socketId) {
        const room = this.rooms.get(code);
        if (!room)
            return null;
        // Check if room is full (max 2 players for now)
        if (room.playerSockets.size >= 2) {
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
                // Remove room if empty
                if (room.playerSockets.size === 0) {
                    this.removeRoom(code);
                }
                break;
            }
        }
    }
    removeRoom(code) {
        this.rooms.delete(code);
        console.log(`🗑️  Room ${code} removed`);
    }
    getRoomCount() {
        return this.rooms.size;
    }
}
exports.RoomManager = RoomManager;
