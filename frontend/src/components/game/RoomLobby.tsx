import { useState, useEffect } from 'react';
import { Gamepad2, Clipboard, Check, Crown, Users, Rocket, Hourglass, LogOut, Star } from 'lucide-react';

interface RoomLobbyProps {
    roomCode: string;
    players: Array<{ id: number; color: string }>;
    isHost: boolean;
    onStartGame: () => void;
    onLeaveRoom: () => void;
}

export const RoomLobby = ({ roomCode, players, isHost, onStartGame, onLeaveRoom }: RoomLobbyProps) => {
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            onStartGame();
        }
    }, [countdown, onStartGame]);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const canStart = players.length >= 2;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/20 max-w-2xl w-full animate-slide-in">
                {/* Título com ícone */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="relative">
                            <Gamepad2 className="w-12 h-12 text-emerald-400 animate-pulse" />
                            <Star className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1 animate-spin-slow" />
                        </div>
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500">
                            SALA DE ESPERA
                        </h2>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-purple-200 bg-purple-500/10 py-2 px-4 rounded-full border border-purple-400/20 inline-flex mx-auto">
                        <Hourglass className="w-4 h-4 animate-spin-slow" />
                        <p className="font-medium">Aguardando jogadores...</p>
                    </div>
                </div>

                {/* Código da Sala - Enhanced */}
                <div className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-2xl p-8 mb-8 border-2 border-purple-400/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] backdrop-blur-sm">
                    <p className="text-purple-200 text-sm mb-3 text-center font-bold uppercase tracking-wider">
                        Código da Sala
                    </p>
                    <div
                        onClick={copyRoomCode}
                        className="cursor-pointer group"
                    >
                        <div className="relative inline-block w-full">
                            <p className="text-7xl font-mono font-black text-center tracking-[0.3em] mb-3 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-emerald-400 to-cyan-400 group-hover:scale-110 transition-transform duration-300">
                                {roomCode}
                            </p>
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-emerald-400 to-cyan-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300"></div>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-sm bg-white/5 py-2 px-4 rounded-lg border border-white/10 mx-auto w-fit group-hover:bg-white/10 transition-all">
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-green-400" />
                                    <p className="text-green-400 font-bold">Copiado!</p>
                                </>
                            ) : (
                                <>
                                    <Clipboard className="w-4 h-4 text-purple-300" />
                                    <p className="text-purple-300 font-medium">Clica para copiar</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de Jogadores - Enhanced */}
                <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 mb-5">
                        <Users className="w-5 h-5 text-cyan-400" />
                        <p className="text-cyan-200 text-sm font-bold uppercase tracking-wider">
                            Jogadores ({players.length}/2)
                        </p>
                    </div>
                    <div className="space-y-3">
                        {players.map((player, index) => (
                            <div
                                key={player.id}
                                className="flex items-center justify-between bg-gradient-to-r from-white/10 to-white/5 rounded-xl p-4 border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-102 animate-slide-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div
                                            className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
                                            style={{ backgroundColor: player.color }}
                                        ></div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
                                    </div>
                                    <div>
                                        <span className="text-white font-bold text-lg block">
                                            Jogador {index + 1}
                                        </span>
                                        <span className="text-purple-300 text-xs uppercase tracking-wider">
                                            {index === 0 ? 'Anfitrião' : 'Convidado'}
                                        </span>
                                    </div>
                                </div>
                                {index === 0 && (
                                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-900 px-4 py-2 rounded-full text-sm font-black flex items-center gap-2 shadow-lg">
                                        <Crown className="w-4 h-4" />
                                        HOST
                                    </div>
                                )}
                            </div>
                        ))}
                        {players.length < 2 && (
                            <div className="flex items-center justify-center bg-white/5 rounded-xl p-6 border-2 border-dashed border-purple-400/30 gap-3 animate-pulse">
                                <div className="w-12 h-12 rounded-full border-3 border-dashed border-purple-400/50 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-purple-400" />
                                </div>
                                <span className="text-purple-300 text-lg font-medium">
                                    À espera do 2º jogador...
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botões de Ação - Enhanced */}
                <div className="space-y-3">
                    {isHost && (
                        <button
                            onClick={onStartGame}
                            disabled={!canStart}
                            className="group relative w-full py-5 px-6 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-700 hover:via-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-black text-2xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(16,185,129,0.8)] disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            <div className="relative flex items-center justify-center gap-4">
                                {canStart ? (
                                    <>
                                        <Rocket className="w-8 h-8 group-hover:-rotate-45 transition-transform duration-300" />
                                        <span className="tracking-wide">COMEÇAR JOGO</span>
                                    </>
                                ) : (
                                    <>
                                        <Hourglass className="w-8 h-8 animate-spin-slow" />
                                        <span className="tracking-wide">AGUARDANDO...</span>
                                    </>
                                )}
                            </div>
                        </button>
                    )}
                    {!isHost && (
                        <div className="w-full py-5 px-6 bg-white/10 text-purple-200 font-bold text-center rounded-2xl border-2 border-purple-400/30 flex items-center justify-center gap-3 backdrop-blur-sm">
                            <Hourglass className="w-6 h-6 animate-spin-slow" />
                            <span>Aguardando o host iniciar...</span>
                        </div>
                    )}
                    <button
                        onClick={onLeaveRoom}
                        className="group w-full py-4 px-6 bg-white/5 hover:bg-red-500/20 text-white font-bold rounded-2xl border-2 border-white/10 hover:border-red-500/50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
                        Sair da Sala
                    </button>
                </div>
            </div>
        </div>
    );
};
