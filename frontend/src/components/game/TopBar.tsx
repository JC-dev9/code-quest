import { useGameStore } from '../../store/gameStore';
import type { Player } from '../../store/gameStore';
import { Coins, User, TrendingUp, Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ConfirmLogoutModal } from './ConfirmLogoutModal';
import { useState } from 'react';

export const TopBar = () => {
    const { players, currentPlayerIndex, localPlayerId, gameMode } = useGameStore();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLeave = () => {
        setIsLogoutModalOpen(true);
    };

    return (
        <div className="flex justify-between items-start pointer-events-auto gap-4">
            {/* Logo/Brand */}
            <div className="flex flex-col gap-2">
                <div className="bg-zinc-950/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-zinc-800 shadow-lg flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        <h1 className="text-2xl font-black text-zinc-50 tracking-tight leading-none">
                            CODE QUEST
                        </h1>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-bold">Monopoly Edition</p>
                        {localPlayerId && (
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 py-0.5 px-2 rounded-full ml-3">
                                ID: {localPlayerId}
                            </span>
                        )}
                    </div>
                </div>

                <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={handleLeave}
                    className="w-fit bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-900/50 backdrop-blur-md rounded-xl font-bold gap-2 text-[10px] uppercase tracking-wider px-4 h-9"
                >
                    <LogOut className="w-3 h-3" />
                    Sair e Voltar ao Menu
                </Button>

                <ConfirmLogoutModal 
                    isOpen={isLogoutModalOpen} 
                    onClose={() => setIsLogoutModalOpen(false)} 
                />
            </div>

            {/* Player Cards */}
            <div className="flex gap-3">
                {players.map((p: Player, i: number) => {
                    const isActive = i === currentPlayerIndex;
                    const isYou = gameMode === 'split-screen' || p.id === localPlayerId;
                    
                    return (
                        <Card 
                            key={p.id} 
                            className={`relative bg-zinc-950/90 backdrop-blur-md p-3 border transition-all duration-300 ${
                                isActive 
                                    ? 'border-indigo-500 shadow-md scale-105' 
                                    : 'border-zinc-800 opacity-90'
                            }`}
                        >
                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                            )}
                            
                            {/* You Badge */}
                            {isYou && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-zinc-100 hover:bg-zinc-100 text-zinc-900 border-none font-bold uppercase text-[9px] px-2 py-0">You</Badge>
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <Avatar className={`w-12 h-12 border-2 ${isActive ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-zinc-950' : 'border-zinc-800'}`} style={{ borderColor: isActive ? undefined : p.color }}>
                                    <AvatarFallback className="text-zinc-950 font-black text-xl" style={{ backgroundColor: p.color }}>
                                        {p.id}
                                    </AvatarFallback>
                                </Avatar>

                                {/* Player Info */}
                                <div className="min-w-[100px]">
                                    <div className="flex items-center gap-1 mb-0.5">
                                        <User className="w-3 h-3 text-zinc-500" />
                                        <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                                            Player {p.id}
                                        </p>
                                    </div>
                                    
                                    {/* Money Display */}
                                    <div className="flex items-center gap-1">
                                        <Coins className="w-4 h-4 text-emerald-400" />
                                        <p className="text-xl font-black text-zinc-100 leading-none">
                                            {p.money}
                                        </p>
                                    </div>

                                    {/* Properties Count */}
                                    {p.properties.length > 0 && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <TrendingUp className="w-3 h-3 text-indigo-400" />
                                            <span className="text-[10px] text-zinc-400 font-medium">
                                                {p.properties.length} prop(s)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};
