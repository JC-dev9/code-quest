import { AlertCircle, ShoppingCart, ArrowRight } from 'lucide-react';
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-6 animate-slide-in">
            {/* Dice Display - 3D Style */}
            <div className="flex gap-5 animate-bounce-short">
                {diceValue.map((v, i) => (
                    <div 
                        key={i} 
                        className="relative bg-gradient-to-br from-white to-gray-100 w-24 h-24 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-center border-4 border-white/50 transform hover:scale-110 transition-transform duration-300"
                        style={{
                            transform: `perspective(1000px) rotateX(${i * 5}deg) rotateY(${i * 10}deg)`,
                            animationDelay: `${i * 0.1}s`
                        }}
                    >
                        <span className="text-6xl font-black text-slate-900 drop-shadow-md">{v}</span>
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent"></div>
                    </div>
                ))}
            </div>

            {/* Total Display */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full font-black text-lg shadow-lg border-2 border-white/30">
                Total: {diceValue.reduce((a, b) => a + b, 0)}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-80">
                {currentSpace?.type === 'property' && currentSpace.ownerId === null && (
                    <>
                        {currentPlayer.purchaseAttemptUsed ? (
                            <div className="px-6 py-4 bg-gradient-to-r from-red-900/40 to-red-800/40 border-2 border-red-500/50 text-red-200 rounded-2xl font-bold text-center flex items-center justify-center gap-3 backdrop-blur-sm animate-shake">
                                <AlertCircle className="w-6 h-6" />
                                <span>Tentativa de compra já utilizada</span>
                            </div>
                        ) : (
                            <button
                                onClick={requestPurchase}
                                disabled={!isMyTurn || !canPurchase}
                                className={`group relative px-6 py-5 bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 text-white rounded-2xl font-black text-lg transition-all overflow-hidden ${
                                    isMyTurn && canPurchase 
                                        ? 'hover:scale-105 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] cursor-pointer' 
                                        : 'opacity-50 cursor-not-allowed'
                                }`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                <div className="relative flex items-center justify-center gap-3">
                                    <ShoppingCart className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
                                    <div className="flex flex-col items-start">
                                        <span className="text-sm opacity-80">COMPRAR</span>
                                        <span className="text-xl leading-none">{currentSpace.name}</span>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1">
                                        <span className="text-2xl font-black">{currentSpace.price}</span>
                                        <span className="text-sm">DG</span>
                                    </div>
                                </div>
                            </button>
                        )}
                    </>
                )}
                
                <button
                    onClick={nextTurn}
                    disabled={!isMyTurn}
                    className={`group relative px-6 py-5 bg-gradient-to-r from-slate-700 to-slate-600 backdrop-blur-md border-2 border-white/20 text-white rounded-2xl font-black text-xl transition-all overflow-hidden ${
                        isMyTurn 
                            ? 'hover:bg-gradient-to-r hover:from-slate-600 hover:to-slate-500 hover:scale-105 cursor-pointer' 
                            : 'opacity-50 cursor-not-allowed'
                    }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <div className="relative flex items-center justify-center gap-3">
                        <span>TERMINAR TURNO</span>
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                </button>
            </div>
        </div>
    );
};
