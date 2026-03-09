import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Brain, Clock, Zap, Flame, CheckCircle2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const QuestionModal = () => {
    const { currentQuestion, answerQuestion, players, currentPlayerIndex, localPlayerId } = useGameStore();
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    useEffect(() => {
        if (currentQuestion) {
            setSelectedAnswer(null);
            setShowResult(false);
            setIsCorrect(false);
        }
    }, [currentQuestion]);

    const handleAnswer = useCallback((idx: number) => {
        if (!currentQuestion || !players[currentPlayerIndex] || localPlayerId !== players[currentPlayerIndex]?.id || showResult || selectedAnswer !== null) return;

        setSelectedAnswer(idx);
        const correct = idx === currentQuestion.correctIndex;
        setIsCorrect(correct);
        setShowResult(true);

        setTimeout(() => {
            answerQuestion(idx);
        }, 1500);
    }, [showResult, selectedAnswer, currentQuestion?.correctIndex, answerQuestion, players, currentPlayerIndex, localPlayerId]);

    if (!currentQuestion) return null;

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === (currentPlayer?.id);

    const getLevelConfig = () => {
        switch (currentQuestion.level) {
            case 'Fácil':
                return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
            case 'Intermédio':
                return { icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-500/10' };
            case 'Difícil':
                return { icon: Brain, color: 'text-amber-500', bg: 'bg-amber-500/10' };
            default: // Extremo
                return { icon: Flame, color: 'text-rose-500', bg: 'bg-rose-500/10' };
        }
    };

    const config = getLevelConfig();
    const LevelIcon = config.icon;

    const getOptionVariant = (idx: number) => {
        if (!showResult) return 'outline';
        if (idx === currentQuestion.correctIndex) return 'default'; // Vai ser overriden por classe de cor
        if (idx === selectedAnswer && !isCorrect) return 'destructive';
        return 'outline';
    };

    const getOptionClass = (idx: number) => {
        if (!showResult) {
            return isMyTurn ? 'hover:bg-zinc-800 hover:text-zinc-50 border-zinc-800' : 'opacity-50 border-zinc-800 bg-zinc-950';
        }
        if (idx === currentQuestion.correctIndex) {
            return 'bg-emerald-600/20 text-emerald-500 border-emerald-500/50 hover:bg-emerald-600/30';
        }
        if (idx === selectedAnswer && !isCorrect) {
            return 'bg-rose-600/20 text-rose-500 border-rose-500/50 hover:bg-rose-600/30';
        }
        return 'opacity-30 border-zinc-800 bg-zinc-950';
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm pointer-events-auto z-50 p-4">
            <Card className="w-full max-w-2xl bg-zinc-900 border-zinc-800 shadow-2xl">
                <CardHeader className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <Badge variant="outline" className={`px-3 py-1 text-sm border-zinc-700 ${config.bg} ${config.color}`}>
                            <LevelIcon className="w-4 h-4 mr-2" />
                            {currentQuestion.level}
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1 text-sm bg-zinc-800 text-zinc-300">
                            <Clock className="w-4 h-4 mr-2" />
                            {isMyTurn ? 'Sua vez!' : `Vez do Jogador ${currentPlayer?.id}`}
                        </Badge>
                    </div>

                    {showResult && (
                        <div className={`flex items-center justify-center gap-2 py-3 rounded-lg border ${
                            isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                        }`}>
                            {isCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                            <span className="font-bold">{isCorrect ? 'RESPOSTA CORRETA!' : 'RESPOSTA ERRADA!'}</span>
                        </div>
                    )}

                    <div className="flex gap-4 items-start pt-4">
                        <div className={`p-3 rounded-lg bg-zinc-800 border border-zinc-700`}>
                            <Brain className="w-6 h-6 text-indigo-400" />
                        </div>
                        <CardTitle className="text-xl leading-relaxed text-zinc-100 flex-1">
                            {currentQuestion.text}
                        </CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="space-y-3">
                    {currentQuestion.options.map((opt, idx) => (
                        <Button
                            key={idx}
                            variant={getOptionVariant(idx)}
                            onClick={() => handleAnswer(idx)}
                            disabled={!isMyTurn || showResult}
                            className={`w-full justify-start h-auto py-4 px-6 text-left whitespace-normal text-base font-normal transition-all ${getOptionClass(idx)}`}
                        >
                            <span className="flex-shrink-0 w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center font-bold text-lg mr-4 text-zinc-400">
                                {showResult && idx === currentQuestion.correctIndex ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                ) : showResult && idx === selectedAnswer && !isCorrect ? (
                                    <XCircle className="w-5 h-5 text-rose-500" />
                                ) : (
                                    String.fromCharCode(65 + idx)
                                )}
                            </span>
                            <span className="flex-1 font-medium">{opt}</span>
                        </Button>
                    ))}
                </CardContent>

                {!isMyTurn && (
                    <CardFooter className="justify-center">
                        <p className="text-sm text-zinc-500">Aguarde a resposta do {currentPlayer?.id}...</p>
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};
