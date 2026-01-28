import { useGameStore } from '../../store/gameStore';

export const TopBar = () => {
    const { players, currentPlayerIndex, localPlayerId } = useGameStore();

    return (
        <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-xl p-4 rounded-2xl text-white border border-white/20 shadow-2xl">
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
                    CODE QUEST
                </h1>
                <p className="text-[10px] tracking-[0.2em] text-gray-500 uppercase font-bold">DigiCoin Network</p>
                {localPlayerId && (
                    <div className="mt-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                        Você é o Jogador {localPlayerId}
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                {players.map((p, i) => (
                    <div key={p.id} className={`bg-black/60 backdrop-blur-md p-4 rounded-2xl text-white border transition-all duration-300 ${i === currentPlayerIndex ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)] scale-105' : 'border-white/10 opacity-70'}`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg shadow-inner flex items-center justify-center font-bold" style={{ backgroundColor: p.color }}>
                                {p.id}
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase font-bold">Player {p.id}</p>
                                <p className="text-xl font-black text-green-400 leading-none">{p.money} <span className="text-sm">DG</span></p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
