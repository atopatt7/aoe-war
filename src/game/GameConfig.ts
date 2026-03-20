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

/** 能量上限升級表（共 8 級） */
export const BASE_ENERGY_CAP_UPGRADES: Array<{
  level: number; maxEnergy: number; cost: number;
}> = [
  { level: 1, maxEnergy: 10, cost: 0    },
  { level: 2, maxEnergy: 12, cost: 80   },
  { level: 3, maxEnergy: 15, cost: 160  },
  { level: 4, maxEnergy: 18, cost: 280  },
  { level: 5, maxEnergy: 22, cost: 450  },
  { level: 6, maxEnergy: 25, cost: 700  },
  { level: 7, maxEnergy: 28, cost: 1000 },
  { level: 8, maxEnergy: 30, cost: 1350 },
];

/** 能量回復速度升級表（共 8 級，regenIntervalSec = 每 N 秒 +1 能量） */
export const BASE_REGEN_UPGRADES: Array<{
  level: number; regenIntervalSec: number; cost: number;
}> = [
  { level: 1, regenIntervalSec: 10,  cost: 0    },
  { level: 2, regenIntervalSec: 8,   cost: 100  },
  { level: 3, regenIntervalSec: 7,   cost: 180  },
  { level: 4, regenIntervalSec: 6,   cost: 300  },
  { level: 5, regenIntervalSec: 5,   cost: 480  },
  { level: 6, regenIntervalSec: 4,   cost: 750  },
  { level: 7, regenIntervalSec: 3.5, cost: 1100 },
  { level: 8, regenIntervalSec: 3,   cost: 1600 },
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
