import { useGameStore } from '../../store/gameStore';

export const QuestionModal = () => {
    const { currentQuestion, answerQuestion, players, currentPlayerIndex, localPlayerId } = useGameStore();
    
    // Safety check
    if (!currentQuestion) return null;

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === (currentPlayer?.id);

    return (
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
    );
};
