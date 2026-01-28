export type Player = {
    id: number;
    color: string;
    position: number;
    money: number;
    properties: number[]; // Array de IDs das casas
    clientId: string | null; // Sessão do cliente associada
    purchaseAttemptUsed: boolean; // Controla se o jogador já tentou comprar neste turno
    initialRoll?: number; // Rolagem de dados para determinar a ordem
};

export type SpaceLevel = 'Fácil' | 'Intermédio' | 'Difícil' | 'Extremo' | 'Corner';
export type GamePhase = 'WAITING' | 'INITIAL_ROLL' | 'PLAYING';

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

export interface GameStateData {
    players: Player[];
    currentPlayerIndex: number;
    diceValue: [number, number] | null;
    boardConfig: SpaceData[];
    isRolling: boolean;
    currentQuestion: Question | null;
    pendingPurchaseId: number | null;
    gamePhase: GamePhase;
}
