import { useMemo, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Bot, MapPin, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const ChatGPTModal = () => {
    const {
        awaitingChatGPTChoice, boardConfig, players, currentPlayerIndex,
        localPlayerId, chatGPTChooseSpace
    } = useGameStore();

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === currentPlayer?.id;

    const validSpaces = useMemo(() => {
        return boardConfig.filter(space =>
            space.type === 'property'
        );
    }, [boardConfig]);

    const handleChoose = useCallback((spaceId: number) => {
        if (isMyTurn) {
            chatGPTChooseSpace(spaceId);
        }
    }, [isMyTurn, chatGPTChooseSpace]);

    if (!awaitingChatGPTChoice) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm pointer-events-auto z-50 p-4">
            <Card className="w-full max-w-3xl bg-zinc-900 border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)] max-h-[85vh] flex flex-col">
                <CardHeader className="text-center pb-4 shrink-0">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Bot className="w-8 h-8 text-indigo-400" />
                        <CardTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                            CHAT GPT
                        </CardTitle>
                        <Sparkles className="w-6 h-6 text-cyan-400" />
                    </div>
                    <CardDescription className="text-zinc-400 text-base font-medium">
                        {isMyTurn
                            ? 'Escolhe uma casa para o Chat GPT te avançar!'
                            : `Aguardando ${currentPlayer?.displayName ?? 'jogador'} escolher...`
                        }
                    </CardDescription>
                </CardHeader>

                <CardContent className="overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-4 gap-3 pb-6">
                    {validSpaces.map(space => {
                        const isOwned = space.ownerId !== null;
                        const owner = isOwned ? players.find(p => p.id === space.ownerId) : null;

                        return (
                            <button
                                key={space.id}
                                onClick={() => handleChoose(space.id)}
                                disabled={!isMyTurn}
                                className={`group relative p-3 rounded-xl border transition-all duration-200 text-left ${
                                    isMyTurn
                                        ? 'border-zinc-800 bg-zinc-950 hover:border-indigo-500 hover:bg-zinc-900 cursor-pointer'
                                        : 'border-zinc-800 bg-zinc-950/50 opacity-60 cursor-not-allowed'
                                }`}
                            >
                                <div
                                    className="w-full h-1.5 rounded-full mb-3"
                                    style={{ backgroundColor: space.color }}
                                />

                                <p className="text-zinc-100 text-sm font-bold truncate">{space.name}</p>

                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-zinc-500 font-medium">
                                        {space.price} DG
                                    </span>
                                    {isOwned && owner && (
                                        <div
                                            className="w-3 h-3 rounded-full border border-zinc-800"
                                            style={{ backgroundColor: owner.color }}
                                        />
                                    )}
                                    {space.isImportant && (
                                        <Sparkles className="w-3 h-3 text-indigo-400" />
                                    )}
                                </div>

                                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-zinc-800/50">
                                    <MapPin className="w-3 h-3 text-zinc-600" />
                                    <span className="text-[10px] text-zinc-500">#{space.id}</span>
                                </div>
                            </button>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
};
