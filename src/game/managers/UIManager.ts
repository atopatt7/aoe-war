// ============================================================
// UIManager：遊戲 UI 管理器
// 負責：能量條、出兵按鈕、血量條、狀態顯示、結算畫面
// ✅ 新增：能量回復進度條 + 出兵按鈕冷卻進度條
// ============================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, PLAYER_BASE_X, ENEMY_BASE_X, UNIT_NAMES, ERA_NAMES } from '@/game/GameConfig';
import { UNIT_ENERGY_COST } from './EnergyManager';
import type { UnitType, Era } from '@/types/game';

/** 出兵按鈕點擊回呼 */
export type SpawnCallback = (unitType: UnitType) => void;

/** 升級按鈕點擊回呼 */
export type UpgradeCallback = (unitType: UnitType) => void;

// ── 各兵種冷卻時間（與 GameScene.UNIT_COOLDOWN_MS 一致）──────
const UNIT_COOLDOWN_MS: Record<UnitType, number> = {
  swordsman: 1000,
  archer:    3000,
  tank:      5000,
  mage:      7000,
};

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

// 能量條參數
const EX = 20;
const EY = GAME_HEIGHT - 82;
const EW = 200;
const EH = 16;

export class UIManager {
  private scene: Phaser.Scene;

  // ── UI 元素 ──
  private energyBarFill!: Phaser.GameObjects.Rectangle;
  private energyRegenBar!: Phaser.GameObjects.Rectangle;   // 能量回復進度條
  private energyRegenBg!: Phaser.GameObjects.Rectangle;    // 能量回復進度條背景
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
    cooldownBar: Phaser.GameObjects.Rectangle;     // 冷卻進度條（填充）
    cooldownBarBg: Phaser.GameObjects.Rectangle;   // 冷卻進度條背景
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
    this.scene.add.rectangle(GAME_WIDTH / 2, 18, GAME_WIDTH, 36, 0x000000, 0.75)
      .setDepth(50);

    this.scene.add.text(10, 5, `第 ${levelId} 關　[${ERA_NAMES[enemyEra]}]`, {
      fontSize: '14px', color: '#ffffff', fontStyle: 'bold',
    }).setDepth(51);

    this.goldText = this.scene.add.text(300, 5, '💰 0', {
      fontSize: '14px', color: '#FFD700',
    }).setDepth(51);

    this.timeText = this.scene.add.text(GAME_WIDTH / 2, 5, '⏱ 00:00', {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5, 0).setDepth(51);

    this.waveText = this.scene.add.text(GAME_WIDTH - 200, 5, '波次: 0/0', {
      fontSize: '12px', color: '#aaaaff',
    }).setDepth(51);

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
  // 能量條（底部左側）+ 能量回復進度條
  // ─────────────────────────────────────────────
  private createEnergyBar(): void {
    this.scene.add.text(EX, EY - 16, '⚡ 能量', {
      fontSize: '12px', color: '#88ffff',
    }).setDepth(51);

    // 能量條背景
    this.scene.add.rectangle(EX + EW / 2, EY, EW, EH, 0x002233)
      .setOrigin(0.5).setDepth(51);

    // 能量條填充
    this.energyBarFill = this.scene.add.rectangle(EX, EY, EW, EH, 0x00ccff)
      .setOrigin(0, 0.5).setDepth(52);

    // 數值文字
    this.energyText = this.scene.add.text(EX + EW + 8, EY, '10/10', {
      fontSize: '12px', color: '#88ffff',
    }).setOrigin(0, 0.5).setDepth(51);

    // ── 能量回復進度條（在能量條下方，顯示下一點能量的累積進度）──
    const REGEN_Y = EY + EH / 2 + 5;
    const REGEN_H = 4;

    // 背景
    this.energyRegenBg = this.scene.add.rectangle(EX + EW / 2, REGEN_Y, EW, REGEN_H, 0x003344)
      .setOrigin(0.5).setDepth(51);

    // 填充（金色）
    this.energyRegenBar = this.scene.add.rectangle(EX, REGEN_Y, 0, REGEN_H, 0xFFD700)
      .setOrigin(0, 0.5).setDepth(52);
  }

  // ─────────────────────────────────────────────
  // 出兵按鈕（底部中央）+ 冷卻進度條
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

      // ── 冷卻進度條（按鈕底部，填充式，顯示冷卻完成進度）──
      const barY = by + BTN_H / 2 - 5;
      const barH = 5;

      // 冷卻條背景（深色）
      const cooldownBarBg = this.scene.add.rectangle(bx, barY, BTN_W, barH, 0x000000, 0.6)
        .setOrigin(0.5).setDepth(53);

      // 冷卻條填充（從左往右，填滿=冷卻完成=可出兵）
      const cooldownBar = this.scene.add.rectangle(bx - BTN_W / 2, barY, BTN_W, barH, 0x00ff88)
        .setOrigin(0, 0.5).setDepth(54);

      // ── 冷卻遮罩 ──
      const cooldownOverlay = this.scene.add.rectangle(bx, by, BTN_W, BTN_H, 0x000000, 0)
        .setDepth(55);

      const cooldownText = this.scene.add.text(bx, by, '', {
        fontSize: '18px', color: '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(56);

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

      this.unitButtons.set(cfg.type, {
        bg, costText, cooldownOverlay, cooldownText, cooldownBar, cooldownBarBg,
      });
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
  // regenProgress: 0~1，下一點能量的累積進度
  // ─────────────────────────────────────────────
  update(
    energy: number,
    maxEnergy: number,
    regenProgress: number,
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
    this.energyBarFill.width = EW * energyRatio;
    this.energyText.setText(`${energy}/${maxEnergy}`);

    // ── 能量回復進度條（energy < max 時顯示；已滿時填滿） ──
    const regenRatio = energy >= maxEnergy ? 1 : Math.max(0, Math.min(1, regenProgress));
    this.energyRegenBar.width = EW * regenRatio;
    // 已滿時變灰，有能量時顯示金色
    this.energyRegenBar.setFillStyle(energy >= maxEnergy ? 0x444444 : 0xFFD700);

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

    // ── 出兵按鈕狀態 + 冷卻進度條 ──
    for (const cfg of UNIT_BUTTON_CONFIG) {
      const btn = this.unitButtons.get(cfg.type);
      if (!btn) continue;

      const cost = UNIT_ENERGY_COST[cfg.type][
        ['stone', 'feudal', 'castle', 'modern', 'space'].indexOf(currentEra)
      ];
      btn.costText.setText(`⚡${cost}`);

      const cooldownUntil = unitCooldownsMs.get(cfg.type) ?? 0;
      const remainMs = cooldownUntil - currentTime;
      const totalMs = UNIT_COOLDOWN_MS[cfg.type];

      if (remainMs > 0) {
        // ── 冷卻中 ──
        const progress = Math.max(0, Math.min(1, 1 - remainMs / totalMs));
        btn.cooldownBar.width = BTN_W * progress;
        btn.cooldownBar.setFillStyle(0xff8800); // 橙色：冷卻中

        const remainSec = (remainMs / 1000).toFixed(1);
        btn.cooldownOverlay.setFillStyle(0x000000, 0.45);
        btn.cooldownText.setText(`${remainSec}s`);
        btn.bg.setAlpha(0.65);
      } else if (energy < cost) {
        // ── 能量不足（冷卻完成但能量不夠）──
        btn.cooldownBar.width = BTN_W; // 冷卻條滿（冷卻已好）
        btn.cooldownBar.setFillStyle(0x446644); // 暗綠：等能量
        btn.cooldownOverlay.setFillStyle(0x000000, 0);
        btn.cooldownText.setText('');
        btn.bg.setAlpha(0.55);
      } else {
        // ── 可出兵 ──
        btn.cooldownBar.width = BTN_W;
        btn.cooldownBar.setFillStyle(0x00ff88); // 亮綠：就緒
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

    const overlay = this.scene.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
      .setDepth(200);

    this.scene.add.rectangle(width / 2, height / 2, 500, 220, 0x111133)
      .setStrokeStyle(3, isVictory ? 0xFFD700 : 0xff4444)
      .setDepth(201);

    const titleText = isVictory ? '🏆 勝利！' : '💀 失敗';
    const titleColor = isVictory ? '#FFD700' : '#ff4444';
    this.scene.add.text(width / 2, height / 2 - 80, titleText, {
      fontSize: '36px', color: titleColor, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(202);

    if (isVictory) {
      const gradeColors = { S: '#FFD700', A: '#00ccff', B: '#88ff88', C: '#aaaaaa' };
      this.scene.add.text(width / 2, height / 2 - 35, `評價：${grade}`, {
        fontSize: '28px', color: gradeColors[grade], fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(202);
    }

    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const ss = String(elapsedSec % 60).padStart(2, '0');
    this.scene.add.text(width / 2, height / 2 + 10,
      `獲得金幣：${goldEarned}　　通關時間：${mm}:${ss}`, {
      fontSize: '16px', color: '#ffffff',
    }).setOrigin(0.5).setDepth(202);

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

    // suppress unused overlay reference (needed for creation side-effect)
    void overlay;
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
