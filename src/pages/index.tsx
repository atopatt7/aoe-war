// ============================================================
// index.tsx：首頁 - 動態載入 GameCanvas
// ============================================================
import dynamic from 'next/dynamic';

// 以 dynamic import 確保 Phaser 元件只在 client 端渲染
const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '1280px',
      height: '400px',
      margin: '0 auto',
      backgroundColor: '#0d0d1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFD700',
      fontSize: '24px',
      border: '2px solid #333366',
      borderRadius: '8px',
    }}>
      載入遊戲中...
    </div>
  ),
});

export default function Home() {
  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: '#06060f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* 頂部標題 */}
      <h1 style={{
        color: '#FFD700',
        fontSize: '32px',
        marginBottom: '16px',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
        letterSpacing: '4px',
      }}>
        ⚔ AOE WAR - 跨時代戰爭 ⚔
      </h1>

      {/* 遊戲畫布 */}
      <GameCanvas />

      {/* 底部提示 */}
      <p style={{
        color: '#555588',
        fontSize: '13px',
        marginTop: '12px',
        textAlign: 'center',
      }}>
        點擊關卡開始遊戲 | 鍵盤 ESC 返回主選單 | 金幣永久保存
      </p>
    </main>
  );
}
