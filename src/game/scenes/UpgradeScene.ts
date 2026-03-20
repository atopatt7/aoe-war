// ============================================================
// UpgradeScene.ts — 升級畫面（使用 SaveManager）
// ============================================================
import Phaser from 'phaser';
import {
  GAME_WIDTH, GAME_HEIGHT, UNIT_NAMES, ERA_NAMES,
  BASE_HP_UPGRADES, BASE_ENERGY_CAP_UPGRADES, BASE_REGEN_UPGRADES,
} from '@/game/GameConfig';
import { UNIT_ENERGY_COST } from '@/game/managers/EnergyManager';
import { SaveManager } from '@/game/SaveManager';
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
  private selectedTab: number = 0;
  private tabContainers: Phaser.GameObjects.Container[] = [];
  private contentContainer!: Phaser.GameObjects.Container;
  private goldText!: Phaser.GameObjects.Text;

  constructor() { super({ key: 'UpgradeScene' }); }

  init(data: { playerSave?: PlayerSave; selectedTab?: number }): void {
    // ✅ 永遠從 localStorage 讀取最新存檔（不依賴傳入的 playerSave）
    this.playerSave  = SaveManager.load();
    this.selectedTab = data.selectedTab ?? 0;
  }

  async create(): Promise<void> {
    this.cameras.main.setBackgroundColor('#0d0d1a');
    await this.loadData();
    this.drawLayout();
    this.renderContent();
  }

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

  private drawLayout(): void {
    const W = GAME_WIDTH;
    this.add.rectangle(W / 2, 22, W, 44, 0x000000, 0.85).setDepth(10);

    const backBtn = this.add.text(14, 6, '← 返回', { fontSize: '14px', color: '#aaaaff' })
      .setDepth(11).setInteractive({ useHandCursor: true });
    backBtn.on('pointerdown', () => this.scene.start('MenuScene'));
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout',  () => backBtn.setColor('#aaaaff'));

    this.add.text(W / 2, 8, '⬆  升級中心', { fontSize: '18px', color: '#FFD700', fontStyle: 'bold' }).setOrigin(0.5, 0).setDepth(11);
    this.goldText = this.add.text(W - 14, 8, `💰 ${this.playerSave.gold}`, { fontSize: '14px', color: '#FFD700' }).setOrigin(1, 0).setDepth(11);

    this.drawTabs();
    this.add.rectangle(W / 2, (GAME_HEIGHT + 80) / 2, W, GAME_HEIGHT - 80, 0x111122).setOrigin(0.5).setY(80).setDepth(9);
  }

  private drawTabs(): void {
    this.tabContainers.forEach(c => c.destroy());
    this.tabContainers = [];

    const tabs = [
      ...UNIT_TYPES.map((t, i) => ({ label: `${UNIT_ICONS[i]} ${UNIT_NAMES[t]}`, color: TAB_COLORS[i] })),
      { label: '🏰 主基地', color: 0x225533 },
    ];
    const W = GAME_WIDTH, tabW = W / tabs.length;

    tabs.forEach((tab, i) => {
      const tx = i * tabW + tabW / 2;
      const isSelected = i === this.selectedTab;
      const bg   = this.add.rectangle(tx, 58, tabW - 4, 28, tab.color).setDepth(11).setInteractive({ useHandCursor: true });
      const lbl  = this.add.text(tx, 58, tab.label, { fontSize: '13px', color: isSelected ? '#FFD700' : '#aaaaaa', fontStyle: isSelected ? 'bold' : 'normal' }).setOrigin(0.5).setDepth(12);
      const line = this.add.rectangle(tx, 73, tabW - 4, 3, isSelected ? 0xFFD700 : 0x333333).setDepth(12);
      bg.on('pointerdown', () => { this.selectedTab = i; this.drawTabs(); this.renderContent(); });
      bg.on('pointerover', () => bg.setFillStyle(tab.color + 0x111111));
      bg.on('pointerout',  () => bg.setFillStyle(tab.color));
      this.tabContainers.push(this.add.container(0, 0, [bg, lbl, line]) as unknown as Phaser.GameObjects.Container);
    });
  }

  private renderContent(): void {
    this.contentContainer?.destroy();
    this.contentContainer = this.add.container(0, 0);
    if (this.selectedTab < 4) this.renderUnitUpgrade(UNIT_TYPES[this.selectedTab]);
    else this.renderBaseUpgrade();
  }

  private renderUnitUpgrade(unitType: UnitType): void {
    const W = GAME_WIDTH, TOP = 88;
    const unitData    = this.unitsData.find(u => u.id === unitType);
    const upgradeData = this.upgradesData.find(u => u.unitId === unitType);
    if (!unitData || !upgradeData) return;

    const currentLv  = this.playerSave.unitUpgrades[unitType] ?? 0;
    const eraIdx     = Math.min(4, Math.floor(currentLv / 10));
    const currentEra = ERA_ORDER[eraIdx];
    const nextLv     = currentLv + 1;
    const nextUpgrade = upgradeData.levels.find(l => l.level === nextLv);
    const isMaxLevel  = currentLv >= 50;

    // 資訊卡
    const cardBg = this.add.rectangle(W / 2, TOP + 70, W - 40, 120, 0x1a1a33).setStrokeStyle(2, ERA_COLORS[currentEra]).setDepth(20);
    this.contentContainer.add(cardBg);
    this.contentContainer.add(this.add.text(W / 2, TOP + 20, `${UNIT_ICONS[UNIT_TYPES.indexOf(unitType)]} ${UNIT_NAMES[unitType]}`, { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21));
    this.contentContainer.add(this.add.text(W / 2, TOP + 48, `目前時代：${ERA_NAMES[currentEra]}　　等級：${currentLv} / 50`, { fontSize: '14px', color: '#aaaacc' }).setOrigin(0.5).setDepth(21));

    // 進化進度條
    const inEraLv = currentLv % 10;
    for (let i = 0; i < 10; i++) {
      this.contentContainer.add(this.add.rectangle(W / 2 - 100 + i * 22, TOP + 72, 18, 14, i < inEraLv ? 0xFFD700 : 0x222244).setStrokeStyle(1, 0x555577).setDepth(21));
    }
    const toNextLabel = isMaxLevel ? '已達最高等級' : eraIdx < 4 ? `再升 ${10 - inEraLv} 次 → ${ERA_NAMES[ERA_ORDER[eraIdx + 1]]}` : '已達最高時代';
    this.contentContainer.add(this.add.text(W / 2, TOP + 90, toNextLabel, { fontSize: '12px', color: '#FFD700' }).setOrigin(0.5).setDepth(21));

    // 數值對比
    const stats     = unitData.stats[currentEra];
    const nextEra   = ERA_ORDER[Math.min(4, Math.floor(nextLv / 10))];
    const nextStats = unitData.stats[nextEra];
    const statY = TOP + 130;
    [['📊 當前數值', W / 2 - 160], ['📈 升級後', W / 2 + 60]].forEach(([t, x]) => this.contentContainer.add(this.add.text(x as number, statY, t as string, { fontSize: '13px', color: '#aaaaff' }).setDepth(21)));
    [['HP', stats.hp, nextStats?.hp], ['攻擊', stats.attack, nextStats?.attack], ['速度', stats.speed, nextStats?.speed]].forEach(([lbl, cur, nxt], i) => {
      const y = statY + 22 + i * 22;
      this.contentContainer.add(this.add.text(W / 2 - 180, y, lbl as string, { fontSize: '13px', color: '#888888' }).setDepth(21));
      this.contentContainer.add(this.add.text(W / 2 - 100, y, String(cur), { fontSize: '13px', color: '#ffffff' }).setDepth(21));
      this.contentContainer.add(this.add.text(W / 2 + 20, y, `→ ${nxt}`, { fontSize: '13px', color: (nxt as number) > (cur as number) ? '#88ff88' : '#aaaaaa' }).setDepth(21));
    });

    // 費用表
    const costY = statY + 100;
    this.contentContainer.add(this.add.text(W / 2, costY, '⚡ 出兵費用（各時代固定）', { fontSize: '12px', color: '#88ffff' }).setOrigin(0.5).setDepth(21));
    UNIT_ENERGY_COST[unitType].forEach((cost, i) => {
      const cx = W / 2 - 200 + i * 100;
      this.contentContainer.add(this.add.text(cx, costY + 20, ERA_NAMES[ERA_ORDER[i]].charAt(0), { fontSize: '11px', color: '#888888' }).setOrigin(0.5).setDepth(21));
      this.contentContainer.add(this.add.text(cx, costY + 36, `⚡${cost}`, { fontSize: '13px', color: '#aaddff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21));
    });

    // 升級按鈕
    const canAfford = !isMaxLevel && !!nextUpgrade && this.playerSave.gold >= nextUpgrade.cost;
    const btnY = GAME_HEIGHT - 50;
    const btnBg = this.add.rectangle(W / 2, btnY, W - 60, 52, canAfford ? 0xcc9900 : 0x444444).setStrokeStyle(2, 0xffffff).setDepth(21).setInteractive({ useHandCursor: canAfford });
    this.contentContainer.add(btnBg);
    this.contentContainer.add(this.add.text(W / 2, btnY - 8, isMaxLevel ? '已達最高等級' : `⬆ 升級到 Lv.${nextLv}`, { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22));
    this.contentContainer.add(this.add.text(W / 2, btnY + 12, isMaxLevel ? '' : nextUpgrade ? `💰 ${nextUpgrade.cost} 金幣` : '—', { fontSize: '13px', color: canAfford ? '#FFD700' : '#888888' }).setOrigin(0.5).setDepth(22));

    if (canAfford && nextUpgrade) {
      btnBg.on('pointerdown', () => {
        // ✅ 用 SaveManager 扣金幣並儲存
        const updated = SaveManager.saveUnitUpgrade(this.playerSave, unitType, nextUpgrade.cost);
        if (updated) {
          this.playerSave = updated;
          this.goldText.setText(`💰 ${this.playerSave.gold}`);
          this.renderContent();
        }
      });
      btnBg.on('pointerover', () => btnBg.setFillStyle(0xffaa00));
      btnBg.on('pointerout',  () => btnBg.setFillStyle(0xcc9900));
    }
  }

  // ─────────────────────────────────────────────────────────
  // 主基地升級：三張獨立升級卡（血量 / 能量上限 / 能量回速）
  // ─────────────────────────────────────────────────────────
  private renderBaseUpgrade(): void {
    const W = GAME_WIDTH, TOP = 88;

    this.contentContainer.add(
      this.add.text(W / 2, TOP + 10, '🏰 主基地升級', {
        fontSize: '22px', color: '#FFD700', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(21)
    );
    this.contentContainer.add(
      this.add.text(W / 2, TOP + 38, '每條屬性可獨立升級，互不影響', {
        fontSize: '13px', color: '#888888',
      }).setOrigin(0.5).setDepth(21)
    );

    // 三張卡片水平排列
    const cardW   = Math.floor((W - 80) / 3);
    const cardH   = 330;
    const cardY   = TOP + 60 + cardH / 2;
    const cards: Array<{
      icon: string; title: string; subtitle: string;
      currentVal: string; nextVal: string;
      lv: number; maxLv: number; cost: number;
      stat: 'hp' | 'energyCap' | 'regen';
      color: number; strokeColor: number;
    }> = [];

    const hpLv  = this.playerSave.baseHpLevel        ?? 1;
    const capLv = this.playerSave.baseEnergyCapLevel  ?? 1;
    const regLv = this.playerSave.baseRegenLevel      ?? 1;

    const curHp  = BASE_HP_UPGRADES.find(l => l.level === hpLv)!;
    const nextHp = BASE_HP_UPGRADES.find(l => l.level === hpLv + 1);
    cards.push({
      icon: '❤', title: '基地血量', subtitle: '同時解鎖可用時代',
      currentVal: `${curHp.hp} HP\n${ERA_NAMES[curHp.maxUnitEra]}`,
      nextVal: nextHp ? `${nextHp.hp} HP\n${ERA_NAMES[nextHp.maxUnitEra]}` : '—',
      lv: hpLv, maxLv: 10, cost: nextHp?.cost ?? 0,
      stat: 'hp', color: 0x3a1515, strokeColor: 0xff6666,
    });

    const curCap  = BASE_ENERGY_CAP_UPGRADES.find(l => l.level === capLv)!;
    const nextCap = BASE_ENERGY_CAP_UPGRADES.find(l => l.level === capLv + 1);
    cards.push({
      icon: '⚡', title: '能量上限', subtitle: '提高可同時蓄積的能量',
      currentVal: `${curCap.maxEnergy} 能量`,
      nextVal: nextCap ? `${nextCap.maxEnergy} 能量` : '—',
      lv: capLv, maxLv: 8, cost: nextCap?.cost ?? 0,
      stat: 'energyCap', color: 0x1a2a3a, strokeColor: 0x44aaff,
    });

    const curReg  = BASE_REGEN_UPGRADES.find(l => l.level === regLv)!;
    const nextReg = BASE_REGEN_UPGRADES.find(l => l.level === regLv + 1);
    cards.push({
      icon: '🔄', title: '能量回速', subtitle: '縮短每點能量回復時間',
      currentVal: `${curReg.regenIntervalSec}秒/點`,
      nextVal: nextReg ? `${nextReg.regenIntervalSec}秒/點` : '—',
      lv: regLv, maxLv: 8, cost: nextReg?.cost ?? 0,
      stat: 'regen', color: 0x152a15, strokeColor: 0x44ff88,
    });

    cards.forEach((card, ci) => {
      const cx = 40 + cardW / 2 + ci * (cardW + 20);
      const isMax     = card.lv >= card.maxLv;
      const canAfford = !isMax && this.playerSave.gold >= card.cost;

      // 卡片背景
      const cardBg = this.add.rectangle(cx, cardY, cardW, cardH, card.color)
        .setStrokeStyle(2, isMax ? 0x888888 : card.strokeColor).setDepth(21);
      this.contentContainer.add(cardBg);

      // 標題列
      this.contentContainer.add(
        this.add.text(cx, cardY - cardH / 2 + 22, `${card.icon} ${card.title}`, {
          fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
        }).setOrigin(0.5).setDepth(22)
      );
      this.contentContainer.add(
        this.add.text(cx, cardY - cardH / 2 + 44, card.subtitle, {
          fontSize: '11px', color: '#888888',
        }).setOrigin(0.5).setDepth(22)
      );

      // 等級條
      const lvBarY = cardY - cardH / 2 + 70;
      this.contentContainer.add(
        this.add.text(cx, lvBarY, `Lv.${card.lv} / ${card.maxLv}`, {
          fontSize: '13px', color: isMax ? '#FFD700' : '#aaaacc',
        }).setOrigin(0.5).setDepth(22)
      );
      for (let i = 0; i < card.maxLv; i++) {
        const filled = i < card.lv;
        const bw     = Math.floor((cardW - 24) / card.maxLv) - 2;
        const bx     = cx - (cardW - 24) / 2 + i * ((cardW - 24) / card.maxLv) + bw / 2;
        this.contentContainer.add(
          this.add.rectangle(bx, lvBarY + 18, bw, 8, filled ? card.strokeColor : 0x222233)
            .setStrokeStyle(1, 0x444455).setDepth(22)
        );
      }

      // 分隔線
      this.contentContainer.add(
        this.add.rectangle(cx, cardY - cardH / 2 + 108, cardW - 20, 1, 0x333355).setDepth(22)
      );

      // 目前數值
      this.contentContainer.add(
        this.add.text(cx, cardY - cardH / 2 + 124, '目前', {
          fontSize: '11px', color: '#666688',
        }).setOrigin(0.5).setDepth(22)
      );
      this.contentContainer.add(
        this.add.text(cx, cardY - cardH / 2 + 150, card.currentVal, {
          fontSize: '15px', color: '#ffffff', align: 'center',
        }).setOrigin(0.5).setDepth(22)
      );

      // 箭頭 + 升級後數值
      if (!isMax) {
        this.contentContainer.add(
          this.add.text(cx, cardY - cardH / 2 + 196, '↓ 升級後', {
            fontSize: '11px', color: '#666688',
          }).setOrigin(0.5).setDepth(22)
        );
        this.contentContainer.add(
          this.add.text(cx, cardY - cardH / 2 + 222, card.nextVal, {
            fontSize: '15px', color: '#aaffaa', align: 'center',
          }).setOrigin(0.5).setDepth(22)
        );
      } else {
        this.contentContainer.add(
          this.add.text(cx, cardY - cardH / 2 + 210, '✅ 已達最高等級', {
            fontSize: '13px', color: '#FFD700', align: 'center',
          }).setOrigin(0.5).setDepth(22)
        );
      }

      // 升級按鈕
      const btnY   = cardY + cardH / 2 - 30;
      const btnBg  = this.add.rectangle(cx, btnY, cardW - 20, 42,
        canAfford ? (0x111111 | (card.strokeColor & 0x444444)) : 0x222222)
        .setStrokeStyle(1.5, canAfford ? card.strokeColor : 0x444444)
        .setDepth(22)
        .setInteractive({ useHandCursor: canAfford });
      this.contentContainer.add(btnBg);

      if (isMax) {
        this.contentContainer.add(
          this.add.text(cx, btnY, '滿等', { fontSize: '13px', color: '#888888' })
            .setOrigin(0.5).setDepth(23)
        );
      } else {
        this.contentContainer.add(
          this.add.text(cx, btnY - 8, '⬆ 升級', {
            fontSize: '14px', color: canAfford ? '#ffffff' : '#555555', fontStyle: 'bold',
          }).setOrigin(0.5).setDepth(23)
        );
        this.contentContainer.add(
          this.add.text(cx, btnY + 10, `💰 ${card.cost}`, {
            fontSize: '12px', color: canAfford ? '#FFD700' : '#555555',
          }).setOrigin(0.5).setDepth(23)
        );

        if (canAfford) {
          const stat = card.stat;
          const cost = card.cost;
          btnBg.on('pointerdown', () => {
            const updated = SaveManager.saveBaseStatUpgrade(this.playerSave, stat, cost);
            if (updated) {
              this.playerSave = updated;
              this.goldText.setText(`💰 ${this.playerSave.gold}`);
              this.renderContent();
            }
          });
          btnBg.on('pointerover',  () => btnBg.setFillStyle(card.strokeColor & 0x333333 | 0x111111));
          btnBg.on('pointerout',   () => btnBg.setFillStyle(0x111111 | (card.strokeColor & 0x444444)));
        }
      }
    });
  }
}
