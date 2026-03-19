// ============================================================
// GameCanvas：React 元件，負責掛載 Phaser 遊戲實例
// 使用動態 import 避免 SSR 問題（Phaser 需要瀏覽器環境）
// ============================================================
'use client';

import { useEffect, useRef } from 'react';

interface GameCanvasProps {
  className?: string;
}

export default function GameCanvas({ className = '' }: GameCanvasProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gameRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (gameRef.current) return;

    const initGame = async () => {
      // 動態 import 避免 SSR 報錯
      const Phaser           = (await import('phaser')).default;
      const { BootScene }    = await import('@/game/scenes/BootScene');
      const { MenuScene }    = await import('@/game/scenes/MenuScene');
      const { GameScene }    = await import('@/game/scenes/GameScene');
      const { UpgradeScene } = await import('@/game/scenes/UpgradeScene');
      const { createGameConfig } = await import('@/game/GameConfig');

      const config = createGameConfig([BootScene, MenuScene, GameScene, UpgradeScene]);

      const game = new Phaser.Game({
        ...config,
        parent: 'phaser-container',
      });

      gameRef.current = game;
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
      ref={containerRef}
      className={className}
      style={{
        width: '1280px',
        height: '400px',
        margin: '0 auto',
        border: '2px solid #333366',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 0 30px rgba(100, 100, 255, 0.3)',
      }}
    />
  );
}
