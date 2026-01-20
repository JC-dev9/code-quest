export type Player = {
    id: number;
    color: string;
    position: number;
    money: number;
    properties: number[]; // Array of space IDs
};

export type SpaceData = {
    id: number;
    name: string;
    color: string;
    type: 'property' | 'corner';
    price?: number;
    rent?: number;
    level?: number;
    ownerId?: number | null;
    imageUrl?: string;
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
            { id: 1, color: '#ff0000', position: 0, money: 1500, properties: [] },
            { id: 2, color: '#0000ff', position: 0, money: 1500, properties: [] },
        ];
        this.currentPlayerIndex = 0;
        this.diceValue = null;
        this.isRolling = false;
        this.boardConfig = this.generateBoard();
    }

    private generateBoard(): SpaceData[] {
        const companyNames = [
            "TechNova", "BioGen", "EcoPower", "SkyNet", "CyberEdge",
            "OmniCorp", "GlobalLogistics", "FutureLabs", "QuantumSys", "NanoSoft",
            "SpaceX", "SolarCity", "DeepMind", "OpenAI", "Neuralink",
            "ByteDance", "Stripe", "Airbnb", "Uber", "Palantir",
            "Tesla", "Apple", "Google", "Amazon", "Microsoft",
            "Netflix", "Meta", "Nvidia", "AMD", "Intel",
            "Cisco", "Oracle", "SAP", "Salesforce", "Adobe",
            "Zoom", "Slack", "Discord", "Spotify", "GitHub"
        ];

        return Array.from({ length: BOARD_SIZE }).map((_, i) => {
            let color = '#e5e7eb'; // Default gray
            let type: 'property' | 'corner' = 'property';
            let name = companyNames[i] || `Company ${i}`;
            let price = 50 + (i * 10);

            if (i % 10 === 0) {
                type = 'corner';
                color = '#000000'; // Corners
                price = 0;
                if (i === 0) name = 'GO';
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

            return {
                id: i,
                name,
                color,
                type,
                price: type === 'property' ? price : undefined,
                rent: type === 'property' ? Math.floor(price * 0.2) : undefined, // 20% of price
                level: type === 'property' ? 1 : undefined,
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
            isRolling: this.isRolling
        };
    }

    public rollDice() {
        if (this.isRolling) return;

        this.isRolling = true;

        const roll = Math.floor(Math.random() * 6) + 1;
        const player = this.players[this.currentPlayerIndex];

        let newPos = player.position + roll;
        if (newPos >= BOARD_SIZE) {
            newPos -= BOARD_SIZE;
            player.money += 200; // Passed GO
        }

        player.position = newPos;

        // Rent logic
        const space = this.boardConfig[newPos];
        if (space.type === 'property' && space.ownerId !== null && space.ownerId !== player.id) {
            const owner = this.players.find(p => p.id === space.ownerId);
            if (owner) {
                const rentAmount = (space.rent || 0) * (space.level || 1);
                player.money -= rentAmount;
                owner.money += rentAmount;
                console.log(`Player ${player.id} paid ${rentAmount} rent to Player ${owner.id}`);
            }
        }

        this.diceValue = roll;
        this.isRolling = false;
    }

    public buyProperty() {
        const player = this.players[this.currentPlayerIndex];
        const space = this.boardConfig[player.position];

        if (space.type === 'property' && space.ownerId === null && player.money >= (space.price || 0)) {
            player.money -= space.price || 0;
            player.properties.push(space.id);
            space.ownerId = player.id;
            return true;
        }
        return false;
    }

    public nextTurn() {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.diceValue = null;
    }
}
