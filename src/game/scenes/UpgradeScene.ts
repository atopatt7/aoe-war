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

// 返回按鈕點擊區尺寸
const BACK_HIT_W = 130;
const BACK_HIT_H = 44;
const BACK_X     = 90;
const BACK_Y     = 22;

export class UpgradeScene extends Phaser.Scene {
  private playerSave!: PlayerSave;
  private unitsData: UnitData[] = [];
  private upgradesData: UpgradeData[] = [];
  private baseData!: BaseData;
  private selectedTab: number = 0;
  private tabContainers: Phaser.GameObjects.Container[] = [];
  private contentContainer!: Phaser.GameObjects.Container;
  private goldText!: Phaser.GameObjects.Text;
  private resetDialogContainer: Phaser.GameObjects.Container | null = null;

  constructor() { super({ key: 'UpgradeScene' }); }

  init(data: { playerSave?: PlayerSave; selectedTab?: number }): void {
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

    // ── 返回按鈕 ───────────────────────────────────────────────
    // 綠色外框顯示實際觸控範圍，遠離螢幕邊角
    this.add.rectangle(BACK_X, BACK_Y, BACK_HIT_W, BACK_HIT_H, 0x000000, 0)
      .setStrokeStyle(2, 0x00ff44)   // 綠色外框（方便確認觸控範圍）
      .setDepth(11);
    const backHitZone = this.add.rectangle(BACK_X, BACK_Y, BACK_HIT_W, BACK_HIT_H, 0x000000, 0)
      .setDepth(12).setInteractive({ useHandCursor: true });
    const backBtn = this.add.text(BACK_X, BACK_Y, '← 返回', {
      fontSize: '16px', color: '#aaaaff',
    }).setOrigin(0.5).setDepth(13);
    const doBack = () => this.scene.start('MenuScene');
    backHitZone.on('pointerdown', doBack);
    backHitZone.on('pointerover',  () => backBtn.setColor('#ffffff'));
    backHitZone.on('pointerout',   () => backBtn.setColor('#aaaaff'));

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
      const tabCont = this.add.container(0, 0, [bg, lbl, line]);
      tabCont.setDepth(15);
      this.tabContainers.push(tabCont as unknown as Phaser.GameObjects.Container);
    });
  }

  private renderContent(): void {
    this.contentContainer?.destroy();
    this.contentContainer = this.add.container(0, 0);
    this.contentContainer.setDepth(15);
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
    const inSpaceEra = eraIdx >= 4;
    const nextLv     = currentLv + 1;

    const tableUpgrade = upgradeData.levels.find(l => l.level === nextLv);
    const nextUpgradeCost = tableUpgrade
      ? tableUpgrade.cost
      : (upgradeData.levels[upgradeData.levels.length - 1].cost + (nextLv - 50) * 600);
    const nextUpgrade = tableUpgrade ?? (inSpaceEra ? { level: nextLv, cost: nextUpgradeCost } : null);

    const isMaxLevel = !inSpaceEra && currentLv >= 50;

    const cardBg = this.add.rectangle(W / 2, TOP + 70, W - 40, 120, 0x1a1a33).setStrokeStyle(2, ERA_COLORS[currentEra]).setDepth(20);
    this.contentContainer.add(cardBg);
    this.contentContainer.add(this.add.text(W / 2, TOP + 20, `${UNIT_ICONS[UNIT_TYPES.indexOf(unitType)]} ${UNIT_NAMES[unitType]}`, { fontSize: '22px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21));
    const lvLabel = inSpaceEra ? `目前時代：${ERA_NAMES[currentEra]}　　等級：${currentLv}（無上限）` : `目前時代：${ERA_NAMES[currentEra]}　　等級：${currentLv} / 50`;
    this.contentContainer.add(this.add.text(W / 2, TOP + 48, lvLabel, { fontSize: '14px', color: '#aaaacc' }).setOrigin(0.5).setDepth(21));

    const inEraLv = currentLv % 10;
    for (let i = 0; i < 10; i++) {
      this.contentContainer.add(this.add.rectangle(W / 2 - 100 + i * 22, TOP + 72, 18, 14, i < inEraLv ? 0xFFD700 : 0x222244).setStrokeStyle(1, 0x555577).setDepth(21));
    }
    const toNextLabel = isMaxLevel
      ? '已達最高等級'
      : eraIdx < 4
        ? `再升 ${10 - inEraLv} 次 → ${ERA_NAMES[ERA_ORDER[eraIdx + 1]]}`
        : '🚀 太空時代・無限升級';
    this.contentContainer.add(this.add.text(W / 2, TOP + 90, toNextLabel, { fontSize: '12px', color: '#FFD700' }).setOrigin(0.5).setDepth(21));

    const bonusRate     = 1 + currentLv * 0.03;
    const nextBonusRate = 1 + nextLv    * 0.03;
    const nextEra       = ERA_ORDER[Math.min(4, Math.floor(nextLv / 10))];
    const baseStats     = unitData.stats[currentEra];
    const nextBaseStats = unitData.stats[nextEra];
    const stats     = { hp: Math.round(baseStats.hp * bonusRate), attack: Math.round(baseStats.attack * bonusRate), speed: baseStats.speed };
    const nextStats = { hp: Math.round(nextBaseStats.hp * nextBonusRate), attack: Math.round(nextBaseStats.attack * nextBonusRate), speed: nextBaseStats.speed };
    const statY = TOP + 130;
    [['📊 當前數值', W / 2 - 160], ['📈 升級後', W / 2 + 60]].forEach(([t, x]) => this.contentContainer.add(this.add.text(x as number, statY, t as string, { fontSize: '13px', color: '#aaaaff' }).setDepth(21)));
    [['HP', stats.hp, nextStats?.hp], ['攻擊', stats.attack, nextStats?.attack], ['速度', stats.speed, nextStats?.speed]].forEach(([lbl, cur, nxt], i) => {
      const y = statY + 22 + i * 22;
      this.contentContainer.add(this.add.text(W / 2 - 180, y, lbl as string, { fontSize: '13px', color: '#888888' }).setDepth(21));
      this.contentContainer.add(this.add.text(W / 2 - 100, y, String(cur), { fontSize: '13px', color: '#ffffff' }).setDepth(21));
      this.contentContainer.add(this.add.text(W / 2 + 20, y, `→ ${nxt}`, { fontSize: '13px', color: (nxt as number) > (cur as number) ? '#88ff88' : '#aaaaaa' }).setDepth(21));
    });

    const costY = statY + 100;
    this.contentContainer.add(this.add.text(W / 2, costY, '⚡ 出兵費用（各時代固定）', { fontSize: '12px', color: '#88ffff' }).setOrigin(0.5).setDepth(21));
    UNIT_ENERGY_COST[unitType].forEach((cost, i) => {
      const cx = W / 2 - 200 + i * 100;
      this.contentContainer.add(this.add.text(cx, costY + 20, ERA_NAMES[ERA_ORDER[i]].charAt(0), { fontSize: '11px', color: '#888888' }).setOrigin(0.5).setDepth(21));
      this.contentContainer.add(this.add.text(cx, costY + 36, `⚡${cost}`, { fontSize: '13px', color: '#aaddff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(21));
    });

    const canAfford = !isMaxLevel && !!nextUpgrade && this.playerSave.gold >= nextUpgradeCost;
    const btnY = GAME_HEIGHT - 50;
    const btnBg = this.add.rectangle(W / 2, btnY, W - 60, 52, canAfford ? 0xcc9900 : 0x444444).setStrokeStyle(2, 0xffffff).setDepth(21).setInteractive({ useHandCursor: canAfford });
    this.contentContainer.add(btnBg);
    this.contentContainer.add(this.add.text(W / 2, btnY - 8, isMaxLevel ? '已達最高等級' : `⬆ 升級到 Lv.${nextLv}`, { fontSize: '16px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22));
    this.contentContainer.add(this.add.text(W / 2, btnY + 12, isMaxLevel ? '' : `💰 ${nextUpgradeCost} 金幣`, { fontSize: '13px', color: canAfford ? '#FFD700' : '#888888' }).setOrigin(0.5).setDepth(22));

    if (canAfford && nextUpgrade) {
      btnBg.on('pointerdown', () => {
        const updated = SaveManager.saveUnitUpgrade(this.playerSave, unitType, nextUpgradeCost);
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
  // 主基地升級
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

    const cardW   = Math.floor((W - 80) / 3);
    const cardH   = 310;
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
      lv: capLv, maxLv: 19, cost: nextCap?.cost ?? 0,
      stat: 'energyCap', color: 0x1a2a3a, strokeColor: 0x44aaff,
    });

    const curReg  = BASE_REGEN_UPGRADES.find(l => l.level === regLv)!;
    const nextReg = BASE_REGEN_UPGRADES.find(l => l.level === regLv + 1);
    cards.push({
      icon: '🔄', title: '能量回速', subtitle: '每升一級 +0.2 能量/秒',
      currentVal: `${curReg.regenPerSec.toFixed(1)}/秒`,
      nextVal: nextReg ? `${nextReg.regenPerSec.toFixed(1)}/秒` : '—',
      lv: regLv, maxLv: 50, cost: nextReg?.cost ?? 0,
      stat: 'regen', color: 0x152a15, strokeColor: 0x44ff88,
    });

    cards.forEach((card, ci) => {
      const cx = 40 + cardW / 2 + ci * (cardW + 20);
      const isMax     = card.lv >= card.maxLv;
      const canAfford = !isMax && this.playerSave.gold >= card.cost;

      const cardBg = this.add.rectangle(cx, cardY, cardW, cardH, card.color)
        .setStrokeStyle(2, isMax ? 0x888888 : card.strokeColor).setDepth(21);
      this.contentContainer.add(cardBg);

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

      this.contentContainer.add(
        this.add.rectangle(cx, cardY - cardH / 2 + 108, cardW - 20, 1, 0x333355).setDepth(22)
      );

      this.contentContainer.add(
        this.add.text(cx, cardY - cardH / 2 + 124, '目前', {
          fontSize: '11px', color: '#666688',
        }).setOrigin(0.5).setDepth(22)
      );
      this.contentContainer.add(
        this.add.text(cx, cardY - cardH / 2 + 148, card.currentVal, {
          fontSize: '15px', color: '#ffffff', align: 'center',
        }).setOrigin(0.5).setDepth(22)
      );

      if (!isMax) {
        this.contentContainer.add(
          this.add.text(cx, cardY - cardH / 2 + 186, '↓ 升級後', {
            fontSize: '11px', color: '#666688',
          }).setOrigin(0.5).setDepth(22)
        );
        this.contentContainer.add(
          this.add.text(cx, cardY - cardH / 2 + 210, card.nextVal, {
            fontSize: '15px', color: '#aaffaa', align: 'center',
          }).setOrigin(0.5).setDepth(22)
        );
      } else {
        this.contentContainer.add(
          this.add.text(cx, cardY - cardH / 2 + 196, '✅ 已達最高等級', {
            fontSize: '13px', color: '#FFD700', align: 'center',
          }).setOrigin(0.5).setDepth(22)
        );
      }

      const btnY   = cardY + cardH / 2 - 28;
      const btnBg  = this.add.rectangle(cx, btnY, cardW - 20, 40,
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

    // ── 重置紀錄按鈕 ─────────────────────────────────────────
    const resetY = GAME_HEIGHT - 44;
    // 紅色警示背景
    const resetBg = this.add.rectangle(W / 2, resetY, 320, 44, 0x550000)
      .setStrokeStyle(2, 0xff3333)
      .setDepth(21)
      .setInteractive({ useHandCursor: true });
    this.contentContainer.add(resetBg);
    this.contentContainer.add(
      this.add.text(W / 2, resetY - 8, '⚠  重置所有紀錄', {
        fontSize: '15px', color: '#ff6666', fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(22)
    );
    this.contentContainer.add(
      this.add.text(W / 2, resetY + 10, '清除金幣、升級、進度（不可復原）', {
        fontSize: '11px', color: '#aa4444',
      }).setOrigin(0.5).setDepth(22)
    );
    resetBg.on('pointerdown', () => this.showResetConfirmDialog());
    resetBg.on('pointerover',  () => resetBg.setFillStyle(0x880000));
    resetBg.on('pointerout',   () => resetBg.setFillStyle(0x550000));
  }

  // ─────────────────────────────────────────────────────────
  // 重置確認對話框（全螢幕遮罩）
  // ─────────────────────────────────────────────────────────
  private showResetConfirmDialog(): void {
    if (this.resetDialogContainer) return; // 防止重複開啟

    const W = GAME_WIDTH, H = GAME_HEIGHT;
    const dlg = this.add.container(0, 0).setDepth(200);
    this.resetDialogContainer = dlg;

    // 半透明遮罩
    dlg.add(this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.78));

    // 警示框
    dlg.add(this.add.rectangle(W / 2, H / 2, 520, 280, 0x1a0000)
      .setStrokeStyle(3, 0xff3333));

    // 警示文字
    dlg.add(this.add.text(W / 2, H / 2 - 100, '⚠  警告  ⚠', {
      fontSize: '28px', color: '#ff3333', fontStyle: 'bold',
    }).setOrigin(0.5));

    dlg.add(this.add.text(W / 2, H / 2 - 50,
      '這將清除所有升級紀錄\n包含金幣、兵種升級、基地升級\n\n此操作無法復原！', {
        fontSize: '15px', color: '#ffaaaa', align: 'center',
      }).setOrigin(0.5));

    // 取消按鈕
    const cancelBg = this.add.rectangle(W / 2 - 110, H / 2 + 90, 180, 50, 0x333333)
      .setStrokeStyle(2, 0xaaaaaa)
      .setInteractive({ useHandCursor: true });
    cancelBg.on('pointerdown', () => {
      dlg.destroy();
      this.resetDialogContainer = null;
    });
    cancelBg.on('pointerover',  () => cancelBg.setFillStyle(0x555555));
    cancelBg.on('pointerout',   () => cancelBg.setFillStyle(0x333333));
    dlg.add(cancelBg);
    dlg.add(this.add.text(W / 2 - 110, H / 2 + 90, '取消', {
      fontSize: '16px', color: '#cccccc',
    }).setOrigin(0.5));

    // 確認重置按鈕（明顯紅色）
    const confirmBg = this.add.rectangle(W / 2 + 110, H / 2 + 90, 180, 50, 0x880000)
      .setStrokeStyle(2, 0xff3333)
      .setInteractive({ useHandCursor: true });
    confirmBg.on('pointerdown', () => {
      SaveManager.reset();
      this.playerSave = SaveManager.load();
      dlg.destroy();
      this.resetDialogContainer = null;
      this.goldText.setText(`💰 ${this.playerSave.gold}`);
      this.renderContent();
    });
    confirmBg.on('pointerover',  () => confirmBg.setFillStyle(0xcc0000));
    confirmBg.on('pointerout',   () => confirmBg.setFillStyle(0x880000));
    dlg.add(confirmBg);
    dlg.add(this.add.text(W / 2 + 110, H / 2 + 90, '確認重置', {
      fontSize: '16px', color: '#ffffff', fontStyle: 'bold',
    }).setOrigin(0.5));
  }
}
