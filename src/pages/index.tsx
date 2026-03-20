// ============================================================
// index.tsx — 首頁（v4 強制重新打包）
// ============================================================
import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: '#0d0d1a',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      color: '#FFD700', fontSize: '20px', gap: '12px',
    }}>
      <div>⚔ 跨時代戰爭 ⚔</div>
      <div style={{ fontSize: '14px', color: '#888' }}>載入遊戲中...</div>
    </div>
  ),
});

export default function Home() {
  return (
    <main style={{ margin: 0, padding: 0, overflow: 'hidden' }}>
      <GameCanvas />
    </main>
  );
}
