// ============================================================
// BootScene：遊戲啟動場景，負責資源預載入
// ✅ 載入所有 20 角色精靈圖（idle + attack sprite sheets）
// ============================================================
import Phaser from 'phaser';

const ERAS   = ['stone', 'feudal', 'castle', 'modern', 'space'] as const;
const UNITS  = ['swordsman', 'archer', 'tank', 'mage']         as const;
const ATTACK_FRAMES: Record<string, number> = {
  swordsman: 5, archer: 5, tank: 4, mage: 5,
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // 背景文字
    this.add.text(cx, cy - 60, '跨時代戰爭', {
      fontSize: '36px', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, 'AOE WAR', {
      fontSize: '20px', color: '#aaaaaa',
    }).setOrigin(0.5);

    // 進度條外框
    const barBg = this.add.rectangle(cx, cy + 30, 400, 20, 0x333333);
    barBg.setStrokeStyle(2, 0x888888);

    // 進度條
    const bar = this.add.rectangle(cx - 200, cy + 30, 0, 16, 0xFFD700);
    bar.setOrigin(0, 0.5);

    // 進度文字
    const loadText = this.add.text(cx, cy + 60, '載入中... 0%', {
      fontSize: '14px', color: '#ffffff',
    }).setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      bar.width = 400 * value;
      loadText.setText(`載入中... ${Math.round(value * 100)}%`);
    });

    this.load.on('complete', () => {
      loadText.setText('載入完成！');
    });

    // ── 載入所有精靈圖 ──────────────────────────────────
    for (const era of ERAS) {
      for (const unit of UNITS) {
        const key = `${era}_${unit}`;

        // Idle（單幀 512×512）
        this.load.image(`${key}_idle`, `/assets/sprites/${key}_idle.png`);

        // Attack sprite sheet（N 幀水平排列，每幀 512×512）
        const frames = ATTACK_FRAMES[unit];
        this.load.spritesheet(`${key}_attack`, `/assets/sprites/${key}_attack.png`, {
          frameWidth:  512,
          frameHeight: 512,
        });
        void frames; // frames 資訊供 UnitManager 動畫建立時使用
      }
    }
  }

  create(): void {
    // ── 建立攻擊動畫定義 ────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anims = (this as any).anims;
    for (const era of ERAS) {
      for (const unit of UNITS) {
        const key    = `${era}_${unit}`;
        const frames = ATTACK_FRAMES[unit];

        if (!anims.exists(`${key}_attack`)) {
          anims.create({
            key: `${key}_attack`,
            frames: anims.generateFrameNumbers(`${key}_attack`, {
              start: 0, end: frames - 1,
            }),
            frameRate: 8,   // 120ms per frame
            repeat: 0,      // one-shot
          });
        }
      }
    }

    // 短暫停留後跳到主選單
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }
}
