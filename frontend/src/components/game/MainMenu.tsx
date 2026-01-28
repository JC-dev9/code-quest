import { useState } from 'react';
import { Gamepad2, Loader2, LogIn, Lightbulb, Sparkles } from 'lucide-react';

interface MainMenuProps {
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    isLoading: boolean;
    error: string | null;
}

export const MainMenu = ({ onCreateRoom, onJoinRoom, isLoading, error }: MainMenuProps) => {
    const [roomCode, setRoomCode] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const handleJoin = () => {
        if (roomCode.trim().length === 6) {
            onJoinRoom(roomCode.trim().toUpperCase());
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] border border-white/20 max-w-md w-full transform transition-all duration-300 hover:shadow-[0_8px_48px_0_rgba(139,92,246,0.3)]">
                {/* Título com efeito brilhante */}
                <div className="text-center mb-10 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                        <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                    </div>
                    <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 mb-3 drop-shadow-2xl animate-gradient">
                        CODE QUEST
                    </h1>
                    <div className="h-1 w-40 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full mb-3"></div>
                    <p className="text-purple-200 text-lg font-semibold tracking-wide">
                        Monopoly Digital Edition
                    </p>
                </div>

                {/* Mensagem de Erro com animação */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border-2 border-red-500/50 rounded-xl text-red-200 text-center animate-shake backdrop-blur-sm">
                        <p className="font-semibold">{error}</p>
                    </div>
                )}

                {/* Botão Criar Sala - Enhanced */}
                <button
                    onClick={onCreateRoom}
                    disabled={isLoading}
                    className="group relative w-full mb-6 py-5 px-6 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:via-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-black text-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(16,185,129,0.7)] disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        {isLoading ? (
                            <Loader2 className="w-7 h-7 animate-spin" />
                        ) : (
                            <Gamepad2 className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
                        )}
                        <span className="tracking-wide">{isLoading ? 'CRIANDO...' : 'CRIAR SALA'}</span>
                    </div>
                </button>

                {/* Divisor melhorado */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 py-1 bg-slate-900/50 backdrop-blur-sm text-purple-300 font-bold text-sm rounded-full border border-purple-400/30">
                            OU
                        </span>
                    </div>
                </div>

                {/* Entrar na Sala - Enhanced */}
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="CÓDIGO DA SALA"
                            maxLength={6}
                            disabled={isLoading}
                            className={`w-full py-4 px-6 bg-white/5 border-2 ${isFocused ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]' : 'border-white/20'} rounded-2xl text-white text-center text-3xl font-mono font-bold tracking-[0.3em] placeholder-purple-300/40 focus:outline-none transition-all duration-300 disabled:opacity-50 backdrop-blur-sm`}
                        />
                        {roomCode.length > 0 && (
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                                {roomCode.length}/6
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleJoin}
                        disabled={isLoading || roomCode.length !== 6}
                        className="group relative w-full py-5 px-6 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:from-blue-700 hover:via-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-black text-xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(59,130,246,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(59,130,246,0.7)] disabled:scale-100 disabled:cursor-not-allowed disabled:shadow-none overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="relative flex items-center justify-center gap-3">
                            {isLoading ? (
                                <Loader2 className="w-7 h-7 animate-spin" />
                            ) : (
                                <LogIn className="w-7 h-7 group-hover:translate-x-1 transition-transform duration-300" />
                            )}
                            <span className="tracking-wide">{isLoading ? 'ENTRANDO...' : 'ENTRAR NA SALA'}</span>
                        </div>
                    </button>
                </div>

                {/* Info melhorado */}
                <div className="mt-8 flex items-center justify-center gap-2 text-purple-200/80 text-sm bg-purple-500/10 py-3 px-4 rounded-xl border border-purple-400/20">
                    <Lightbulb className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <p className="font-medium">Códigos possuem 6 caracteres</p>
                </div>
            </div>
        </div>
    );
};
