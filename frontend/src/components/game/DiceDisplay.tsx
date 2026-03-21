import { AlertCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';

export const DiceDisplay = () => {
    const { 
        diceValue, isRolling, currentPlayerIndex, players, boardConfig, 
        requestPurchase, nextTurn, localPlayerId, currentQuestion, isTokenMoving,
        awaitingChatGPTChoice, gameMode
    } = useGameStore();

    if (diceValue === null || isRolling || currentQuestion || isTokenMoving || awaitingChatGPTChoice) return null;

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = gameMode === 'split-screen' || localPlayerId === (currentPlayer?.id);

    const currentSpace = boardConfig[currentPlayer.position];
    const canPurchase = currentSpace?.type === 'property' &&
        currentSpace.ownerId === null &&
        currentPlayer.money >= (currentSpace.price || 0) &&
        !currentPlayer.purchaseAttemptUsed;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto flex flex-col items-center gap-6 z-50">
            {/* Dice Display - 3D Style */}
            <div className="flex gap-5">
                <AnimatePresence>
                    {diceValue.map((v, i) => (
                        <motion.div 
                            key={i} 
                            initial={{ scale: 0, rotateX: 180, rotateY: 180, y: -50, opacity: 0 }}
                            animate={{ 
                                scale: 1, 
                                rotateX: i * 5, 
                                rotateY: i * 10, 
                                y: 0, 
                                opacity: 1 
                            }}
                            transition={{ 
                                type: "spring", 
                                stiffness: 200, 
                                damping: 15,
                                delay: i * 0.1 
                            }}
                            className="relative bg-gradient-to-br from-white to-gray-100 w-24 h-24 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex items-center justify-center border-4 border-white/50"
                            style={{
                                transformPerspective: 1000,
                            }}
                            whileHover={{ scale: 1.1, rotateY: 0, rotateX: 0 }}
                        >
                            <span className="text-6xl font-black text-slate-900 drop-shadow-md">{v}</span>
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 to-transparent"></div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Total Display */}
            <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-5 py-2.5 rounded-full">
                <span className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Total</span>
                <span className="text-white font-bold text-lg">{diceValue.reduce((a, b) => a + b, 0)}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 w-72">
                {currentSpace?.type === 'property' && currentSpace.ownerId === null && (
                    <>
                        {currentPlayer.purchaseAttemptUsed ? (
                            <div className="px-5 py-3 bg-red-950 border border-red-500/40 text-red-300 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2 animate-shake">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Tentativa de compra já utilizada</span>
                            </div>
                        ) : (
                            <button
                                onClick={requestPurchase}
                                disabled={!isMyTurn || !canPurchase}
                                className={`px-5 py-4 bg-emerald-900 border border-emerald-700 text-emerald-100 rounded-xl font-semibold text-sm transition-all duration-200 ${
                                    isMyTurn && canPurchase 
                                        ? 'hover:bg-emerald-800 hover:border-emerald-600 hover:scale-[1.02] cursor-pointer' 
                                        : 'opacity-40 cursor-not-allowed'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2.5">
                                        <ShoppingCart className="w-4 h-4 text-emerald-400" />
                                        <div className="flex flex-col items-start">
                                            <span className="text-xs text-emerald-400/80 uppercase tracking-wider leading-none mb-0.5">Comprar</span>
                                            <span className="text-white font-medium leading-none">{currentSpace.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-1 text-emerald-300">
                                        <span className="text-lg font-bold">{currentSpace.price}</span>
                                        <span className="text-xs opacity-70">DG</span>
                                    </div>
                                </div>
                            </button>
                        )}
                    </>
                )}
                
                <button
                    onClick={nextTurn}
                    disabled={!isMyTurn}
                    className={`px-5 py-4 bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        isMyTurn 
                            ? 'hover:bg-zinc-700 hover:border-zinc-600 hover:scale-[1.02] cursor-pointer' 
                            : 'opacity-40 cursor-not-allowed'
                    }`}
                >
                    <div className="flex items-center justify-center gap-2.5">
                        <span className="tracking-wide">Terminar Turno</span>
                        <ArrowRight className="w-4 h-4 text-zinc-400" />
                    </div>
                </button>
            </div>
        </div>
    );
};
