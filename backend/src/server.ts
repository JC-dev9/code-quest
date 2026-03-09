import 'dotenv/config';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import app from './app';
import { GameController } from './controllers/GameController';
import os from 'os';
import SupabaseService from './services/SupabaseService';

const port = 3000;

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Inicializar Controlador do Jogo
const gameController = new GameController(io);

io.on('connection', (socket) => {
    gameController.handleConnection(socket);
});

// Helper para encontrar IP da rede
const getNetworkIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]!) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};

const initServer = async () => {
    // 1. Carregar perguntas do Supabase para cache em memória
    await SupabaseService.getInstance().loadAllQuestions();

    // 2. Iniciar servidor
    httpServer.listen(port, '0.0.0.0', () => {
        const ip = getNetworkIp();
        console.log(`🎮 CodeQuest Backend rodando em http://localhost:${port}`);
        console.log(`🌐 Acesso na rede: http://${ip}:${port}`);
        console.log(`📱 Para jogar em rede, conecte-se ao IP acima.`);
    });
};

initServer();
