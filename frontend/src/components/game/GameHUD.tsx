import { ActionControls } from './ActionControls';
import { DiceDisplay } from './DiceDisplay';
import { QuestionModal } from './QuestionModal';
import { TopBar } from './TopBar';
import { EventToast } from './EventToast';
import { ChatGPTModal } from './ChatGPTModal';
import { useGameStore } from '../../store/gameStore';
import { Trophy, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const VictoryOverlay = () => {
    const { winnerId, players, leaveRoom } = useGameStore();
    if (winnerId === null) return null;

    const winner = players.find(p => p.id === winnerId);
    if (!winner) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/90 backdrop-blur-md pointer-events-auto z-[70] p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-amber-500/50 shadow-[0_0_80px_rgba(245,158,11,0.2)] text-center">
                <CardHeader className="pt-8 pb-4 relative">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <Trophy className="w-20 h-20 text-amber-500" />
                            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
                        </div>
                    </div>
                    <CardTitle className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-500">
                        VITÓRIA!
                    </CardTitle>
                    <CardDescription className="text-zinc-400 text-base font-medium">
                        Temos um grande vencedor!
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6 pb-8">
                    <div className="flex items-center justify-center gap-4 bg-zinc-950/50 p-4 rounded-xl border border-zinc-800">
                        <div
                            className="w-14 h-14 rounded-xl shadow-lg flex items-center justify-center font-black text-2xl text-zinc-950"
                            style={{ backgroundColor: winner.color }}
                        >
                            {winner.id}
                        </div>
                        <div className="text-left">
                            <p className="text-xl font-black text-zinc-100">{winner.displayName || `Jogador ${winner.id}`}</p>
                            <p className="text-amber-500 font-bold text-sm">
                                {winner.money} DG • {winner.properties.length} empresas
                            </p>
                        </div>
                    </div>

                    <Button
                        size="lg"
                        onClick={leaveRoom}
                        className="w-full font-bold h-14 text-lg bg-amber-600 hover:bg-amber-700 text-white"
                    >
                        VOLTAR AO LOBBY
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export const GameHUD = () => {
    const { currentPlayerIndex, players, gamePhase } = useGameStore();
    const currentPlayer = players[currentPlayerIndex];

    return (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">
            <TopBar />
            
            {(!currentPlayer || gamePhase === 'INITIAL_ROLL') ? null : (
                <>
                    <EventToast />
                    <ChatGPTModal />
                    <QuestionModal />
                    <VictoryOverlay />
                    <DiceDisplay />
                    <ActionControls />
                </>
            )}
        </div>
    );
};
