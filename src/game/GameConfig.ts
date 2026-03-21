// ============================================================
// GameConfig.ts — 支援手機自動縮放版本
// ============================================================

export const GAME_WIDTH  = 1280;
export const GAME_HEIGHT = 720;

// ─── 主基地三條獨立升級軌 ─────────────────────────────────
/** 基地血量升級表（共 10 級，同時決定可用時代） */
export const BASE_HP_UPGRADES: Array<{
  level: number; hp: number;
  maxUnitEra: 'stone' | 'feudal' | 'castle' | 'modern' | 'space';
  cost: number;
}> = [
  { level: 1, hp: 1000, maxUnitEra: 'stone',  cost: 0    },
  { level: 2, hp: 1500, maxUnitEra: 'stone',  cost: 100  },
  { level: 3, hp: 2200, maxUnitEra: 'feudal', cost: 200  },
  { level: 4, hp: 3000, maxUnitEra: 'feudal', cost: 400  },
  { level: 5, hp: 4000, maxUnitEra: 'castle', cost: 700  },
  { level: 6, hp: 5000, maxUnitEra: 'castle', cost: 1100 },
  { level: 7, hp: 6000, maxUnitEra: 'modern', cost: 1700 },
  { level: 8, hp: 7000, maxUnitEra: 'modern', cost: 2500 },
  { level: 9, hp: 7500, maxUnitEra: 'space',  cost: 3500 },
  { level: 10, hp: 8000, maxUnitEra: 'space', cost: 5000 },
];

/** 能量上限升級表（共 19 級，每升一級 +5 能量，上限 100） */
export const BASE_ENERGY_CAP_UPGRADES: Array<{
  level: number; maxEnergy: number; cost: number;
}> = [
  { level:  1, maxEnergy:  10, cost: 0    },
  { level:  2, maxEnergy:  15, cost: 80   },
  { level:  3, maxEnergy:  20, cost: 160  },
  { level:  4, maxEnergy:  25, cost: 280  },
  { level:  5, maxEnergy:  30, cost: 450  },
  { level:  6, maxEnergy:  35, cost: 700  },
  { level:  7, maxEnergy:  40, cost: 1000 },
  { level:  8, maxEnergy:  45, cost: 1350 },
  { level:  9, maxEnergy:  50, cost: 1800 },
  { level: 10, maxEnergy:  55, cost: 2350 },
  { level: 11, maxEnergy:  60, cost: 3000 },
  { level: 12, maxEnergy:  65, cost: 3800 },
  { level: 13, maxEnergy:  70, cost: 4700 },
  { level: 14, maxEnergy:  75, cost: 5800 },
  { level: 15, maxEnergy:  80, cost: 7000 },
  { level: 16, maxEnergy:  85, cost: 8400 },
  { level: 17, maxEnergy:  90, cost: 10000 },
  { level: 18, maxEnergy:  95, cost: 12000 },
  { level: 19, maxEnergy: 100, cost: 14500 },
];

/** 能量回復速度升級表（共 50 級，regenPerSec 每升一級 +0.2，上限 10.0/秒） */
export const BASE_REGEN_UPGRADES: Array<{
  level: number; regenPerSec: number; cost: number;
}> = [
  { level:  1, regenPerSec:  0.2, cost:      0 },
  { level:  2, regenPerSec:  0.4, cost:     80 },
  { level:  3, regenPerSec:  0.6, cost:    160 },
  { level:  4, regenPerSec:  0.8, cost:    280 },
  { level:  5, regenPerSec:  1.0, cost:    420 },
  { level:  6, regenPerSec:  1.2, cost:    600 },
  { level:  7, regenPerSec:  1.4, cost:    820 },
  { level:  8, regenPerSec:  1.6, cost:   1100 },
  { level:  9, regenPerSec:  1.8, cost:   1450 },
  { level: 10, regenPerSec:  2.0, cost:   1900 },
  { level: 11, regenPerSec:  2.2, cost:   2450 },
  { level: 12, regenPerSec:  2.4, cost:   3100 },
  { level: 13, regenPerSec:  2.6, cost:   3900 },
  { level: 14, regenPerSec:  2.8, cost:   4900 },
  { level: 15, regenPerSec:  3.0, cost:   6200 },
  { level: 16, regenPerSec:  3.2, cost:   6750 },
  { level: 17, regenPerSec:  3.4, cost:   7350 },
  { level: 18, regenPerSec:  3.6, cost:   8000 },
  { level: 19, regenPerSec:  3.8, cost:   8700 },
  { level: 20, regenPerSec:  4.0, cost:   9500 },
  { level: 21, regenPerSec:  4.2, cost:  10350 },
  { level: 22, regenPerSec:  4.4, cost:  11300 },
  { level: 23, regenPerSec:  4.6, cost:  12300 },
  { level: 24, regenPerSec:  4.8, cost:  13400 },
  { level: 25, regenPerSec:  5.0, cost:  14600 },
  { level: 26, regenPerSec:  5.2, cost:  15900 },
  { level: 27, regenPerSec:  5.4, cost:  17350 },
  { level: 28, regenPerSec:  5.6, cost:  18900 },
  { level: 29, regenPerSec:  5.8, cost:  20600 },
  { level: 30, regenPerSec:  6.0, cost:  22450 },
  { level: 31, regenPerSec:  6.2, cost:  24450 },
  { level: 32, regenPerSec:  6.4, cost:  26650 },
  { level: 33, regenPerSec:  6.6, cost:  29050 },
  { level: 34, regenPerSec:  6.8, cost:  31650 },
  { level: 35, regenPerSec:  7.0, cost:  34500 },
  { level: 36, regenPerSec:  7.2, cost:  37600 },
  { level: 37, regenPerSec:  7.4, cost:  41000 },
  { level: 38, regenPerSec:  7.6, cost:  44700 },
  { level: 39, regenPerSec:  7.8, cost:  48700 },
  { level: 40, regenPerSec:  8.0, cost:  53100 },
  { level: 41, regenPerSec:  8.2, cost:  57900 },
  { level: 42, regenPerSec:  8.4, cost:  63100 },
  { level: 43, regenPerSec:  8.6, cost:  68800 },
  { level: 44, regenPerSec:  8.8, cost:  75000 },
  { level: 45, regenPerSec:  9.0, cost:  81750 },
  { level: 46, regenPerSec:  9.2, cost:  89100 },
  { level: 47, regenPerSec:  9.4, cost:  97100 },
  { level: 48, regenPerSec:  9.6, cost: 105850 },
  { level: 49, regenPerSec:  9.8, cost: 115400 },
  { level: 50, regenPerSec: 10.0, cost: 125800 },
];

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

export const GROUND_Y      = 560;
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
