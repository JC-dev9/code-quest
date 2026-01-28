import { useGameStore } from '../../store/gameStore';
import { Coins, User, TrendingUp } from 'lucide-react';

export const TopBar = () => {
    const { players, currentPlayerIndex, localPlayerId } = useGameStore();

    return (
        <div className="flex justify-between items-start pointer-events-auto gap-4">
            {/* Logo/Brand */}
            <div className="bg-gradient-to-br from-slate-900/90 to-purple-900/90 backdrop-blur-xl p-5 rounded-2xl border-2 border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.3)] group hover:scale-105 transition-all duration-300">
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-purple-500 animate-gradient mb-1">
                    CODE QUEST
                </h1>
                <p className="text-[10px] tracking-[0.2em] text-purple-300 uppercase font-bold">DigiCoin Network</p>
                {localPlayerId && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 py-1 px-2 rounded-full border border-emerald-500/30">
                        <User className="w-3 h-3" />
                        Jogador {localPlayerId}
                    </div>
                )}
            </div>

            {/* Player Cards */}
            <div className="flex gap-3">
                {players.map((p, i) => {
                    const isActive = i === currentPlayerIndex;
                    const isYou = p.id === localPlayerId;
                    
                    return (
                        <div 
                            key={p.id} 
                            className={`relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl p-4 rounded-2xl border-2 transition-all duration-500 ${
                                isActive 
                                    ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.5)] scale-110 -translate-y-2' 
                                    : 'border-white/10 opacity-80 hover:opacity-100'
                            }`}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                            )}
                            
                            {/* You Badge */}
                            {isYou && (
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-lg">
                                    VOCÊ
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                {/* Avatar com cor do jogador */}
                                <div className="relative">
                                    <div 
                                        className="w-12 h-12 rounded-xl shadow-lg flex items-center justify-center font-black text-2xl text-white border-2 border-white/20" 
                                        style={{ backgroundColor: p.color }}
                                    >
                                        {p.id}
                                    </div>
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-xl" style={{ 
                                            boxShadow: `0 0 20px ${p.color}`,
                                            animation: 'glow 2s ease-in-out infinite'
                                        }}></div>
                                    )}
                                </div>

                                {/* Player Info */}
                                <div className="min-w-[100px]">
                                    <div className="flex items-center gap-1 mb-1">
                                        <User className="w-3 h-3 text-gray-400" />
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                                            Player {p.id}
                                        </p>
                                    </div>
                                    
                                    {/* Money Display */}
                                    <div className="flex items-center gap-1">
                                        <Coins className="w-4 h-4 text-yellow-400" />
                                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 leading-none">
                                            {p.money}
                                        </p>
                                        <span className="text-xs text-yellow-400/80 font-bold">DG</span>
                                    </div>

                                    {/* Properties Count */}
                                    {p.properties.length > 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                                            <span className="text-[10px] text-emerald-400 font-bold">
                                                {p.properties.length} {p.properties.length === 1 ? 'propriedade' : 'propriedades'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
