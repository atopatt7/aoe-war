// ============================================================
// GameCanvas.tsx — 全螢幕容器
// ✅ 修正：用 window.innerWidth/Height 明確指定容器像素尺寸
//    避免 Phaser Scale Manager 在行動裝置上讀到錯誤的父容器大小
// ============================================================
'use client';
import { useEffect, useRef, useState } from 'react';

export default function GameCanvas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gameRef = useRef<any>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

  // ── 尺寸 & 橫屏偵測 ────────────────────────────────────────
  useEffect(() => {
    const updateSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setContainerSize({ w, h });
      setIsPortrait(h > w);
    };

    updateSize(); // 立即取得真實像素尺寸

    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', () => {
      // orientationchange 後需等一下才能讀到正確尺寸
      setTimeout(updateSize, 150);
    });

    // 嘗試鎖定橫屏（Android Chrome 支援，iOS 會靜默忽略）
    if (typeof screen !== 'undefined' && screen.orientation?.lock) {
      screen.orientation.lock('landscape').catch(() => {/* 不支援則忽略 */});
    }

    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // ── Phaser 初始化（等容器尺寸確定後再啟動）────────────────
  useEffect(() => {
    // 等待容器尺寸就緒
    if (containerSize.w === 0 || containerSize.h === 0) return;
    // 避免重複初始化
    if (gameRef.current) return;

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

      // 監聽視窗大小變化，通知 Phaser Scale Manager 重新計算
      const onResize = () => {
        if (gameRef.current?.scale) {
          gameRef.current.scale.refresh();
        }
      };
      window.addEventListener('resize', onResize);
    };

    initGame().catch(console.error);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [containerSize.w, containerSize.h]);

  return (
    <>
      {/* ── Phaser 容器：用明確像素值，不用 %/vw/vh ── */}
      <div
        id="phaser-container"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          // 用 innerWidth/Height 的像素值，Phaser 初始化時能正確讀到容器大小
          width:  containerSize.w > 0 ? `${containerSize.w}px` : '100vw',
          height: containerSize.h > 0 ? `${containerSize.h}px` : '100vh',
          overflow: 'hidden',
          backgroundColor: '#0d0d1a',
          // ⚠️ 不加 flex 置中，讓 Phaser Scale Manager 自己處理
          // 加了 flex 會讓 canvas 視覺偏移但 Phaser 輸入座標不跟著動
        }}
      />

      {/* ── 直屏提示遮罩 ── */}
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
