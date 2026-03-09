import { useState, useEffect } from 'react';
import { Gamepad2, Clipboard, Check, Crown, Users, Rocket, Hourglass, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface RoomLobbyProps {
    roomCode: string;
    players: Array<{ id: number; color: string }>;
    isHost: boolean;
    onStartGame: () => void;
    onLeaveRoom: () => void;
}

export const RoomLobby = ({ roomCode, players, isHost, onStartGame, onLeaveRoom }: RoomLobbyProps) => {
    const [copied, setCopied] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (countdown !== null && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            onStartGame();
        }
    }, [countdown, onStartGame]);

    const copyRoomCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const canStart = players.length >= 2;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 p-4 z-50">
            <Card className="w-full max-w-lg border-zinc-800 bg-zinc-900 shadow-2xl">
                <CardHeader className="text-center pb-6">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                        <Gamepad2 className="h-8 w-8 text-emerald-400" />
                    </div>
                    <CardTitle className="text-3xl font-black text-zinc-50">SALA DE ESPERA</CardTitle>
                    <CardDescription className="text-zinc-400 mt-2 flex items-center justify-center gap-2">
                        <Hourglass className="w-4 h-4 animate-spin-slow" />
                        Aguardando jogadores...
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Código da Sala */}
                    <div 
                        onClick={copyRoomCode}
                        className="group flex flex-col items-center justify-center p-6 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer hover:border-emerald-500/50 transition-colors"
                    >
                        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Código da Sala</span>
                        <div className="text-5xl font-mono font-black tracking-[0.2em] text-zinc-100 group-hover:text-emerald-400 transition-colors">
                            {roomCode}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                            {copied ? (
                                <span className="flex items-center gap-1 text-emerald-500"><Check className="w-4 h-4" /> Copiado!</span>
                            ) : (
                                <span className="flex items-center gap-1 text-zinc-500"><Clipboard className="w-4 h-4" /> Copiar código</span>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    {/* Lista de Jogadores */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-zinc-400 text-sm font-medium flex items-center gap-2">
                                <Users className="w-4 h-4" /> Jogadores
                            </span>
                            <Badge variant="secondary" className="bg-zinc-800 text-zinc-300">
                                {players.length}/2
                            </Badge>
                        </div>
                        
                        <div className="grid gap-3">
                            {players.map((player, index) => (
                                <div key={player.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border-2 border-zinc-900 ring-2" style={{ "--tw-ring-color": player.color } as React.CSSProperties}>
                                            <AvatarFallback className="bg-zinc-800 text-zinc-300 font-bold" style={{ color: player.color }}>
                                                J{index + 1}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-zinc-100 font-bold">Jogador {index + 1}</span>
                                            <span className="text-zinc-500 text-xs">{index === 0 ? 'Anfitrião' : 'Convidado'}</span>
                                        </div>
                                    </div>
                                    {index === 0 && (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-none hover:bg-emerald-500/20">
                                            <Crown className="w-3 h-3 mr-1" /> Host
                                        </Badge>
                                    )}
                                </div>
                            ))}
                            
                            {players.length < 2 && (
                                <div className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-zinc-800 bg-zinc-950/50">
                                    <span className="text-zinc-500 text-sm font-medium animate-pulse">
                                        À espera do 2º jogador...
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex flex-col gap-3">
                    {isHost ? (
                        <Button 
                            className="w-full h-12 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white" 
                            disabled={!canStart} 
                            onClick={onStartGame}
                        >
                            {canStart ? (
                                <><Rocket className="w-5 h-5 mr-2" /> Começar Jogo</>
                            ) : (
                                <><Hourglass className="w-5 h-5 mr-2 animate-spin-slow" /> Aguardando...</>
                            )}
                        </Button>
                    ) : (
                        <div className="w-full h-12 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 font-medium">
                            <Hourglass className="w-4 h-4 mr-2 animate-spin-slow" /> Host a iniciar...
                        </div>
                    )}
                    <Button variant="ghost" className="w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10" onClick={onLeaveRoom}>
                        <LogOut className="w-4 h-4 mr-2" /> Sair da Sala
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};
