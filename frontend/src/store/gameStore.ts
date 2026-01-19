import { create } from 'zustand';

export type Player = {
    id: number;
    color: string;
    position: number;
};

export type SpaceData = {
    id: number;
    name: string;
    color: string;
    type: 'property' | 'corner';
};

interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    diceValue: number | null;
    boardConfig: SpaceData[];
    isRolling: boolean;

    fetchState: () => Promise<void>;
    rollDice: () => Promise<void>;
    nextTurn: () => Promise<void>;
}

const API_URL = 'http://localhost:3000';

export const useGameStore = create<GameState>((set) => ({
    players: [],
    currentPlayerIndex: 0,
    diceValue: null,
    boardConfig: [],
    isRolling: false,

    fetchState: async () => {
        try {
            const res = await fetch(`${API_URL}/gamestate`);
            const data = await res.json();
            set(data);
        } catch (error) {
            console.error("Failed to fetch game state:", error);
        }
    },

    rollDice: async () => {
        set({ isRolling: true });

        // Simulate animation delay for UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const res = await fetch(`${API_URL}/api/roll`, { method: 'POST' });
            const data = await res.json();
            set({ ...data, isRolling: false });
        } catch (error) {
            console.error("Failed to roll dice:", error);
            set({ isRolling: false });
        }
    },

    nextTurn: async () => {
        try {
            const res = await fetch(`${API_URL}/api/next-turn`, { method: 'POST' });
            const data = await res.json();
            set(data);
        } catch (error) {
            console.error("Failed to advance turn:", error);
        }
    },
}));
