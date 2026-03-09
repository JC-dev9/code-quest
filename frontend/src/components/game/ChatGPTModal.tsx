import { useMemo, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Bot, MapPin, Sparkles } from 'lucide-react';

export const ChatGPTModal = () => {
    const {
        awaitingChatGPTChoice, boardConfig, players, currentPlayerIndex,
        localPlayerId, chatGPTChooseSpace
    } = useGameStore();

    const currentPlayer = players[currentPlayerIndex];
    const isMyTurn = localPlayerId === currentPlayer?.id;

    // Filtrar casas válidas para o Chat GPT (apenas propriedades, não cantos)
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
        <div className="absolute inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md pointer-events-auto z-50 animate-slide-in">
            <div className="bg-gradient-to-br from-slate-900/95 to-blue-900/95 border-2 border-blue-500/50 p-8 rounded-3xl max-w-3xl w-full shadow-[0_0_60px_rgba(59,130,246,0.3)] backdrop-blur-xl max-h-[80vh] flex flex-col">
                {/* Cabeçalho */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <Bot className="w-10 h-10 text-blue-400 animate-pulse" />
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
                        CHAT GPT
                    </h2>
                    <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                </div>

                <p className="text-blue-200 text-center text-lg mb-6 font-medium">
                    {isMyTurn
                        ? 'Escolhe uma casa para avançar!'
                        : `Aguardando ${currentPlayer?.displayName ?? 'jogador'} escolher...`
                    }
                </p>

                {/* Grid de casas disponíveis */}
                <div className="overflow-y-auto grid grid-cols-4 gap-2 pr-2">
                    {validSpaces.map(space => {
                        const isOwned = space.ownerId !== null;
                        const owner = isOwned ? players.find(p => p.id === space.ownerId) : null;

                        return (
                            <button
                                key={space.id}
                                onClick={() => handleChoose(space.id)}
                                disabled={!isMyTurn}
                                className={`group relative p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                                    isMyTurn
                                        ? 'border-white/20 hover:border-blue-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer bg-white/5'
                                        : 'border-white/10 opacity-50 cursor-not-allowed bg-white/5'
                                }`}
                            >
                                {/* Indicador de cor */}
                                <div
                                    className="w-full h-1.5 rounded-full mb-2"
                                    style={{ backgroundColor: space.color }}
                                />

                                <p className="text-white text-xs font-bold truncate">{space.name}</p>

                                <div className="flex items-center justify-between mt-1">
                                    <span className="text-[10px] text-gray-400 font-medium">
                                        {space.price} DG
                                    </span>
                                    {isOwned && owner && (
                                        <div
                                            className="w-3 h-3 rounded-full border border-white/30"
                                            style={{ backgroundColor: owner.color }}
                                        />
                                    )}
                                    {space.isImportant && (
                                        <Sparkles className="w-3 h-3 text-yellow-400" />
                                    )}
                                </div>

                                <div className="flex items-center gap-1 mt-1">
                                    <MapPin className="w-2.5 h-2.5 text-gray-500" />
                                    <span className="text-[9px] text-gray-500">#{space.id}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
