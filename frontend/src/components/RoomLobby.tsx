import { useState } from 'react';

interface RoomLobbyProps {
    roomCode: string;
    players: Array<{ id: number; color: string }>;
    isHost: boolean;
    onStartGame: () => void;
    onLeaveRoom: () => void;
}

export const RoomLobby = ({ roomCode, players, isHost, onStartGame, onLeaveRoom }: RoomLobbyProps) => {
    const [copied, setCopied] = useState(false);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const canStart = players.length >= 2;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 max-w-2xl w-full">
                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold text-white mb-2">
                        🎮 Sala de Espera
                    </h2>
                    <p className="text-purple-200">
                        Esperando jogadores...
                    </p>
                </div>

                {/* Room Code */}
                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/20">
                    <p className="text-purple-200 text-sm mb-2 text-center">
                        Código da Sala
                    </p>
                    <div
                        onClick={copyRoomCode}
                        className="cursor-pointer group"
                    >
                        <p className="text-6xl font-mono font-bold text-white text-center tracking-widest mb-2 group-hover:text-purple-300 transition-colors">
                            {roomCode}
                        </p>
                        <p className="text-center text-sm text-purple-300">
                            {copied ? '✅ Copiado!' : '📋 Clica para copiar'}
                        </p>
                    </div>
                </div>

                {/* Players List */}
                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/20">
                    <p className="text-purple-200 text-sm mb-4 text-center">
                        Jogadores ({players.length}/2)
                    </p>
                    <div className="space-y-3">
                        {players.map((player, index) => (
                            <div
                                key={player.id}
                                className="flex items-center justify-between bg-white/10 rounded-xl p-4"
                            >
                                <div className="flex items-center space-x-3">
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-white"
                                        style={{ backgroundColor: player.color }}
                                    ></div>
                                    <span className="text-white font-semibold text-lg">
                                        Jogador {index + 1}
                                    </span>
                                </div>
                                {index === 0 && (
                                    <span className="bg-yellow-500/20 text-yellow-200 px-3 py-1 rounded-full text-sm font-medium">
                                        👑 Host
                                    </span>
                                )}
                            </div>
                        ))}
                        {players.length < 2 && (
                            <div className="flex items-center justify-center bg-white/5 rounded-xl p-4 border-2 border-dashed border-white/20">
                                <span className="text-purple-300 text-lg">
                                    🔍 Esperando jogador...
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    {isHost && (
                        <button
                            onClick={onStartGame}
                            disabled={!canStart}
                            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold text-xl rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                        >
                            {canStart ? '🚀 Começar Jogo' : '⏳ Aguardando jogadores...'}
                        </button>
                    )}
                    {!isHost && (
                        <div className="w-full py-4 px-6 bg-white/10 text-purple-200 font-semibold text-center rounded-xl border border-white/20">
                            ⏳ Esperando o host iniciar o jogo...
                        </div>
                    )}
                    <button
                        onClick={onLeaveRoom}
                        className="w-full py-3 px-6 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition-all duration-200"
                    >
                        🚪 Sair da Sala
                    </button>
                </div>
            </div>
        </div>
    );
};
