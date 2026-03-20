// ============================================================
// UnitManager：單位生成、移動、繪製管理器
// ✅ 改用精靈圖 (Phaser.GameObjects.Sprite) 顯示角色
// ============================================================
import Phaser from 'phaser';
import { GROUND_Y, PLAYER_BASE_X, ENEMY_BASE_X, ERA_INDEX } from '@/game/GameConfig';
import type { UnitData, UnitInstance, UnitType, Era, Faction } from '@/types/game';

// ── 精靈縮放與錨點 ────────────────────────────────────────
const SPRITE_SCALE   = 0.28;          // 512px → ~143px
const SPRITE_ORIGIN_Y = 0.86;         // 腳在精靈圖 86% 處
const HP_BAR_ABOVE   = 66;            // HP 條距離地面的像素
const HP_BAR_W       = 52;
const LABEL_ABOVE    = 80;

// ── 後備視覺設定（精靈載入失敗時用） ─────────────────────
const UNIT_VISUAL: Record<UnitType, {
  color: number; enemyColor: number;
  width: number; height: number;
}> = {
  swordsman: { color: 0x4488ff, enemyColor: 0xff4444, width: 28, height: 38 },
  archer:    { color: 0x44cc44, enemyColor: 0xff8800, width: 24, height: 34 },
  tank:      { color: 0x8888ff, enemyColor: 0xff6688, width: 38, height: 48 },
  mage:      { color: 0xcc44ff, enemyColor: 0xffcc00, width: 26, height: 40 },
};

// ── 單位 GameObject 容器 ────────────────────────────────────
interface UnitGameObject {
  instance: UnitInstance;
  sprite: Phaser.GameObjects.Sprite;
  hpBarBg: Phaser.GameObjects.Rectangle;
  hpBar: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

export class UnitManager {
  private scene: Phaser.Scene;
  private unitsData: Map<UnitType, UnitData>;
  private unitObjects: Map<string, UnitGameObject> = new Map();
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
    if (!data) { console.warn(`找不到兵種資料：${unitType}`); return null; }

    const stats = data.stats[era];
    if (!stats) { console.warn(`找不到時代數值：${unitType} / ${era}`); return null; }

    const bonusRate = 1 + upgradeLevel * 0.03;

    const spawnX = faction === 'player'
      ? PLAYER_BASE_X - 30
      : ENEMY_BASE_X  + 30;

    const instance: UnitInstance = {
      id: `unit_${++this.idCounter}`,
      unitType, faction, era,
      currentHp: Math.round(stats.hp * bonusRate),
      maxHp:     Math.round(stats.hp * bonusRate),
      attack:    Math.round(stats.attack * bonusRate),
      speed:     stats.speed,
      range:     stats.range,
      isAreaAttack: stats.isAreaAttack,
      attackCooldown: data.attackCooldown * 1000,
      lastAttackTime: 0,
      x: spawnX,
      y: GROUND_Y,
      state: 'moving',
      targetId: null,
    };

    this.createUnitSprite(instance);
    return instance;
  }

  // ─────────────────────────────────────────────
  // 建立精靈及 HP 條
  // ─────────────────────────────────────────────
  private createUnitSprite(instance: UnitInstance): void {
    const idleKey = `${instance.era}_${instance.unitType}_idle`;
    const isPlayer = instance.faction === 'player';

    // 如果精靈圖已載入就用，否則建立一個後備 Graphics Sprite
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hasTexture = (this.scene as any).textures.exists(idleKey);

    let sprite: Phaser.GameObjects.Sprite;
    if (hasTexture) {
      sprite = this.scene.add.sprite(instance.x, instance.y, idleKey);
      sprite.setScale(SPRITE_SCALE);
      sprite.setOrigin(0.5, SPRITE_ORIGIN_Y);
      // 敵方單位左右翻轉（面向左）
      if (!isPlayer) sprite.setFlipX(true);
    } else {
      // 後備：動態產生純色方塊材質（精靈圖未載入時使用）
      const visual   = UNIT_VISUAL[instance.unitType];
      const color    = isPlayer ? visual.color : visual.enemyColor;
      const fbKey    = `__fallback_${instance.unitType}_${isPlayer ? 'p' : 'e'}`;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(this.scene as any).textures.exists(fbKey)) {
        const fg = this.scene.make.graphics({ x: 0, y: 0, add: false });
        fg.fillStyle(color, 1);
        fg.fillRoundedRect(0, 0, visual.width, visual.height * 1.5, 4);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (fg as any).generateTexture(fbKey, visual.width, Math.round(visual.height * 1.5));
        fg.destroy();
      }
      sprite = this.scene.add.sprite(instance.x, instance.y, fbKey);
      sprite.setOrigin(0.5, 1.0);
    }

    sprite.setDepth(30);

    // ── HP 條 ──────────────────────────────────
    const hpBarBg = this.scene.add.rectangle(
      instance.x, instance.y - HP_BAR_ABOVE, HP_BAR_W, 5, 0x333333
    ).setOrigin(0.5).setDepth(31);

    const hpBarColor = isPlayer ? 0x44ff44 : 0xff4444;
    const hpBar = this.scene.add.rectangle(
      instance.x - HP_BAR_W / 2, instance.y - HP_BAR_ABOVE, HP_BAR_W, 5, hpBarColor
    ).setOrigin(0, 0.5).setDepth(32);

    // ── 時代標籤 ───────────────────────────────
    const eraSymbol = ['⬡', '⚔', '🏰', '⚙', '🚀'][ERA_INDEX[instance.era] ?? 0];
    const label = this.scene.add.text(
      instance.x, instance.y - LABEL_ABOVE, eraSymbol, {
        fontSize: '10px',
        color: isPlayer ? '#aaddff' : '#ffaaaa',
      }
    ).setOrigin(0.5).setDepth(33);

    this.unitObjects.set(instance.id, { instance, sprite, hpBarBg, hpBar, label });
  }

  // ─────────────────────────────────────────────
  // 更新所有單位（每幀呼叫）
  // ─────────────────────────────────────────────
  updateAll(
    delta: number,
    enemies: UnitInstance[],
    playerBase: { x: number; hp: number },
    enemyBase:  { x: number; hp: number }
  ): void {
    for (const obj of this.unitObjects.values()) {
      if (obj.instance.state === 'dead') continue;
      const targets = enemies.filter(e => e.faction !== obj.instance.faction && e.state !== 'dead');
      const targetBase = obj.instance.faction === 'player' ? enemyBase : playerBase;
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
    const moveDir  = isPlayer ? 1 : -1;

    if (inst.targetId === 'ENEMY_BASE' || inst.targetId === 'PLAYER_BASE') {
      this.syncSpritePosition(obj);
      return;
    }

    const nearest = this.findNearestEnemy(inst, enemies);

    if (nearest && Math.abs(nearest.x - inst.x) <= inst.range) {
      inst.state    = 'attacking';
      inst.targetId = nearest.id;
    } else {
      inst.state    = 'moving';
      inst.targetId = null;
      inst.x += inst.speed * moveDir * (delta / 1000);
    }

    this.syncSpritePosition(obj);
  }

  // ─────────────────────────────────────────────
  // 同步精靈位置 + 動畫狀態
  // ─────────────────────────────────────────────
  private syncSpritePosition(obj: UnitGameObject): void {
    const inst = obj.instance;
    const sp   = obj.sprite;

    sp.setPosition(inst.x, inst.y);

    // ── 動畫切換 ─────────────────────────────
    const idleKey   = `${inst.era}_${inst.unitType}_idle`;
    const attackKey = `${inst.era}_${inst.unitType}_attack`;

    if (inst.state === 'attacking') {
      // 若動畫存在且沒有在播，就播攻擊動畫
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sceneAnims = (this.scene as any).anims;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spAnims = (sp as any).anims;
      if (sceneAnims.exists(attackKey) && !spAnims.isPlaying) {
        sp.play(attackKey);
        sp.once('animationcomplete', () => {
          if (inst.state !== 'dead') {
            sp.setTexture(idleKey);
          }
        });
      }
    } else {
      // 移動中 → 顯示 idle（若目前不是已在播攻擊動畫）
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const spAnims2 = (sp as any).anims;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!spAnims2.isPlaying && (this.scene as any).textures.exists(idleKey)) {
        if (sp.texture.key !== idleKey) {
          sp.setTexture(idleKey);
        }
      }
    }

    // ── HP 條 ─────────────────────────────────
    const hpRatio = Math.max(0, inst.currentHp / inst.maxHp);
    obj.hpBarBg.setPosition(inst.x, inst.y - HP_BAR_ABOVE);
    obj.hpBar.setPosition(inst.x - HP_BAR_W / 2, inst.y - HP_BAR_ABOVE);
    obj.hpBar.width = HP_BAR_W * hpRatio;

    // ── 標籤 ──────────────────────────────────
    obj.label.setPosition(inst.x, inst.y - LABEL_ABOVE);
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
      if (dist < minDist) { minDist = dist; nearest = e; }
    }
    return nearest;
  }

  // ─────────────────────────────────────────────
  // 顯示傷害數字
  // ─────────────────────────────────────────────
  showDamageNumber(x: number, y: number, damage: number, isAreaAttack: boolean): void {
    const color = isAreaAttack ? '#ff88ff' : '#ffff44';
    const text = this.scene.add.text(x, y - 20, `-${damage}`, {
      fontSize: isAreaAttack ? '16px' : '14px', color,
      fontStyle: 'bold', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(200);

    this.scene.tweens.add({
      targets: text, y: y - 50, alpha: 0, duration: 800, ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }

  // ─────────────────────────────────────────────
  // 顯示攻擊特效
  // ─────────────────────────────────────────────
  showAttackEffect(attacker: UnitInstance, target: UnitInstance): void {
    const g = this.scene.add.graphics().setDepth(150);

    if (attacker.isAreaAttack) {
      g.fillStyle(0xff88ff, 0.5);
      g.fillCircle(target.x, target.y - 20, 40);
      g.lineStyle(2, 0xff44ff, 1);
      g.strokeCircle(target.x, target.y - 20, 40);
    } else {
      const color = attacker.unitType === 'archer' ? 0xcccc44
                  : attacker.unitType === 'mage'   ? 0x00ffff
                  : 0xffffff;
      g.lineStyle(2, color, 0.9);
      g.lineBetween(attacker.x, attacker.y - 20, target.x, target.y - 20);
    }

    this.scene.tweens.add({
      targets: g, alpha: 0, duration: 180,
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
      targets: g, scaleX: 2, scaleY: 2, alpha: 0, duration: 300,
      onComplete: () => g.destroy(),
    });

    obj.sprite.destroy();
    obj.hpBarBg.destroy();
    obj.hpBar.destroy();
    obj.label.destroy();
    this.unitObjects.delete(id);
  }

  // ─────────────────────────────────────────────
  // 取得單位列表
  // ─────────────────────────────────────────────
  getAliveInstances(): UnitInstance[] {
    return Array.from(this.unitObjects.values())
      .map(o => o.instance).filter(i => i.state !== 'dead');
  }
  getPlayerUnits(): UnitInstance[] { return this.getAliveInstances().filter(i => i.faction === 'player'); }
  getEnemyUnits():  UnitInstance[] { return this.getAliveInstances().filter(i => i.faction === 'enemy'); }
  getInstance(id: string): UnitInstance | undefined { return this.unitObjects.get(id)?.instance; }

  clearAll(): void {
    for (const id of [...this.unitObjects.keys()]) this.removeUnit(id);
    this.unitObjects.clear();
  }
}
