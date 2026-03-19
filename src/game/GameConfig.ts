// ============================================================
// GameConfig.ts — 支援手機自動縮放版本
// ============================================================

export const GAME_WIDTH  = 1280;
export const GAME_HEIGHT = 400;

export const ERA_INDEX: Record<string, number> = {
  stone: 0, feudal: 1, castle: 2, modern: 3, space: 4,
};
export const ERA_NAMES: Record<string, string> = {
  stone: '石器時代', feudal: '封建時代', castle: '城堡時代',
  modern: '現代', space: '太空時代',
};
export const UNIT_NAMES: Record<string, string> = {
  swordsman: '劍士', archer: '弓箭手', tank: '肉盾', mage: '法師',
};

export const GROUND_Y      = 310;
export const PLAYER_BASE_X = 80;
export const ENEMY_BASE_X  = GAME_WIDTH - 80;
export const PLAYER_SPAWN_X = PLAYER_BASE_X + 60;
export const ENEMY_SPAWN_X  = ENEMY_BASE_X  - 60;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createGameConfig(scenes: any[]): Record<string, unknown> {
  return {
    type: 0,              // Phaser.AUTO
    width:  GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#1a1a2e',
    parent: 'phaser-container',
    scene: scenes,

    // ✅ Scale Manager：自動縮放到填滿螢幕，保持長寬比
    scale: {
      mode: 3,       // Phaser.Scale.FIT — 等比縮放填滿容器
      autoCenter: 1, // Phaser.Scale.CENTER_BOTH — 水平+垂直置中
      width:  GAME_WIDTH,
      height: GAME_HEIGHT,
    },

    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    render: {
      pixelArt: false,
      antialias: true,
    },
  };
}
