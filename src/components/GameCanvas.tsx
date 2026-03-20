// ============================================================
// GameCanvas.tsx — 全螢幕 Phaser 容器
// ✅ display:'block' 明確覆蓋，確保無 flex 影響 Phaser 輸入座標
// ============================================================
'use client';
import { useEffect, useRef, useState } from 'react';

export default function GameCanvas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gameRef = useRef<any>(null);
  const [isPortrait, setIsPortrait] = useState(false);

  // ── 橫屏偵測 ──────────────────────────────────────────────
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => setTimeout(checkOrientation, 200));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orientation = (screen as any).orientation;
    if (typeof screen !== 'undefined' && orientation?.lock) {
      orientation.lock('landscape').catch(() => {});
    }
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // ── Phaser 初始化 ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || gameRef.current) return;

    const initGame = async () => {
      const Phaser           = (await import('phaser')).default;
      const { BootScene }    = await import('@/game/scenes/BootScene');
      const { MenuScene }    = await import('@/game/scenes/MenuScene');
      const { GameScene }    = await import('@/game/scenes/GameScene');
      const { UpgradeScene } = await import('@/game/scenes/UpgradeScene');
      const { createGameConfig } = await import('@/game/GameConfig');

      const config = createGameConfig([BootScene, MenuScene, GameScene, UpgradeScene]);
      const game = new Phaser.Game({ ...config, parent: 'phaser-container' });
      gameRef.current = game;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const onResize = () => { (game as any)?.scale?.refresh?.(); };
      window.addEventListener('resize', onResize);
    };

    initGame().catch(console.error);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <>
      {/*
        ⚠️ display:'block' 必須明確指定
        不能用 flex/grid 等，否則 Phaser Scale Manager 的 margin-top
        會被 flex alignment 重新計算，導致 canvas 位置偏移，
        Phaser canvasBounds 快取的座標與視覺位置不符，input 系統失效
      */}
      <div
        id="phaser-container"
        style={{
          display: 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          /* 使用安全區域內縮，避免 iPhone 底部 Home 指示列遮擋 */
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#0d0d1a',
        }}
      />

      {/* 直屏提示遮罩（與 phaser-container 同層，不影響 canvas 定位） */}
      {isPortrait && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#0d0d1a',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          color: '#FFD700',
          gap: '20px',
        }}>
          <div style={{ fontSize: '64px' }}>📱</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold' }}>請旋轉裝置</div>
          <div style={{ fontSize: '14px', color: '#aaaacc', textAlign: 'center', padding: '0 32px' }}>
            本遊戲為橫向設計<br />請將手機轉為橫屏模式
          </div>
        </div>
      )}
    </>
  );
}
