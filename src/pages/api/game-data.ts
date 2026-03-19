// ============================================================
// API Route：/api/game-data?type=<units|levels|upgrades|base>
// 統一提供遊戲 JSON 資料給前端
// ============================================================
import type { NextApiRequest, NextApiResponse } from 'next';
import unitsData from '@/data/units.json';
import levelsData from '@/data/levels.json';
import upgradesData from '@/data/upgrades.json';
import baseData from '@/data/base.json';

type DataType = 'units' | 'levels' | 'upgrades' | 'base';

/** 資料映射表 */
const DATA_MAP: Record<DataType, unknown> = {
  units: unitsData.units,
  levels: levelsData,
  upgrades: upgradesData.upgrades,
  base: baseData,
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允許 GET 請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type } = req.query;

  // 驗證 type 參數
  if (!type || typeof type !== 'string' || !(type in DATA_MAP)) {
    return res.status(400).json({
      error: '無效的資料類型',
      validTypes: Object.keys(DATA_MAP),
    });
  }

  const data = DATA_MAP[type as DataType];

  // 設定快取（60秒）
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  return res.status(200).json(data);
}
