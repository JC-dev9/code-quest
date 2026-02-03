import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// Definição dos tipos principais do jogo
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
    // Estado da Visualização
    viewState: ViewState;

    // Estado da Sala
    roomCode: string | null;
    isHost: boolean;

    // Estado do Jogo
    players: Player[];
    currentPlayerIndex: number;
    localPlayerId: number | null;
    diceValue: [number, number] | null;
    boardConfig: SpaceData[];
    isRolling: boolean;
    currentQuestion: Question | null;
    pendingPurchaseId: number | null;
    gamePhase: GamePhase;

    // Estado da Conexão
    socket: Socket | null;
    isLoading: boolean;
    error: string | null;

    // Ações
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useGameStore = create<GameState>((set, get) => ({
    // Estado Inicial
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
            console.log('🔌 Conectado ao servidor');

            // Tenta reconexão automática se houver sessão salva
            const session = localStorage.getItem('codequest_session');
            if (session) {
                try {
                    const { roomCode, playerId } = JSON.parse(session);
                    console.log('🔄 Tentando reconectar à sessão anterior...', roomCode);
                    console.log('Player ID:', playerId);
                    socket.emit('rejoin-room', { roomCode, playerId });
                } catch (e) {
                    console.error('Erro ao ler sessão salva:', e);
                    localStorage.removeItem('codequest_session');
                }
            }
        });

        socket.on('room-created', ({ code, isHost, playerId, gameState }) => {
            console.log('✅ Sala criada:', code);
            localStorage.setItem('codequest_session', JSON.stringify({ roomCode: code, playerId }));
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
            console.log('✅ Entrou na sala:', code);
            localStorage.setItem('codequest_session', JSON.stringify({ roomCode: code, playerId }));

            // Se o jogo já estiver em andamento, vai direto para a tela do jogo
            const targetView = (gameState.gamePhase === 'INITIAL_ROLL' || gameState.gamePhase === 'PLAYING')
                ? 'game'
                : 'lobby';

            set({
                roomCode: code,
                isHost,
                localPlayerId: playerId,
                viewState: targetView,
                isLoading: false,
                error: null,
                ...gameState
            });
        });

        socket.on('game-state-updated', (gameState) => {
            console.log('🔄 Estado do jogo atualizado');
            set({ ...gameState });
        });

        socket.on('error', ({ message }) => {
            console.error('❌ Erro:', message);
            set({ error: message, isLoading: false });
        });

        socket.on('player-disconnected', ({ socketId }) => {
            console.log('👋 Jogador desconectado:', socketId);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Desconectado do servidor');
            set({
                viewState: 'menu',
                roomCode: null,
                error: 'Desconectado do servidor'
            });
        });

        socket.on('game-started', () => {
            console.log('🚀 Jogo iniciado!');
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
        localStorage.removeItem('codequest_session');
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

        // Simula delay de animação para UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        socket.emit('roll-dice');

        // isRolling será resetado pelo evento game-state-updated
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


