import { ActionControls } from './ActionControls';
import { DiceDisplay } from './DiceDisplay';
import { QuestionModal } from './QuestionModal';
import { TopBar } from './TopBar';
import { EventToast } from './EventToast';
import { ChatGPTModal } from './ChatGPTModal';
import { useGameStore } from '../../store/gameStore';
import { Trophy, Sparkles } from 'lucide-react';

// ============================================================
// Overlay de Vitória (fim de jogo)
// ============================================================
const VictoryOverlay = () => {
    const { winnerId, players, leaveRoom } = useGameStore();
    if (winnerId === null) return null;

    const winner = players.find(p => p.id === winnerId);
    if (!winner) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto z-[70] animate-slide-in">
            <div className="bg-gradient-to-br from-yellow-900/95 to-amber-900/95 border-2 border-yellow-500/50 p-12 rounded-3xl max-w-lg w-full shadow-[0_0_80px_rgba(234,179,8,0.4)] text-center">
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <Trophy className="w-24 h-24 text-yellow-400" />
                        <Sparkles className="w-8 h-8 text-yellow-300 absolute -top-2 -right-2 animate-pulse" />
                    </div>
                </div>

                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 mb-4 animate-gradient">
                    VITÓRIA!
                </h2>

                <div className="flex items-center justify-center gap-4 mb-6">
                    <div
                        className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center font-black text-3xl text-white border-2 border-white/30"
                        style={{ backgroundColor: winner.color }}
                    >
                        {winner.id}
                    </div>
                    <div className="text-left">
                        <p className="text-2xl font-black text-white">{winner.displayName}</p>
                        <p className="text-yellow-300 font-medium">
                            {winner.money} DG • {winner.properties.length} empresas
                        </p>
                    </div>
                </div>

                <button
                    onClick={leaveRoom}
                    className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-black text-xl rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                    VOLTAR AO MENU
                </button>
            </div>
        </div>
    );
};

// ============================================================
// GameHUD — Overlay principal do jogo
// ============================================================
export const GameHUD = () => {
    const { currentPlayerIndex, players, gamePhase } = useGameStore();
    const currentPlayer = players[currentPlayerIndex];

    if (!currentPlayer || gamePhase === 'INITIAL_ROLL') return null;

    return (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">
            <TopBar />
            <EventToast />
            <ChatGPTModal />
            <QuestionModal />
            <VictoryOverlay />
            <DiceDisplay />
            <ActionControls />
        </div>
    );
};
