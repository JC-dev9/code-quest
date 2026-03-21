import { useState } from 'react';
import { Gamepad2, Loader2, LogIn, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface MainMenuProps {
    onCreateRoom: () => void;
    onJoinRoom: (code: string) => void;
    isLoading: boolean;
    error: string | null;
}

export const MainMenu = ({ onCreateRoom, onJoinRoom, isLoading, error }: MainMenuProps) => {
    const [roomCode, setRoomCode] = useState('');

    const handleJoin = () => {
        if (roomCode.trim().length === 6) {
            onJoinRoom(roomCode.trim().toUpperCase());
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 p-4 overflow-hidden z-50">
            <Card className="w-full max-w-md border-zinc-800 bg-zinc-900 shadow-2xl overflow-y-auto max-h-[95vh]">
                <CardHeader className="text-center space-y-4 pb-8">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 mb-2">
                        <Sparkles className="h-8 w-8 text-indigo-400" />
                    </div>
                    <CardTitle className="text-4xl font-black tracking-tight text-zinc-50">
                        CODE QUEST
                    </CardTitle>
                    <CardDescription className="text-base text-zinc-400 font-medium tracking-wide">
                        Monopoly Digital Edition
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                    {error && (
                        <div className="rounded-lg bg-red-500/10 p-4 border border-red-500/20 text-center">
                            <p className="text-sm font-medium text-red-500">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                        <Button 
                            size="lg" 
                            onClick={() => onCreateRoom()} // Default Online
                            disabled={isLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-14 text-lg"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Sparkles className="mr-2 h-5 w-5" />
                            )}
                            {isLoading ? 'Criando...' : 'Jogar Online'}
                        </Button>

                        <Button 
                            size="lg" 
                            variant="outline"
                            onClick={() => (onCreateRoom as any)('split-screen')}
                            disabled={isLoading}
                            className="w-full border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-100 font-bold h-14 text-lg"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <Gamepad2 className="mr-2 h-5 w-5" />
                            )}
                            {isLoading ? 'Criando...' : 'Local (Split Screen)'}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator className="border-zinc-800" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-zinc-900 px-2 text-zinc-500 font-medium">
                                Ou entrar com código
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Input
                            type="text"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                            placeholder="CÓDIGO (6 DÍGITOS)"
                            maxLength={6}
                            disabled={isLoading}
                            className="h-14 bg-zinc-950 border-zinc-800 text-center text-xl font-mono font-bold tracking-[0.2em] uppercase focus-visible:ring-indigo-500 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-1"
                        />
                        <Button 
                            variant="secondary"
                            size="lg"
                            onClick={handleJoin}
                            disabled={isLoading || roomCode.length !== 6}
                            className="w-full font-bold h-14 text-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            ) : (
                                <LogIn className="mr-2 h-5 w-5" />
                            )}
                            {isLoading ? 'Entrando...' : 'Entrar na Sala'}
                        </Button>
                    </div>
                </CardContent>

                <CardFooter className="pt-2 pb-6 flex justify-center">
                    <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium text-center">
                        <Lightbulb className="h-4 w-4 shrink-0" />
                        <span>{isLoading ? 'Aguarde um momento...' : 'No modo local não é necessário convidar amigos online'}</span>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
