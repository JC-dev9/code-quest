"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = void 0;
const BOARD_SIZE = 40;
class GameState {
    constructor() {
        this.currentQuestion = null;
        this.pendingPurchaseId = null;
        this.questions = [
            { level: 'Fácil', text: "O que significa HTML?", options: ["HyperText Markup Language", "HighTech Modern Language", "Hyperlink Text Mode"], correctIndex: 0 },
            { level: 'Fácil', text: "Qual destes é um tipo primitivo em JS?", options: ["Object", "String", "Array"], correctIndex: 1 },
            { level: 'Intermédio', text: "Qual a diferença entre == e ===?", options: ["Nenhuma", "== compara valor, === valor e tipo", "=== é para strings"], correctIndex: 1 },
            { level: 'Intermédio', text: "Como se declara uma variável que não muda?", options: ["var", "let", "const"], correctIndex: 2 },
            { level: 'Difícil', text: "O que faz o useMemo em React?", options: ["Memoiza um componente", "Memoiza um valor calculado", "Executa código após render"], correctIndex: 1 },
            { level: 'Extremo', text: "Qual a complexidade do Big O de uma busca binária?", options: ["O(n)", "O(log n)", "O(n^2)"], correctIndex: 1 }
        ];
        this.onStateChange = null;
        this.players = [
            { id: 1, color: '#ff0000', position: 0, money: 500, properties: [], clientId: null, purchaseAttemptUsed: false },
            { id: 2, color: '#0000ff', position: 0, money: 500, properties: [], clientId: null, purchaseAttemptUsed: false },
        ];
        this.currentPlayerIndex = 0;
        this.diceValue = null;
        this.isRolling = false;
        this.gamePhase = 'WAITING';
        this.boardConfig = this.generateBoard();
    }
    generateBoard() {
        // Define companies by tier/folder
        const tier50 = [
            { name: "Fortinet", file: "64px-Fortinet_Logo.png" },
            { name: "Vercel", file: "Vercel.png" },
            { name: "Stripe", file: "Stripe.png" },
            { name: "Stack Overflow", file: "Stack_Overflow.png" },
            { name: "Slack", file: "Slack.png" },
            { name: "Figma", file: "Figma.png" },
            { name: "GitHub", file: "GitHub.png" },
            { name: "LinkedIn", file: "linkedIn_PNG6.png" }
        ];
        const tier100 = [
            { name: "Raspberry Pi", file: "RapeberryPI.png" },
            { name: "Arduino", file: "Arduino.png" },
            { name: "Spotify", file: "Spotify.png" },
            { name: "Shopify", file: "Shopify.png" },
            { name: "ThinkPad", file: "ThinkPad.png" },
            { name: "Intel", file: "intel.png" },
            { name: "Postman", file: "PostMan.png" },
            { name: "OpenAI", file: "OpenAI.png" }
        ];
        const tier150 = [
            { name: "Tencent", file: "128px-Tencent_logo_2017.svg.png" },
            { name: "AMD", file: "AMD.png" },
            { name: "Adobe", file: "Adobe.png" },
            { name: "Cisco", file: "Cisco.png" },
            { name: "Red Hat", file: "Red_Hat.png" },
            { name: "Azure", file: "Azure.png" },
            { name: "PostgreSQL", file: "PostgreSQL.png" },
            { name: "Jetbrains", file: "Jetbrains.png" }
        ];
        const tier200 = [
            { name: "Linux Foundation", file: "64px-Linux_Foundation_logo.png" },
            { name: "SpaceX", file: "SpaceX.png" },
            { name: "Docker", file: "Docker.png" },
            { name: "Oracle", file: "Oracle.png" },
            { name: "Broadcom", file: "Broadcom.png" },
            { name: "YouTube", file: "YouTube.png" },
            { name: "Meta", file: "Meta.png" },
            { name: "AWS", file: "AWS.png" }
        ];
        // Helper to get image path
        const getPath = (folder, file) => `/logosCodeQuest/Nova pasta/${folder}/${file}`;
        return Array.from({ length: 40 }).map((_, i) => {
            let color = '#e5e7eb';
            let type = 'property';
            let level = 'Fácil';
            let name = `Empresa ${i}`;
            let price = 50;
            let isImportant = false;
            let imageUrl = '';
            // Corners
            if (i === 0) {
                return { id: i, name: 'Start', color: '#22c55e', type: 'corner', level: 'Corner' };
            }
            if (i === 10) {
                return { id: i, name: 'Chat GPT', color: '#3b82f6', type: 'corner', level: 'Corner' };
            } // Jail/Visiting
            if (i === 20) {
                return { id: i, name: 'Auditoria', color: '#ef4444', type: 'corner', level: 'Corner' };
            } // Free Parking
            if (i === 30) {
                return { id: i, name: 'Coffee Break', color: '#f59e0b', type: 'corner', level: 'Corner' };
            } // Go to Jail
            // Assign companies based on board position (approximate Monopoly grouping)
            // 0-10: Tier 50 (Brown/LightBlue)
            // 11-20: Tier 100 (Pink/Orange)
            // 21-30: Tier 150 (Red/Yellow)
            // 31-39: Tier 200 (Green/Blue)
            if (i > 0 && i < 10) {
                const idx = (i - 1) % tier50.length;
                const company = tier50[idx];
                name = company.name;
                price = 50;
                level = 'Fácil';
                color = i < 5 ? '#8B4513' : '#87CEEB'; // Brown / Light Blue equivalent
                imageUrl = getPath('50', company.file);
            }
            else if (i > 10 && i < 20) {
                const idx = (i - 11) % tier100.length;
                const company = tier100[idx];
                name = company.name;
                price = 100;
                level = 'Intermédio';
                color = i < 15 ? '#DA70D6' : '#FFA500'; // Pink / Orange
                imageUrl = getPath('100', company.file);
            }
            else if (i > 20 && i < 30) {
                const idx = (i - 21) % tier150.length;
                const company = tier150[idx];
                name = company.name;
                price = 150;
                level = 'Difícil';
                color = i < 25 ? '#FF0000' : '#FFD700'; // Red / Yellow
                imageUrl = getPath('150', company.file);
            }
            else if (i > 30) {
                const idx = (i - 31) % tier200.length;
                const company = tier200[idx];
                name = company.name;
                price = 200;
                level = 'Extremo';
                color = i < 35 ? '#008000' : '#0000FF'; // Green / Dark Blue
                imageUrl = getPath('200', company.file);
                if (i >= 37)
                    isImportant = true; // Top tier
            }
            return {
                id: i,
                name,
                color,
                type,
                level,
                isImportant,
                price,
                ownerId: null,
                imageUrl
            };
        });
    }
    getState() {
        return {
            players: this.players,
            currentPlayerIndex: this.currentPlayerIndex,
            diceValue: this.diceValue,
            boardConfig: this.boardConfig,
            isRolling: this.isRolling,
            currentQuestion: this.currentQuestion,
            pendingPurchaseId: this.pendingPurchaseId,
            gamePhase: this.gamePhase
        };
    }
    startGame() {
        if (this.gamePhase === 'WAITING') {
            this.gamePhase = 'INITIAL_ROLL';
            // Start with the first player who joined
            this.currentPlayerIndex = this.players.findIndex(p => p.clientId !== null);
            if (this.currentPlayerIndex === -1)
                this.currentPlayerIndex = 0;
        }
    }
    joinGame(clientId) {
        const existingPlayer = this.players.find(p => p.clientId === clientId);
        if (existingPlayer)
            return existingPlayer.id;
        const availablePlayer = this.players.find(p => p.clientId === null);
        if (availablePlayer) {
            availablePlayer.clientId = clientId;
            return availablePlayer.id;
        }
        return null;
    }
    validateAction(clientId) {
        const currentPlayer = this.players[this.currentPlayerIndex];
        return currentPlayer && currentPlayer.clientId === clientId;
    }
    rollDice(clientId) {
        if (!this.validateAction(clientId) || this.isRolling)
            return;
        if (this.gamePhase === 'INITIAL_ROLL') {
            this.handleInitialRoll();
            return;
        }
        if (this.gamePhase !== 'PLAYING' || this.currentQuestion)
            return;
        this.isRolling = true;
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const roll = d1 + d2;
        const player = this.players[this.currentPlayerIndex];
        let newPos = player.position + roll;
        if (newPos >= BOARD_SIZE) {
            newPos -= BOARD_SIZE;
            player.money += 100;
        }
        player.position = newPos;
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
    handleInitialRoll() {
        this.isRolling = true;
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        this.diceValue = [d1, d2];
        const player = this.players[this.currentPlayerIndex];
        player.initialRoll = d1 + d2;
        setTimeout(() => {
            this.isRolling = false;
            // Find next player who has joined
            let nextIndex = this.currentPlayerIndex + 1;
            while (nextIndex < this.players.length && this.players[nextIndex].clientId === null) {
                nextIndex++;
            }
            if (nextIndex < this.players.length) {
                this.currentPlayerIndex = nextIndex;
            }
            else {
                // All joined players rolled, determine order
                const activePlayers = this.players.filter(p => p.clientId !== null);
                activePlayers.sort((a, b) => (b.initialRoll || 0) - (a.initialRoll || 0));
                this.players = activePlayers;
                this.currentPlayerIndex = 0;
                this.gamePhase = 'PLAYING';
                this.diceValue = null;
            }
            if (this.onStateChange) {
                this.onStateChange(this.getState());
            }
        }, 1500);
    }
    requestPurchase(clientId) {
        if (this.gamePhase !== 'PLAYING' || !this.validateAction(clientId))
            return false;
        const player = this.players[this.currentPlayerIndex];
        if (player.purchaseAttemptUsed)
            return false;
        const space = this.boardConfig[player.position];
        if (space.type === 'property' && space.ownerId === null && player.money >= (space.price || 0)) {
            const available = this.questions.filter(q => q.level === space.level);
            this.currentQuestion = available[Math.floor(Math.random() * available.length)] || this.questions[0];
            this.pendingPurchaseId = space.id;
            player.purchaseAttemptUsed = true;
            return true;
        }
        return false;
    }
    answerQuestion(clientId, optionIndex) {
        if (!this.validateAction(clientId) || !this.currentQuestion || this.pendingPurchaseId === null)
            return false;
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
    sellProperty(clientId, propertyId) {
        const player = this.players.find(p => p.clientId === clientId);
        if (!player)
            return false;
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
    setOnStateChange(cb) {
        this.onStateChange = cb;
    }
    nextTurn(clientId) {
        if (this.gamePhase !== 'PLAYING' || !this.validateAction(clientId))
            return;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.diceValue = null;
        this.players[this.currentPlayerIndex].purchaseAttemptUsed = false;
    }
}
exports.GameState = GameState;
