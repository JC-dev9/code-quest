import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Dices } from 'lucide-react';

export const GameUI: React.FC = () => {
    const { currentPlayerIndex, players, diceValue, rollDice, isRolling, nextTurn, buyProperty, boardConfig } = useGameStore();

    const currentPlayer = players[currentPlayerIndex];

    if (!currentPlayer) return null; // Wait for data

    return (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">

            {/* Top Bar */}
            <div className="flex justify-between items-start pointer-events-auto">
                <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl text-white border border-white/10">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                        3D Poly
                    </h1>
                </div>

                <div className="bg-black/50 backdrop-blur-md p-4 rounded-xl text-white border border-white/10">
                    <p className="text-sm text-gray-400">Current Turn</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div
                            className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]"
                            style={{ backgroundColor: currentPlayer.color, color: currentPlayer.color }}
                        />
                        <span className="font-bold">Player {currentPlayer.id}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/10">
                        <p className="text-xl font-black text-green-400">
                            ${currentPlayer.money}
                        </p>
                    </div>
                </div>
            </div>

            {/* Center Dice Display */}
            {diceValue !== null && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
                    <div className="bg-white/90 p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce-short">
                        <Dices size={64} className="text-indigo-600 mb-2" />
                        <span className="text-4xl font-black text-indigo-900">{diceValue}</span>

                        {(() => {
                            const currentSpace = boardConfig[currentPlayer.position];
                            const canBuy = currentSpace?.type === 'property' &&
                                currentSpace.ownerId === null &&
                                currentPlayer.money >= (currentSpace.price || 0);

                            return (
                                <div className="flex flex-col gap-2 mt-4 w-full">
                                    {canBuy && (
                                        <button
                                            onClick={buyProperty}
                                            className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition shadow-lg shadow-green-900/20 pointer-events-auto"
                                        >
                                            Buy {currentSpace.name} (${currentSpace.price})
                                        </button>
                                    )}
                                    <button
                                        onClick={nextTurn}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition pointer-events-auto"
                                    >
                                        End Turn
                                    </button>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="flex justify-center pointer-events-auto pb-8">
                <button
                    onClick={rollDice}
                    disabled={isRolling || diceValue !== null}
                    className={`
            group relative px-8 py-4 rounded-full font-bold text-xl transition-all duration-200
            ${isRolling || diceValue !== null
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:scale-105 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                        }
          `}
                >
                    <span className="text-white flex items-center gap-3">
                        {isRolling ? 'Rolling...' : 'Roll Dice'}
                        <Dices className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                    </span>
                </button>
            </div>

        </div>
    );
};
