import React from 'react';
import { Dices, Trophy, Timer, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const InitialRollOverlay: React.FC = () => {
    const {
        players,
        currentPlayerIndex,
        localPlayerId,
        rollDice,
        isRolling,
        diceValue,
        gamePhase
    } = useGameStore();

    if (gamePhase !== 'INITIAL_ROLL') return null;

    const currentPlayer = players[currentPlayerIndex];
    const isLocalTurn = currentPlayer.id === localPlayerId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-slide-in">
            <div className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 border-2 border-purple-500/30 rounded-3xl p-10 max-w-2xl w-full shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <Trophy className="w-10 h-10 text-yellow-400 animate-pulse" />
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 animate-gradient">
                            ORDEM DE JOGADA
                        </h2>
                        <Trophy className="w-10 h-10 text-yellow-400 animate-pulse" />
                    </div>
                    <p className="text-purple-200 text-lg font-medium">
                        Lance os dados para determinar quem joga primeiro
                    </p>
                </div>

                {/* Players List */}
                <div className="space-y-4 mb-8">
                    {players.map((player, index) => {
                        const isCurrentTurn = index === currentPlayerIndex;
                        const hasRolled = player.initialRoll !== undefined;

                        return (
                            <div
                                key={player.id}
                                className={`relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-5 border-2 transition-all duration-500 ${
                                    isCurrentTurn 
                                        ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105' 
                                        : hasRolled 
                                        ? 'border-purple-500/30' 
                                        : 'border-white/10 opacity-60'
                                } animate-slide-in`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Active Turn Indicator */}
                                {isCurrentTurn && (
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]">
                                        <Timer className="w-3 h-3 text-white" />
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    {/* Player Info */}
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-14 h-14 rounded-xl shadow-lg flex items-center justify-center font-black text-2xl text-white border-2 border-white/20"
                                            style={{ backgroundColor: player.color }}
                                        >
                                            {player.id}
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-xl">
                                                Jogador {player.id}
                                            </p>
                                            <p className="text-purple-300 text-sm font-medium">
                                                {player.id === localPlayerId ? 'Você' : 'Adversário'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Roll Result or Status */}
                                    <div className="text-right">
                                        {hasRolled ? (
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gradient-to-br from-white to-gray-100 w-16 h-16 rounded-2xl shadow-lg flex items-center justify-center border-2 border-white/50">
                                                    <span className="text-4xl font-black text-slate-900">{player.initialRoll}</span>
                                                </div>
                                                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                                            </div>
                                        ) : (
                                            <div className="bg-white/5 px-6 py-3 rounded-xl border border-white/10">
                                                <p className="text-purple-300 text-sm font-bold uppercase tracking-wider">
                                                    {isCurrentTurn ? 'Sua vez!' : 'Aguardando...'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Roll Button */}
                {isLocalTurn && (
                    <button
                        onClick={rollDice}
                        disabled={isRolling}
                        className="group relative w-full py-6 px-8 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-700 hover:via-green-600 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-black text-2xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(16,185,129,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_60px_-10px_rgba(16,185,129,0.8)] disabled:scale-100 disabled:cursor-not-allowed overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        <div className="relative flex items-center justify-center gap-4">
                            {isRolling ? (
                                <>
                                    <Dices className="w-8 h-8 animate-spin" />
                                    <span className="tracking-wide">A PROCESSAR...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-8 h-8 group-hover:rotate-180 transition-transform duration-700" />
                                    <span className="tracking-wide">LANÇAR DADOS</span>
                                    <Dices className="w-8 h-8 group-hover:rotate-[360deg] transition-transform duration-700" />
                                </>
                            )}
                        </div>
                    </button>
                )}

                {!isLocalTurn && (
                    <div className="w-full py-6 px-8 bg-white/10 text-purple-200 font-bold text-center rounded-2xl border-2 border-purple-400/30 flex items-center justify-center gap-3 backdrop-blur-sm">
                        <Timer className="w-6 h-6 animate-spin-slow" />
                        <span>Aguardando Jogador {currentPlayer.id}...</span>
                    </div>
                )}
            </div>
        </div>
    );
};
