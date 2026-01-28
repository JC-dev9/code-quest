import { Dices } from 'lucide-react';
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
    );
};
