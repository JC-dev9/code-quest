import express from 'express';
import cors from 'cors';
import { GameState } from './gameState';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const gameState = new GameState();

app.get('/gamestate', (req, res) => {
    res.json(gameState.getState());
});

app.post('/api/join', (req, res) => {
    const { clientId } = req.body;
    const playerId = gameState.joinGame(clientId);
    res.json({ playerId, state: gameState.getState() });
});

app.post('/api/roll', (req, res) => {
    const clientId = req.headers['client-id'] as string;
    gameState.rollDice(clientId);
    res.json(gameState.getState());
});

app.post('/api/request-purchase', (req, res) => {
    const clientId = req.headers['client-id'] as string;
    gameState.requestPurchase(clientId);
    res.json(gameState.getState());
});

app.post('/api/answer', (req, res) => {
    const { optionIndex } = req.body;
    const clientId = req.headers['client-id'] as string;
    gameState.answerQuestion(clientId, optionIndex);
    res.json(gameState.getState());
});

app.post('/api/sell', (req, res) => {
    const { propertyId } = req.body;
    const clientId = req.headers['client-id'] as string;
    gameState.sellProperty(clientId, propertyId);
    res.json(gameState.getState());
});

app.post('/api/next-turn', (req, res) => {
    const clientId = req.headers['client-id'] as string;
    gameState.nextTurn(clientId);
    res.json(gameState.getState());
});

app.listen(port, () => {
    console.log(`Bananapoly backend listening at http://localhost:${port}`);
});
