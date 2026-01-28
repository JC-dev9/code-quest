import { SpaceData, SpaceLevel } from '../models/types';
import { tier50, tier100, tier150, tier200 } from '../data/companies';
import { BOARD_SIZE } from '../config/constants';

export const generateBoard = (): SpaceData[] => {
    // Helper para obter o caminho da imagem
    const getPath = (folder: string, file: string) => `/logosCodeQuest/Nova pasta/${folder}/${file}`;

    return Array.from({ length: BOARD_SIZE }).map((_, i) => {
        let color = '#e5e7eb';
        let type: 'property' | 'corner' = 'property';
        let level: SpaceLevel = 'Fácil';
        let name = `Empresa ${i}`;
        let price = 50;
        let isImportant = false;
        let imageUrl = '';

        // Corners (Cantos)
        if (i === 0) { return { id: i, name: 'Start', color: '#22c55e', type: 'corner', level: 'Corner' }; }
        if (i === 10) { return { id: i, name: 'Chat GPT', color: '#3b82f6', type: 'corner', level: 'Corner' }; } // Cadeia/Visita
        if (i === 20) { return { id: i, name: 'Auditoria', color: '#ef4444', type: 'corner', level: 'Corner' }; } // Estacionamento Grátis
        if (i === 30) { return { id: i, name: 'Coffee Break', color: '#f59e0b', type: 'corner', level: 'Corner' }; } // Vá para a cadeia

        // Atribuir empresas com base na posição do tabuleiro (agrupamento aproximado do Monopoly)
        // 0-10: Tier 50 (Marrom/Azul Claro)
        // 11-20: Tier 100 (Rosa/Laranja)
        // 21-30: Tier 150 (Vermelho/Amarelo)
        // 31-39: Tier 200 (Verde/Azul Escuro)

        if (i > 0 && i < 10) {
            const idx = (i - 1) % tier50.length;
            const company = tier50[idx];
            name = company.name;
            price = 50;
            level = 'Fácil';
            color = i < 5 ? '#8B4513' : '#87CEEB';
            imageUrl = getPath('50', company.file);
        } else if (i > 10 && i < 20) {
            const idx = (i - 11) % tier100.length;
            const company = tier100[idx];
            name = company.name;
            price = 100;
            level = 'Intermédio';
            color = i < 15 ? '#DA70D6' : '#FFA500';
            imageUrl = getPath('100', company.file);
        } else if (i > 20 && i < 30) {
            const idx = (i - 21) % tier150.length;
            const company = tier150[idx];
            name = company.name;
            price = 150;
            level = 'Difícil';
            color = i < 25 ? '#FF0000' : '#FFD700';
            imageUrl = getPath('150', company.file);
        } else if (i > 30) {
            const idx = (i - 31) % tier200.length;
            const company = tier200[idx];
            name = company.name;
            price = 200;
            level = 'Extremo';
            color = i < 35 ? '#008000' : '#0000FF';
            imageUrl = getPath('200', company.file);
            
            if (i >= 37) isImportant = true; // Top tier
        }

        return {
            id: i,
            name,
            color,
            type,
            level,
            isImportant,
            price,
            ownerId: null,
            imageUrl
        };
    });
};
