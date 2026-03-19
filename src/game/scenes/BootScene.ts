// ============================================================
// BootScene：遊戲啟動場景，負責資源預載入
// ============================================================
import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // 顯示載入進度條
    const { width, height } = this.cameras.main;
    const cx = width / 2;
    const cy = height / 2;

    // 背景文字
    this.add.text(cx, cy - 60, '跨時代戰爭', {
      fontSize: '36px',
      color: '#FFD700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    this.add.text(cx, cy - 20, 'AOE WAR', {
      fontSize: '20px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // 進度條外框
    const barBg = this.add.rectangle(cx, cy + 30, 400, 20, 0x333333);
    barBg.setStrokeStyle(2, 0x888888);

    // 進度條
    const bar = this.add.rectangle(cx - 200, cy + 30, 0, 16, 0xFFD700);
    bar.setOrigin(0, 0.5);

    // 進度文字
    const loadText = this.add.text(cx, cy + 60, '載入中... 0%', {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // 監聽載入進度
    this.load.on('progress', (value: number) => {
      bar.width = 400 * value;
      loadText.setText(`載入中... ${Math.round(value * 100)}%`);
    });

    // 所有資源載入完成
    this.load.on('complete', () => {
      loadText.setText('載入完成！');
    });

    // 在此載入遊戲所需資源（目前使用程式繪製，先不載入外部圖片）
    // 如果之後要加入圖片資源，在此加入 this.load.image(...)
  }

  create(): void {
    // 短暫停留後跳到主選單
    this.time.delayedCall(500, () => {
      this.scene.start('MenuScene');
    });
  }
}
