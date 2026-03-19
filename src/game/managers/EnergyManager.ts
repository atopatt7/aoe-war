// ============================================================
// EnergyManager：能量系統
// 管理能量回復、消耗、上限
// ============================================================
import type { UnitType, Era } from '@/types/game';

/** 方案C固定費用表（依 [石器,封建,城堡,現代,太空] 對應） */
export const UNIT_ENERGY_COST: Record<UnitType, number[]> = {
  swordsman: [1, 2, 4, 6, 8],
  archer:    [3, 5, 7, 10, 14],
  tank:      [5, 8, 12, 18, 25],
  mage:      [7, 10, 15, 22, 30],
};

/** 時代對應索引 */
const ERA_TO_INDEX: Record<Era, number> = {
  stone: 0, feudal: 1, castle: 2, modern: 3, space: 4,
};

export class EnergyManager {
  private current: number;
  private max: number;
  private regenInterval: number; // ms
  private lastRegenTime: number;

  constructor(maxEnergy: number, regenIntervalSec: number) {
    this.max = maxEnergy;
    this.current = maxEnergy;
    this.regenInterval = regenIntervalSec * 1000;
    this.lastRegenTime = 0;
  }

  // ─────────────────────────────────────────────
  // 每幀更新（能量回復）
  // ─────────────────────────────────────────────
  update(currentTime: number): void {
    if (this.lastRegenTime === 0) {
      this.lastRegenTime = currentTime;
      return;
    }

    // 每 regenInterval ms 回復 1 能量
    if (currentTime - this.lastRegenTime >= this.regenInterval) {
      const ticks = Math.floor((currentTime - this.lastRegenTime) / this.regenInterval);
      this.current = Math.min(this.max, this.current + ticks);
      this.lastRegenTime += ticks * this.regenInterval;
    }
  }

  // ─────────────────────────────────────────────
  // 嘗試消耗能量（返回是否成功）
  // ─────────────────────────────────────────────
  tryConsume(unitType: UnitType, era: Era): boolean {
    const cost = this.getCost(unitType, era);
    if (this.current >= cost) {
      this.current -= cost;
      return true;
    }
    return false;
  }

  // ─────────────────────────────────────────────
  // 取得指定兵種的能量費用
  // ─────────────────────────────────────────────
  getCost(unitType: UnitType, era: Era): number {
    const costs = UNIT_ENERGY_COST[unitType];
    const idx = ERA_TO_INDEX[era];
    return costs[idx] ?? costs[0];
  }

  // ─────────────────────────────────────────────
  // 是否有足夠能量
  // ─────────────────────────────────────────────
  canAfford(unitType: UnitType, era: Era): boolean {
    return this.current >= this.getCost(unitType, era);
  }

  // Getters
  get energy(): number { return this.current; }
  get maxEnergy(): number { return this.max; }

  /** 取得能量百分比 (0~1) */
  get ratio(): number { return this.current / this.max; }

  /** 更新設定（主基地升級後呼叫） */
  updateConfig(maxEnergy: number, regenIntervalSec: number): void {
    const oldRatio = this.ratio;
    this.max = maxEnergy;
    this.regenInterval = regenIntervalSec * 1000;
    // 維持同比例的當前能量
    this.current = Math.round(this.max * oldRatio);
  }
}
