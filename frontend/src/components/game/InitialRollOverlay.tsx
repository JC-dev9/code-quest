import React from 'react';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl text-white text-center">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Ordem de Jogada
                </h2>

                <p className="text-gray-300 mb-8">
                    Lança os dados para decidir quem começa o jogo!
                </p>

                <div className="space-y-4 mb-8">
                    {players.map((player) => (
                        <div
                            key={player.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${player.id === currentPlayer.id
                                    ? 'bg-blue-500/20 border-blue-500'
                                    : 'bg-gray-700/50 border-gray-600'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: player.color }}
                                />
                                <span className="font-medium">Jogador {player.id}</span>
                                {player.id === localPlayerId && (
                                    <span className="text-xs bg-gray-600 px-2 py-0.5 rounded text-gray-300">Tu</span>
                                )}
                            </div>
                            <div className="font-bold text-xl">
                                {player.initialRoll !== undefined ? player.initialRoll : '-'}
                            </div>
                        </div>
                    ))}
                </div>

                {isLocalTurn ? (
                    <button
                        onClick={() => rollDice()}
                        disabled={isRolling}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform active:scale-95 ${isRolling
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/40'
                            }`}
                    >
                        {isRolling ? 'A Lançar...' : 'Lançar Dados'}
                    </button>
                ) : (
                    <div className="py-4 text-gray-400 animate-pulse">
                        Aguardando pelo Jogador {currentPlayer.id}...
                    </div>
                )}

                {diceValue && (
                    <div className="mt-6 flex justify-center gap-4 animate-bounce">
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-900 text-2xl font-bold shadow-inner">
                            {diceValue[0]}
                        </div>
                        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-gray-900 text-2xl font-bold shadow-inner">
                            {diceValue[1]}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
