import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

export type Player = {
    id: number;
    color: string;
    position: number;
    money: number;
    properties: number[];
    purchaseAttemptUsed: boolean;
    initialRoll?: number;
};

export type GamePhase = 'WAITING' | 'INITIAL_ROLL' | 'PLAYING';
export type SpaceLevel = 'Fácil' | 'Intermédio' | 'Difícil' | 'Extremo' | 'Corner';

export type SpaceData = {
    id: number;
    name: string;
    color: string;
    type: 'property' | 'corner';
    level?: SpaceLevel;
    isImportant?: boolean;
    price?: number;
    ownerId?: number | null;
    imageUrl?: string;
};

export interface Question {
    text: string;
    options: string[];
    correctIndex: number;
    level: SpaceLevel;
}

type ViewState = 'menu' | 'lobby' | 'game';

interface GameState {
    // View state
    viewState: ViewState;

    // Room state
    roomCode: string | null;
    isHost: boolean;

    // Game state
    players: Player[];
    currentPlayerIndex: number;
    localPlayerId: number | null;
    diceValue: [number, number] | null;
    boardConfig: SpaceData[];
    isRolling: boolean;
    currentQuestion: Question | null;
    pendingPurchaseId: number | null;
    gamePhase: GamePhase;

    // Connection state
    socket: Socket | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    connectSocket: () => void;
    disconnectSocket: () => void;
    createRoom: () => void;
    joinRoom: (code: string) => void;
    leaveRoom: () => void;
    startGame: () => void;
    rollDice: () => Promise<void>;
    nextTurn: () => Promise<void>;
    requestPurchase: () => Promise<void>;
    answerQuestion: (index: number) => Promise<void>;
    sellProperty: (id: number) => Promise<void>;
}

const API_URL = 'http://localhost:3000';

export const useGameStore = create<GameState>((set, get) => ({
    // Initial state
    viewState: 'menu',
    roomCode: null,
    isHost: false,
    players: [],
    currentPlayerIndex: 0,
    localPlayerId: null,
    diceValue: null,
    boardConfig: [],
    isRolling: false,
    currentQuestion: null,
    pendingPurchaseId: null,
    gamePhase: 'WAITING',
    socket: null,
    isLoading: false,
    error: null,

    connectSocket: () => {
        const socket = io(API_URL);

        socket.on('connect', () => {
            console.log('🔌 Connected to server');
        });

        socket.on('room-created', ({ code, isHost, playerId, gameState }) => {
            console.log('✅ Room created:', code);
            set({
                roomCode: code,
                isHost,
                localPlayerId: playerId,
                viewState: 'lobby',
                isLoading: false,
                error: null,
                ...gameState
            });
        });

        socket.on('room-joined', ({ code, isHost, playerId, gameState }) => {
            console.log('✅ Room joined:', code);
            set({
                roomCode: code,
                isHost,
                localPlayerId: playerId,
                viewState: 'lobby',
                isLoading: false,
                error: null,
                ...gameState
            });
        });

        socket.on('game-state-updated', (gameState) => {
            console.log('🔄 Game state updated');
            set({ ...gameState });
        });

        socket.on('error', ({ message }) => {
            console.error('❌ Error:', message);
            set({ error: message, isLoading: false });
        });

        socket.on('player-disconnected', ({ socketId }) => {
            console.log('👋 Player disconnected:', socketId);
            // Could show a notification here
        });

        socket.on('disconnect', () => {
            console.log('🔌 Disconnected from server');
            set({
                viewState: 'menu',
                roomCode: null,
                error: 'Desconectado do servidor'
            });
        });

        socket.on('game-started', () => {
            console.log('🚀 Game started!');
            set({ viewState: 'game' });
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    },

    createRoom: () => {
        const { socket } = get();
        if (!socket) return;

        set({ isLoading: true, error: null });
        socket.emit('create-room');
    },

    joinRoom: (code: string) => {
        const { socket } = get();
        if (!socket) return;

        set({ isLoading: true, error: null });
        socket.emit('join-room', code);
    },

    leaveRoom: () => {
        set({
            viewState: 'menu',
            roomCode: null,
            isHost: false,
            localPlayerId: null,
            players: [],
            error: null
        });
    },

    startGame: () => {
        const { socket, isHost } = get();
        if (!socket || !isHost) return;

        socket.emit('start-game');
    },

    rollDice: async () => {
        const { socket } = get();
        if (!socket) return;

        set({ isRolling: true });

        // Simulate animation delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        socket.emit('roll-dice');

        // The isRolling will be reset by game-state-updated event
        setTimeout(() => {
            set({ isRolling: false });
        }, 1500);
    },

    nextTurn: async () => {
        const { socket } = get();
        if (!socket) return;

        socket.emit('next-turn');
    },

    requestPurchase: async () => {
        const { socket } = get();
        if (!socket) return;

        socket.emit('request-purchase');
    },

    answerQuestion: async (index: number) => {
        const { socket } = get();
        if (!socket) return;

        socket.emit('answer-question', index);
    },

    sellProperty: async (id: number) => {
        const { socket } = get();
        if (!socket) return;

        socket.emit('sell-property', id);
    },
}));






