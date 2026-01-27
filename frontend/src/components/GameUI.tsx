import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Dices } from 'lucide-react';

export const GameUI: React.FC = () => {
    const {
        currentPlayerIndex, players, diceValue, rollDice, isRolling,
        nextTurn, requestPurchase, answerQuestion, boardConfig,
        currentQuestion, localPlayerId, gamePhase
    } = useGameStore();

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === (currentPlayer?.id);

    if (!currentPlayer || gamePhase === 'INITIAL_ROLL') return null; // Wait for data or wait for initial rolls

    return (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">

            {/* Top Bar */}
            <div className="flex justify-between items-start pointer-events-auto">
                <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl text-white border border-white/20 shadow-2xl">
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
                        CODE QUEST
                    </h1>
                    <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">DigiCoin Network</p>
                    {localPlayerId && (
                        <div className="mt-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                            Você é o Jogador {localPlayerId}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    {players.map((p, i) => (
                        <div key={p.id} className={`bg-black/60 backdrop-blur-md p-4 rounded-2xl text-white border transition-all duration-300 ${i === currentPlayerIndex ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-105' : 'border-white/10 opacity-70'}`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg shadow-inner flex items-center justify-center font-bold" style={{ backgroundColor: p.color }}>
                                    {p.id}
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase font-bold">Player {p.id}</p>
                                    <p className="text-xl font-black text-green-400 leading-none">{p.money} <span className="text-sm">DG</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Question Modal */}
            {currentQuestion && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto z-50">
                    <div className="bg-slate-900 border border-white/20 p-8 rounded-3xl max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${currentQuestion.level === 'Fácil' ? 'bg-green-500/20 text-green-400' :
                                currentQuestion.level === 'Intermédio' ? 'bg-blue-500/20 text-blue-400' :
                                    currentQuestion.level === 'Difícil' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                }`}>
                                Desafio: {currentQuestion.level}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-8">{currentQuestion.text}</h2>
                        <div className="grid gap-3">
                            {currentQuestion.options.map((opt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => isMyTurn && answerQuestion(idx)}
                                    disabled={!isMyTurn}
                                    className={`p-4 bg-white/5 border border-white/10 rounded-xl text-left text-gray-300 transition-all ${isMyTurn ? 'hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]' : 'opacity-50 cursor-not-allowed'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Center Dice Display */}
            {diceValue !== null && !isRolling && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-6">
                    <div className="flex gap-4 animate-bounce-short">
                        {diceValue.map((v, i) => (
                            <div key={i} className="bg-white w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center border-b-8 border-gray-200">
                                <span className="text-5xl font-black text-slate-900">{v}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 w-64">
                        {(() => {
                            const currentSpace = boardConfig[currentPlayer.position];
                            const canPurchase = currentSpace?.type === 'property' &&
                                currentSpace.ownerId === null &&
                                currentPlayer.money >= (currentSpace.price || 0) &&
                                !currentPlayer.purchaseAttemptUsed;

                            return (
                                <>
                                    {currentSpace?.type === 'property' && currentSpace.ownerId === null && (
                                        <>
                                            {currentPlayer.purchaseAttemptUsed ? (
                                                <div className="px-8 py-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-2xl font-bold text-center">
                                                    ❌ Tentativa de compra já utilizada
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={requestPurchase}
                                                    disabled={!isMyTurn || !canPurchase}
                                                    className={`px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-black text-lg transition-all ${isMyTurn && canPurchase ? 'hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-105' : 'opacity-50 cursor-not-allowed'}`}
                                                >
                                                    COMPRAR {currentSpace.name.toUpperCase()} ({currentSpace.price} DG)
                                                </button>
                                            )}
                                        </>
                                    )}
                                    <button
                                        onClick={nextTurn}
                                        disabled={!isMyTurn}
                                        className={`px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-bold text-lg transition-all ${isMyTurn ? 'hover:bg-white/20 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                                    >
                                        TERMINAR TURNO
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Bottom Controls */}
            <div className="flex justify-center pointer-events-auto pb-8">
                {!diceValue && !isRolling && (
                    <button
                        onClick={rollDice}
                        disabled={!isMyTurn}
                        className={`group relative px-12 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full font-black text-2xl text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] transition-all duration-300 ${isMyTurn ? 'hover:shadow-[0_20px_60px_rgba(37,99,235,0.5)] hover:-translate-y-2 active:translate-y-1' : 'opacity-50 cursor-not-allowed'}`}
                    >
                        <span className="flex items-center gap-4">
                            LANÇAR DADOS
                            <Dices className={`w-8 h-8 ${isMyTurn ? 'group-hover:rotate-180' : ''} transition-transform duration-700`} />
                        </span>
                        {isMyTurn && <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full blur opacity-20 group-hover:opacity-40 transition" />}
                    </button>
                )}

                {isRolling && (
                    <div className="px-12 py-6 bg-white/5 border border-white/10 rounded-full font-black text-2xl text-white backdrop-blur-md flex items-center gap-4 animate-pulse">
                        <Dices className="w-8 h-8 animate-spin" />
                        A PROCESSAR...
                    </div>
                )}
            </div>

        </div>
    );
};
