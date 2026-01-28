import { ActionControls } from './ActionControls';
import { DiceDisplay } from './DiceDisplay';
import { QuestionModal } from './QuestionModal';
import { TopBar } from './TopBar';
import { useGameStore } from '../../store/gameStore';

export const GameHUD = () => {
    const { currentPlayerIndex, players, gamePhase } = useGameStore();
    const currentPlayer = players[currentPlayerIndex];

    if (!currentPlayer || gamePhase === 'INITIAL_ROLL') return null;

    return (
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between z-10">
            <TopBar />
            <QuestionModal />
            <DiceDisplay />
            <ActionControls />
        </div>
    );
};
