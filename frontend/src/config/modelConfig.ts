/**
 * Model Configuration for Player Tokens
 * 
 * Maps player colors to their respective .glb model files.
 * Models should be placed in the /public/models/ directory.
 */

export interface PlayerModelConfig {
    color: string;
    modelPath: string;
    scale?: number; // Optional scaling factor for the model
}

/**
 * Player model configurations
 * Customize these paths based on your actual .glb file names
 */
export const PLAYER_MODELS: PlayerModelConfig[] = [
    {
        color: '#ff0000', // Red player
        modelPath: '/models/red_player.glb',
        scale: 0.05
    },
    {
        color: '#0000ff', // Blue player
        modelPath: '/models/blue_player.glb',
        scale: 0.05
    },
    {
        color: '#00ff00', // Green player (if needed in the future)
        modelPath: '/models/green_player.glb',
        scale: 0.05
    },
    {
        color: '#ffff00', // Yellow player (if needed in the future)
        modelPath: '/models/yellow_player.glb',
        scale: 0.05
    }
];

/**
 * Get model configuration for a given player color
 * @param color - The hex color code of the player
 * @returns Model configuration or undefined if not found
 */
export function getModelConfig(color: string): PlayerModelConfig | undefined {
    return PLAYER_MODELS.find(model =>
        model.color.toLowerCase() === color.toLowerCase()
    );
}

/**
 * Get model path for a given player color
 * @param color - The hex color code of the player
 * @returns Model path or null if not found
 */
export function getModelPath(color: string): string | null {
    const config = getModelConfig(color);
    return config ? config.modelPath : null;
}

/**
 * Get model scale for a given player color
 * @param color - The hex color code of the player
 * @returns Scale factor or 1.0 as default
 */
export function getModelScale(color: string): number {
    const config = getModelConfig(color);
    return config?.scale ?? 1.0;
}
