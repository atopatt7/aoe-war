// ============================================================
// Phaser 遊戲設定（不直接 import Phaser 型別，避免 SSR 問題）
// ============================================================

/** 遊戲畫布尺寸 */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 400;

/** 時代映射表 */
export const ERA_INDEX: Record<string, number> = {
  stone: 0,
  feudal: 1,
  castle: 2,
  modern: 3,
  space: 4,
};

export const ERA_NAMES: Record<string, string> = {
  stone: '石器時代',
  feudal: '封建時代',
  castle: '城堡時代',
  modern: '現代',
  space: '太空時代',
};

export const UNIT_NAMES: Record<string, string> = {
  swordsman: '劍士',
  archer: '弓箭手',
  tank: '肉盾',
  mage: '法師',
};

/** 地面 Y 座標（單位站立位置） */
export const GROUND_Y = 310;

/** 玩家基地 X 座標 */
export const PLAYER_BASE_X = 80;

/** 敵人基地 X 座標 */
export const ENEMY_BASE_X = GAME_WIDTH - 80;

/** 玩家單位生成 X 座標 */
export const PLAYER_SPAWN_X = PLAYER_BASE_X + 60;

/** 敵人單位生成 X 座標 */
export const ENEMY_SPAWN_X = ENEMY_BASE_X - 60;

/**
 * 獲取 Phaser 遊戲設定。
 * 此函式只在 client 端執行（透過動態 import），
 * 所以可安全使用 Phaser 全域變數。
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createGameConfig(scenes: any[]): Record<string, unknown> {
  return {
    // Phaser.AUTO = 0（自動偵測渲染器）
    type: 0,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#1a1a2e',
    parent: 'phaser-container',
    scene: scenes,
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
