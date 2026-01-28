import { useGameStore } from '../../store/gameStore';
import { Brain, Clock, Zap, Flame, CheckCircle2 } from 'lucide-react';

export const QuestionModal = () => {
    const { currentQuestion, answerQuestion, players, currentPlayerIndex, localPlayerId } = useGameStore();
    
    // Safety check
    if (!currentQuestion) return null;

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === (currentPlayer?.id);

    // Get level icon and color
    const getLevelConfig = () => {
        switch (currentQuestion.level) {
            case 'Fácil':
                return {
                    icon: CheckCircle2,
                    bgClass: 'from-green-600 to-emerald-600',
                    borderClass: 'border-green-500',
                    badgeClass: 'bg-green-500/20 text-green-400',
                    glowClass: 'shadow-[0_0_40px_rgba(34,197,94,0.3)]'
                };
            case 'Intermédio':
                return {
                    icon: Zap,
                    bgClass: 'from-blue-600 to-cyan-600',
                    borderClass: 'border-blue-500',
                    badgeClass: 'bg-blue-500/20 text-blue-400',
                    glowClass: 'shadow-[0_0_40px_rgba(59,130,246,0.3)]'
                };
            case 'Difícil':
                return {
                    icon: Brain,
                    bgClass: 'from-yellow-600 to-amber-600',
                    borderClass: 'border-yellow-500',
                    badgeClass: 'bg-yellow-500/20 text-yellow-400',
                    glowClass: 'shadow-[0_0_40px_rgba(234,179,8,0.3)]'
                };
            default: // Extremo
                return {
                    icon: Flame,
                    bgClass: 'from-red-600 to-orange-600',
                    borderClass: 'border-red-500',
                    badgeClass: 'bg-red-500/20 text-red-400',
                    glowClass: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]'
                };
        }
    };

    const config = getLevelConfig();
    const LevelIcon = config.icon;

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto z-50 animate-slide-in">
            <div className={`bg-gradient-to-br from-slate-900/95 to-purple-900/95 border-2 ${config.borderClass} p-10 rounded-3xl max-w-2xl w-full shadow-2xl ${config.glowClass} backdrop-blur-xl`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className={`flex items-center gap-3 px-5 py-2 rounded-full ${config.badgeClass} border-2 ${config.borderClass}`}>
                        <LevelIcon className="w-5 h-5" />
                        <span className="font-black text-sm uppercase tracking-wider">
                            {currentQuestion.level}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                        <Clock className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-purple-300 text-sm font-bold">
                            {isMyTurn ? 'Sua vez!' : `Vez do Jogador ${currentPlayer.id}`}
                        </span>
                    </div>
                </div>

                {/* Question */}
                <div className="mb-8 bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${config.bgClass} flex items-center justify-center shadow-lg`}>
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white leading-relaxed">
                            {currentQuestion.text}
                        </h2>
                    </div>
                </div>

                {/* Options */}
                <div className="grid gap-3">
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => isMyTurn && answerQuestion(idx)}
                            disabled={!isMyTurn}
                            className={`group relative p-5 bg-gradient-to-r from-white/5 to-white/10 border-2 border-white/20 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
                                isMyTurn 
                                    ? 'hover:border-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer' 
                                    : 'opacity-50 cursor-not-allowed'
                            }`}
                        >
                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                            
                            <div className="relative flex items-center gap-4">
                                {/* Option Letter */}
                                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.bgClass} flex items-center justify-center font-black text-white text-lg shadow-md flex-shrink-0`}>
                                    {String.fromCharCode(65 + idx)}
                                </div>
                                
                                {/* Option Text */}
                                <span className="text-white font-semibold text-lg">
                                    {opt}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Footer Info */}
                {!isMyTurn && (
                    <div className="mt-6 text-center text-purple-300 text-sm bg-purple-500/10 py-3 px-4 rounded-xl border border-purple-400/20">
                        Aguarde sua vez para responder
                    </div>
                )}
            </div>
        </div>
    );
};
