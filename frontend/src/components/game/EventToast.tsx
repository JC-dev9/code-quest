import { useEffect, useState, useCallback } from 'react';
import { useGameStore, GameEvent } from '../../store/gameStore';
import { Coins, ShieldAlert, Coffee, Bot, Skull, Trophy, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

// ============================================================
// Mapeamento de ícones e cores por tipo de evento
// ============================================================
const EVENT_CONFIG: Record<string, { icon: typeof Coins; bgClass: string; borderClass: string }> = {
    RENT_PAID: { icon: Coins, bgClass: 'from-yellow-600/90 to-amber-700/90', borderClass: 'border-yellow-500' },
    PROPERTY_BOUGHT: { icon: TrendingUp, bgClass: 'from-emerald-600/90 to-green-700/90', borderClass: 'border-emerald-500' },
    PASSED_START: { icon: Coins, bgClass: 'from-green-600/90 to-emerald-700/90', borderClass: 'border-green-500' },
    AUDIT_TAX: { icon: ShieldAlert, bgClass: 'from-red-600/90 to-rose-700/90', borderClass: 'border-red-500' },
    COFFEE_BREAK: { icon: Coffee, bgClass: 'from-amber-600/90 to-yellow-700/90', borderClass: 'border-amber-500' },
    CHATGPT_MOVE: { icon: Bot, bgClass: 'from-blue-600/90 to-cyan-700/90', borderClass: 'border-blue-500' },
    PLAYER_BANKRUPT: { icon: Skull, bgClass: 'from-gray-700/90 to-slate-800/90', borderClass: 'border-gray-500' },
    GAME_OVER: { icon: Trophy, bgClass: 'from-yellow-500/90 to-amber-600/90', borderClass: 'border-yellow-400' },
    ANSWER_CORRECT: { icon: CheckCircle, bgClass: 'from-emerald-600/90 to-green-700/90', borderClass: 'border-emerald-500' },
    ANSWER_WRONG: { icon: XCircle, bgClass: 'from-red-600/90 to-rose-700/90', borderClass: 'border-red-500' },
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
                visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
            }`}
        >
            <div
                className={`bg-gradient-to-r ${config.bgClass} backdrop-blur-xl px-8 py-4 rounded-2xl border-2 ${config.borderClass} shadow-2xl flex items-center gap-4 max-w-lg cursor-pointer`}
                onClick={hideToast}
            >
                <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-white font-bold text-base leading-snug">
                    {currentEvent.message}
                </p>
                {currentEvent.amount !== undefined && (
                    <div className="flex-shrink-0 bg-white/20 px-3 py-1 rounded-full">
                        <span className="text-white font-black text-sm">{currentEvent.amount} DG</span>
                    </div>
                )}
            </div>
        </div>
    );
};
