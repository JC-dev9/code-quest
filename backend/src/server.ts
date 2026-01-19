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

app.post('/api/roll', (req, res) => {
    gameState.rollDice();
    res.json(gameState.getState());
});

app.post('/api/next-turn', (req, res) => {
    gameState.nextTurn();
    res.json(gameState.getState());
});

app.listen(port, () => {
    console.log(`Bananapoly backend listening at http://localhost:${port}`);
});
