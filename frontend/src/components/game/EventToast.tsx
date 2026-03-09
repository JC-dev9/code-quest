import { useEffect, useState, useCallback } from 'react';
import { useGameStore, type GameEvent } from '../../store/gameStore';
import { Coins, ShieldAlert, Coffee, Bot, Skull, Trophy, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

const EVENT_CONFIG: Record<string, { icon: typeof Coins; colorClass: string }> = {
    RENT_PAID: { icon: Coins, colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    PROPERTY_BOUGHT: { icon: TrendingUp, colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    PASSED_START: { icon: Coins, colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    AUDIT_TAX: { icon: ShieldAlert, colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
    COFFEE_BREAK: { icon: Coffee, colorClass: 'text-amber-600 bg-amber-600/10 border-amber-600/20' },
    CHATGPT_MOVE: { icon: Bot, colorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    PLAYER_BANKRUPT: { icon: Skull, colorClass: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
    GAME_OVER: { icon: Trophy, colorClass: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' },
    ANSWER_CORRECT: { icon: CheckCircle, colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    ANSWER_WRONG: { icon: XCircle, colorClass: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
};

export const EventToast = () => {
    const { lastEvent, clearEvent } = useGameStore();
    const [visible, setVisible] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

    const hideToast = useCallback(() => {
        setVisible(false);
        setTimeout(() => {
            setCurrentEvent(null);
            clearEvent();
        }, 300);
    }, [clearEvent]);

    useEffect(() => {
        if (lastEvent) {
            setCurrentEvent(lastEvent);
            setVisible(true);

            // Auto-esconder após 3 segundos (exceto GAME_OVER)
            if (lastEvent.type !== 'GAME_OVER') {
                const timer = setTimeout(hideToast, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [lastEvent, hideToast]);

    if (!currentEvent) return null;

    const config = EVENT_CONFIG[currentEvent.type] ?? EVENT_CONFIG['PASSED_START'];
    const Icon = config.icon;

    return (
        <div
            className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] pointer-events-auto transition-all duration-300 ${
                visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
            }`}
        >
            <div
                className={`bg-zinc-950/95 backdrop-blur-md px-5 py-3 rounded-full border border-zinc-800 shadow-2xl flex items-center gap-3 max-w-lg cursor-pointer hover:bg-zinc-900 transition-colors`}
                onClick={hideToast}
            >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border ${config.colorClass}`}>
                    <Icon className={`w-4 h-4 ${config.colorClass.split(' ')[0]}`} />
                </div>
                <p className="text-zinc-100 font-medium text-sm leading-snug">
                    {currentEvent.message.replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{2B00}-\u{2BFF}]|[\u{FE00}-\u{FE0F}]|[\u{1F000}-\u{1F9FF}]/gu, '').trim()}
                </p>
                {currentEvent.amount !== undefined && (
                    <div className="flex-shrink-0 bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 rounded-full ml-2">
                        <span className="text-zinc-300 font-bold text-xs">{currentEvent.amount} DG</span>
                    </div>
                )}
            </div>
        </div>
    );
};
