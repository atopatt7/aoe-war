// ============================================================
// SpawnManager：敵人自動生成系統
// ① 依關卡 waves 設定，定時生成敵人（原有）
// ② AI 持續出兵系統（金幣累積 + 加權隨機）
// ============================================================
import type { LevelData, EnemyWave, Era, UnitType, UnitInstance } from '@/types/game';
import type { UnitManager } from './UnitManager';

// AI 三種兵種及費用（輕兵/遠程/重甲 映射到現有 UnitType）
const AI_UNIT_COST: Partial<Record<UnitType, number>> = {
  swordsman: 10,  // 輕兵
  archer:    18,  // 遠程
  tank:      25,  // 重甲
};

/** 波次執行狀態 */
interface WaveState {
  wave: EnemyWave;
  startTime: number;  // 此波開始的絕對時間（ms）
  spawned: number;    // 已生成幾隻
  done: boolean;
}

export class SpawnManager {
  private unitManager: UnitManager;
  private levelData: LevelData;
  private waveStates: WaveState[] = [];
  private gameStartTime: number = 0;
  private isInitialized: boolean = false;

  /** 敵人使用的時代（依關卡設定） */
  private enemyEra: Era;

  /** 敵人兵種升級數值（關卡越高，敵人越強） */
  private enemyUpgradeLevel: number;

  // ── AI 持續出兵狀態 ──────────────────────────
  /** AI 目前金幣 */
  private aiGold: number = 5;

  /** 下次出兵冷卻剩餘（ms）*/
  private aiCooldown: number = 2000; // 開局 2 秒緩衝

  /** 目前 AI Wave 數（依時間推算） */
  private aiWave: number = 1;

  constructor(unitManager: UnitManager, levelData: LevelData) {
    this.unitManager = unitManager;
    this.levelData = levelData;
    this.enemyEra = levelData.enemyEra;

    // 越後面的關卡敵人升級越高
    // 每5關相當於升1級（每時代10級，計算出對應基數）
    const eraBaseLevel = ['stone', 'feudal', 'castle', 'modern', 'space'].indexOf(levelData.enemyEra) * 10;
    const inEraLevel = ((levelData.id - 1) % 20) / 2; // 0~9
    this.enemyUpgradeLevel = eraBaseLevel + inEraLevel;
  }

  // ─────────────────────────────────────────────
  // 初始化（接收遊戲開始時間）
  // ─────────────────────────────────────────────
  init(gameStartTime: number): void {
    this.gameStartTime = gameStartTime;
    this.isInitialized = true;

    // 預設所有波次的狀態
    this.waveStates = this.levelData.waves.map(wave => ({
      wave,
      startTime: gameStartTime + wave.delay * 1000,
      spawned: 0,
      done: false,
    }));
  }

  // ─────────────────────────────────────────────
  // 每幀更新（自動生成敵人）
  // playerUnits：玩家場上兵種，供 AI 反制邏輯使用
  // ─────────────────────────────────────────────
  update(currentTime: number, delta: number = 16, playerUnits: UnitInstance[] = []): void {
    if (!this.isInitialized) return;

    // ─ 原有 Wave 系統 ─
    for (const ws of this.waveStates) {
      if (ws.done) continue;

      // 此波尚未到時間
      if (currentTime < ws.startTime) continue;

      // 計算此波應已生成幾隻
      const elapsed = currentTime - ws.startTime;
      const shouldHaveSpawned = Math.min(
        ws.wave.count,
        1 + Math.floor(elapsed / (ws.wave.interval * 1000))
      );

      // 補生成差距
      while (ws.spawned < shouldHaveSpawned) {
        this.spawnEnemy(ws.wave.unitType as UnitType);
        ws.spawned++;
      }

      // 此波完成
      if (ws.spawned >= ws.wave.count) {
        ws.done = true;
      }
    }

    // ─ AI 持續出兵系統 ─
    this.updateAI(currentTime, delta, playerUnits);
  }

  // ─────────────────────────────────────────────
  // AI 持續出兵（資源累積 + 加權隨機）
  // ─────────────────────────────────────────────
  private updateAI(currentTime: number, delta: number, playerUnits: UnitInstance[]): void {
    // 依遊戲時長計算目前 Wave（每 30 秒升一波）
    const gameElapsedSec = (currentTime - this.gameStartTime) / 1000;
    this.aiWave = Math.floor(gameElapsedSec / 30) + 1;

    // 每幀累積金幣：income_per_second / 60
    // income = min(2 + (wave-1)*0.5, 8) 金/秒
    const income = Math.min(2 + (this.aiWave - 1) * 0.5, 8);
    this.aiGold += income * (delta / 1000);

    // 倒扣冷卻
    this.aiCooldown -= delta;
    if (this.aiCooldown > 0) return;

    // 金幣不足最便宜兵種
    const minCost = 10; // swordsman
    if (this.aiGold < minCost) return;

    // 選擇兵種（加權隨機 + AI 反制）
    const chosen = this.selectAIUnit(playerUnits, this.aiWave);
    const cost = AI_UNIT_COST[chosen] ?? minCost;

    if (this.aiGold >= cost) {
      this.spawnEnemy(chosen);
      this.aiGold -= cost;
      this.aiCooldown = 800; // 0.8 秒冷卻
    } else if (this.aiGold >= minCost) {
      // 金幣不足，降級為輕兵
      this.spawnEnemy('swordsman');
      this.aiGold -= minCost;
      this.aiCooldown = 800;
    }
  }

  // ─────────────────────────────────────────────
  // AI 加權隨機選兵（反制玩家兵種）
  // ─────────────────────────────────────────────
  private selectAIUnit(playerUnits: UnitInstance[], wave: number): UnitType {
    // Wave 1-2：只出輕兵
    if (wave <= 2) return 'swordsman';

    // 基礎權重
    let wSword  = 50;
    let wTank   = wave >= 3 ? 25 : 0;
    let wArcher = wave >= 5 ? 25 : 0;
    if (wave < 5) wSword = 100 - wTank; // 補足到 100

    // 統計玩家場上兵種數量
    const pUnits = playerUnits.filter(u => u.faction === 'player');
    const nRanged = pUnits.filter(u => u.unitType === 'archer' || u.unitType === 'mage').length;
    const nHeavy  = pUnits.filter(u => u.unitType === 'tank').length;
    const nLight  = pUnits.filter(u => u.unitType === 'swordsman').length;
    const nMax    = Math.max(nRanged, nHeavy, nLight);

    // 動態調整：反制玩家主力
    if (nMax > 0) {
      if (nRanged === nMax && wTank > 0) {
        // 玩家遠程多 → 多出重甲（重甲耐打）
        wTank   = Math.min(wTank + 20, 65);
        wSword  = Math.max(wSword - 10, 15);
        wArcher = Math.max(wArcher - 10, 0);
      } else if (nHeavy === nMax && wArcher > 0) {
        // 玩家重甲多 → 多出遠程（遠程繞過）
        wArcher = Math.min(wArcher + 20, 60);
        wSword  = Math.max(wSword - 10, 15);
        wTank   = Math.max(wTank - 10, 5);
      }
    }

    // 加權隨機
    const total = wSword + wTank + wArcher;
    if (total <= 0) return 'swordsman';
    const r = Math.random() * total;
    if (r < wSword)              return 'swordsman';
    if (r < wSword + wTank)      return 'tank';
    return 'archer';
  }

  // ─────────────────────────────────────────────
  // 生成單一敵人
  // ─────────────────────────────────────────────
  private spawnEnemy(unitType: UnitType): void {
    const unit = this.unitManager.spawnUnit(
      unitType,
      'enemy',
      this.enemyEra,
      this.enemyUpgradeLevel
    );

    if (!unit) return;

    // 輕微隨機 Y 偏移（避免所有敵人堆在同一條線）
    const yOffset = (Math.random() - 0.5) * 16;
    unit.y += yOffset;
  }

  // ─────────────────────────────────────────────
  // 是否所有波次都已完成生成
  // ─────────────────────────────────────────────
  isAllWavesDone(): boolean {
    return this.waveStates.every(ws => ws.done);
  }

  // ─────────────────────────────────────────────
  // 取得已完成的波次數 / 總波次數
  // ─────────────────────────────────────────────
  getProgress(): { done: number; total: number } {
    return {
      done: this.waveStates.filter(ws => ws.done).length,
      total: this.waveStates.length,
    };
  }

  /** 更新關卡資料（切換關卡時呼叫） */
  updateLevel(levelData: LevelData): void {
    this.levelData = levelData;
    this.enemyEra = levelData.enemyEra;
    this.isInitialized = false;
  }
}
