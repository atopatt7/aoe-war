// ============================================================
// UpgradeScene：升級畫面
// 顯示4種兵種＋主基地升級，消耗金幣，更新存檔
// ============================================================
import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, UNIT_NAMES, ERA_NAMES } from '@/game/GameConfig';
import { UNIT_ENERGY_COST } from '@/game/managers/EnergyManager';
import type { PlayerSave, UnitData, BaseData, UnitType, Era, UpgradeData } from '@/types/game';

const ERA_ORDER: Era[] = ['stone', 'feudal', 'castle', 'modern', 'space'];
const ERA_COLORS: Record<Era, number> = {
  stone: 0x8B6914, feudal: 0x2d6e2d, castle: 0x1a3f8f, modern: 0x555566, space: 0x440088,
};
const UNIT_TYPES: UnitType[] = ['swordsman', 'archer', 'tank', 'mage'];
const UNIT_ICONS = ['⚔', '🏹', '🛡', '🔮'];
const TAB_COLORS = [0x1a3a7a, 0x1a5a1a, 0x5a3a1a, 0x4a1a5a];

export class UpgradeScene extends Phaser.Scene {
  private playerSave!: PlayerSave;
  private unitsData: UnitData[] = [];
  private upgradesData: UpgradeData[] = [];
  private baseData!: BaseData;

  private selectedTab: number = 0; // 0~3=兵種, 4=主基地
  private tabContainers: Phaser.GameObjects.Container[] = [];
  private contentContainer!: Phaser.GameObjects.Container;
  private goldText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UpgradeScene' });
  }

  init(data: { playerSave: PlayerSave; selectedTab?: number }): void {
    this.playerSave  = data.playerSave;
    this.selectedTab = data.selectedTab ?? 0;
  }

  async create(): Promise<void> {
    this.cameras.main.setBackgroundColor('#0d0d1a');
    await this.loadData();
    this.drawLayout();
    this.renderContent();
  }

  // ─────────────────────────────────────────────
  // 載入資料
  // ─────────────────────────────────────────────
  private async loadData(): Promise<void> {
    try {
      const [uRes, upRes, bRes] = await Promise.all([
        fetch('/api/game-data?type=units'),
        fetch('/api/game-data?type=upgrades'),
        fetch('/api/game-data?type=base'),
      ]);
      const uObj  = await uRes.json();
      this.unitsData    = Array.isArray(uObj) ? uObj : (uObj.units ?? []);
      const upObj = await upRes.json();
      this.upgradesData = Array.isArray(upObj) ? upObj : (upObj.upgrades ?? []);
      this.baseData     = await bRes.json();
    } catch (e) { console.error('UpgradeScene 載入失敗', e); }
  }

  // ─────────────────────────────────────────────
  // 繪製固定版面（頂部列＋分頁）
  // ─────────────────────────────────────────────
  private drawLayout(): void {
    const W = GAME_WIDTH;

    // 頂部背景
    this.add.rectangle(W / 2, 22, W, 44, 0x000000, 0.85).setDepth(10);

    // 返回按鈕
    const backBtn = this.add.text(14, 6, '← 返回', {
      fontSize: '14px', color: '#aaaaff',
    }).setDepth(11).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.returnToMenu());
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout',  () => backBtn.setColor('#aaaaff'));

    // 標題
    this.add.text(W / 2, 8, '⬆  升級中心', {
      fontSize: '18px', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5, 0).setDepth(11);

    // 金幣
    this.goldText = this.add.text(W - 14, 8, `💰 ${this.playerSave.gold}`, {
      fontSize: '14px', color: '#FFD700',
    }).setOrigin(1, 0).setDepth(11);

    // ── 分頁標籤（4兵種 + 主基地）──
    const tabs = [...UNIT_TYPES.map((t, i) => ({
      label: `${UNIT_ICONS[i]} ${UNIT_NAMES[t]}`,
      color: TAB_COLORS[i],
    })), { label: '🏰 主基地', color: 0x225533 }];

    const tabW = W / tabs.length;
    tabs.forEach((tab, i) => {
      const tx = i * tabW + tabW / 2;
      const bg = this.add.rectangle(tx, 58, tabW - 4, 28, tab.color)
        .setDepth(11)
        .setInteractive({ useHandCursor: true });

      const lbl = this.add.text(tx, 58, tab.label, {
        fontSize: '13px', color: i === this.selectedTab ? '#FFD700' : '#aaaaaa',
        fontStyle: i === this.selectedTab ? 'bold' : 'normal',
      }).setOrigin(0.5).setDepth(12);

      // 選中底線
      const underline = this.add.rectangle(tx, 73, tabW - 4, 3,
        i === this.selectedTab ? 0xFFD700 : 0x333333
      ).setDepth(12);

      bg.on('pointerdown', () => {
        this.selectedTab = i;
        this.refreshTabs();
        this.renderContent();
      });
      bg.on('pointerover', () => bg.setFillStyle(tab.color + 0x111111));
      bg.on('pointerout',  () => bg.setFillStyle(tab.color));

      this.tabContainers.push(
        this.add.container(0, 0, [bg, lbl, underline]) as unknown as Phaser.GameObjects.Container
      );
    });

    // 內容區背景
    this.add.rectangle(W / 2, (GAME_HEIGHT + 80) / 2, W, GAME_HEIGHT - 80, 0x111122)
      .setOrigin(0.5, 0)
      .setY(80)
      .setDepth(9);
  }

  // ─────────────────────────────────────────────
  // 重繪分頁高亮
  // ─────────────────────────────────────────────
  private refreshTabs(): void {
    // 刪除舊容器，重建
    this.tabContainers.forEach(c => c.destroy());
    this.tabContainers = [];

    const tabs = [...UNIT_TYPES.map((t, i) => ({
      label: `${UNIT_ICONS[i]} ${UNIT_NAMES[t]}`,
      color: TAB_COLORS[i],
    })), { label: '🏰 主基地', color: 0x225533 }];
    const W    = GAME_WIDTH;
    const tabW = W / tabs.length;

    tabs.forEach((tab, i) => {
      const tx   = i * tabW + tabW / 2;
      const isSelected = i === this.selectedTab;
      const bg   = this.add.rectangle(tx, 58, tabW - 4, 28, tab.color).setDepth(11)
        .setInteractive({ useHandCursor: true });
      const lbl  = this.add.text(tx, 58, tab.label, {
        fontSize: '13px', color: isSelected ? '#FFD700' : '#aaaaaa',
        fontStyle: isSelected ? 'bold' : 'normal',
      }).setOrigin(0.5).setDepth(12);
      const line = this.add.rectangle(tx, 73, tabW - 4, 3, isSelected ? 0xFFD700 : 0x333333).setDepth(12);

      bg.on('pointerdown', () => { this.selectedTab = i; this.refreshTabs(); this.renderContent(); });
      bg.on('pointerover', () => bg.setFillStyle(tab.color + 0x111111));
      bg.on('pointerout',  () => bg.setFillStyle(tab.color));

      this.tabContainers.push(this.add.container(0, 0, [bg, lbl, line]) as unknown as Phaser.GameObjects.Container);
    });
  }

  // ─────────────────────────────────────────────
  // 渲染內容區（依選中分頁）
  // ─────────────────────────────────────────────
  private renderContent(): void {
    this.contentContainer?.destroy();
    this.contentContainer = this.add.container(0, 0);

    if (this.selectedTab < 4) {
      this.renderUnitUpgrade(UNIT_TYPES[this.selectedTab]);
    } else {
      this.renderBaseUpgrade();
    }
  }

  // ─────────────────────────────────────────────
  // 兵種升級內容
  // ─────────────────────────────────────────────
  private renderUnitUpgrade(unitType: UnitType): void {
    const W   = GAME_WIDTH;
    const TOP = 88;
    const unitData    = this.unitsData.find(u => u.id === unitType);
    const upgradeData = this.upgradesData.find(u => u.unitId === unitType);
    if (!unitData || !upgradeData) return;

    const currentLv  = this.playerSave.unitUpgrades[unitType] ?? 0;
    const eraIdx     = Math.min(4, Math.floor(currentLv / 10));
    const currentEra = ERA_ORDER[eraIdx];
    const nextLv     = currentLv + 1;
    const nextUpgrade = upgradeData.levels.find(l => l.level === nextLv);
    const isMaxLevel = currentLv >= 50;

    // ── 兵種資訊卡 ──
    const cardBg = this.add.rectangle(W / 2, TOP + 70, W - 40, 120, 0x1a1a33)
      .setStrokeStyle(2, ERA_COLORS[currentEra]).setDepth(20);
    this.contentContainer.add(cardBg);

    // 名稱＋時代
    const nameText = this.add.text(W / 2, TOP + 20, `${UNIT_ICONS[UNIT_TYPES.indexOf(unitType)]} ${UNIT_NAMES[unitType]}`, {
      fontSize: '22px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(21);
    this.contentContainer.add(nameText);

    const eraText = this.add.text(W / 2, TOP + 48, `目前時代：${ERA_NAMES[currentEra]}　　等級：${currentLv} / 50`, {
      fontSize: '14px', color: '#aaaacc',
    }).setOrigin(0.5).setDepth(21);
    this.contentContainer.add(eraText);

    // 進化進度條（10格）
    const inEraLv = currentLv % 10;
    const barStartX = W / 2 - 100;
    for (let i = 0; i < 10; i++) {
      const filled = i < inEraLv;
      const cell = this.add.rectangle(barStartX + i * 22, TOP + 72, 18, 14,
        filled ? 0xFFD700 : 0x222244
      ).setStrokeStyle(1, 0x555577).setDepth(21);
      this.contentContainer.add(cell);
    }

    const toNextEra = 10 - inEraLv;
    const progressLabel = isMaxLevel
      ? '已達最高等級'
      : eraIdx < 4
        ? `再升 ${toNextEra} 次 → ${ERA_NAMES[ERA_ORDER[eraIdx + 1]]}`
        : '已達最高時代';
    const progText = this.add.text(W / 2, TOP + 90, progressLabel, {
      fontSize: '12px', color: '#FFD700',
    }).setOrigin(0.5).setDepth(21);
    this.contentContainer.add(progText);

    // ── 數值對比 ──
    const stats = unitData.stats[currentEra];
    const nextEraIdx = Math.min(4, Math.floor(nextLv / 10));
    const nextEra    = ERA_ORDER[nextEraIdx];
    const nextStats  = unitData.stats[nextEra];

    const statY = TOP + 130;
    this.add.text(W / 2 - 160, statY, '📊 當前數值', {
      fontSize: '13px', color: '#aaaaff',
    }).setDepth(21);
    this.add.text(W / 2 + 60, statY, '📈 升級後', {
      fontSize: '13px', color: '#88ff88',
    }).setDepth(21);

    const statLabels = [
      ['HP',  String(stats.hp),  String(nextStats?.hp ?? stats.hp)],
      ['攻擊', String(stats.attack), String(nextStats?.attack ?? stats.attack)],
      ['速度', String(stats.speed),  String(nextStats?.speed ?? stats.speed)],
    ];
    statLabels.forEach(([label, cur, nxt], i) => {
      const y = statY + 22 + i * 22;
      [
        this.add.text(W / 2 - 180, y, label, { fontSize: '13px', color: '#888888' }).setDepth(21),
        this.add.text(W / 2 - 100, y, cur, { fontSize: '13px', color: '#ffffff' }).setDepth(21),
        this.add.text(W / 2 + 20,  y, `→ ${nxt}`, {
          fontSize: '13px',
          color: Number(nxt) > Number(cur) ? '#88ff88' : '#aaaaaa',
        }).setDepth(21),
      ].forEach(t => this.contentContainer.add(t));
    });

    // ── 出兵費用表 ──
    const costY = statY + 100;
    this.add.text(W / 2, costY, '⚡ 出兵費用（各時代固定）', {
      fontSize: '12px', color: '#88ffff',
    }).setOrigin(0.5).setDepth(21);

    const costs = UNIT_ENERGY_COST[unitType];
    ERA_ORDER.forEach((era, i) => {
      const cx = W / 2 - 200 + i * 100;
      [
        this.add.text(cx, costY + 20, ERA_NAMES[era].charAt(0), {
          fontSize: '11px', color: '#888888',
        }).setOrigin(0.5).setDepth(21),
        this.add.text(cx, costY + 36, `⚡${costs[i]}`, {
          fontSize: '13px', color: '#aaddff', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(21),
      ].forEach(t => this.contentContainer.add(t));
    });

    // ── 升級按鈕 ──
    const canAfford = !isMaxLevel && nextUpgrade && this.playerSave.gold >= nextUpgrade.cost;
    const btnY = GAME_HEIGHT - 50;
    const btnColor = canAfford ? 0xcc9900 : 0x444444;

    const btnBg = this.add.rectangle(W / 2, btnY, W - 60, 52, btnColor)
      .setStrokeStyle(2, 0xffffff).setDepth(21).setInteractive({ useHandCursor: canAfford });
    this.contentContainer.add(btnBg);

    const costStr = isMaxLevel ? '已達最高等級' : nextUpgrade ? `💰 ${nextUpgrade.cost} 金幣` : '—';
    const btnLabel = this.add.text(W / 2, btnY - 8, `⬆ 升級到 Lv.${nextLv}`, {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(22);
    const costLabel = this.add.text(W / 2, btnY + 12, costStr, {
      fontSize: '13px', color: canAfford ? '#FFD700' : '#888888',
    }).setOrigin(0.5).setDepth(22);
    this.contentContainer.add(btnLabel);
    this.contentContainer.add(costLabel);

    if (!canAfford && !isMaxLevel) {
      const warnText = this.add.text(W / 2, btnY + 32, '金幣不足', {
        fontSize: '12px', color: '#ff4444',
      }).setOrigin(0.5).setDepth(22);
      this.contentContainer.add(warnText);
    }

    if (canAfford && nextUpgrade) {
      btnBg.on('pointerdown', () => {
        this.playerSave.gold -= nextUpgrade.cost;
        this.playerSave.unitUpgrades[unitType] = (this.playerSave.unitUpgrades[unitType] ?? 0) + 1;
        this.savePlayerData();
        this.goldText.setText(`💰 ${this.playerSave.gold}`);
        this.renderContent(); // 重繪
      });
      btnBg.on('pointerover', () => btnBg.setFillStyle(0xffaa00));
      btnBg.on('pointerout',  () => btnBg.setFillStyle(btnColor));
    }
  }

  // ─────────────────────────────────────────────
  // 主基地升級內容
  // ─────────────────────────────────────────────
  private renderBaseUpgrade(): void {
    const W   = GAME_WIDTH;
    const TOP = 88;
    const currentLv  = this.playerSave.baseLevel ?? 1;
    const currentCfg = this.baseData?.levels?.find(l => l.level === currentLv);
    const nextCfg    = this.baseData?.levels?.find(l => l.level === currentLv + 1);
    const isMax      = !nextCfg;

    if (!currentCfg) return;

    // 標題
    this.add.text(W / 2, TOP + 16, `🏰 主基地  Lv.${currentLv}`, {
      fontSize: '22px', color: '#FFD700', fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(21);

    this.add.text(W / 2, TOP + 44, `最高可用時代：${ERA_NAMES[currentCfg.maxUnitEra as Era]}`, {
      fontSize: '15px', color: '#aaffaa',
    }).setOrigin(0.5).setDepth(21);

    // 數值對比
    const rows = [
      ['基地血量', String(currentCfg.hp), nextCfg ? String(nextCfg.hp) : '—'],
      ['能量上限', String(currentCfg.maxEnergy), nextCfg ? String(nextCfg.maxEnergy) : '—'],
      ['能量回復', `${currentCfg.energyRegenInterval}秒/點`, nextCfg ? `${nextCfg.energyRegenInterval}秒/點` : '—'],
      ['可用時代', ERA_NAMES[currentCfg.maxUnitEra as Era], nextCfg ? ERA_NAMES[nextCfg.maxUnitEra as Era] : '—'],
    ];

    rows.forEach(([lbl, cur, nxt], i) => {
      const y = TOP + 80 + i * 30;
      [
        this.add.text(80,        y, lbl, { fontSize: '13px', color: '#888888' }).setDepth(21),
        this.add.text(260,       y, cur, { fontSize: '13px', color: '#ffffff' }).setDepth(21),
        this.add.text(W / 2 + 20, y, `→ ${nxt}`, {
          fontSize: '13px', color: nxt !== '—' ? '#aaffaa' : '#555555',
        }).setDepth(21),
      ].forEach(t => this.contentContainer.add(t));
    });

    // 升級按鈕
    const canUpgrade = !isMax && nextCfg && this.playerSave.gold >= nextCfg.upgradeCost;
    const btnY    = GAME_HEIGHT - 50;
    const btnColor = canUpgrade ? 0x226633 : 0x333333;

    const btnBg = this.add.rectangle(W / 2, btnY, W - 60, 52, btnColor)
      .setStrokeStyle(2, 0x88ff88).setDepth(21).setInteractive({ useHandCursor: !!canUpgrade });
    this.contentContainer.add(btnBg);

    const label = isMax ? '已達最高等級' : `⬆ 升級主基地 → Lv.${currentLv + 1}`;
    const costLbl = !isMax && nextCfg ? `💰 ${nextCfg.upgradeCost} 金幣` : '';
    this.add.text(W / 2, btnY - 8, label, { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(22);
    if (costLbl) {
      this.add.text(W / 2, btnY + 12, costLbl, {
        fontSize: '13px', color: canUpgrade ? '#FFD700' : '#888888',
      }).setOrigin(0.5).setDepth(22);
    }

    if (canUpgrade && nextCfg) {
      btnBg.on('pointerdown', () => {
        this.playerSave.gold -= nextCfg.upgradeCost;
        this.playerSave.baseLevel = currentLv + 1;
        this.savePlayerData();
        this.goldText.setText(`💰 ${this.playerSave.gold}`);
        this.renderContent();
      });
    }
  }

  private savePlayerData(): void {
    try { localStorage.setItem('aoewar_save', JSON.stringify(this.playerSave)); } catch { /* noop */ }
  }

  private returnToMenu(): void {
    this.scene.start('MenuScene');
  }
}
