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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomService = void 0;
const GameService_1 = require("./GameService");
const constants_1 = require("../config/constants");
const SupabaseService_1 = __importDefault(require("./SupabaseService"));
class RoomService {
    constructor() {
        this.rooms = new Map();
        this.supabase = SupabaseService_1.default.getInstance();
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
        const gameService = new GameService_1.GameService();
        gameService.setRoomCode(code);
        const room = {
            code,
            hostSocketId,
            playerSockets: new Set([hostSocketId]),
            gameService,
            createdAt: new Date()
        };
        this.rooms.set(code, room);
        // Persistir sala no Supabase
        this.supabase.saveRoomState(code, gameService.getState(), 'WAITING', 0);
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
    addPlayerSocket(code, socketId) {
        const room = this.rooms.get(code);
        if (!room)
            return false;
        room.playerSockets.add(socketId);
        return true;
    }
    getRoom(code) {
        return this.rooms.get(code) || null;
    }
    /** Tentar recuperar uma sala do Supabase se não existir em memória */
    recoverRoom(code) {
        return __awaiter(this, void 0, void 0, function* () {
            // Primeiro verifica memória
            const memRoom = this.rooms.get(code);
            if (memRoom)
                return memRoom;
            // Tentar carregar do Supabase
            const dbRoom = yield this.supabase.loadRoomState(code);
            if (!dbRoom || dbRoom.status === 'FINISHED')
                return null;
            // Recriar a sala em memória a partir do estado do Supabase
            const gameService = new GameService_1.GameService();
            gameService.setRoomCode(code);
            gameService.restoreFromState(dbRoom.game_state);
            const room = {
                code,
                hostSocketId: '', // Será atualizado quando o host reconectar
                playerSockets: new Set(),
                gameService,
                createdAt: new Date(dbRoom.created_at)
            };
            this.rooms.set(code, room);
            console.log(`♻️ Sala ${code} recuperada do Supabase`);
            // Auto-cleanup após timeout
            setTimeout(() => {
                if (this.rooms.has(code) && this.rooms.get(code).playerSockets.size === 0) {
                    this.removeRoom(code);
                }
            }, constants_1.ROOM_TIMEOUT_MS);
            return room;
        });
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
                // Remover sala se estiver vazia após grace period
                if (room.playerSockets.size === 0) {
                    console.log(`⏳ Sala ${code} vazia. Agendando remoção em 2 min...`);
                    setTimeout(() => {
                        if (this.rooms.has(code) && this.rooms.get(code).playerSockets.size === 0) {
                            this.removeRoom(code);
                        }
                        else {
                            console.log(`♻️ Sala ${code} recuperada ou já removida.`);
                        }
                    }, 2 * 60 * 1000);
                }
                break;
            }
        }
    }
    removeRoom(code) {
        this.rooms.delete(code);
        // Remover também do Supabase
        this.supabase.removeRoom(code);
        console.log(`🗑️ Sala ${code} removida`);
    }
}
exports.RoomService = RoomService;
