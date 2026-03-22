import { useGameStore } from '../../store/gameStore';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmLogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ConfirmLogoutModal = ({ isOpen, onClose }: ConfirmLogoutModalProps) => {
    const { leaveRoom } = useGameStore();

    if (!isOpen) return null;

    const handleConfirm = () => {
        leaveRoom();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm pointer-events-auto z-[100] p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-full max-w-md"
                    >
                        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl overflow-hidden">
                            <CardHeader className="relative pb-2 pt-8 text-center">
                                <button 
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                                
                                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                                    <AlertTriangle className="w-8 h-8 text-red-500" />
                                </div>
                                
                                <CardTitle className="text-2xl font-black text-zinc-50 tracking-tight">
                                    TEM CERTEZA?
                                </CardTitle>
                                <p className="text-zinc-400 mt-2 text-sm font-medium">
                                    Ao sair agora, perderá todo o progresso desta partida.
                                </p>
                            </CardHeader>

                            <CardContent className="pt-4 pb-6 px-8">
                                <div className="bg-zinc-950/50 rounded-xl p-4 border border-zinc-800/50 mb-2">
                                    <p className="text-zinc-500 text-xs text-center font-bold uppercase tracking-widest">
                                        Confirme sua decisão
                                    </p>
                                </div>
                            </CardContent>

                            <CardFooter className="flex flex-col gap-3 px-8 pb-8">
                                <Button 
                                    variant="destructive" 
                                    className="w-full h-12 font-black text-base bg-red-600 hover:bg-red-700 shadow-lg shadow-red-900/40 text-white uppercase tracking-widest"
                                    onClick={handleConfirm}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    SIM, SAIR DO JOGO
                                </Button>
                                
                                <Button 
                                    variant="ghost" 
                                    className="w-full h-12 font-bold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                                    onClick={onClose}
                                >
                                    VOLTAR À PARTIDA
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
