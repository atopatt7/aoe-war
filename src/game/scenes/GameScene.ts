// ============================================================
// GameScene.ts — 完整整合版（含 SaveManager 永久存檔）
// ✅ 關鍵修正：改用 preload() + 同步 create()，移除 async create
// ============================================================
import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, GROUND_Y,
  PLAYER_BASE_X, ENEMY_BASE_X, ERA_NAMES,
  BASE_HP_UPGRADES, BASE_ENERGY_CAP_UPGRADES, BASE_REGEN_UPGRADES,
} from '@/game/GameConfig';
import { UnitManager }   from '@/game/managers/UnitManager';
import { CombatManager } from '@/game/managers/CombatManager';
import { EnergyManager } from '@/game/managers/EnergyManager';
import { SpawnManager }  from '@/game/managers/SpawnManager';
import { UIManager }     from '@/game/managers/UIManager';
import { SaveManager }   from '@/game/SaveManager';
import type {
  PlayerSave, LevelData, BaseData, UnitData,
  UnitType, Era, Grade,
} from '@/types/game';

const ERA_ORDER: Era[] = ['stone', 'feudal', 'castle', 'modern', 'space'];

export class GameScene extends Phaser.Scene {
  private levelId!: number;
  private playerSave!: PlayerSave;

  private levelData!: LevelData;
  private baseData!: BaseData;
  private allUnitsData: UnitData[] = [];

  private unitManager!: UnitManager;
  private combatManager!: CombatManager;
  private energyManager!: EnergyManager;
  private spawnManager!: SpawnManager;
  private uiManager!: UIManager;

  private playerBaseHp: number = 1000;
  private playerBaseMaxHp: number = 1000;
  private enemyBaseHp: number = 1000;
  private enemyBaseMaxHp: number = 1000;
  private gold: number = 0;
  private elapsedMs: number = 0;
  private isGameOver: boolean = false;

  private unitCooldowns: Map<UnitType, number> = new Map([
    ['swordsman', 0], ['archer', 0], ['tank', 0], ['mage', 0],
  ]);

  private readonly UNIT_COOLDOWN_MS: Record<UnitType, number> = {
    swordsman: 1000, archer: 3000, tank: 5000, mage: 7000,
  };

  private currentEra: Era = 'stone';

  constructor() { super({ key: 'GameScene' }); }

  init(data: { levelId: number; playerSave: PlayerSave }): void {
    this.levelId    = data.levelId ?? 1;
    this.playerSave = SaveManager.load();
    this.isGameOver = false;
    this.elapsedMs  = 0;
    this.gold       = 0;
    this.unitCooldowns = new Map([
      ['swordsman', 0], ['archer', 0], ['tank', 0], ['mage', 0],
    ]);
  }

  // ✅ 在 preload 用 Phaser loader 載入所有資料
  preload(): void {
    this.load.json('levels', '/api/game-data?type=levels');
    this.load.json('base',   '/api/game-data?type=base');
    this.load.json('units',  '/api/game-data?type=units');
  }

  // ✅ create() 改為同步 — 從 cache 讀取已載入的資料
  create(): void {
    // 從 Phaser cache 讀取（preload 已保證載入完成）
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const phaserCache = (this as any).cache;
    const levels: LevelData[] = phaserCache.json.get('levels') ?? [];
    this.levelData    = levels.find(l => l.id === this.levelId) ?? levels[0];
    this.baseData     = phaserCache.json.get('base') ?? { levels: [] };
    const uObj        = phaserCache.json.get('units');
    this.allUnitsData = Array.isArray(uObj) ? uObj : (uObj?.units ?? []);

    this.initState();
    this.drawBackground();
    this.drawGround();
    this.drawBases();

    this.unitManager   = new UnitManager(this, this.allUnitsData);
    this.combatManager = new CombatManager(this.unitManager, this.levelData?.goldPerKill ?? 10);
    this.energyManager = new EnergyManager(
      this.getBaseConfig().maxEnergy,
      this.getBaseConfig().energyRegenInterval
    );
    this.spawnManager = new SpawnManager(this.unitManager, this.levelData);
    this.uiManager    = new UIManager(this);

    this.uiManager.create(
      this.levelId,
      this.levelData?.enemyEra ?? 'stone',
      (unitType) => this.trySpawnPlayerUnit(unitType)
    );

    this.spawnManager.init(this.time.now);

    this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
      .on('down', () => this.returnToMenu());

    this.showStartBanner();
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) return;
    this.elapsedMs += delta;

    this.energyManager.update(time);

    const allAlive = this.unitManager.getAliveInstances();
    this.unitManager.updateAll(
      delta, allAlive,
      { x: PLAYER_BASE_X, hp: this.playerBaseHp },
      { x: ENEMY_BASE_X,  hp: this.enemyBaseHp  }
    );

    const result = this.combatManager.update(time);
    this.gold += result.goldEarned;

    if (result.playerBaseDamage > 0)
      this.playerBaseHp = Math.max(0, this.playerBaseHp - result.playerBaseDamage * (delta / 1000));
    if (result.enemyBaseDamage > 0)
      this.enemyBaseHp  = Math.max(0, this.enemyBaseHp  - result.enemyBaseDamage * (delta / 1000));

    this.spawnManager.update(time, delta, this.unitManager.getPlayerUnits());

    this.uiManager.update(
      this.energyManager.energy,
      this.energyManager.maxEnergy,
      this.playerBaseHp,
      this.playerBaseMaxHp,
      this.enemyBaseHp,
      this.enemyBaseMaxHp,
      this.playerSave.gold + this.gold,
      this.elapsedMs,
      this.spawnManager.getProgress(),
      this.currentEra,
      this.unitCooldowns,
      time
    );

    this.checkGameOver();
  }

  // ─── 出兵 ───────────────────────────────────
  private trySpawnPlayerUnit(unitType: UnitType): void {
    if (this.isGameOver) return;
    const now = this.time.now;
    const cooldownUntil = this.unitCooldowns.get(unitType) ?? 0;

    if (now < cooldownUntil) {
      const remain = ((cooldownUntil - now) / 1000).toFixed(1);
      this.uiManager.showToast(`冷卻中 ${remain}s`, '#ffaa44');
      return;
    }

    const era = this.getPlayerUnitEra(unitType);
    if (ERA_ORDER.indexOf(era) > ERA_ORDER.indexOf(this.currentEra)) {
      this.uiManager.showToast('需先升級主基地！', '#ff4444');
      return;
    }
    if (!this.energyManager.tryConsume(unitType, era)) {
      this.uiManager.showToast('能量不足！', '#ff4444');
      return;
    }

    const unit = this.unitManager.spawnUnit(
      unitType, 'player', era,
      this.playerSave.unitUpgrades[unitType] ?? 0
    );
    if (unit) this.unitCooldowns.set(unitType, now + this.UNIT_COOLDOWN_MS[unitType]);
  }

  private getPlayerUnitEra(unitType: UnitType): Era {
    const lvl = this.playerSave.unitUpgrades[unitType] ?? 0;
    return ERA_ORDER[Math.min(4, Math.floor(lvl / 10))];
  }

  // ─── 勝負判定 ───────────────────────────────
  private checkGameOver(): void {
    if (this.playerBaseHp <= 0) this.triggerGameOver(false);
    else if (this.enemyBaseHp <= 0) this.triggerGameOver(true);
  }

  private triggerGameOver(isVictory: boolean): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    const sec   = Math.floor(this.elapsedMs / 1000);
    const hpPct = Math.round((this.playerBaseHp / this.playerBaseMaxHp) * 100);
    const grade: Grade = isVictory
      ? CombatManager.calculateGrade(true, sec, hpPct, this.levelData.gradeConditions)
      : 'C';

    const multiplier = CombatManager.getGradeMultiplier(grade);
    const finalGold  = isVictory
      ? Math.floor(this.gold * multiplier)
      : Math.floor(this.gold * 0.5);

    if (isVictory) {
      this.playerSave = SaveManager.saveVictory(this.playerSave, this.levelId, finalGold, grade);
    } else {
      this.playerSave = SaveManager.saveDefeat(this.playerSave, this.gold);
    }

    this.time.delayedCall(600, () => {
      this.uiManager.showResult(
        isVictory, grade, finalGold, sec,
        () => this.scene.restart({ levelId: this.levelId, playerSave: this.playerSave }),
        () => this.returnToMenu()
      );
    });
  }

  private initState(): void {
    const cfg = this.getBaseConfig();
    this.playerBaseMaxHp = cfg.hp;
    this.playerBaseHp    = cfg.hp;
    this.currentEra      = cfg.maxUnitEra as Era;
    this.enemyBaseMaxHp  = 800 + this.levelId * 80;
    this.enemyBaseHp     = this.enemyBaseMaxHp;
  }

  private getBaseConfig() {
    const hpLv  = this.playerSave?.baseHpLevel        ?? 1;
    const capLv = this.playerSave?.baseEnergyCapLevel  ?? 1;
    const regLv = this.playerSave?.baseRegenLevel      ?? 1;
    const hpCfg  = BASE_HP_UPGRADES.find(l => l.level === hpLv)  ?? BASE_HP_UPGRADES[0];
    const capCfg = BASE_ENERGY_CAP_UPGRADES.find(l => l.level === capLv) ?? BASE_ENERGY_CAP_UPGRADES[0];
    const regCfg = BASE_REGEN_UPGRADES.find(l => l.level === regLv) ?? BASE_REGEN_UPGRADES[0];
    return {
      hp: hpCfg.hp,
      maxEnergy: capCfg.maxEnergy,
      energyRegenInterval: regCfg.regenIntervalSec,
      maxUnitEra: hpCfg.maxUnitEra,
    };
  }

  // ─── 繪製場景 ───────────────────────────────
  private drawBackground(): void {
    const g   = this.add.graphics();
    const era = this.levelData?.enemyEra ?? 'stone';
    const pal: Record<string, [number, number]> = {
      stone:  [0x87CEEB, 0xD4B896], feudal: [0x5a8fbf, 0x7aad7a],
      castle: [0x2e4a7a, 0x556b55], modern: [0x1a1a3e, 0x2a2a5e],
      space:  [0x000011, 0x08082a],
    };
    const [top, bot] = pal[era] ?? pal.stone;
    for (let i = 0; i < 20; i++) {
      const t  = i / 20;
      const lp = (a: number, b: number) => Math.round(a + (b - a) * t);
      const r  = lp((top >> 16) & 0xff, (bot >> 16) & 0xff);
      const gv = lp((top >> 8)  & 0xff, (bot >> 8)  & 0xff);
      const b  = lp(top & 0xff, bot & 0xff);
      g.fillStyle((r << 16) | (gv << 8) | b, 1);
      g.fillRect(0, (GAME_HEIGHT * i) / 20, GAME_WIDTH, GAME_HEIGHT / 20 + 1);
    }
    if (era === 'space') {
      g.fillStyle(0xffffff, 1);
      for (let i = 0; i < 80; i++) g.fillRect(Math.random() * GAME_WIDTH, Math.random() * GROUND_Y, 2, 2);
    } else {
      g.fillStyle(0xffffff, 0.8);
      [[120,55],[380,45],[680,68],[950,50],[1150,62]].forEach(([cx,cy]) => {
        g.fillEllipse(cx,cy,56,18); g.fillEllipse(cx-20,cy+7,38,14); g.fillEllipse(cx+20,cy+7,38,14);
      });
    }
  }

  private drawGround(): void {
    const g = this.add.graphics();
    g.fillStyle(0x3d7a34, 1); g.fillRect(0, GROUND_Y + 8, GAME_WIDTH, 16);
    g.fillStyle(0x5c4a1e, 1); g.fillRect(0, GROUND_Y + 24, GAME_WIDTH, GAME_HEIGHT - GROUND_Y - 24);
    g.lineStyle(1, 0x888888, 0.15); g.lineBetween(GAME_WIDTH / 2, GROUND_Y + 8, GAME_WIDTH / 2, GAME_HEIGHT);
  }

  private drawBases(): void {
    const g = this.add.graphics();
    const baseY = GROUND_Y + 8;
    const px = PLAYER_BASE_X, ex = ENEMY_BASE_X;

    g.fillStyle(0x2244aa,1); g.fillRect(px-45,baseY-110,90,118);
    g.fillStyle(0x1a3388,1);
    for(let r=0;r<6;r++) for(let c=0;c<3;c++) g.fillRect(px-42+c*30+(r%2===0?0:15),baseY-106+r*18,26,14);
    g.fillStyle(0x3355cc,1);
    for(let i=0;i<5;i++) g.fillRect(px-44+i*20,baseY-124,12,16);
    g.fillStyle(0x111133,1); g.fillRect(px-14,baseY-50,28,58);
    g.fillStyle(0x4499ff,1); g.fillRect(px+2,baseY-145,3,35);
    g.fillTriangle(px+5,baseY-145,px+5,baseY-128,px+22,baseY-137);
    this.add.text(px,baseY-158,'我方基地',{fontSize:'10px',color:'#88aaff'}).setOrigin(0.5);

    g.fillStyle(0xaa2222,1); g.fillRect(ex-45,baseY-110,90,118);
    g.fillStyle(0x881818,1);
    for(let r=0;r<6;r++) for(let c=0;c<3;c++) g.fillRect(ex-42+c*30+(r%2===0?0:15),baseY-106+r*18,26,14);
    g.fillStyle(0xcc3333,1);
    for(let i=0;i<5;i++) g.fillRect(ex-44+i*20,baseY-124,12,16);
    g.fillStyle(0x330000,1); g.fillRect(ex-14,baseY-50,28,58);
    g.fillStyle(0xff4444,1); g.fillRect(ex-5,baseY-145,3,35);
    g.fillTriangle(ex-5,baseY-145,ex-5,baseY-128,ex-22,baseY-137);
    this.add.text(ex,baseY-158,'敵方基地',{fontSize:'10px',color:'#ff8888'}).setOrigin(0.5);
  }

  private showStartBanner(): void {
    const {width,height} = this.cameras.main;
    const era = this.levelData?.enemyEra ?? 'stone';
    const ov = this.add.rectangle(width/2,height/2,width,height,0x000000,0.65).setDepth(500);
    const t1 = this.add.text(width/2,height/2-40,`第 ${this.levelId} 關`,{fontSize:'44px',color:'#FFD700',fontStyle:'bold',stroke:'#000000',strokeThickness:4}).setOrigin(0.5).setDepth(501);
    const t2 = this.add.text(width/2,height/2+16,`${ERA_NAMES[era]} 敵軍來襲！`,{fontSize:'20px',color:'#ffffff',stroke:'#000000',strokeThickness:3}).setOrigin(0.5).setDepth(501);
    this.tweens.add({targets:[ov,t1,t2],alpha:0,delay:1400,duration:700,onComplete:()=>{ov.destroy();t1.destroy();t2.destroy();}});
  }

  private returnToMenu(): void {
    this.isGameOver = true;
    this.unitManager?.clearAll();
    this.scene.start('MenuScene');
  }
}
