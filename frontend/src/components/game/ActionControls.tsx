import { Dices, Loader2 } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const ActionControls = () => {
    const { diceValue, isRolling, rollDice, currentPlayerIndex, players, localPlayerId } = useGameStore();

    if (diceValue && !isRolling) return null;

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === (currentPlayer?.id);

    return (
        <div className="flex justify-center pointer-events-auto pb-8 z-50">
            {!isRolling && (
                <Button
                    size="lg"
                    onClick={rollDice}
                    disabled={!isMyTurn}
                    className={`h-20 px-12 rounded-full font-black text-2xl shadow-xl transition-all duration-300 border-2 ${
                        isMyTurn 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500/50 hover:scale-105 hover:shadow-indigo-500/25' 
                            : 'bg-zinc-800 text-zinc-500 border-zinc-700 opacity-80'
                    }`}
                >
                    <span className="flex items-center gap-4">
                        LANÇAR DADOS
                        <Dices className={`w-8 h-8 ${isMyTurn ? 'animate-bounce' : ''}`} />
                    </span>
                </Button>
            )}

            {isRolling && (
                <Card className="h-20 px-12 rounded-full bg-zinc-900 border-indigo-500/30 flex items-center justify-center gap-4 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                    <span className="font-black text-2xl text-zinc-100 animate-pulse tracking-wide">
                        A PROCESSAR...
                    </span>
                </Card>
            )}
        </div>
    );
};
