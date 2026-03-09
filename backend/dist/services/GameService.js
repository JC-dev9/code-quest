"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const constants_1 = require("../config/constants");
const boardGenerator_1 = require("../utils/boardGenerator");
const SupabaseService_1 = __importDefault(require("./SupabaseService"));
// ============================================================
// IDs dos cantos especiais
// ============================================================
const CORNER_START = 0;
const CORNER_CHATGPT = 10;
const CORNER_AUDITORIA = 20;
const CORNER_COFFEE_BREAK = 30;
// IDs das empresas importantes (meio de cada lado)
const IMPORTANT_COMPANY_IDS = [5, 15, 25, 35];
class GameService {
    constructor() {
        this.currentQuestion = null;
        this.pendingPurchaseId = null;
        this.winnerId = null;
        this.lastEvent = null;
        this.awaitingChatGPTChoice = false;
        this.roomCode = null;
        // Mutex para bloquear race conditions
        this.isProcessingAction = false;
        // Callback para notificar mudanças de estado ao controlador
        this.onStateChange = null;
        this.players = [];
        this.currentPlayerIndex = 0;
        this.diceValue = null;
        this.isRolling = false;
        this.gamePhase = 'WAITING';
        this.boardConfig = (0, boardGenerator_1.generateBoard)();
        this.supabase = SupabaseService_1.default.getInstance();
    }
    // ============================================================
    // Gestão de Estado
    // ============================================================
    setRoomCode(code) {
        this.roomCode = code;
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
            gamePhase: this.gamePhase,
            winnerId: this.winnerId,
            lastEvent: this.lastEvent,
            awaitingChatGPTChoice: this.awaitingChatGPTChoice
        };
    }
    setOnStateChange(cb) {
        this.onStateChange = cb;
    }
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
        }
        // Persistir estado no Supabase (assíncrono, sem bloquear)
        this.persistState();
    }
    /** Persistir estado da sala no Supabase */
    persistState() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.roomCode)
                return;
            const status = this.gamePhase === 'FINISHED' ? 'FINISHED'
                : this.gamePhase === 'WAITING' ? 'WAITING'
                    : 'PLAYING';
            const activePlayers = this.players.filter(p => !p.isBankrupt).length;
            yield this.supabase.saveRoomState(this.roomCode, this.getState(), status, activePlayers);
        });
    }
    /** Restaurar estado a partir de dados guardados (reconexão) */
    restoreFromState(state) {
        var _a, _b, _c;
        this.players = state.players;
        this.currentPlayerIndex = state.currentPlayerIndex;
        this.diceValue = state.diceValue;
        this.boardConfig = state.boardConfig;
        this.isRolling = state.isRolling;
        this.currentQuestion = state.currentQuestion;
        this.pendingPurchaseId = state.pendingPurchaseId;
        this.gamePhase = state.gamePhase;
        this.winnerId = (_a = state.winnerId) !== null && _a !== void 0 ? _a : null;
        this.lastEvent = (_b = state.lastEvent) !== null && _b !== void 0 ? _b : null;
        this.awaitingChatGPTChoice = (_c = state.awaitingChatGPTChoice) !== null && _c !== void 0 ? _c : false;
    }
    // ============================================================
    // Emitir Eventos de Jogo (notificações)
    // ============================================================
    emitEvent(type, playerId, message, extra) {
        this.lastEvent = Object.assign({ type,
            playerId,
            message }, extra);
    }
    // ============================================================
    // Entrar / Reconectar
    // ============================================================
    joinGame(clientId) {
        // Verificar se o jogador já existe na sala
        const existingPlayer = this.players.find(p => p.clientId === clientId);
        if (existingPlayer)
            return existingPlayer.id;
        // Verificar slots disponíveis (máximo 2 jogadores)
        if (this.players.length >= 2) {
            return null;
        }
        // Criar novo jogador dinamicamente
        const playerId = this.players.length + 1;
        const playerColors = ['#ff0000', '#0000ff'];
        const playerNames = ['Jogador 1', 'Jogador 2'];
        const newPlayer = {
            id: playerId,
            color: playerColors[playerId - 1],
            position: 0,
            money: constants_1.INITIAL_MONEY,
            properties: [],
            clientId: clientId,
            purchaseAttemptUsed: false,
            skipTurns: 0,
            isBankrupt: false,
            displayName: playerNames[playerId - 1]
        };
        this.players.push(newPlayer);
        return playerId;
    }
    reconnectPlayer(playerId, newClientId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.clientId = newClientId;
            return true;
        }
        return false;
    }
    // ============================================================
    // Iniciar Jogo
    // ============================================================
    startGame() {
        if (this.gamePhase === 'WAITING') {
            this.gamePhase = 'INITIAL_ROLL';
            this.currentPlayerIndex = this.players.findIndex(p => p.clientId !== null);
            if (this.currentPlayerIndex === -1)
                this.currentPlayerIndex = 0;
        }
    }
    // ============================================================
    // Validação de Ações
    // ============================================================
    validateAction(clientId) {
        const currentPlayer = this.players[this.currentPlayerIndex];
        return currentPlayer !== undefined && currentPlayer.clientId === clientId;
    }
    /** Adquirir lock para ação (prevenir race conditions) */
    acquireLock() {
        if (this.isProcessingAction)
            return false;
        this.isProcessingAction = true;
        return true;
    }
    releaseLock() {
        this.isProcessingAction = false;
    }
    // ============================================================
    // Rolar Dados
    // ============================================================
    rollDice(clientId) {
        if (!this.validateAction(clientId) || this.isRolling)
            return;
        if (!this.acquireLock())
            return; // Bloquear duplo-clique
        if (this.gamePhase === 'INITIAL_ROLL') {
            this.handleInitialRoll();
            return;
        }
        if (this.gamePhase !== 'PLAYING' || this.currentQuestion || this.awaitingChatGPTChoice) {
            this.releaseLock();
            return;
        }
        const player = this.players[this.currentPlayerIndex];
        // Verificar se o jogador tem turnos a saltar (Coffee Break)
        if (player.skipTurns > 0) {
            player.skipTurns--;
            this.emitEvent('COFFEE_BREAK', player.id, `☕ ${player.displayName} está no Coffee Break! Faltam ${player.skipTurns} turno(s).`);
            this.advanceToNextPlayer();
            this.releaseLock();
            this.notifyStateChange();
            return;
        }
        this.isRolling = true;
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const roll = d1 + d2;
        let newPos = player.position + roll;
        // Verificar se passou pelo Start
        if (newPos >= constants_1.BOARD_SIZE) {
            newPos -= constants_1.BOARD_SIZE;
            player.money += 100;
            this.emitEvent('PASSED_START', player.id, `🏁 ${player.displayName} passou pelo Start e recebeu 100 DG!`, { amount: 100 });
        }
        player.position = newPos;
        this.diceValue = [d1, d2];
        this.isRolling = false;
        // Processar a casa onde o jogador caiu
        this.processLanding(player);
        this.releaseLock();
        this.notifyStateChange();
    }
    // ============================================================
    // Processar chegada a uma casa
    // ============================================================
    processLanding(player) {
        var _a;
        const space = this.boardConfig[player.position];
        // --- Cantos Especiais ---
        if (space.type === 'corner') {
            switch (player.position) {
                case CORNER_START:
                    // Já processado acima (passar pelo start)
                    break;
                case CORNER_CHATGPT:
                    // Jogador escolhe para que casa quer avançar
                    this.awaitingChatGPTChoice = true;
                    this.emitEvent('CHATGPT_MOVE', player.id, `🤖 ${player.displayName} caiu no Chat GPT! Escolha uma casa para avançar.`);
                    break;
                case CORNER_AUDITORIA:
                    this.processAuditoria(player);
                    break;
                case CORNER_COFFEE_BREAK:
                    player.skipTurns = 2;
                    this.emitEvent('COFFEE_BREAK', player.id, `☕ ${player.displayName} caiu no Coffee Break! Fica parado 2 turnos completos.`);
                    break;
            }
            return;
        }
        // --- Propriedade de outro jogador (pagar aluguel) ---
        if (space.type === 'property' && space.ownerId !== null && space.ownerId !== player.id) {
            const owner = this.players.find(p => p.id === space.ownerId);
            if (owner && !owner.isBankrupt) {
                const rentAmount = Math.floor(((_a = space.price) !== null && _a !== void 0 ? _a : 0) * 0.5);
                player.money -= rentAmount;
                owner.money += rentAmount;
                this.emitEvent('RENT_PAID', player.id, `💰 ${player.displayName} pagou ${rentAmount} DG de aluguel a ${owner.displayName}!`, {
                    amount: rentAmount,
                    targetPlayerId: owner.id
                });
                // Verificar falência após pagar aluguel
                this.checkBankruptcy(player);
            }
        }
    }
    // ============================================================
    // Lógica de cantos especiais
    // ============================================================
    /** Auditoria: Pagar 25% do valor total das empresas */
    processAuditoria(player) {
        const totalValue = player.properties.reduce((sum, propId) => {
            var _a;
            const space = this.boardConfig[propId];
            return sum + ((_a = space.price) !== null && _a !== void 0 ? _a : 0);
        }, 0);
        const taxAmount = Math.floor(totalValue * 0.25);
        if (taxAmount > 0) {
            player.money -= taxAmount;
            this.emitEvent('AUDIT_TAX', player.id, `⚖️ Auditoria! ${player.displayName} pagou ${taxAmount} DG (25% do valor das empresas).`, { amount: taxAmount });
            this.checkBankruptcy(player);
        }
        else {
            this.emitEvent('AUDIT_TAX', player.id, `⚖️ ${player.displayName} passou pela Auditoria sem empresas. Sem taxa!`);
        }
    }
    /** Chat GPT: Jogador escolhe para onde avançar */
    processChatGPTChoice(clientId, targetSpaceId) {
        if (!this.validateAction(clientId) || !this.awaitingChatGPTChoice)
            return;
        if (targetSpaceId < 0 || targetSpaceId >= constants_1.BOARD_SIZE)
            return;
        // Não pode escolher a própria casa nem cantos
        const targetSpace = this.boardConfig[targetSpaceId];
        if (targetSpace.type === 'corner')
            return;
        const player = this.players[this.currentPlayerIndex];
        player.position = targetSpaceId;
        this.awaitingChatGPTChoice = false;
        this.emitEvent('CHATGPT_MOVE', player.id, `🤖 ${player.displayName} usou o Chat GPT e avançou para ${targetSpace.name}!`);
        // Processar a casa de destino (pode ter aluguel)
        this.processLanding(player);
        this.notifyStateChange();
    }
    // ============================================================
    // Initial Roll (determinar ordem de jogo)
    // ============================================================
    handleInitialRoll() {
        this.isRolling = true;
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        this.diceValue = [d1, d2];
        const player = this.players[this.currentPlayerIndex];
        player.initialRoll = d1 + d2;
        // Delay para UX (visualização dos dados)
        setTimeout(() => {
            this.isRolling = false;
            // Encontrar o próximo jogador que ainda não rolou
            const nextPlayerIndex = this.players.findIndex(p => p.initialRoll === undefined);
            if (nextPlayerIndex !== -1) {
                this.currentPlayerIndex = nextPlayerIndex;
            }
            else {
                // Todos rolaram — definir ordem final
                const activePlayers = [...this.players];
                activePlayers.sort((a, b) => { var _a, _b; return ((_a = b.initialRoll) !== null && _a !== void 0 ? _a : 0) - ((_b = a.initialRoll) !== null && _b !== void 0 ? _b : 0); });
                this.players = activePlayers;
                this.currentPlayerIndex = 0;
                this.gamePhase = 'PLAYING';
                this.diceValue = null;
                console.log('🏁 Ordem definida:', this.players.map(p => `${p.displayName} (${p.initialRoll})`).join(', '));
            }
            this.releaseLock();
            this.notifyStateChange();
        }, 1500);
    }
    // ============================================================
    // Compra de Propriedades
    // ============================================================
    requestPurchase(clientId) {
        var _a;
        if (this.gamePhase !== 'PLAYING' || !this.validateAction(clientId))
            return false;
        const player = this.players[this.currentPlayerIndex];
        if (player.purchaseAttemptUsed)
            return false;
        const space = this.boardConfig[player.position];
        // Validação estrita: propriedade livre, dinheiro suficiente
        if (space.type === 'property' && space.ownerId === null && player.money >= ((_a = space.price) !== null && _a !== void 0 ? _a : 0)) {
            // Filtrar perguntas pelo nível da casa
            const dbQuestions = this.supabase.getQuestions();
            const available = dbQuestions.filter(q => q.level === space.level);
            if (available.length > 0) {
                this.currentQuestion = available[Math.floor(Math.random() * available.length)];
            }
            else {
                // Instância de Fallback se não houver perguntas do nível na DB
                console.warn(`Aviso: Nenhuma pergunta encontrada para o nível ${space.level}. Usar fallback.`);
                this.currentQuestion = {
                    text: "Pergunta de Emergência (Base de dados sem perguntas para este nível). O que é HTML?",
                    options: ["HyperText Markup Language", "Hi Text", "None"],
                    correctIndex: 0,
                    level: space.level
                };
            }
            this.pendingPurchaseId = space.id;
            player.purchaseAttemptUsed = true;
            this.notifyStateChange();
            return true;
        }
        return false;
    }
    answerQuestion(clientId, optionIndex) {
        var _a;
        if (!this.validateAction(clientId) || !this.currentQuestion || this.pendingPurchaseId === null)
            return false;
        const player = this.players[this.currentPlayerIndex];
        const space = this.boardConfig[this.pendingPurchaseId];
        const isCorrect = optionIndex === this.currentQuestion.correctIndex;
        if (isCorrect) {
            player.money -= (_a = space.price) !== null && _a !== void 0 ? _a : 0;
            player.properties.push(space.id);
            space.ownerId = player.id;
            this.emitEvent('PROPERTY_BOUGHT', player.id, `🏢 ${player.displayName} comprou ${space.name} por ${space.price} DG!`, { amount: space.price });
            this.emitEvent('ANSWER_CORRECT', player.id, `✅ Resposta correta!`);
        }
        else {
            this.emitEvent('ANSWER_WRONG', player.id, `❌ Resposta errada! ${player.displayName} não conseguiu comprar ${space.name}.`);
        }
        this.currentQuestion = null;
        this.pendingPurchaseId = null;
        // Verificar condição de vitória
        this.checkVictoryCondition();
        this.notifyStateChange();
        return isCorrect;
    }
    // ============================================================
    // Venda de Propriedades
    // ============================================================
    sellProperty(clientId, propertyId) {
        var _a;
        const player = this.players.find(p => p.clientId === clientId);
        if (!player)
            return false;
        const propertyIndex = player.properties.indexOf(propertyId);
        if (propertyIndex > -1) {
            const space = this.boardConfig[propertyId];
            // Empresas importantes não podem ser vendidas
            if (space.isImportant)
                return false;
            const salePrice = Math.floor(((_a = space.price) !== null && _a !== void 0 ? _a : 0) * 0.25);
            player.money += salePrice;
            player.properties.splice(propertyIndex, 1);
            space.ownerId = null;
            this.emitEvent('PROPERTY_BOUGHT', player.id, `📤 ${player.displayName} vendeu ${space.name} por ${salePrice} DG.`, { amount: salePrice });
            this.notifyStateChange();
            return true;
        }
        return false;
    }
    // ============================================================
    // Próximo Turno
    // ============================================================
    nextTurn(clientId) {
        if (this.gamePhase !== 'PLAYING' || !this.validateAction(clientId))
            return;
        if (this.awaitingChatGPTChoice)
            return; // Não pode passar turno enquanto Chat GPT activo
        this.lastEvent = null; // Limpar evento anterior
        this.advanceToNextPlayer();
        this.notifyStateChange();
    }
    /** Avançar para o próximo jogador que não está falido */
    advanceToNextPlayer() {
        const activePlayersCount = this.players.filter(p => !p.isBankrupt).length;
        // Se só resta 1 jogador, jogo acabou
        if (activePlayersCount <= 1) {
            this.checkVictoryCondition();
            return;
        }
        // Encontrar o próximo jogador não falido
        let nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
        let safeguard = 0;
        while (this.players[nextIndex].isBankrupt && safeguard < this.players.length) {
            nextIndex = (nextIndex + 1) % this.players.length;
            safeguard++;
        }
        this.currentPlayerIndex = nextIndex;
        // Reset de estados de turno
        this.diceValue = null;
        this.players[this.currentPlayerIndex].purchaseAttemptUsed = false;
        this.currentQuestion = null;
        this.pendingPurchaseId = null;
    }
    // ============================================================
    // Falência e Vitória
    // ============================================================
    /** Verificar se um jogador entrou em falência */
    checkBankruptcy(player) {
        if (player.money <= 0 && player.properties.length === 0) {
            player.isBankrupt = true;
            player.money = 0;
            this.emitEvent('PLAYER_BANKRUPT', player.id, `💀 ${player.displayName} foi à falência!`);
            // Devolver todas as propriedades ao banco
            for (const propId of player.properties) {
                const space = this.boardConfig[propId];
                space.ownerId = null;
            }
            player.properties = [];
            this.checkVictoryCondition();
        }
    }
    /** Verificar condição de vitória */
    checkVictoryCondition() {
        if (this.gamePhase === 'FINISHED')
            return;
        // Condição 1: Possuir as 4 empresas importantes
        for (const player of this.players) {
            if (player.isBankrupt)
                continue;
            const importantOwned = IMPORTANT_COMPANY_IDS.filter(id => player.properties.includes(id));
            if (importantOwned.length >= 4) {
                this.declareWinner(player);
                return;
            }
        }
        // Condição 2: Todos os adversários falidos
        const activePlayers = this.players.filter(p => !p.isBankrupt);
        if (activePlayers.length === 1) {
            this.declareWinner(activePlayers[0]);
            return;
        }
    }
    /** Declarar vencedor e terminar o jogo */
    declareWinner(winner) {
        this.winnerId = winner.id;
        this.gamePhase = 'FINISHED';
        this.emitEvent('GAME_OVER', winner.id, `🏆 ${winner.displayName} venceu o Code Quest!`);
        console.log(`🏆 Jogo terminado! Vencedor: ${winner.displayName}`);
        this.notifyStateChange();
    }
}
exports.GameService = GameService;
