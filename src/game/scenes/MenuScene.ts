// ============================================================
// MenuScene.ts — 主選單
// ✅ 修正：改用 scene 層級 input.on('pointerdown') + 座標比對
//    完全繞開 Container setInteractive 與 Scale Manager 的相容性問題
// ============================================================
import Phaser from 'phaser';
import type { PlayerSave, LevelData } from '@/types/game';
import { ERA_NAMES } from '@/game/GameConfig';
import { SaveManager } from '@/game/SaveManager';

const LEVELS_PER_ROW = 10;
const BTN_W = 90, BTN_H = 50, BTN_GAP_X = 14, BTN_GAP_Y = 10;
const START_X = 60, START_Y = 130;

export class MenuScene extends Phaser.Scene {
  private playerSave!: PlayerSave;
  private levelsData: LevelData[] = [];
  // 存放每個按鈕的背景 Rectangle，供 hover 效果使用
  private btnBgs: Map<number, Phaser.GameObjects.Rectangle> = new Map();
  private btnDefaultColors: Map<number, number> = new Map();

  constructor() { super({ key: 'MenuScene' }); }

  // ✅ Phaser 內建 loader — create() 進入前保證資料已載入
  preload(): void {
    this.load.json('levels', '/api/game-data?type=levels');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#0d0d1a');
    this.btnBgs.clear();
    this.btnDefaultColors.clear();

    this.levelsData = this.cache.json.get('levels') ?? [];
    this.playerSave = SaveManager.load();

    this.drawHeader();
    this.drawLevelGrid();
    this.drawFooter();

    // ✅ 用 scene 層級 input 處理所有點擊
    //    pointer.x / pointer.y 在 Phaser 3 中已是 game 座標（Scale Manager 已換算）
    this.input.on('pointerdown', (pointer: any) => {
      this.handlePointerDown(pointer.x, pointer.y);
    });

    // hover 效果（pointermove）
    this.input.on('pointermove', (pointer: any) => {
      this.handlePointerMove(pointer.x, pointer.y);
    });
  }

  // ─── 點擊處理（game 座標比對）────────────────────────────
  private handlePointerDown(x: number, y: number): void {
    const { width } = this.cameras.main;

    // 升級按鈕區域（右上角）
    if (Math.abs(x - (width - 90)) <= 65 && Math.abs(y - 60) <= 15) {
      this.scene.start('UpgradeScene', { playerSave: this.playerSave });
      return;
    }

    // 關卡按鈕
    for (let i = 0; i < 100; i++) {
      const levelId = i + 1;
      if (levelId > this.playerSave.unlockedLevels) continue; // 鎖定的關卡跳過

      const col = i % LEVELS_PER_ROW;
      const row = Math.floor(i / LEVELS_PER_ROW);
      const bx  = START_X + col * (BTN_W + BTN_GAP_X);
      const by  = START_Y + row * (BTN_H + BTN_GAP_Y);

      if (Math.abs(x - bx) <= BTN_W / 2 && Math.abs(y - by) <= BTN_H / 2) {
        this.scene.start('GameScene', { levelId, playerSave: this.playerSave });
        return;
      }
    }
  }

  // ─── Hover 效果（pointermove）────────────────────────────
  private handlePointerMove(x: number, y: number): void {
    this.btnBgs.forEach((bg, levelId) => {
      const i   = levelId - 1;
      const col = i % LEVELS_PER_ROW;
      const row = Math.floor(i / LEVELS_PER_ROW);
      const bx  = START_X + col * (BTN_W + BTN_GAP_X);
      const by  = START_Y + row * (BTN_H + BTN_GAP_Y);

      const isHovered = Math.abs(x - bx) <= BTN_W / 2 && Math.abs(y - by) <= BTN_H / 2;
      bg.setFillStyle(isHovered ? 0x2255aa : (this.btnDefaultColors.get(levelId) ?? 0x1a3a5c));
    });
  }

  // ─── 畫面元素 ─────────────────────────────────────────────
  private drawHeader(): void {
    const { width } = this.cameras.main;

    this.add.text(width / 2, 28, '⚔  跨時代戰爭  ⚔', {
      fontSize: '28px', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(20, 60, `💰 金幣：${this.playerSave.gold}`, {
      fontSize: '16px', color: '#FFD700',
    });

    this.add.text(220, 60, `🏰 基地 Lv.${this.playerSave.baseLevel}`, {
      fontSize: '16px', color: '#88ccff',
    });

    // 升級按鈕（視覺用，點擊由 handlePointerDown 處理）
    this.add.rectangle(width - 90, 60, 130, 30, 0x224422).setStrokeStyle(1.5, 0x44aa44);
    this.add.text(width - 90, 60, '⬆ 升級兵種', { fontSize: '13px', color: '#88ff88' }).setOrigin(0.5);

    this.add.rectangle(width / 2, 95, width - 40, 2, 0x333366).setOrigin(0.5);
    this.add.text(20, 105, '── 關卡選擇 ──', { fontSize: '13px', color: '#888888' });
  }

  private drawLevelGrid(): void {
    for (let i = 0; i < 100; i++) {
      const levelId   = i + 1;
      const isUnlocked = levelId <= this.playerSave.unlockedLevels;
      const col       = i % LEVELS_PER_ROW;
      const row       = Math.floor(i / LEVELS_PER_ROW);
      const x         = START_X + col * (BTN_W + BTN_GAP_X);
      const y         = START_Y + row * (BTN_H + BTN_GAP_Y);
      this.createLevelButton(x, y, levelId, isUnlocked, this.playerSave.levelGrades[levelId]);
    }
  }

  private createLevelButton(
    x: number, y: number, levelId: number,
    isUnlocked: boolean, grade?: string
  ): void {
    const bgColor     = isUnlocked ? 0x1a3a5c : 0x222222;
    const borderColor = isUnlocked ? 0x4488cc : 0x444444;
    const textColor   = isUnlocked ? '#ffffff' : '#555555';

    const levelData = this.levelsData.find(l => l.id === levelId);
    const eraShort  = levelData ? ERA_NAMES[levelData.enemyEra]?.charAt(0) ?? '' : '';

    // ✅ 純視覺 Rectangle（不呼叫 setInteractive）
    const bg = this.add.rectangle(x, y, BTN_W, BTN_H, bgColor).setStrokeStyle(1.5, borderColor);
    this.add.text(x, y - 8, `${levelId}`, { fontSize: '14px', color: textColor, fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(x, y + 8, eraShort, { fontSize: '10px', color: isUnlocked ? '#aaaacc' : '#444444' }).setOrigin(0.5);

    if (grade) {
      const gc: Record<string, string> = { S: '#FFD700', A: '#00ccff', B: '#88ff88', C: '#aaaaaa' };
      this.add.text(x + BTN_W / 2 - 8, y - BTN_H / 2 + 6, grade, {
        fontSize: '11px', color: gc[grade] ?? '#ffffff', fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    // 只有解鎖的關卡才記錄到 map，供 hover/click 用
    if (isUnlocked) {
      this.btnBgs.set(levelId, bg);
      this.btnDefaultColors.set(levelId, bgColor);
    }
  }

  private drawFooter(): void {
    const { width, height } = this.cameras.main;
    this.add.rectangle(width / 2, height - 24, width, 48, 0x111122).setOrigin(0.5);
    this.add.text(width / 2, height - 24, '點擊關卡開始遊戲   |   石器(1-20)  封建(21-40)  城堡(41-60)  現代(61-80)  太空(81-100)', {
      fontSize: '12px', color: '#666688',
    }).setOrigin(0.5);
  }
}
