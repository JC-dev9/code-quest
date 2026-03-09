import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

// ============================================================
// Tipos partilhados (espelho dos tipos do backend)
// ============================================================

export type Player = {
    id: number;
    color: string;
    position: number;
    money: number;
    properties: number[];
    purchaseAttemptUsed: boolean;
    initialRoll?: number;
    skipTurns: number;
    isBankrupt: boolean;
    displayName: string;
};

export type GamePhase = 'WAITING' | 'INITIAL_ROLL' | 'PLAYING' | 'FINISHED';
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

export type GameEventType =
    | 'RENT_PAID'
    | 'PROPERTY_BOUGHT'
    | 'PASSED_START'
    | 'AUDIT_TAX'
    | 'COFFEE_BREAK'
    | 'CHATGPT_MOVE'
    | 'PLAYER_BANKRUPT'
    | 'GAME_OVER'
    | 'ANSWER_CORRECT'
    | 'ANSWER_WRONG';

export interface GameEvent {
    type: GameEventType;
    playerId: number;
    message: string;
    amount?: number;
    targetPlayerId?: number;
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
    winnerId: number | null;
    lastEvent: GameEvent | null;
    awaitingChatGPTChoice: boolean;
    isTokenMoving: boolean;

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
    chatGPTChooseSpace: (spaceId: number) => void;
    clearEvent: () => void;
    setTokenMoving: (moving: boolean) => void;
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
    winnerId: null,
    lastEvent: null,
    awaitingChatGPTChoice: false,
    isTokenMoving: false,
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
                players: gameState.players,
                currentPlayerIndex: gameState.currentPlayerIndex,
                diceValue: gameState.diceValue,
                boardConfig: gameState.boardConfig,
                isRolling: gameState.isRolling,
                currentQuestion: gameState.currentQuestion,
                pendingPurchaseId: gameState.pendingPurchaseId,
                gamePhase: gameState.gamePhase,
                winnerId: gameState.winnerId ?? null,
                lastEvent: gameState.lastEvent ?? null,
                awaitingChatGPTChoice: gameState.awaitingChatGPTChoice ?? false
            });
        });

        socket.on('room-joined', ({ code, isHost, playerId, gameState }) => {
            console.log('✅ Entrou na sala:', code);
            localStorage.setItem('codequest_session', JSON.stringify({ roomCode: code, playerId }));

            // Se o jogo já estiver em andamento, ir direto para o ecrã do jogo
            const targetView = (gameState.gamePhase === 'INITIAL_ROLL' || gameState.gamePhase === 'PLAYING' || gameState.gamePhase === 'FINISHED')
                ? 'game'
                : 'lobby';

            set({
                roomCode: code,
                isHost,
                localPlayerId: playerId,
                viewState: targetView,
                isLoading: false,
                error: null,
                players: gameState.players,
                currentPlayerIndex: gameState.currentPlayerIndex,
                diceValue: gameState.diceValue,
                boardConfig: gameState.boardConfig,
                isRolling: gameState.isRolling,
                currentQuestion: gameState.currentQuestion,
                pendingPurchaseId: gameState.pendingPurchaseId,
                gamePhase: gameState.gamePhase,
                winnerId: gameState.winnerId ?? null,
                lastEvent: gameState.lastEvent ?? null,
                awaitingChatGPTChoice: gameState.awaitingChatGPTChoice ?? false
            });
        });

        socket.on('game-state-updated', (gameState) => {
            set({
                players: gameState.players,
                currentPlayerIndex: gameState.currentPlayerIndex,
                diceValue: gameState.diceValue,
                boardConfig: gameState.boardConfig,
                isRolling: gameState.isRolling,
                currentQuestion: gameState.currentQuestion,
                pendingPurchaseId: gameState.pendingPurchaseId,
                gamePhase: gameState.gamePhase,
                winnerId: gameState.winnerId ?? null,
                lastEvent: gameState.lastEvent ?? null,
                awaitingChatGPTChoice: gameState.awaitingChatGPTChoice ?? false
            });
        });

        socket.on('error', ({ message }: { message: string }) => {
            console.error('❌ Erro:', message);
            set({ error: message, isLoading: false });
        });

        socket.on('player-disconnected', ({ socketId }: { socketId: string }) => {
            console.log('👋 Jogador desconectado:', socketId);
        });

        socket.on('disconnect', () => {
            console.log('🔌 Desconectado do servidor');
            set({
                error: 'Desconectado do servidor. Tentando reconectar...'
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
            error: null,
            winnerId: null,
            lastEvent: null,
            awaitingChatGPTChoice: false
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

        // Simulação de delay de animação para UX
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

    chatGPTChooseSpace: (spaceId: number) => {
        const { socket } = get();
        if (!socket) return;

        socket.emit('chatgpt-choose-space', spaceId);
    },

    clearEvent: () => {
        set({ lastEvent: null });
    },

    setTokenMoving: (moving: boolean) => {
        set({ isTokenMoving: moving });
    },
}));
