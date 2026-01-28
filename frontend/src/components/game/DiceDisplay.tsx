import { useGameStore } from '../../store/gameStore';

export const DiceDisplay = () => {
    const { 
        diceValue, isRolling, currentPlayerIndex, players, boardConfig, 
        requestPurchase, nextTurn, localPlayerId 
    } = useGameStore();

    if (diceValue === null || isRolling) return null;

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === (currentPlayer?.id);

    const currentSpace = boardConfig[currentPlayer.position];
    const canPurchase = currentSpace?.type === 'property' &&
        currentSpace.ownerId === null &&
        currentPlayer.money >= (currentSpace.price || 0) &&
        !currentPlayer.purchaseAttemptUsed;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-6">
            <div className="flex gap-4 animate-bounce-short">
                {diceValue.map((v, i) => (
                    <div key={i} className="bg-white w-20 h-20 rounded-2xl shadow-2xl flex items-center justify-center border-b-8 border-gray-200">
                        <span className="text-5xl font-black text-slate-900">{v}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-3 w-64">
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
            </div>
        </div>
    );
};
