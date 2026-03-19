// ============================================================
// MenuScene：主選單場景
// 顯示關卡選擇、玩家金幣、升級入口
// ============================================================
import Phaser from 'phaser';
import type { PlayerSave, LevelData } from '@/types/game';
import { ERA_NAMES } from '@/game/GameConfig';

/** 每行顯示幾個關卡按鈕 */
const LEVELS_PER_ROW = 10;
const BTN_W = 90;
const BTN_H = 50;
const BTN_GAP_X = 14;
const BTN_GAP_Y = 10;
const START_X = 60;
const START_Y = 130;

export class MenuScene extends Phaser.Scene {
  private playerSave!: PlayerSave;
  private levelsData: LevelData[] = [];
  private levelBtns: Phaser.GameObjects.Container[] = [];

  constructor() {
    super({ key: 'MenuScene' });
  }

  async create(): Promise<void> {
    this.cameras.main.setBackgroundColor('#0d0d1a');

    // ── 從 API 載入關卡資料 ──
    try {
      const res = await fetch('/api/game-data?type=levels');
      this.levelsData = await res.json();
    } catch (e) {
      console.error('無法載入關卡資料', e);
    }

    // ── 讀取或初始化玩家存檔 ──
    this.playerSave = this.loadPlayerSave();

    // ── 繪製主選單 UI ──
    this.drawHeader();
    this.drawLevelGrid();
    this.drawFooter();
  }

  // ─────────────────────────────────────────────
  // 繪製標題列
  // ─────────────────────────────────────────────
  private drawHeader(): void {
    const { width } = this.cameras.main;

    // 標題
    this.add.text(width / 2, 28, '⚔  跨時代戰爭  ⚔', {
      fontSize: '28px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 金幣顯示
    this.add.text(20, 60, `💰 金幣：${this.playerSave.gold}`, {
      fontSize: '16px',
      color: '#FFD700',
    });

    // 基地等級
    this.add.text(220, 60, `🏰 基地 Lv.${this.playerSave.baseLevel}`, {
      fontSize: '16px',
      color: '#88ccff',
    });

    // ── 升級入口按鈕 ──
    const upgradeBtn = this.add.rectangle(width - 90, 60, 130, 30, 0x224422)
      .setStrokeStyle(1.5, 0x44aa44)
      .setInteractive({ useHandCursor: true });
    this.add.text(width - 90, 60, '⬆ 升級兵種', {
      fontSize: '13px', color: '#88ff88',
    }).setOrigin(0.5);
    upgradeBtn.on('pointerdown', () => {
      this.scene.start('UpgradeScene', { playerSave: this.playerSave });
    });
    upgradeBtn.on('pointerover', () => upgradeBtn.setFillStyle(0x336633));
    upgradeBtn.on('pointerout',  () => upgradeBtn.setFillStyle(0x224422));

    // 分隔線
    this.add.rectangle(width / 2, 95, width - 40, 2, 0x333366).setOrigin(0.5);

    this.add.text(20, 105, '── 關卡選擇 ──', {
      fontSize: '13px',
      color: '#888888',
    });
  }

  // ─────────────────────────────────────────────
  // 繪製 100 關的格子
  // ─────────────────────────────────────────────
  private drawLevelGrid(): void {
    for (let i = 0; i < 100; i++) {
      const levelId = i + 1;
      const col = i % LEVELS_PER_ROW;
      const row = Math.floor(i / LEVELS_PER_ROW);
      const x = START_X + col * (BTN_W + BTN_GAP_X);
      const y = START_Y + row * (BTN_H + BTN_GAP_Y);

      const isUnlocked = levelId <= this.playerSave.unlockedLevels;
      const grade = this.playerSave.levelGrades[levelId];

      this.createLevelButton(x, y, levelId, isUnlocked, grade);
    }
  }

  // ─────────────────────────────────────────────
  // 建立單一關卡按鈕
  // ─────────────────────────────────────────────
  private createLevelButton(
    x: number,
    y: number,
    levelId: number,
    isUnlocked: boolean,
    grade?: string
  ): void {
    // 決定按鈕顏色
    const bgColor = isUnlocked ? 0x1a3a5c : 0x222222;
    const borderColor = isUnlocked ? 0x4488cc : 0x444444;
    const textColor = isUnlocked ? '#ffffff' : '#555555';

    // 取得對應關卡的時代資訊
    const levelData = this.levelsData.find(l => l.id === levelId);
    const eraShort = levelData ? ERA_NAMES[levelData.enemyEra]?.charAt(0) ?? '' : '';

    // 按鈕背景
    const bg = this.add.rectangle(0, 0, BTN_W, BTN_H, bgColor).setStrokeStyle(1.5, borderColor);

    // 關卡編號
    const numText = this.add.text(0, -8, `${levelId}`, {
      fontSize: '14px',
      color: textColor,
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // 時代標記
    const eraText = this.add.text(0, 8, eraShort, {
      fontSize: '10px',
      color: isUnlocked ? '#aaaacc' : '#444444',
    }).setOrigin(0.5);

    // 評價標記（右上角）
    const gradeObjects: Phaser.GameObjects.GameObject[] = [];
    if (grade) {
      const gradeColors: Record<string, string> = {
        S: '#FFD700', A: '#00ccff', B: '#88ff88', C: '#aaaaaa',
      };
      const gradeText = this.add.text(BTN_W / 2 - 8, -BTN_H / 2 + 6, grade, {
        fontSize: '11px',
        color: gradeColors[grade] ?? '#ffffff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      gradeObjects.push(gradeText);
    }

    // 組合成 Container
    const container = this.add.container(x, y, [bg, numText, eraText, ...gradeObjects]);

    // 解鎖的關卡可點擊
    if (isUnlocked) {
      bg.setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
          bg.setFillStyle(0x2255aa);
          this.tweens.add({ targets: container, scaleX: 1.06, scaleY: 1.06, duration: 80 });
        })
        .on('pointerout', () => {
          bg.setFillStyle(bgColor);
          this.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
        })
        .on('pointerdown', () => {
          this.startLevel(levelId);
        });
    }

    this.levelBtns.push(container);
  }

  // ─────────────────────────────────────────────
  // 繪製底部說明列
  // ─────────────────────────────────────────────
  private drawFooter(): void {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height - 24, width, 48, 0x111122).setOrigin(0.5);

    this.add.text(width / 2, height - 24, '點擊關卡開始遊戲   |   石器(1-20)  封建(21-40)  城堡(41-60)  現代(61-80)  太空(81-100)', {
      fontSize: '12px',
      color: '#666688',
    }).setOrigin(0.5);
  }

  // ─────────────────────────────────────────────
  // 啟動關卡
  // ─────────────────────────────────────────────
  private startLevel(levelId: number): void {
    // 傳遞 levelId 和 playerSave 到 GameScene
    this.scene.start('GameScene', {
      levelId,
      playerSave: this.playerSave,
    });
  }

  // ─────────────────────────────────────────────
  // 讀取玩家存檔（localStorage）
  // ─────────────────────────────────────────────
  private loadPlayerSave(): PlayerSave {
    const defaultSave: PlayerSave = {
      gold: 0,
      unlockedLevels: 1,
      unitUpgrades: {
        swordsman: 0,
        archer: 0,
        tank: 0,
        mage: 0,
      },
      baseLevel: 1,
      levelGrades: {},
    };

    try {
      const raw = localStorage.getItem('aoewar_save');
      if (!raw) return defaultSave;
      return { ...defaultSave, ...JSON.parse(raw) };
    } catch {
      return defaultSave;
    }
  }
}
