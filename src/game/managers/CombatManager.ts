// ============================================================
// CombatManager：戰鬥系統
// 負責攻擊判定、傷害計算、基地攻擊、勝負判定
// ============================================================
import type { UnitInstance, UnitType } from '@/types/game';
import type { UnitManager } from './UnitManager';
import { PLAYER_BASE_X, ENEMY_BASE_X } from '@/game/GameConfig';

/** 攻擊結果（供 GameScene 使用） */
export interface CombatResult {
  killedUnitIds: string[];  // 本幀被擊殺的單位 ID
  playerBaseDamage: number; // 我方基地受到的傷害
  enemyBaseDamage: number;  // 敵方基地受到的傷害
  goldEarned: number;       // 本幀獲得金幣
}

export class CombatManager {
  private unitManager: UnitManager;
  private goldPerKill: number;

  // 基地碰撞範圍（靠近到此距離視為攻擊基地）
  private readonly BASE_ATTACK_RANGE = 70;

  constructor(unitManager: UnitManager, goldPerKill: number) {
    this.unitManager = unitManager;
    this.goldPerKill = goldPerKill;
  }

  // ─────────────────────────────────────────────
  // 主更新函式（每幀呼叫）
  // ─────────────────────────────────────────────
  update(currentTime: number): CombatResult {
    const result: CombatResult = {
      killedUnitIds: [],
      playerBaseDamage: 0,
      enemyBaseDamage: 0,
      goldEarned: 0,
    };

    const playerUnits = this.unitManager.getPlayerUnits();
    const enemyUnits = this.unitManager.getEnemyUnits();

    // ① 玩家單位攻擊
    for (const unit of playerUnits) {
      if (unit.state !== 'attacking') continue;

      // 是否冷卻完畢
      if (currentTime - unit.lastAttackTime < unit.attackCooldown) continue;

      const target = unit.targetId
        ? this.unitManager.getInstance(unit.targetId)
        : this.unitManager.findNearestEnemy(unit, enemyUnits);

      if (!target || target.state === 'dead') {
        unit.state = 'moving';
        unit.targetId = null;
        continue;
      }

      // 執行攻擊
      const killed = this.performAttack(unit, target, enemyUnits);
      unit.lastAttackTime = currentTime;

      for (const killedId of killed) {
        result.killedUnitIds.push(killedId);
        result.goldEarned += this.goldPerKill;
        this.unitManager.removeUnit(killedId);
      }
    }

    // ② 敵人單位攻擊
    for (const unit of enemyUnits) {
      if (unit.state !== 'attacking') continue;

      if (currentTime - unit.lastAttackTime < unit.attackCooldown) continue;

      const target = unit.targetId
        ? this.unitManager.getInstance(unit.targetId)
        : this.unitManager.findNearestEnemy(unit, playerUnits);

      if (!target || target.state === 'dead') {
        unit.state = 'moving';
        unit.targetId = null;
        continue;
      }

      const killed = this.performAttack(unit, target, playerUnits);
      unit.lastAttackTime = currentTime;

      for (const killedId of killed) {
        result.killedUnitIds.push(killedId);
        this.unitManager.removeUnit(killedId);
      }
    }

    // ③ 單位攻擊基地
    const baseAttacks = this.checkBaseAttacks(playerUnits, enemyUnits);
    result.playerBaseDamage = baseAttacks.playerBaseDamage;
    result.enemyBaseDamage = baseAttacks.enemyBaseDamage;

    return result;
  }

  // ─────────────────────────────────────────────
  // 執行攻擊（含範圍攻擊）
  // 回傳：被擊殺的單位 ID 列表
  // ─────────────────────────────────────────────
  private performAttack(
    attacker: UnitInstance,
    primaryTarget: UnitInstance,
    allEnemies: UnitInstance[]
  ): string[] {
    const killed: string[] = [];

    // 顯示攻擊特效
    this.unitManager.showAttackEffect(attacker, primaryTarget);

    if (attacker.isAreaAttack) {
      // ── 範圍攻擊：擊中附近所有敵人 ──
      const aoeRadius = 80; // 範圍半徑（像素）
      for (const enemy of allEnemies) {
        if (enemy.state === 'dead') continue;
        const dist = Math.abs(enemy.x - primaryTarget.x);
        if (dist <= aoeRadius) {
          enemy.currentHp -= attacker.attack;
          this.unitManager.showDamageNumber(enemy.x, enemy.y, attacker.attack, true);
          if (enemy.currentHp <= 0) {
            enemy.state = 'dead';
            killed.push(enemy.id);
          }
        }
      }
    } else {
      // ── 單體攻擊 ──
      primaryTarget.currentHp -= attacker.attack;
      this.unitManager.showDamageNumber(primaryTarget.x, primaryTarget.y, attacker.attack, false);
      if (primaryTarget.currentHp <= 0) {
        primaryTarget.state = 'dead';
        killed.push(primaryTarget.id);
      }
    }

    return killed;
  }

  // ─────────────────────────────────────────────
  // 檢查基地攻擊
  // 靠近敵方基地的最前方單位會持續造成傷害
  // ─────────────────────────────────────────────
  private checkBaseAttacks(
    playerUnits: UnitInstance[],
    enemyUnits: UnitInstance[]
  ): { playerBaseDamage: number; enemyBaseDamage: number } {
    let playerBaseDamage = 0;
    let enemyBaseDamage = 0;

    // 玩家單位攻擊敵方基地
    for (const unit of playerUnits) {
      const distToEnemyBase = Math.abs(unit.x - ENEMY_BASE_X);
      if (distToEnemyBase <= this.BASE_ATTACK_RANGE && unit.state === 'moving') {
        // 到達敵方基地 → 攻擊基地
        unit.state = 'attacking';
        // 基地沒有 targetId，用特殊標記
        unit.targetId = 'ENEMY_BASE';
        enemyBaseDamage += unit.attack;
      }
      if (unit.targetId === 'ENEMY_BASE') {
        enemyBaseDamage += unit.attack * 0.1; // 持續傷害（每幀的比例）
      }
    }

    // 敵人單位攻擊玩家基地
    for (const unit of enemyUnits) {
      const distToPlayerBase = Math.abs(unit.x - PLAYER_BASE_X);
      if (distToPlayerBase <= this.BASE_ATTACK_RANGE && unit.state === 'moving') {
        unit.state = 'attacking';
        unit.targetId = 'PLAYER_BASE';
        playerBaseDamage += unit.attack;
      }
      if (unit.targetId === 'PLAYER_BASE') {
        playerBaseDamage += unit.attack * 0.1;
      }
    }

    return { playerBaseDamage, enemyBaseDamage };
  }

  // ─────────────────────────────────────────────
  // 計算評價等級
  // ─────────────────────────────────────────────
  static calculateGrade(
    isVictory: boolean,
    elapsedTimeSec: number,
    playerBaseHpPercent: number,
    gradeConditions: {
      S: { maxTime: number; minBaseHpPercent: number };
      A: { maxTime: number; minBaseHpPercent: number };
      B: { maxTime: number; minBaseHpPercent: number };
    }
  ): 'S' | 'A' | 'B' | 'C' {
    if (!isVictory) return 'C';

    const { S, A, B } = gradeConditions;

    if (elapsedTimeSec <= S.maxTime && playerBaseHpPercent >= S.minBaseHpPercent) {
      return 'S';
    }
    if (elapsedTimeSec <= A.maxTime && playerBaseHpPercent >= A.minBaseHpPercent) {
      return 'A';
    }
    if (elapsedTimeSec <= B.maxTime && playerBaseHpPercent >= B.minBaseHpPercent) {
      return 'B';
    }
    return 'C';
  }

  // ─────────────────────────────────────────────
  // 計算金幣倍率（依評價）
  // ─────────────────────────────────────────────
  static getGradeMultiplier(grade: 'S' | 'A' | 'B' | 'C'): number {
    const multipliers = { S: 1.5, A: 1.3, B: 1.1, C: 1.0 };
    return multipliers[grade];
  }

  /** 更新金幣/擊殺基準 */
  setGoldPerKill(gold: number): void {
    this.goldPerKill = gold;
  }
}
