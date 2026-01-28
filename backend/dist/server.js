"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const GameController_1 = require("./controllers/GameController");
const os_1 = __importDefault(require("os"));
const port = 3000;
const httpServer = (0, node_http_1.createServer)(app_1.default);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
// Inicializar Controlador do Jogo
const gameController = new GameController_1.GameController(io);
io.on('connection', (socket) => {
    gameController.handleConnection(socket);
});
// Helper para encontrar IP da rede
const getNetworkIp = () => {
    const interfaces = os_1.default.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
};
httpServer.listen(port, '0.0.0.0', () => {
    const ip = getNetworkIp();
    console.log(`🎮 CodeQuest Backend rodando em http://localhost:${port}`);
    console.log(`🌐 Acesso na rede: http://${ip}:${port}`);
    console.log(`📱 Para jogar em rede, conecte-se ao IP acima.`);
});
