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

export interface GameStateData {
    players: Player[];
    currentPlayerIndex: number;
    diceValue: number | null;
    boardConfig: SpaceData[];
    isRolling: boolean;
}

const BOARD_SIZE = 40;

export class GameState {
    private players: Player[];
    private currentPlayerIndex: number;
    private diceValue: number | null;
    private boardConfig: SpaceData[];
    private isRolling: boolean;

    constructor() {
        this.players = [
            { id: 1, color: '#ff0000', position: 0 },
            { id: 2, color: '#0000ff', position: 0 },
        ];
        this.currentPlayerIndex = 0;
        this.diceValue = null;
        this.isRolling = false;
        this.boardConfig = this.generateBoard();
    }

    private generateBoard(): SpaceData[] {
        return Array.from({ length: BOARD_SIZE }).map((_, i) => {
            let color = '#e5e7eb'; // Default gray
            let type: 'property' | 'corner' = 'property';
            let name = `Property ${i}`;

            if (i % 10 === 0) {
                type = 'corner';
                color = '#000000'; // Corners
                if (i === 0) name = 'Go';
                if (i === 10) name = 'Jail';
                if (i === 20) name = 'Free Parking';
                if (i === 30) name = 'Go To Jail';
            } else {
                // Simple color grouping
                if (i < 10) color = '#8B4513';
                else if (i < 20) color = '#87CEEB';
                else if (i < 30) color = '#FFD700';
                else color = '#228B22';
            }

            return { id: i, name, color, type };
        });
    }

    public getState(): GameStateData {
        return {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            diceValue: this.diceValue,
            boardConfig: this.boardConfig,
            isRolling: this.isRolling
        };
    }

    public rollDice() {
        if (this.isRolling) return;

        this.isRolling = true;

        // This logic is now instantaneous in the backend, 
        // but the frontend might still want to simulate animation.
        // However, for correct state management, we perform the move here.

        const roll = Math.floor(Math.random() * 6) + 1;
        const player = this.players[this.currentPlayerIndex];

        let newPos = player.position + roll;
        if (newPos >= BOARD_SIZE) newPos -= BOARD_SIZE;

        this.players[this.currentPlayerIndex] = { ...player, position: newPos };
        this.diceValue = roll;
        this.isRolling = false; // logic instantly complete
    }

    public nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.diceValue = null;
    }
}
