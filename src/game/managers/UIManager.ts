// ============================================================
// UIManager：遊戲 UI 管理器
// 負責：能量條、出兵按鈕、血量條、狀態顯示、結算畫面
// ============================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_BASE_X, ENEMY_BASE_X, UNIT_NAMES, ERA_NAMES } from '@/game/GameConfig';
import { UNIT_ENERGY_COST } from './EnergyManager';
import type { UnitType, Era, PlayerSave } from '@/types/game';

/** 出兵按鈕點擊回呼 */
export type SpawnCallback = (unitType: UnitType) => void;

/** 升級按鈕點擊回呼 */
export type UpgradeCallback = (unitType: UnitType) => void;

// ── 出兵按鈕視覺設定 ──────────────────────────────────────
const UNIT_BUTTON_CONFIG: Array<{
  type: UnitType;
  label: string;
  color: number;
  icon: string;
  keybind: string;
}> = [
  { type: 'swordsman', label: '劍士',  color: 0x2255cc, icon: '⚔', keybind: 'Q' },
  { type: 'archer',    label: '弓箭手', color: 0x226622, icon: '🏹', keybind: 'W' },
  { type: 'tank',      label: '肉盾',  color: 0x664422, icon: '🛡', keybind: 'E' },
  { type: 'mage',      label: '法師',  color: 0x662266, icon: '🔮', keybind: 'R' },
];

const BTN_W = 120;
const BTN_H = 72;
const BTN_Y = GAME_HEIGHT - 38;

export class UIManager {
  private scene: Phaser.Scene;

  // ── UI 元素 ──
  private energyBarFill!: Phaser.GameObjects.Rectangle;
  private energyText!: Phaser.GameObjects.Text;
  private playerHpBar!: Phaser.GameObjects.Rectangle;
  private enemyHpBar!: Phaser.GameObjects.Rectangle;
  private playerHpText!: Phaser.GameObjects.Text;
  private enemyHpText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private goldText!: Phaser.GameObjects.Text;
  private waveText!: Phaser.GameObjects.Text;

  private unitButtons: Map<UnitType, {
    bg: Phaser.GameObjects.Rectangle;
    costText: Phaser.GameObjects.Text;
    cooldownOverlay: Phaser.GameObjects.Rectangle;
    cooldownText: Phaser.GameObjects.Text;
  }> = new Map();

  // ── 回呼 ──
  private onSpawn?: SpawnCallback;

  // ── 冷卻追蹤 ──
  private cooldowns: Map<UnitType, number> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // ─────────────────────────────────────────────
  // 建立所有 UI 元素
  // ─────────────────────────────────────────────
  create(
    levelId: number,
    enemyEra: Era,
    onSpawn: SpawnCallback
  ): void {
    this.onSpawn = onSpawn;

    this.createTopBar(levelId, enemyEra);
    this.createBaseHpBars();
    this.createEnergyBar();
    this.createUnitButtons();
    this.createKeyboardShortcuts();
  }

  // ─────────────────────────────────────────────
  // 頂部狀態列
  // ─────────────────────────────────────────────
  private createTopBar(levelId: number, enemyEra: Era): void {
    // 背景
    this.scene.add.rectangle(GAME_WIDTH / 2, 18, GAME_WIDTH, 36, 0x000000, 0.75)
      .setDepth(50);

    // 關卡標題
    this.scene.add.text(10, 5, `第 ${levelId} 關　[${ERA_NAMES[enemyEra]}]`, {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setDepth(51);

    // 金幣
    this.goldText = this.scene.add.text(300, 5, '💰 0', {
      fontSize: '14px', color: '#FFD700',
    }).setDepth(51);

    // 時間
    this.timeText = this.scene.add.text(GAME_WIDTH / 2, 5, '⏱ 00:00', {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(51);

    // 波次
    this.waveText = this.scene.add.text(GAME_WIDTH - 200, 5, '波次: 0/0', {
      fontSize: '12px', color: '#aaaaff',
    }).setDepth(51);

    // ESC
    this.scene.add.text(GAME_WIDTH - 10, 5, '[ESC] 返回', {
      fontSize: '11px', color: '#666688',
    }).setOrigin(1, 0).setDepth(51);
  }

  // ─────────────────────────────────────────────
  // 雙方基地血量條
  // ─────────────────────────────────────────────
  private createBaseHpBars(): void {
    const HP_BAR_W = 100;
    const HP_BAR_H = 10;
    const BAR_Y = 50;

    // ── 玩家基地血量 ──
    this.scene.add.text(PLAYER_BASE_X, BAR_Y - 14, '我方基地', {
      fontSize: '11px', color: '#88aaff',
    }).setOrigin(0.5).setDepth(51);

    this.scene.add.rectangle(PLAYER_BASE_X, BAR_Y, HP_BAR_W, HP_BAR_H, 0x222244)
      .setDepth(51);

    this.playerHpBar = this.scene.add.rectangle(
      PLAYER_BASE_X - HP_BAR_W / 2, BAR_Y, HP_BAR_W, HP_BAR_H, 0x4488ff
    ).setOrigin(0, 0.5).setDepth(52);

    this.playerHpText = this.scene.add.text(PLAYER_BASE_X, BAR_Y + 14, '100%', {
      fontSize: '10px', color: '#88aaff',
    }).setOrigin(0.5).setDepth(51);

    // ── 敵方基地血量 ──
    this.scene.add.text(ENEMY_BASE_X, BAR_Y - 14, '敵方基地', {
      fontSize: '11px', color: '#ff8888',
    }).setOrigin(0.5).setDepth(51);

    this.scene.add.rectangle(ENEMY_BASE_X, BAR_Y, HP_BAR_W, HP_BAR_H, 0x442222)
      .setDepth(51);

    this.enemyHpBar = this.scene.add.rectangle(
      ENEMY_BASE_X - HP_BAR_W / 2, BAR_Y, HP_BAR_W, HP_BAR_H, 0xff4444
    ).setOrigin(0, 0.5).setDepth(52);

    this.enemyHpText = this.scene.add.text(ENEMY_BASE_X, BAR_Y + 14, '100%', {
      fontSize: '10px', color: '#ff8888',
    }).setOrigin(0.5).setDepth(51);
  }

  // ─────────────────────────────────────────────
  // 能量條（底部左側）
  // ─────────────────────────────────────────────
  private createEnergyBar(): void {
    const EX = 20;
    const EY = GAME_HEIGHT - 78;
    const EW = 200;
    const EH = 16;

    this.scene.add.text(EX, EY - 16, '⚡ 能量', {
      fontSize: '12px', color: '#88ffff',
    }).setDepth(51);

    // 背景
    this.scene.add.rectangle(EX + EW / 2, EY, EW, EH, 0x002233)
      .setOrigin(0.5).setDepth(51);

    // 填充條
    this.energyBarFill = this.scene.add.rectangle(EX, EY, EW, EH, 0x00ccff)
      .setOrigin(0, 0.5).setDepth(52);

    // 數值文字
    this.energyText = this.scene.add.text(EX + EW + 8, EY, '10/10', {
      fontSize: '12px', color: '#88ffff',
    }).setOrigin(0, 0.5).setDepth(51);
  }

  // ─────────────────────────────────────────────
  // 出兵按鈕（底部中央）
  // ─────────────────────────────────────────────
  private createUnitButtons(): void {
    // 底部背景
    this.scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 38, GAME_WIDTH, BTN_H + 12, 0x000000, 0.85)
      .setDepth(50);

    const totalWidth = UNIT_BUTTON_CONFIG.length * (BTN_W + 10) - 10;
    const startX = (GAME_WIDTH - totalWidth) / 2;

    UNIT_BUTTON_CONFIG.forEach((cfg, i) => {
      const bx = startX + i * (BTN_W + 10) + BTN_W / 2;
      const by = BTN_Y;

      // ── 按鈕背景 ──
      const bg = this.scene.add.rectangle(bx, by, BTN_W, BTN_H, cfg.color, 0.9)
        .setStrokeStyle(2, 0x888888)
        .setDepth(51)
        .setInteractive({ useHandCursor: true });

      // ── 圖示 ──
      this.scene.add.text(bx, by - 20, cfg.icon, {
        fontSize: '20px',
      }).setOrigin(0.5).setDepth(52);

      // ── 名稱 ──
      this.scene.add.text(bx, by - 2, cfg.label, {
        fontSize: '13px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(52);

      // ── 費用（石器預設，後續動態更新） ──
      const costText = this.scene.add.text(bx, by + 14, `⚡${UNIT_ENERGY_COST[cfg.type][0]}`, {
        fontSize: '12px', color: '#aaddff',
      }).setOrigin(0.5).setDepth(52);

      // ── 快捷鍵標籤 ──
      this.scene.add.text(bx - BTN_W / 2 + 6, by - BTN_H / 2 + 5, cfg.keybind, {
        fontSize: '11px', color: '#ffff88',
      }).setDepth(52);

      // ── 冷卻遮罩 ──
      const cooldownOverlay = this.scene.add.rectangle(bx, by, BTN_W, BTN_H, 0x000000, 0)
        .setDepth(53);

      const cooldownText = this.scene.add.text(bx, by, '', {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(54);

      // ── Hover 效果 ──
      bg.on('pointerover', () => {
        if (!this.cooldowns.get(cfg.type)) {
          this.scene.tweens.add({ targets: bg, scaleX: 1.05, scaleY: 1.05, duration: 60 });
        }
      });
      bg.on('pointerout', () => {
        this.scene.tweens.add({ targets: bg, scaleX: 1, scaleY: 1, duration: 60 });
      });

      // ── 點擊事件 ──
      bg.on('pointerdown', () => {
        this.onSpawn?.(cfg.type);
      });

      this.unitButtons.set(cfg.type, { bg, costText, cooldownOverlay, cooldownText });
    });
  }

  // ─────────────────────────────────────────────
  // 鍵盤快捷鍵 Q/W/E/R 出兵
  // ─────────────────────────────────────────────
  private createKeyboardShortcuts(): void {
    const keys = ['Q', 'W', 'E', 'R'];
    const types: UnitType[] = ['swordsman', 'archer', 'tank', 'mage'];

    keys.forEach((key, i) => {
      this.scene.input.keyboard?.addKey(key)
        .on('down', () => this.onSpawn?.(types[i]));
    });
  }

  // ─────────────────────────────────────────────
  // 每幀更新
  // ─────────────────────────────────────────────
  update(
    energy: number,
    maxEnergy: number,
    playerBaseHp: number,
    playerBaseMaxHp: number,
    enemyBaseHp: number,
    enemyBaseMaxHp: number,
    gold: number,
    elapsedMs: number,
    waveProgress: { done: number; total: number },
    currentEra: Era,
    unitCooldownsMs: Map<UnitType, number>,
    currentTime: number
  ): void {
    // ── 能量條 ──
    const energyRatio = Math.max(0, Math.min(1, energy / maxEnergy));
    this.energyBarFill.width = 200 * energyRatio;
    this.energyText.setText(`${energy}/${maxEnergy}`);

    // ── 基地血量 ──
    const playerHpRatio = Math.max(0, playerBaseHp / playerBaseMaxHp);
    const enemyHpRatio = Math.max(0, enemyBaseHp / enemyBaseMaxHp);
    this.playerHpBar.width = 100 * playerHpRatio;
    this.enemyHpBar.width = 100 * enemyHpRatio;
    this.playerHpText.setText(`${Math.ceil(playerHpRatio * 100)}%`);
    this.enemyHpText.setText(`${Math.ceil(enemyHpRatio * 100)}%`);

    // ── 金幣 ──
    this.goldText.setText(`💰 ${Math.floor(gold)}`);

    // ── 時間 ──
    const totalSec = Math.floor(elapsedMs / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    this.timeText.setText(`⏱ ${m}:${s}`);

    // ── 波次 ──
    this.waveText.setText(`波次: ${waveProgress.done}/${waveProgress.total}`);

    // ── 出兵按鈕狀態 ──
    for (const cfg of UNIT_BUTTON_CONFIG) {
      const btn = this.unitButtons.get(cfg.type);
      if (!btn) continue;

      const cost = UNIT_ENERGY_COST[cfg.type][
        ['stone', 'feudal', 'castle', 'modern', 'space'].indexOf(currentEra)
      ];
      btn.costText.setText(`⚡${cost}`);

      const cooldownUntil = unitCooldownsMs.get(cfg.type) ?? 0;
      const remainMs = cooldownUntil - currentTime;

      if (remainMs > 0) {
        // 冷卻中
        const remainSec = Math.ceil(remainMs / 1000);
        btn.cooldownOverlay.setFillStyle(0x000000, 0.5);
        btn.cooldownText.setText(`${remainSec}s`);
        btn.bg.setAlpha(0.6);
      } else if (energy < cost) {
        // 能量不足
        btn.cooldownOverlay.setFillStyle(0x000000, 0);
        btn.cooldownText.setText('');
        btn.bg.setAlpha(0.5);
      } else {
        // 可出兵
        btn.cooldownOverlay.setFillStyle(0x000000, 0);
        btn.cooldownText.setText('');
        btn.bg.setAlpha(1);
      }
    }
  }

  // ─────────────────────────────────────────────
  // 顯示結算畫面
  // ─────────────────────────────────────────────
  showResult(
    isVictory: boolean,
    grade: 'S' | 'A' | 'B' | 'C',
    goldEarned: number,
    elapsedSec: number,
    onRetry: () => void,
    onMenu: () => void
  ): void {
    const { width, height } = this.scene.cameras.main;

    // 半透明遮罩
    const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setDepth(200);

    // 結果框
    const box = this.scene.add.rectangle(width / 2, height / 2, 500, 220, 0x111133)
      .setStrokeStyle(3, isVictory ? 0xFFD700 : 0xff4444)
      .setDepth(201);

    // 標題
    const titleText = isVictory ? '🏆 勝利！' : '💀 失敗';
    const titleColor = isVictory ? '#FFD700' : '#ff4444';
    this.scene.add.text(width / 2, height / 2 - 80, titleText, {
      fontSize: '36px', color: titleColor, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(202);

    // 評價
    if (isVictory) {
      const gradeColors = { S: '#FFD700', A: '#00ccff', B: '#88ff88', C: '#aaaaaa' };
      this.scene.add.text(width / 2, height / 2 - 35, `評價：${grade}`, {
        fontSize: '28px', color: gradeColors[grade], fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(202);
    }

    // 詳細資訊
    const m = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const s = String(elapsedSec % 60).padStart(2, '0');
    this.scene.add.text(width / 2, height / 2 + 10,
      `獲得金幣：${goldEarned}　　通關時間：${m}:${s}`, {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(202);

    // ── 按鈕 ──
    const createButton = (bx: number, by: number, label: string, color: number, cb: () => void) => {
      const bg = this.scene.add.rectangle(bx, by, 160, 44, color)
        .setStrokeStyle(2, 0xffffff)
        .setDepth(202)
        .setInteractive({ useHandCursor: true });

      this.scene.add.text(bx, by, label, {
        fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(203);

      bg.on('pointerdown', cb);
      bg.on('pointerover', () => bg.setFillStyle(color + 0x222222));
      bg.on('pointerout', () => bg.setFillStyle(color));
    };

    if (isVictory) {
      createButton(width / 2 - 100, height / 2 + 70, '🔁 再次挑戰', 0x334466, onRetry);
      createButton(width / 2 + 100, height / 2 + 70, '🏠 主選單', 0x443344, onMenu);
    } else {
      createButton(width / 2 - 100, height / 2 + 70, '🔁 重試', 0x334466, onRetry);
      createButton(width / 2 + 100, height / 2 + 70, '🏠 主選單', 0x443344, onMenu);
    }
  }

  // ─────────────────────────────────────────────
  // 顯示提示訊息（能量不足等）
  // ─────────────────────────────────────────────
  showToast(message: string, color: string = '#ff8888'): void {
    const text = this.scene.add.text(
      GAME_WIDTH / 2, GAME_HEIGHT - 130, message, {
        fontSize: '15px', color,
        stroke: '#000000', strokeThickness: 4,
        fontStyle: 'bold',
      }
    ).setOrigin(0.5).setDepth(300);

    this.scene.tweens.add({
      targets: text,
      y: GAME_HEIGHT - 160,
      alpha: 0,
      duration: 1200,
      ease: 'Power2',
      onComplete: () => text.destroy(),
    });
  }
}
