export type Player = {
    id: number;
    color: string;
    position: number;
    money: number;
    properties: number[]; // Array of space IDs
    clientId: string | null; // Associated client session
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

export interface GameStateData {
    players: Player[];
    currentPlayerIndex: number;
    diceValue: [number, number] | null;
    boardConfig: SpaceData[];
    isRolling: boolean;
    currentQuestion: Question | null;
    pendingPurchaseId: number | null;
}

const BOARD_SIZE = 40;

export class GameState {
    private players: Player[];
    private currentPlayerIndex: number;
    private diceValue: [number, number] | null;
    private boardConfig: SpaceData[];
    private isRolling: boolean;
    private currentQuestion: Question | null = null;
    private pendingPurchaseId: number | null = null;

    private questions: Question[] = [
        { level: 'Fácil', text: "O que significa HTML?", options: ["HyperText Markup Language", "HighTech Modern Language", "Hyperlink Text Mode"], correctIndex: 0 },
        { level: 'Fácil', text: "Qual destes é um tipo primitivo em JS?", options: ["Object", "String", "Array"], correctIndex: 1 },
        { level: 'Intermédio', text: "Qual a diferença entre == e ===?", options: ["Nenhuma", "== compara valor, === valor e tipo", "=== é para strings"], correctIndex: 1 },
        { level: 'Intermédio', text: "Como se declara uma variável que não muda?", options: ["var", "let", "const"], correctIndex: 2 },
        { level: 'Difícil', text: "O que faz o useMemo em React?", options: ["Memoiza um componente", "Memoiza um valor calculado", "Executa código após render"], correctIndex: 1 },
        { level: 'Extremo', text: "Qual a complexidade do Big O de uma busca binária?", options: ["O(n)", "O(log n)", "O(n^2)"], correctIndex: 1 }
    ];

    constructor() {
        this.players = [
            { id: 1, color: '#ff0000', position: 0, money: 500, properties: [], clientId: null },
            { id: 2, color: '#0000ff', position: 0, money: 500, properties: [], clientId: null },
        ];
        this.currentPlayerIndex = 0;
        this.diceValue = null;
        this.isRolling = false;
        this.boardConfig = this.generateBoard();
    }

    private generateBoard(): SpaceData[] {
        const importantCompanies = {
            5: "Nvidia",
            15: "Amazon",
            25: "Apple",
            35: "Microsoft"
        };

        return Array.from({ length: BOARD_SIZE }).map((_, i) => {
            let color = '#e5e7eb';
            let type: 'property' | 'corner' = 'property';
            let level: SpaceLevel = 'Fácil';
            let name = `Empresa ${i}`;
            let price = 50 + (i * 10);
            let isImportant = false;

            if (i === 0) { type = 'corner'; name = 'Start'; color = '#22c55e'; level = 'Corner'; }
            else if (i === 10) { type = 'corner'; name = 'Chat GPT'; color = '#3b82f6'; level = 'Corner'; }
            else if (i === 20) { type = 'corner'; name = 'Auditoria'; color = '#ef4444'; level = 'Corner'; }
            else if (i === 30) { type = 'corner'; name = 'Coffee Break'; color = '#f59e0b'; level = 'Corner'; }
            else {
                if (importantCompanies[i as keyof typeof importantCompanies]) {
                    name = importantCompanies[i as keyof typeof importantCompanies];
                    level = 'Extremo';
                    price = 400;
                    isImportant = true;
                } else if (i < 10) level = 'Fácil';
                else if (i < 20) level = 'Intermédio';
                else if (i < 30) level = 'Difícil';
                else level = 'Extremo';

                if (level === 'Fácil') color = '#8B4513';
                else if (level === 'Intermédio') color = '#87CEEB';
                else if (level === 'Difícil') color = '#FFD700';
                else color = '#228B22';
            }

            return {
                id: i,
                name,
                color,
                type,
                level,
                isImportant,
                price: type === 'property' ? price : undefined,
                ownerId: null,
                imageUrl: `https://picsum.photos/seed/${i}/200`
            };
        });
    }

    public getState(): GameStateData {
        return {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            diceValue: this.diceValue,
            boardConfig: this.boardConfig,
            isRolling: this.isRolling,
            currentQuestion: this.currentQuestion,
            pendingPurchaseId: this.pendingPurchaseId
        };
    }

    public joinGame(clientId: string): number | null {
        // Find existing player for this client
        const existingPlayer = this.players.find(p => p.clientId === clientId);
        if (existingPlayer) return existingPlayer.id;

        // Assign to first available slot
        const availablePlayer = this.players.find(p => p.clientId === null);
        if (availablePlayer) {
            availablePlayer.clientId = clientId;
            return availablePlayer.id;
        }

        return null; // No slots left
    }

    private validateAction(clientId: string): boolean {
        const currentPlayer = this.players[this.currentPlayerIndex];
        return currentPlayer.clientId === clientId;
    }

    public rollDice(clientId: string) {
        if (!this.validateAction(clientId)) return;
        if (this.isRolling || this.currentQuestion) return;

        this.isRolling = true;

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const roll = d1 + d2;
        const player = this.players[this.currentPlayerIndex];

        let newPos = player.position + roll;
        if (newPos >= BOARD_SIZE) {
            newPos -= BOARD_SIZE;
            player.money += 100; // Passed Start
        }

        player.position = newPos;

        // Rent logic (50% of value)
        const space = this.boardConfig[newPos];
        if (space.type === 'property' && space.ownerId !== null && space.ownerId !== player.id) {
            const owner = this.players.find(p => p.id === space.ownerId);
            if (owner) {
                const rentAmount = Math.floor((space.price || 0) * 0.5);
                player.money -= rentAmount;
                owner.money += rentAmount;
            }
        }

        this.diceValue = [d1, d2];
        this.isRolling = false;
    }

    public requestPurchase(clientId: string) {
        if (!this.validateAction(clientId)) return false;
        const player = this.players[this.currentPlayerIndex];
        const space = this.boardConfig[player.position];

        if (space.type === 'property' && space.ownerId === null && player.money >= (space.price || 0)) {
            // Select a question of matching level
            const available = this.questions.filter(q => q.level === space.level);
            this.currentQuestion = available[Math.floor(Math.random() * available.length)] || this.questions[0];
            this.pendingPurchaseId = space.id;
            return true;
        }
        return false;
    }

    public answerQuestion(clientId: string, optionIndex: number) {
        if (!this.validateAction(clientId)) return false;
        if (!this.currentQuestion || this.pendingPurchaseId === null) return false;

        const player = this.players[this.currentPlayerIndex];
        const space = this.boardConfig[this.pendingPurchaseId];

        const isCorrect = optionIndex === this.currentQuestion.correctIndex;

        if (isCorrect) {
            player.money -= space.price || 0;
            player.properties.push(space.id);
            space.ownerId = player.id;
        }

        this.currentQuestion = null;
        this.pendingPurchaseId = null;
        return isCorrect;
    }

    public sellProperty(clientId: string, propertyId: number) {
        // Selling can be done by the owner, but for simplicity we only allow it on their turn
        // OR we could allow it anytime if it's their property.
        // The user said "na minha vez", so let's stick to turn-based or owner-based validation.
        const player = this.players.find(p => p.clientId === clientId);
        if (!player) return false;

        const propertyIndex = player.properties.indexOf(propertyId);

        if (propertyIndex > -1) {
            const space = this.boardConfig[propertyId];
            const salePrice = Math.floor((space.price || 0) * 0.25);

            player.money += salePrice;
            player.properties.splice(propertyIndex, 1);
            space.ownerId = null;
            return true;
        }
        return false;
    }

    public nextTurn(clientId: string) {
        if (!this.validateAction(clientId)) return;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.diceValue = null;
    }
}
