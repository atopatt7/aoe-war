// ============================================================
// 遊戲核心型別定義
// ============================================================

/** 時代類型 */
export type Era = 'stone' | 'feudal' | 'castle' | 'modern' | 'space';

/** 兵種類型 */
export type UnitType = 'swordsman' | 'archer' | 'tank' | 'mage';

/** 評價等級 */
export type Grade = 'S' | 'A' | 'B' | 'C';

/** 陣營 */
export type Faction = 'player' | 'enemy';

// ---- 資料結構 ----

/** 兵種資料（從 units.json 讀取） */
export interface UnitData {
  id: UnitType;
  name: string;
  description: string;
  stats: {
    [era in Era]: UnitStats;
  };
  cost: number[];          // 依時代對應消耗能量 [石器,封建,城堡,現代,太空]
  cooldown: number;        // 出兵冷卻（秒）
  attackCooldown: number;  // 攻擊間隔（秒）
}

/** 單一時代的兵種數值 */
export interface UnitStats {
  hp: number;
  attack: number;
  speed: number;
  range: number;          // 攻擊射程（像素）
  isAreaAttack: boolean;  // 是否範圍攻擊
}

/** 關卡資料（從 levels.json 讀取） */
export interface LevelData {
  id: number;
  enemyEra: Era;
  waves: EnemyWave[];
  goldPerKill: number;    // 第N關擊殺1敵人獲得N金幣
  timeLimit: number;      // 秒
  gradeConditions: GradeConditions;
}

/** 敵人波次 */
export interface EnemyWave {
  delay: number;           // 距關卡開始幾秒後出現（秒）
  unitType: UnitType;
  count: number;
  interval: number;        // 每隻敵人間隔（秒）
}

/** 評價條件 */
export interface GradeConditions {
  S: { maxTime: number; minBaseHpPercent: number };
  A: { maxTime: number; minBaseHpPercent: number };
  B: { maxTime: number; minBaseHpPercent: number };
}

/** 升級資料（從 upgrades.json 讀取） */
export interface UpgradeData {
  unitId: UnitType;
  levels: UpgradeLevel[];
}

/** 單次升級資訊 */
export interface UpgradeLevel {
  level: number;          // 第幾級（1~50）
  era: Era;               // 該級屬於哪個時代
  cost: number;           // 升級金幣花費
}

/** 主基地資料（從 base.json 讀取） */
export interface BaseData {
  levels: BaseLevel[];
}

/** 主基地升級資訊 */
export interface BaseLevel {
  level: number;
  hp: number;
  maxEnergy: number;
  energyRegenInterval: number; // 每N秒回復1能量
  maxUnitEra: Era;             // 最高可用時代
  upgradeCost: number;
}

// ---- 執行期遊戲狀態 ----

/** 玩家存檔資料（儲存在 localStorage） */
export interface PlayerSave {
  gold: number;
  unlockedLevels: number;       // 已解鎖到第幾關
  unitUpgrades: {
    [key in UnitType]: number;  // 各兵種目前升級次數
  };
  /** 主基地血量升級等級 (1-10)，同時決定可用時代 */
  baseHpLevel: number;
  /** 能量上限升級等級 (1-8) */
  baseEnergyCapLevel: number;
  /** 能量回復速度升級等級 (1-8) */
  baseRegenLevel: number;
  levelGrades: {
    [levelId: number]: Grade;
  };
}

/** 遊戲場景中的單位實例 */
export interface UnitInstance {
  id: string;                // 唯一ID（uuid）
  unitType: UnitType;
  faction: Faction;
  era: Era;
  currentHp: number;
  maxHp: number;
  attack: number;
  speed: number;
  range: number;
  isAreaAttack: boolean;
  attackCooldown: number;    // 攻擊間隔（毫秒）
  lastAttackTime: number;    // 上次攻擊時間戳
  x: number;
  y: number;
  state: 'moving' | 'attacking' | 'dead';
  targetId: string | null;   // 目前攻擊目標ID
}

/** 遊戲場景狀態 */
export interface GameState {
  energy: number;
  maxEnergy: number;
  energyRegenInterval: number;
  lastEnergyRegen: number;
  playerBaseHp: number;
  playerBaseMaxHp: number;
  enemyBaseHp: number;
  enemyBaseMaxHp: number;
  gold: number;
  goldPerKill: number;
  elapsedTime: number;
  isGameOver: boolean;
  isVictory: boolean;
  unitCooldowns: { [key in UnitType]: number }; // 各兵種下次可出兵時間戳
}
