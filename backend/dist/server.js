"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const gameState_1 = require("./gameState");
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const gameState = new gameState_1.GameState();
app.get('/gamestate', (req, res) => {
    res.json(gameState.getState());
});
app.post('/api/join', (req, res) => {
    const { clientId } = req.body;
    const playerId = gameState.joinGame(clientId);
    res.json({ playerId, state: gameState.getState() });
});
app.post('/api/roll', (req, res) => {
    const clientId = req.headers['client-id'];
    gameState.rollDice(clientId);
    res.json(gameState.getState());
});
app.post('/api/request-purchase', (req, res) => {
    const clientId = req.headers['client-id'];
    gameState.requestPurchase(clientId);
    res.json(gameState.getState());
});
app.post('/api/answer', (req, res) => {
    const { optionIndex } = req.body;
    const clientId = req.headers['client-id'];
    gameState.answerQuestion(clientId, optionIndex);
    res.json(gameState.getState());
});
app.post('/api/sell', (req, res) => {
    const { propertyId } = req.body;
    const clientId = req.headers['client-id'];
    gameState.sellProperty(clientId, propertyId);
    res.json(gameState.getState());
});
app.post('/api/next-turn', (req, res) => {
    const clientId = req.headers['client-id'];
    gameState.nextTurn(clientId);
    res.json(gameState.getState());
});
app.listen(port, () => {
    console.log(`Bananapoly backend listening at http://localhost:${port}`);
});
