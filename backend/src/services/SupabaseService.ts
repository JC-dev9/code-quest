import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GameStateData, Question, SpaceLevel } from '../models/types';

// ============================================================
// Tipos de dados das tabelas do Supabase
// ============================================================

export interface DbPlayer {
    id: string;
    display_name: string;
    socket_session_id: string | null;
    total_wins: number;
    total_games: number;
    total_earnings: number;
    created_at: string;
    updated_at: string;
}

export interface DbRoom {
    code: string;
    host_player_id: string | null;
    game_state: GameStateData;
    status: 'WAITING' | 'PLAYING' | 'FINISHED';
    player_count: number;
    created_at: string;
    updated_at: string;
}

export interface DbMatchHistory {
    id: string;
    room_code: string;
    player_id: string;
    player_display_name: string;
    final_position: number;
    final_money: number;
    final_properties: number;
    won: boolean;
    played_at: string;
}

export interface MatchResult {
    playerId: string;
    displayName: string;
    position: number;
    money: number;
    properties: number;
    won: boolean;
}

// ============================================================
// Serviço de acesso ao Supabase (Singleton)
// ============================================================

class SupabaseService {
    private client: SupabaseClient;
    private static instance: SupabaseService | null = null;
    private questionsCache: Question[] = [];
    private isConfigured: boolean = false;

    private constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

        if (!url || !key) {
            console.warn('⚠️  Variáveis SUPABASE_URL ou SUPABASE_ANON_KEY não definidas. Persistência desativada.');
            // Criar cliente dummy para não crashar (nunca será chamado graças ao isConfigured)
            this.client = createClient('https://placeholder.supabase.co', 'placeholder');
            this.isConfigured = false;
            return;
        }

        this.client = createClient(url, key);
        this.isConfigured = true;
        console.log('✅ SupabaseService inicializado com sucesso');
    }

    public static getInstance(): SupabaseService {
        if (!SupabaseService.instance) {
            SupabaseService.instance = new SupabaseService();
        }
        return SupabaseService.instance;
    }

    // ============================================================
    // Salas (Rooms)
    // ============================================================

    /** Guardar ou atualizar o estado de uma sala */
    public async saveRoomState(
        code: string,
        gameState: GameStateData,
        status: 'WAITING' | 'PLAYING' | 'FINISHED' = 'PLAYING',
        playerCount: number = 0
    ): Promise<boolean> {
        if (!this.isConfigured) return false; // Silenciosamente ignorar se não configurado
        try {
            const { error } = await this.client
                .from('rooms')
                .upsert({
                    code,
                    game_state: gameState,
                    status,
                    player_count: playerCount
                }, { onConflict: 'code' });

            if (error) {
                console.error('❌ Erro ao guardar sala:', error.message);
                return false;
            }
            return true;
        } catch (err) {
            console.error('❌ Erro ao guardar sala:', err);
            return false;
        }
    }

    /** Carregar o estado de uma sala para reconexão */
    public async loadRoomState(code: string): Promise<DbRoom | null> {
        if (!this.isConfigured) return null;
        try {
            const { data, error } = await this.client
                .from('rooms')
                .select('*')
                .eq('code', code)
                .single();

            if (error || !data) {
                return null;
            }
            return data as DbRoom;
        } catch (err) {
            console.error('❌ Exceção ao carregar sala:', err);
            return null;
        }
    }

    /** Remover uma sala */
    public async removeRoom(code: string): Promise<boolean> {
        try {
            const { error } = await this.client
                .from('rooms')
                .delete()
                .eq('code', code);

            if (error) {
                console.error('❌ Erro ao remover sala:', error.message);
                return false;
            }
            return true;
        } catch (err) {
            console.error('❌ Exceção ao remover sala:', err);
            return false;
        }
    }

    // ============================================================
    // Jogadores (Players)
    // ============================================================

    /** Criar ou atualizar um perfil de jogador */
    public async upsertPlayer(displayName: string, socketSessionId: string): Promise<DbPlayer | null> {
        try {
            // Primeiro tenta encontrar pelo session id
            const { data: existing } = await this.client
                .from('players')
                .select('*')
                .eq('socket_session_id', socketSessionId)
                .single();

            if (existing) {
                return existing as DbPlayer;
            }

            // Criar novo jogador
            const { data, error } = await this.client
                .from('players')
                .insert({
                    display_name: displayName,
                    socket_session_id: socketSessionId
                })
                .select()
                .single();

            if (error) {
                console.error('❌ Erro ao criar jogador:', error.message);
                return null;
            }
            return data as DbPlayer;
        } catch (err) {
            console.error('❌ Exceção ao criar jogador:', err);
            return null;
        }
    }

    /** Obter um jogador pelo ID */
    public async getPlayer(id: string): Promise<DbPlayer | null> {
        try {
            const { data, error } = await this.client
                .from('players')
                .select('*')
                .eq('id', id)
                .single();

            if (error || !data) return null;
            return data as DbPlayer;
        } catch (err) {
            console.error('❌ Exceção ao obter jogador:', err);
            return null;
        }
    }

    /** Atualizar estatísticas de um jogador após partida */
    public async updatePlayerStats(
        id: string,
        won: boolean,
        earnings: number
    ): Promise<boolean> {
        try {
            // Buscar dados atuais
            const player = await this.getPlayer(id);
            if (!player) return false;

            const { error } = await this.client
                .from('players')
                .update({
                    total_wins: player.total_wins + (won ? 1 : 0),
                    total_games: player.total_games + 1,
                    total_earnings: player.total_earnings + earnings
                })
                .eq('id', id);

            if (error) {
                console.error('❌ Erro ao atualizar stats:', error.message);
                return false;
            }
            return true;
        } catch (err) {
            console.error('❌ Exceção ao atualizar stats:', err);
            return false;
        }
    }

    // ============================================================
    // Histórico de Partidas (Match History)
    // ============================================================

    /** Gravar o resultado de uma partida */
    public async recordMatch(
        roomCode: string,
        results: MatchResult[]
    ): Promise<boolean> {
        try {
            const records = results.map(r => ({
                room_code: roomCode,
                player_id: r.playerId,
                player_display_name: r.displayName,
                final_position: r.position,
                final_money: r.money,
                final_properties: r.properties,
                won: r.won
            }));

            const { error } = await this.client
                .from('match_history')
                .insert(records);

            if (error) {
                console.error('❌ Erro ao gravar histórico:', error.message);
                return false;
            }

            // Atualizar estatísticas de cada jogador
            for (const result of results) {
                await this.updatePlayerStats(result.playerId, result.won, result.money);
            }

            return true;
        } catch (err) {
            console.error('❌ Exceção ao gravar histórico:', err);
            return false;
        }
    }

    /** Obter histórico de partidas de um jogador */
    public async getPlayerHistory(playerId: string): Promise<DbMatchHistory[]> {
        try {
            const { data, error } = await this.client
                .from('match_history')
                .select('*')
                .eq('player_id', playerId)
                .order('played_at', { ascending: false })
                .limit(20);

            if (error || !data) return [];
            return data as DbMatchHistory[];
        } catch (err) {
            console.error('❌ Exceção ao obter histórico:', err);
            return [];
        }
    }
    // ============================================================
    // Perguntas (Questions)
    // ============================================================

    /** Carregar e mapear todas as perguntas aprovadas e as suas opções */
    public async loadAllQuestions(): Promise<void> {
        if (!this.isConfigured) {
            console.warn('⚠️  Supabase não configurado. Nenhuma pergunta será carregada (modo offline).');
            return;
        }
        try {
            console.log('⏳ A carregar perguntas do Supabase...');
            const { data, error } = await this.client
                .from('pergunta')
                .select(`
                    id,
                    enunciado,
                    dificuldade:dificuldade_id (id, nome),
                    opcoes:opcao (id, texto, correta)
                `)
                .eq('aprovada', true);

            if (error || !data) {
                console.error('❌ Erro ao carregar perguntas:', error?.message);
                return;
            }

            this.questionsCache = data.map((q: any) => {
                const options = q.opcoes || [];
                const correctIndex = options.findIndex((o: any) => o.correta);
                
                const safeCorrectIndex = correctIndex >= 0 ? correctIndex : 0;
                
                // Mapear "Médio" / "Intermediário" -> "Intermédio"
                let levelName = q.dificuldade?.nome || 'Fácil';
                if (levelName === 'Médio' || levelName === 'Intermediário') levelName = 'Intermédio';

                return {
                    text: q.enunciado,
                    options: options.map((o: any) => o.texto),
                    correctIndex: safeCorrectIndex,
                    level: levelName as SpaceLevel
                };
            });

            console.log(`✅ ${this.questionsCache.length} perguntas carregadas e prontas no cache.`);
        } catch (err) {
            console.error('❌ Exceção ao carregar perguntas:', err);
        }
    }

    /** Obter lista de perguntas mapeadas do cache local (rápido) */
    public getQuestions(): Question[] {
        return this.questionsCache;
    }
}

export default SupabaseService;

