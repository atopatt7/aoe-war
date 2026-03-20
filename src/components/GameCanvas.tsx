// ============================================================
// GameCanvas.tsx — 全螢幕容器，修正手機點擊偏移 + 橫屏鎖定
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
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    // Android Chrome 支援鎖定橫屏（iOS 不支援，但不會報錯）
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {/* 靜默忽略不支援的裝置 */});
    }

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
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

      gameRef.current = new Phaser.Game({
        ...config,
        parent: 'phaser-container',
      });
    };

    initGame().catch(console.error);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <>
      {/* ── Phaser 容器：不加 flex，避免 canvas 座標偏移 ── */}
      <div
        id="phaser-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          backgroundColor: '#0d0d1a',
          // ⚠️ 不加 display:flex / alignItems / justifyContent
          // Phaser Scale Manager 自行處理 canvas 置中
          // 加了 flex 會讓 canvas 視覺偏移但 Phaser 輸入座標不跟著動，造成點擊失準
        }}
      />

      {/* ── 直屏提示：遮罩＋旋轉圖示 ── */}
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
          userSelect: 'none',
        }}>
          <div style={{ fontSize: '64px', animation: 'spin 2s linear infinite' }}>📱</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold' }}>請旋轉裝置</div>
          <div style={{ fontSize: '14px', color: '#aaaacc', textAlign: 'center', padding: '0 32px' }}>
            本遊戲為橫向設計<br />請將手機轉為橫屏模式
          </div>
          <style>{`
            @keyframes spin {
              0%   { transform: rotate(0deg); }
              25%  { transform: rotate(-90deg); }
              50%  { transform: rotate(-90deg); }
              75%  { transform: rotate(0deg); }
              100% { transform: rotate(0deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
