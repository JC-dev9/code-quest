"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateBoard = void 0;
const companies_1 = require("../data/companies");
const constants_1 = require("../config/constants");
// ============================================================
// Empresas Importantes (no meio de cada lado do tabuleiro)
// ============================================================
const IMPORTANT_COMPANIES = {
    5: { name: 'Apple', file: 'Apple.png' },
    15: { name: 'Amazon', file: 'Amazon.png' },
    25: { name: 'Microsoft', file: 'Microsoft.png' },
    35: { name: 'Nvidia', file: 'Nvidia.png' }
};
const generateBoard = () => {
    // Helper para obter o caminho da imagem
    const getPath = (folder, file) => `/logosCodeQuest/Nova pasta/${folder}/${file}`;
    const getImportantPath = (file) => `/logosCodeQuest/Nova pasta/important/${file}`;
    return Array.from({ length: constants_1.BOARD_SIZE }).map((_, i) => {
        let color = '#e5e7eb';
        let type = 'property';
        let level = 'Fácil';
        let name = `Empresa ${i}`;
        let price = 50;
        let isImportant = false;
        let imageUrl = '';
        // Corners (Cantos)
        if (i === 0) {
            return { id: i, name: 'Start', color: '#22c55e', type: 'corner', level: 'Corner' };
        }
        if (i === 10) {
            return { id: i, name: 'Chat GPT', color: '#3b82f6', type: 'corner', level: 'Corner' };
        }
        if (i === 20) {
            return { id: i, name: 'Auditoria', color: '#ef4444', type: 'corner', level: 'Corner' };
        }
        if (i === 30) {
            return { id: i, name: 'Coffee Break', color: '#f59e0b', type: 'corner', level: 'Corner' };
        }
        // Empresas Importantes (posições 5, 15, 25, 35)
        if (IMPORTANT_COMPANIES[i]) {
            const company = IMPORTANT_COMPANIES[i];
            return {
                id: i,
                name: company.name,
                color: '#FFD700', // Dourado para empresas importantes
                type: 'property',
                level: 'Extremo',
                isImportant: true,
                price: 300,
                ownerId: null,
                imageUrl: getImportantPath(company.file)
            };
        }
        // Atribuir empresas normais com base na posição do tabuleiro
        // Lado 1 (1-9): Tier 50 — Fácil
        // Lado 2 (11-19): Tier 100 — Intermédio
        // Lado 3 (21-29): Tier 150 — Difícil
        // Lado 4 (31-39): Tier 200 — Extremo
        if (i > 0 && i < 10) {
            const normalPositions = [1, 2, 3, 4, 6, 7, 8, 9]; // Excluir 5 (importante)
            const normalIdx = normalPositions.indexOf(i);
            const idx = normalIdx >= 0 ? normalIdx % companies_1.tier50.length : (i - 1) % companies_1.tier50.length;
            const company = companies_1.tier50[idx];
            name = company.name;
            price = 50;
            level = 'Fácil';
            color = i < 5 ? '#8B4513' : '#87CEEB';
            imageUrl = getPath('50', company.file);
        }
        else if (i > 10 && i < 20) {
            const normalPositions = [11, 12, 13, 14, 16, 17, 18, 19]; // Excluir 15 (importante)
            const normalIdx = normalPositions.indexOf(i);
            const idx = normalIdx >= 0 ? normalIdx % companies_1.tier100.length : (i - 11) % companies_1.tier100.length;
            const company = companies_1.tier100[idx];
            name = company.name;
            price = 100;
            level = 'Intermédio';
            color = i < 15 ? '#DA70D6' : '#FFA500';
            imageUrl = getPath('100', company.file);
        }
        else if (i > 20 && i < 30) {
            const normalPositions = [21, 22, 23, 24, 26, 27, 28, 29]; // Excluir 25 (importante)
            const normalIdx = normalPositions.indexOf(i);
            const idx = normalIdx >= 0 ? normalIdx % companies_1.tier150.length : (i - 21) % companies_1.tier150.length;
            const company = companies_1.tier150[idx];
            name = company.name;
            price = 150;
            level = 'Difícil';
            color = i < 25 ? '#FF0000' : '#FFD700';
            imageUrl = getPath('150', company.file);
        }
        else if (i > 30) {
            const normalPositions = [31, 32, 33, 34, 36, 37, 38, 39]; // Excluir 35 (importante)
            const normalIdx = normalPositions.indexOf(i);
            const idx = normalIdx >= 0 ? normalIdx % companies_1.tier200.length : (i - 31) % companies_1.tier200.length;
            const company = companies_1.tier200[idx];
            name = company.name;
            price = 200;
            level = 'Extremo';
            color = i < 35 ? '#008000' : '#0000FF';
            imageUrl = getPath('200', company.file);
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
exports.generateBoard = generateBoard;
