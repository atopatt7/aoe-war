// ============================================================
// GameCanvas.tsx — 全螢幕容器，Phaser 自動縮放至任何裝置
// ============================================================
'use client';
import { useEffect, useRef } from 'react';

export default function GameCanvas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gameRef = useRef<any>(null);

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
    <div
      id="phaser-container"
      style={{
        // 佔滿整個視窗
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#0d0d1a',
        // Phaser 的 canvas 會自動置中
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    />
  );
}
