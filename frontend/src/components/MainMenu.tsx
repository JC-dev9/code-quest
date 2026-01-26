import { useState } from 'react';

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
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 max-w-md w-full">
                {/* Title */}
                <div className="text-center mb-10">
                    <h1 className="text-6xl font-bold text-white mb-2 drop-shadow-lg">
                        Code Quest
                    </h1>
                    <p className="text-purple-200 text-lg">
                        Multiplayer Monopoly
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-center">
                        {error}
                    </div>
                )}

                {/* Create Room Button */}
                <button
                    onClick={onCreateRoom}
                    disabled={isLoading}
                    className="w-full mb-6 py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold text-xl rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                    {isLoading ? '🔄 Criando...' : '🎮 Criar Sala'}
                </button>

                {/* Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-transparent text-purple-200 font-medium">
                            OU
                        </span>
                    </div>
                </div>

                {/* Join Room */}
                <div className="space-y-4">
                    <input
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        onKeyPress={(e) => e.key === 'Enter' && handleJoin()}
                        placeholder="CÓDIGO DA SALA"
                        maxLength={6}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-white/10 border border-white/30 rounded-xl text-white text-center text-2xl font-mono tracking-widest placeholder-purple-300/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                    />
                    <button
                        onClick={handleJoin}
                        disabled={isLoading || roomCode.length !== 6}
                        className="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold text-xl rounded-xl shadow-lg transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                    >
                        {isLoading ? '🔄 Entrando...' : '🚪 Entrar na Sala'}
                    </button>
                </div>

                {/* Info */}
                <div className="mt-8 text-center text-purple-200 text-sm">
                    <p>💡 Códigos têm 6 caracteres</p>
                </div>
            </div>
        </div>
    );
};
