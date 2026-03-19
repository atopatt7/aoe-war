// ============================================================
// SpawnManager：敵人自動生成系統
// 依關卡 waves 設定，定時生成敵人
// ============================================================
import type { LevelData, EnemyWave, Era, UnitType } from '@/types/game';
import type { UnitManager } from './UnitManager';

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
  // ─────────────────────────────────────────────
  update(currentTime: number): void {
    if (!this.isInitialized) return;

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
