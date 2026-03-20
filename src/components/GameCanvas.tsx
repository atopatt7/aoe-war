// ============================================================
// GameCanvas.tsx — 全螢幕 Phaser 容器
// ✅ 簡化版：移除 containerSize 複雜狀態，直接 init Phaser
// ✅ 手機橫屏：偵測直屏顯示提示
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

    if (typeof screen !== 'undefined' && screen.orientation?.lock) {
      screen.orientation.lock('landscape').catch(() => {/* iOS 不支援，靜默忽略 */});
    }
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // ── Phaser 初始化 ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || gameRef.current) return;

    let game: any = null;

    const initGame = async () => {
      const Phaser           = (await import('phaser')).default;
      const { BootScene }    = await import('@/game/scenes/BootScene');
      const { MenuScene }    = await import('@/game/scenes/MenuScene');
      const { GameScene }    = await import('@/game/scenes/GameScene');
      const { UpgradeScene } = await import('@/game/scenes/UpgradeScene');
      const { createGameConfig } = await import('@/game/GameConfig');

      const config = createGameConfig([BootScene, MenuScene, GameScene, UpgradeScene]);

      game = new Phaser.Game({
        ...config,
        parent: 'phaser-container',
      });
      gameRef.current = game;

      // resize 時通知 Phaser 重新計算縮放
      const onResize = () => { game?.scale?.refresh?.(); };
      window.addEventListener('resize', onResize);
    };

    initGame().catch(console.error);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []); // 只初始化一次

  return (
    <>
      {/* Phaser canvas 容器，不加 flex 避免座標偏移 */}
      <div
        id="phaser-container"
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#0d0d1a',
        }}
      />

      {/* 直屏提示遮罩 */}
      {isPortrait && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: '#0d0d1a',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, color: '#FFD700', gap: '20px',
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
