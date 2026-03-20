// ============================================================
// SaveManager.ts — 永久存檔系統
// 使用 localStorage 儲存，關閉視窗後資料不消失
// ============================================================
import type { PlayerSave, Grade } from '@/types/game';

const SAVE_KEY = 'aoewar_save_v2'; // v2：三條獨立升級軌

/** 預設初始存檔 */
const DEFAULT_SAVE: PlayerSave = {
  gold: 0,
  unlockedLevels: 1,
  unitUpgrades: {
    swordsman: 0,
    archer: 0,
    tank: 0,
    mage: 0,
  },
  baseHpLevel: 1,
  baseEnergyCapLevel: 1,
  baseRegenLevel: 1,
  levelGrades: {},
};

export class SaveManager {
  // ─────────────────────────────────────────────
  // 讀取存檔（若不存在則回傳預設值）
  // ─────────────────────────────────────────────
  static load(): PlayerSave {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return { ...DEFAULT_SAVE };

      const parsed = JSON.parse(raw) as Partial<PlayerSave>;

      // 深度合併：確保新增欄位有預設值（向後相容）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyParsed = parsed as any;
      return {
        ...DEFAULT_SAVE,
        ...parsed,
        // v1→v2 遷移：舊存檔有 baseLevel，映射到 baseHpLevel
        baseHpLevel:        parsed.baseHpLevel        ?? anyParsed.baseLevel ?? 1,
        baseEnergyCapLevel: parsed.baseEnergyCapLevel ?? 1,
        baseRegenLevel:     parsed.baseRegenLevel     ?? 1,
        unitUpgrades: {
          ...DEFAULT_SAVE.unitUpgrades,
          ...(parsed.unitUpgrades ?? {}),
        },
        levelGrades: parsed.levelGrades ?? {},
      };
    } catch (e) {
      console.warn('[SaveManager] 讀取存檔失敗，使用預設值', e);
      return { ...DEFAULT_SAVE };
    }
  }

  // ─────────────────────────────────────────────
  // 儲存存檔
  // ─────────────────────────────────────────────
  static save(data: PlayerSave): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage 可能因 Private Mode 或空間不足而失敗
      console.warn('[SaveManager] 儲存失敗', e);
    }
  }

  // ─────────────────────────────────────────────
  // 通關後更新存檔（金幣、評價、解鎖關卡）
  // ─────────────────────────────────────────────
  static saveVictory(
    save: PlayerSave,
    levelId: number,
    goldEarned: number,
    grade: Grade
  ): PlayerSave {
    const updated = { ...save };

    // ① 累加金幣
    updated.gold = (updated.gold ?? 0) + goldEarned;

    // ② 更新最佳評價（只保留最高分）
    const gradeOrder: Grade[] = ['C', 'B', 'A', 'S'];
    const prevGrade = updated.levelGrades[levelId];
    if (!prevGrade || gradeOrder.indexOf(grade) > gradeOrder.indexOf(prevGrade)) {
      updated.levelGrades = { ...updated.levelGrades, [levelId]: grade };
    }

    // ③ 解鎖下一關
    if (levelId >= updated.unlockedLevels) {
      updated.unlockedLevels = Math.min(100, levelId + 1);
    }

    SaveManager.save(updated);
    return updated;
  }

  // ─────────────────────────────────────────────
  // 失敗後保留部分金幣（50%）
  // ─────────────────────────────────────────────
  static saveDefeat(save: PlayerSave, goldEarned: number): PlayerSave {
    const updated = { ...save };
    const partial = Math.floor(goldEarned * 0.5);
    updated.gold = (updated.gold ?? 0) + partial;
    SaveManager.save(updated);
    return updated;
  }

  // ─────────────────────────────────────────────
  // 升級兵種後儲存
  // ─────────────────────────────────────────────
  static saveUnitUpgrade(
    save: PlayerSave,
    unitType: keyof PlayerSave['unitUpgrades'],
    cost: number
  ): PlayerSave | null {
    if (save.gold < cost) return null; // 金幣不足

    const updated = {
      ...save,
      gold: save.gold - cost,
      unitUpgrades: {
        ...save.unitUpgrades,
        [unitType]: (save.unitUpgrades[unitType] ?? 0) + 1,
      },
    };
    SaveManager.save(updated);
    return updated;
  }

  // ─────────────────────────────────────────────
  // 升級主基地某條屬性後儲存
  // stat: 'hp' | 'energyCap' | 'regen'
  // ─────────────────────────────────────────────
  static saveBaseStatUpgrade(
    save: PlayerSave,
    stat: 'hp' | 'energyCap' | 'regen',
    cost: number,
  ): PlayerSave | null {
    if (save.gold < cost) return null;

    const KEY_MAP = {
      hp:        'baseHpLevel'        as const,
      energyCap: 'baseEnergyCapLevel' as const,
      regen:     'baseRegenLevel'     as const,
    };
    const MAX_MAP = { hp: 10, energyCap: 8, regen: 15 };
    const key = KEY_MAP[stat];

    if ((save[key] as number) >= MAX_MAP[stat]) return null; // 已最高級

    const updated: PlayerSave = {
      ...save,
      gold: save.gold - cost,
      [key]: (save[key] as number) + 1,
    };
    SaveManager.save(updated);
    return updated;
  }

  // ─────────────────────────────────────────────
  // 清除存檔（重置遊戲）
  // ─────────────────────────────────────────────
  static reset(): PlayerSave {
    localStorage.removeItem(SAVE_KEY);
    return { ...DEFAULT_SAVE };
  }

  // ─────────────────────────────────────────────
  // 偵錯：印出當前存檔
  // ─────────────────────────────────────────────
  static debug(): void {
    const save = SaveManager.load();
    console.log('[SaveManager] 當前存檔：', save);
  }
}
