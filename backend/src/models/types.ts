// ============================================================
// Tipos partilhados entre Frontend e Backend
// ============================================================

export type Player = {
    id: number;
    color: string;
    position: number;
    money: number;
    properties: number[]; // Array de IDs das casas
    clientId: string | null; // Sessão do cliente associada
    purchaseAttemptUsed: boolean; // Controla se o jogador já tentou comprar neste turno
    initialRoll?: number; // Rolagem de dados para determinar a ordem
    skipTurns: number; // Turnos a saltar (Coffee Break)
    isBankrupt: boolean; // Se o jogador está falido
    displayName: string; // Nome do jogador
    supabaseId?: string; // ID no Supabase para persistência
};

export type SpaceLevel = 'Fácil' | 'Intermédio' | 'Difícil' | 'Extremo' | 'Corner';
export type GamePhase = 'WAITING' | 'INITIAL_ROLL' | 'PLAYING' | 'FINISHED';
export type RoomStatus = 'WAITING' | 'PLAYING' | 'FINISHED';
export type RoomMode = 'online' | 'split-screen';

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

// Tipos de eventos do jogo para notificações no frontend
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

export interface GameStateData {
    players: Player[];
    currentPlayerIndex: number;
    diceValue: [number, number] | null;
    boardConfig: SpaceData[];
    isRolling: boolean;
    currentQuestion: Question | null;
    pendingPurchaseId: number | null;
    gamePhase: GamePhase;
    winnerId: number | null;
    lastEvent: GameEvent | null;
    awaitingChatGPTChoice: boolean;
    mode: RoomMode;
}
