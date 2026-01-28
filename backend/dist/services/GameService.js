"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const constants_1 = require("../config/constants");
const questions_1 = require("../data/questions");
const boardGenerator_1 = require("../utils/boardGenerator");
class GameService {
    constructor() {
        this.currentQuestion = null;
        this.pendingPurchaseId = null;
        // Callback para notificar mudanças de estado
        this.onStateChange = null;
        this.players = [
            { id: 1, color: '#ff0000', position: 0, money: constants_1.INITIAL_MONEY, properties: [], clientId: null, purchaseAttemptUsed: false },
            { id: 2, color: '#0000ff', position: 0, money: constants_1.INITIAL_MONEY, properties: [], clientId: null, purchaseAttemptUsed: false },
        ];
        this.currentPlayerIndex = 0;
        this.diceValue = null;
        this.isRolling = false;
        this.gamePhase = 'WAITING';
        this.boardConfig = (0, boardGenerator_1.generateBoard)();
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
    setOnStateChange(cb) {
        this.onStateChange = cb;
    }
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
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
    startGame() {
        if (this.gamePhase === 'WAITING') {
            this.gamePhase = 'INITIAL_ROLL';
            // Começa com o primeiro jogador que entrou
            this.currentPlayerIndex = this.players.findIndex(p => p.clientId !== null);
            if (this.currentPlayerIndex === -1)
                this.currentPlayerIndex = 0;
        }
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
        if (newPos >= constants_1.BOARD_SIZE) {
            newPos -= constants_1.BOARD_SIZE;
            player.money += 100; // Recebe ao passar pelo início
        }
        player.position = newPos;
        // Lógica de pagamento de aluguel
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
        // Pequeno delay para UX
        setTimeout(() => {
            this.isRolling = false;
            // Encontrar o próximo jogador humano
            let nextIndex = this.currentPlayerIndex + 1;
            while (nextIndex < this.players.length && this.players[nextIndex].clientId === null) {
                nextIndex++;
            }
            if (nextIndex < this.players.length) {
                this.currentPlayerIndex = nextIndex;
            }
            else {
                // Todos rolaram, definir ordem
                const activePlayers = this.players.filter(p => p.clientId !== null);
                activePlayers.sort((a, b) => (b.initialRoll || 0) - (a.initialRoll || 0));
                this.players = activePlayers;
                this.currentPlayerIndex = 0;
                this.gamePhase = 'PLAYING';
                this.diceValue = null;
            }
            this.notifyStateChange();
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
            const available = questions_1.QUESTIONS.filter(q => q.level === space.level);
            this.currentQuestion = available[Math.floor(Math.random() * available.length)] || questions_1.QUESTIONS[0];
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
    nextTurn(clientId) {
        if (this.gamePhase !== 'PLAYING' || !this.validateAction(clientId))
            return;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.diceValue = null;
        this.players[this.currentPlayerIndex].purchaseAttemptUsed = false;
    }
}
exports.GameService = GameService;
