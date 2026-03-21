import React from 'react';
import { Dices, Trophy, Timer, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const InitialRollOverlay: React.FC = () => {
    const {
        players,
        currentPlayerIndex,
        localPlayerId,
        rollDice,
        isRolling,
        gamePhase,
        gameMode
    } = useGameStore();

    if (gamePhase !== 'INITIAL_ROLL') return null;

    const currentPlayer = players[currentPlayerIndex];
    const isLocalTurn = gameMode === 'split-screen' || currentPlayer.id === localPlayerId;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-2xl bg-zinc-900 border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.15)]">
                <CardHeader className="text-center pb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Trophy className="w-8 h-8 text-amber-400" />
                        <CardTitle className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-500">
                            ORDEM DE JOGADA
                        </CardTitle>
                        <Trophy className="w-8 h-8 text-amber-400" />
                    </div>
                    <CardDescription className="text-zinc-400 text-lg">
                        Lance os dados para determinar quem joga primeiro
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        {players.map((player, index) => {
                            const isCurrentTurn = index === currentPlayerIndex;
                            const hasRolled = player.initialRoll !== undefined;

                            return (
                                <div
                                    key={player.id}
                                    className={`relative bg-zinc-950/50 rounded-xl p-4 border transition-all duration-300 ${
                                        isCurrentTurn
                                            ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] bg-emerald-500/5'
                                            : hasRolled
                                                ? 'border-indigo-500/20'
                                                : 'border-zinc-800 opacity-60'
                                    }`}
                                >
                                    {isCurrentTurn && (
                                        <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500/20 rounded-full border border-emerald-500/50 flex items-center justify-center animate-pulse">
                                            <Timer className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-lg flex items-center justify-center font-black text-xl text-zinc-950 shadow-sm"
                                                style={{ backgroundColor: player.color }}
                                            >
                                                {player.id}
                                            </div>
                                            <div>
                                                <p className="text-zinc-100 font-bold text-lg">
                                                    Jogador {player.id}
                                                </p>
                                                <p className="text-zinc-500 text-sm font-medium">
                                                    {player.id === localPlayerId ? 'Você' : 'Adversário'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            {hasRolled ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-zinc-800 w-14 h-14 rounded-xl flex items-center justify-center border border-zinc-700">
                                                        <span className="text-3xl font-black text-indigo-400">{player.initialRoll}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                                                    <p className={`text-xs font-bold uppercase tracking-wider ${isCurrentTurn ? 'text-emerald-400' : 'text-zinc-600'}`}>
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

                    <div className="pt-2">
                        {isLocalTurn ? (
                            <Button
                                size="lg"
                                onClick={rollDice}
                                disabled={isRolling}
                                className="w-full h-16 text-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20 transition-all border border-emerald-500/50"
                            >
                                {isRolling ? (
                                    <span className="flex items-center gap-3">
                                        <Dices className="w-6 h-6 animate-spin" />
                                        A PROCESSAR...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-3">
                                        <Sparkles className="w-5 h-5" />
                                        LANÇAR DADOS
                                        <Dices className="w-6 h-6" />
                                    </span>
                                )}
                            </Button>
                        ) : (
                            <div className="w-full h-16 bg-zinc-900/50 text-indigo-400 font-medium flex items-center justify-center gap-3 rounded-xl border border-indigo-500/20">
                                <Timer className="w-5 h-5 animate-spin-slow" />
                                <span>Aguarde o lançamento do Jogador {currentPlayer.id}...</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
