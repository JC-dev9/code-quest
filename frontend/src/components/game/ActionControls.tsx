import { Dices, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const ActionControls = () => {
    const { diceValue, isRolling, rollDice, currentPlayerIndex, players, localPlayerId } = useGameStore();

    if (diceValue || isRolling && !diceValue) {
         // if just rolling, show rolling state. If rolled (diceValue set), this component actually hides?
         // Checking original GameUI logic: 
         // {!diceValue && !isRolling && ( LANÇAR DADOS )}
         // {isRolling && ( A PROCESSAR )}
         // So if diceValue is present, this area is hidden or replaced by DiceDisplay logic?
         // In original GameUI, DiceDisplay is separate, but bottom controls are hidden when diceValue exists.
         // Let's replicate that logic.
    }
    
    // We only show controls if we are NOT showing dice display results (unless rolling)
    if (diceValue && !isRolling) return null;

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === (currentPlayer?.id);

    return (
        <div className="flex justify-center pointer-events-auto pb-8">
            {!isRolling && (
                <button
                    onClick={rollDice}
                    disabled={!isMyTurn}
                    className={`group relative px-14 py-7 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-full font-black text-3xl text-white shadow-[0_20px_60px_-10px_rgba(99,102,241,0.5)] transition-all duration-300 overflow-hidden ${isMyTurn ? 'hover:shadow-[0_30px_80px_-10px_rgba(99,102,241,0.8)] hover:-translate-y-3 active:translate-y-1 cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                >
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    
                    {/* Glow Effect */}
                    {isMyTurn && (
                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-full blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                    )}
                    
                    <span className="relative flex items-center gap-4">
                        LANÇAR DADOS
                        <Dices className={`w-10 h-10 ${isMyTurn ? 'group-hover:rotate-[360deg] group-hover:scale-125' : ''} transition-all duration-700`} />
                    </span>
                </button>
            )}

            {isRolling && (
                <div className="relative px-14 py-7 bg-gradient-to-r from-slate-800 to-slate-700 border-2 border-purple-500/50 rounded-full font-black text-3xl text-white backdrop-blur-md flex items-center gap-5 shadow-[0_0_40px_rgba(168,85,247,0.4)]">
                    <Dices className="w-10 h-10 animate-spin text-purple-400" />
                    <span className="animate-pulse">A PROCESSAR...</span>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full blur opacity-30 animate-pulse"></div>
                </div>
            )}
        </div>
    );
};
