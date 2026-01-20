import { create } from 'zustand';

export type Player = {
    id: number;
    color: string;
    position: number;
    money: number;
    properties: number[];
};

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

interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    localPlayerId: number | null;
    diceValue: [number, number] | null;
    boardConfig: SpaceData[];
    isRolling: boolean;
    currentQuestion: Question | null;
    pendingPurchaseId: number | null;

    fetchState: () => Promise<void>;
    joinGame: () => Promise<void>;
    rollDice: () => Promise<void>;
    nextTurn: () => Promise<void>;
    requestPurchase: () => Promise<void>;
    answerQuestion: (index: number) => Promise<void>;
    sellProperty: (id: number) => Promise<void>;
    startPolling: () => void;
    stopPolling: () => void;
}

const getClientId = () => {
    let id = localStorage.getItem('codequest_client_id');
    if (!id) {
        id = Math.random().toString(36).substring(2, 15);
        localStorage.setItem('codequest_client_id', id);
    }
    return id;
};

const API_HEADERS = () => ({
    'client-id': getClientId(),
    'Content-Type': 'application/json'
});

const API_URL = 'http://localhost:3000';

export const useGameStore = create<GameState>((set) => ({
    players: [],
    currentPlayerIndex: 0,
    localPlayerId: null,
    diceValue: null,
    boardConfig: [],
    isRolling: false,
    currentQuestion: null,
    pendingPurchaseId: null,

    fetchState: async () => {
        try {
            const res = await fetch(`${API_URL}/gamestate`);
            const data = await res.json();
            set(data);
        } catch (error) {
            console.error("Failed to fetch game state:", error);
        }
    },

    joinGame: async () => {
        try {
            const res = await fetch(`${API_URL}/api/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: getClientId() })
            });
            const { playerId, state } = await res.json();
            set({ ...state, localPlayerId: playerId });
        } catch (error) {
            console.error("Failed to join game:", error);
        }
    },

    rollDice: async () => {
        set({ isRolling: true });

        // Simulate animation delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const res = await fetch(`${API_URL}/api/roll`, {
                method: 'POST',
                headers: API_HEADERS()
            });
            const data = await res.json();
            set({ ...data, isRolling: false });
        } catch (error) {
            console.error("Failed to roll dice:", error);
            set({ isRolling: false });
        }
    },

    nextTurn: async () => {
        try {
            const res = await fetch(`${API_URL}/api/next-turn`, {
                method: 'POST',
                headers: API_HEADERS()
            });
            const data = await res.json();
            set(data);
        } catch (error) {
            console.error("Failed to advance turn:", error);
        }
    },

    requestPurchase: async () => {
        try {
            const res = await fetch(`${API_URL}/api/request-purchase`, {
                method: 'POST',
                headers: API_HEADERS()
            });
            const data = await res.json();
            set(data);
        } catch (error) {
            console.error("Failed to request purchase:", error);
        }
    },

    answerQuestion: async (index: number) => {
        try {
            const res = await fetch(`${API_URL}/api/answer`, {
                method: 'POST',
                headers: API_HEADERS(),
                body: JSON.stringify({ optionIndex: index })
            });
            const data = await res.json();
            set(data);
        } catch (error) {
            console.error("Failed to answer question:", error);
        }
    },

    sellProperty: async (id: number) => {
        try {
            const res = await fetch(`${API_URL}/api/sell`, {
                method: 'POST',
                headers: API_HEADERS(),
                body: JSON.stringify({ propertyId: id })
            });
            const data = await res.json();
            set(data);
        } catch (error) {
            console.error("Failed to sell property:", error);
        }
    },

    startPolling: () => {
        const interval = setInterval(async () => {
            // Only poll if not currently performing an action to avoid race conditions
            const state = useGameStore.getState();
            if (!state.isRolling && !state.currentQuestion) {
                await state.fetchState();
            }
        }, 1000);
        (useGameStore as any)._pollInterval = interval;
    },

    stopPolling: () => {
        const interval = (useGameStore as any)._pollInterval;
        if (interval) {
            clearInterval(interval);
            (useGameStore as any)._pollInterval = null;
        }
    },
}));
