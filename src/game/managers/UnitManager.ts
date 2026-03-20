// ============================================================
// UnitManager：單位生成、移動、繪製管理器
// 負責所有單位的生命週期（玩家 + 敵人）
// ============================================================
import Phaser from 'phaser';
import { GROUND_Y, PLAYER_BASE_X, ENEMY_BASE_X, ERA_INDEX } from '@/game/GameConfig';
import type { UnitData, UnitInstance, UnitType, Era, Faction } from '@/types/game';

// ── 單位視覺設定（依兵種） ──────────────────────────────────
const UNIT_VISUAL: Record<UnitType, {
  color: number;         // 玩家色
  enemyColor: number;    // 敵人色
  shape: 'warrior' | 'archer' | 'tank' | 'mage'; // 繪製形狀
  width: number;
  height: number;
}> = {
  swordsman: { color: 0x4488ff, enemyColor: 0xff4444, shape: 'warrior', width: 28, height: 38 },
  archer:    { color: 0x44cc44, enemyColor: 0xff8800, shape: 'archer',  width: 24, height: 34 },
  tank:      { color: 0x8888ff, enemyColor: 0xff6688, shape: 'tank',    width: 38, height: 48 },
  mage:      { color: 0xcc44ff, enemyColor: 0xffcc00, shape: 'mage',    width: 26, height: 40 },
};

// 時代顏色加成（讓不同時代單位有明顯差異）
const ERA_TINT: Record<Era, number> = {
  stone:  0xffffff,
  feudal: 0xddffdd,
  castle: 0xddddff,
  modern: 0xffffdd,
  space:  0xffddff,
};

// ── 單位 GameObject 容器 ────────────────────────────────────
interface UnitGameObject {
  instance: UnitInstance;
  graphics: Phaser.GameObjects.Graphics;
  hpBarBg: Phaser.GameObjects.Rectangle;
  hpBar: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
  attackEffect?: Phaser.GameObjects.Graphics; // 攻擊特效
}

export class UnitManager {
  private scene: Phaser.Scene;
  private unitsData: Map<UnitType, UnitData>;

  /** 所有場上單位（key = 唯一ID） */
  private unitObjects: Map<string, UnitGameObject> = new Map();

  /** 用於生成唯一ID */
  private idCounter: number = 0;

  constructor(scene: Phaser.Scene, unitsData: UnitData[]) {
    this.scene = scene;
    this.unitsData = new Map(unitsData.map(u => [u.id, u]));
  }

  // ─────────────────────────────────────────────
  // 生成單位
  // ─────────────────────────────────────────────
  spawnUnit(
    unitType: UnitType,
    faction: Faction,
    era: Era,
    upgradeLevel: number = 0
  ): UnitInstance | null {
    const data = this.unitsData.get(unitType);
    if (!data) {
      console.warn(`找不到兵種資料：${unitType}`);
      return null;
    }

    const stats = data.stats[era];
    if (!stats) {
      console.warn(`找不到時代數值：${unitType} / ${era}`);
      return null;
    }

    // 依升級次數計算數值加成（每級 +3%）
    const bonusRate = 1 + upgradeLevel * 0.03;

    // 決定生成位置（玩家從左邊，敵人從右邊）
    const spawnX = faction === 'player'
      ? PLAYER_BASE_X + 65
      : ENEMY_BASE_X - 65;

    // 建立 UnitInstance
    const instance: UnitInstance = {
      id: `unit_${++this.idCounter}`,
      unitType,
      faction,
      era,
      currentHp: Math.round(stats.hp * bonusRate),
      maxHp: Math.round(stats.hp * bonusRate),
      attack: Math.round(stats.attack * bonusRate),
      speed: stats.speed,
      range: stats.range,
      isAreaAttack: stats.isAreaAttack,
      attackCooldown: data.attackCooldown * 1000, // 轉換為 ms
      lastAttackTime: 0,
      x: spawnX,
      y: GROUND_Y,
      state: 'moving',
      targetId: null,
    };

    // 建立視覺元素
    this.createUnitGraphics(instance);

    return instance;
  }

  // ─────────────────────────────────────────────
  // 建立單位視覺元素
  // ─────────────────────────────────────────────
  private createUnitGraphics(instance: UnitInstance): void {
    const visual = UNIT_VISUAL[instance.unitType];
    const color = instance.faction === 'player' ? visual.color : visual.enemyColor;
    const w = visual.width;
    const h = visual.height;

    // ── 主體 Graphics ──
    const graphics = this.scene.add.graphics();
    this.drawUnitBody(graphics, instance, color, w, h);

    // ── 血量條背景 ──
    const hpBarBg = this.scene.add.rectangle(instance.x, instance.y - h / 2 - 14, w, 5, 0x333333);
    hpBarBg.setOrigin(0.5);

    // ── 血量條 ──
    const hpBarColor = instance.faction === 'player' ? 0x44ff44 : 0xff4444;
    const hpBar = this.scene.add.rectangle(instance.x - w / 2, instance.y - h / 2 - 14, w, 5, hpBarColor);
    hpBar.setOrigin(0, 0.5);

    // ── 兵種標籤 ──
    const eraSymbol = ['⬡', '⚔', '🏰', '⚙', '🚀'][ERA_INDEX[instance.era] ?? 0];
    const label = this.scene.add.text(instance.x, instance.y - h / 2 - 22, eraSymbol, {
      fontSize: '10px',
      color: instance.faction === 'player' ? '#aaddff' : '#ffaaaa',
    }).setOrigin(0.5);

    const obj: UnitGameObject = { instance, graphics, hpBarBg, hpBar, label };
    this.unitObjects.set(instance.id, obj);
  }

  // ─────────────────────────────────────────────
  // 依兵種繪製不同形狀的身體
  // ─────────────────────────────────────────────
  private drawUnitBody(
    g: Phaser.GameObjects.Graphics,
    instance: UnitInstance,
    color: number,
    w: number,
    h: number
  ): void {
    const x = instance.x;
    const y = instance.y;
    const shape = UNIT_VISUAL[instance.unitType].shape;

    g.clear();

    // 身體陰影
    g.fillStyle(0x000000, 0.3);
    g.fillEllipse(x, y + 4, w * 0.9, 10);

    // 主體
    g.fillStyle(color, 1);

    switch (shape) {
      case 'warrior':
        // 矩形身體 + 三角頭盔
        g.fillRect(x - w / 2, y - h / 2, w, h * 0.7);       // 身體
        g.fillTriangle(                                         // 頭盔
          x - w / 2, y - h / 2,
          x + w / 2, y - h / 2,
          x, y - h / 2 - 10
        );
        // 武器（右手劍）
        g.lineStyle(3, 0xdddddd, 1);
        g.lineBetween(x + w / 2, y - h / 4, x + w / 2 + 14, y - h / 2 - 6);
        // 盾（左手）
        g.fillStyle(0xaaaacc, 1);
        g.fillRect(x - w / 2 - 8, y - h / 4, 8, 16);
        break;

      case 'archer':
        // 細長身體 + 圓頭
        g.fillRect(x - w / 2, y - h / 2 + 8, w, h * 0.6);
        g.fillCircle(x, y - h / 2 + 8, w / 2.5);             // 頭
        // 弓
        g.lineStyle(2, 0x886633, 1);
        g.strokeCircle(x + w / 2 + 4, y - h / 4, 10);
        // 箭
        g.lineStyle(1, 0xcccc88, 1);
        g.lineBetween(x + w / 2, y - h / 4, x + w / 2 + 18, y - h / 4);
        break;

      case 'tank':
        // 寬大方形 + 圓角
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h * 0.75, 4);
        // 盾牌（前方）
        g.fillStyle(0xcccccc, 1);
        if (instance.faction === 'player') {
          g.fillRect(x + w / 2, y - h / 2, 12, h * 0.6);
        } else {
          g.fillRect(x - w / 2 - 12, y - h / 2, 12, h * 0.6);
        }
        // 頭
        g.fillStyle(color, 1);
        g.fillCircle(x, y - h / 2, w / 2.5);
        break;

      case 'mage':
        // 圓錐形法袍 + 帽子
        g.fillTriangle(
          x - w / 2, y,
          x + w / 2, y,
          x, y - h * 0.7
        );
        // 法杖
        g.lineStyle(2, 0x886633, 1);
        if (instance.faction === 'player') {
          g.lineBetween(x + w / 2 - 2, y, x + w / 2 + 6, y - h * 0.8);
        } else {
          g.lineBetween(x - w / 2 + 2, y, x - w / 2 - 6, y - h * 0.8);
        }
        // 法杖頂端發光
        g.fillStyle(0x00ffff, 1);
        if (instance.faction === 'player') {
          g.fillCircle(x + w / 2 + 6, y - h * 0.8, 5);
        } else {
          g.fillCircle(x - w / 2 - 6, y - h * 0.8, 5);
        }
        // 帽子
        g.fillStyle(color, 1);
        g.fillTriangle(
          x - w / 3, y - h * 0.6,
          x + w / 3, y - h * 0.6,
          x, y - h
        );
        break;
    }

    // 陣營方向標記（小箭頭）
    g.fillStyle(instance.faction === 'player' ? 0x88aaff : 0xffaaaa, 0.8);
    const arrowDir = instance.faction === 'player' ? 1 : -1;
    g.fillTriangle(
      x + arrowDir * (w / 2 + 4), y - h / 4,
      x + arrowDir * (w / 2 + 4), y - h / 4 + 8,
      x + arrowDir * (w / 2 + 12), y - h / 4 + 4
    );
  }

  // ─────────────────────────────────────────────
  // 更新所有單位（每幀呼叫）
  // ─────────────────────────────────────────────
  updateAll(delta: number, enemies: UnitInstance[], playerBase: { x: number; hp: number }, enemyBase: { x: number; hp: number }): void {
    for (const [id, obj] of this.unitObjects) {
      if (obj.instance.state === 'dead') continue;

      const isPlayer = obj.instance.faction === 'player';
      const targets = enemies.filter(e => e.faction !== obj.instance.faction && e.state !== 'dead');
      const targetBase = isPlayer ? enemyBase : playerBase;

      this.updateUnit(obj, targets, targetBase, delta);
    }
  }

  // ─────────────────────────────────────────────
  // 更新單一單位
  // ─────────────────────────────────────────────
  private updateUnit(
    obj: UnitGameObject,
    enemies: UnitInstance[],
    targetBase: { x: number; hp: number },
    delta: number
  ): void {
    const inst = obj.instance;
    const isPlayer = inst.faction === 'player';
    const moveDir = isPlayer ? 1 : -1;

    // ① 攻城模式：原地停止，不切換目標、不移動
    //    敵方單位仍可攻擊本單位（死亡邏輯由 CombatManager 處理）
    if (inst.targetId === 'ENEMY_BASE' || inst.targetId === 'PLAYER_BASE') {
      this.syncGraphicsPosition(obj);
      return;
    }

    // ② 找到最近的敵人
    const nearest = this.findNearestEnemy(inst, enemies);

    if (nearest && Math.abs(nearest.x - inst.x) <= inst.range) {
      // ③ 敵人在射程內 → 停止並攻擊
      inst.state = 'attacking';
      inst.targetId = nearest.id;
    } else {
      // ④ 繼續前進
      inst.state = 'moving';
      inst.targetId = null;
      inst.x += inst.speed * moveDir * (delta / 1000);
    }

    // ④ 更新視覺位置
    this.syncGraphicsPosition(obj);
  }

  // ─────────────────────────────────────────────
  // 找最近的敵人
  // ─────────────────────────────────────────────
  findNearestEnemy(inst: UnitInstance, enemies: UnitInstance[]): UnitInstance | null {
    let nearest: UnitInstance | null = null;
    let minDist = Infinity;

    for (const e of enemies) {
      if (e.state === 'dead') continue;
      const dist = Math.abs(e.x - inst.x);
      if (dist < minDist) {
        minDist = dist;
        nearest = e;
      }
    }
    return nearest;
  }

  // ─────────────────────────────────────────────
  // 同步 Graphics 位置
  // ─────────────────────────────────────────────
  private syncGraphicsPosition(obj: UnitGameObject): void {
    const inst = obj.instance;
    const visual = UNIT_VISUAL[inst.unitType];
    const color = inst.faction === 'player' ? visual.color : visual.enemyColor;
    const w = visual.width;
    const h = visual.height;

    // 重繪在新位置
    this.drawUnitBody(obj.graphics, inst, color, w, h);

    // 更新 HP 條位置
    obj.hpBarBg.setPosition(inst.x, inst.y - h / 2 - 14);
    obj.hpBar.setPosition(inst.x - w / 2, inst.y - h / 2 - 14);

    // 更新 HP 條寬度
    const hpRatio = Math.max(0, inst.currentHp / inst.maxHp);
    obj.hpBar.width = w * hpRatio;

    // 更新標籤位置
    obj.label.setPosition(inst.x, inst.y - h / 2 - 22);
  }

  // ─────────────────────────────────────────────
  // 顯示傷害數字
  // ─────────────────────────────────────────────
  showDamageNumber(x: number, y: number, damage: number, isAreaAttack: boolean): void {
    const color = isAreaAttack ? '#ff88ff' : '#ffff44';
    const text = this.scene.add.text(x, y - 20, `-${damage}`, {
      fontSize: isAreaAttack ? '16px' : '14px',
      color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

    this.scene.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  // ─────────────────────────────────────────────
  // 顯示攻擊特效（連線）
  // ─────────────────────────────────────────────
  showAttackEffect(attacker: UnitInstance, target: UnitInstance): void {
    const g = this.scene.add.graphics();
    g.setDepth(150);

    if (attacker.isAreaAttack) {
      // 範圍爆炸特效
      g.fillStyle(0xff88ff, 0.5);
      g.fillCircle(target.x, target.y - 20, 40);
      g.lineStyle(2, 0xff44ff, 1);
      g.strokeCircle(target.x, target.y - 20, 40);
    } else {
      // 單體攻擊（直線）
      const color = attacker.unitType === 'archer' ? 0xcccc44
                  : attacker.unitType === 'mage'   ? 0x00ffff
                  : 0xffffff;
      g.lineStyle(2, color, 0.9);
      g.lineBetween(attacker.x, attacker.y - 20, target.x, target.y - 20);
    }

    // 快速淡出
    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 180,
      onComplete: () => g.destroy(),
    });
  }

  // ─────────────────────────────────────────────
  // 移除單位（死亡）
  // ─────────────────────────────────────────────
  removeUnit(id: string): void {
    const obj = this.unitObjects.get(id);
    if (!obj) return;

    obj.instance.state = 'dead';

    // 死亡特效
    const g = this.scene.add.graphics();
    g.fillStyle(0xff4400, 0.8);
    g.fillCircle(obj.instance.x, obj.instance.y - 20, 20);
    this.scene.tweens.add({
      targets: g,
      scaleX: 2, scaleY: 2, alpha: 0,
      duration: 300,
      onComplete: () => g.destroy(),
    });

    // 銷毀 GameObjects
    obj.graphics.destroy();
    obj.hpBarBg.destroy();
    obj.hpBar.destroy();
    obj.label.destroy();

    this.unitObjects.delete(id);
  }

  // ─────────────────────────────────────────────
  // 取得所有活躍單位的 instance 列表
  // ─────────────────────────────────────────────
  getAliveInstances(): UnitInstance[] {
    return Array.from(this.unitObjects.values())
      .map(o => o.instance)
      .filter(i => i.state !== 'dead');
  }

  /** 玩家單位列表 */
  getPlayerUnits(): UnitInstance[] {
    return this.getAliveInstances().filter(i => i.faction === 'player');
  }

  /** 敵人單位列表 */
  getEnemyUnits(): UnitInstance[] {
    return this.getAliveInstances().filter(i => i.faction === 'enemy');
  }

  /** 依 ID 取得 instance */
  getInstance(id: string): UnitInstance | undefined {
    return this.unitObjects.get(id)?.instance;
  }

  /** 清空所有單位 */
  clearAll(): void {
    for (const id of this.unitObjects.keys()) {
      this.removeUnit(id);
    }
    this.unitObjects.clear();
  }
}
