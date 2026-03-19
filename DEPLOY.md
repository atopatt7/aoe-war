# 🚀 跨時代戰爭 — 部署指南

## 第一步：上傳到 GitHub

在你的電腦終端機執行（進入專案資料夾後）：

```bash
# 1. 安裝依賴
npm install

# 2. 初始化 Git
git init
git branch -m main
git add -A
git commit -m "feat: 跨時代戰爭橫向塔防遊戲"

# 3. 建立 GitHub Repo（需先登入 GitHub）
#    方法A：用 GitHub CLI
gh repo create aoe-war --public --push --source .

#    方法B：手動
#    → 去 https://github.com/new 建立 aoe-war repo
#    → 複製 repo URL 後執行：
git remote add origin https://github.com/你的帳號/aoe-war.git
git push -u origin main
```

---

## 第二步：部署到 Vercel（免費，一鍵）

### 方法A：Vercel CLI（最快）
```bash
npm install -g vercel
vercel --prod
```
照著提示登入 → 選你的 GitHub repo → 自動部署完成。

### 方法B：Vercel 網頁（最簡單）
1. 前往 **https://vercel.com/new**
2. 登入後選「Import Git Repository」
3. 選你的 `aoe-war` repo
4. Framework 會自動偵測為 **Next.js**
5. 點「Deploy」→ 等 2-3 分鐘完成
6. 取得類似 `https://aoe-war.vercel.app` 的網址

### Vercel 設定（已在 vercel.json 預設好）
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next"
}
```
**不需要任何額外設定！**

---

## 第三步：本地開發

```bash
npm install
npm run dev
# 打開 http://localhost:3000
```

---

## 專案結構
```
aoe-war/
├── src/
│   ├── data/           ← 所有遊戲數值 JSON（可直接修改）
│   │   ├── units.json
│   │   ├── levels.json
│   │   ├── upgrades.json
│   │   └── base.json
│   ├── game/
│   │   ├── GameConfig.ts
│   │   ├── scenes/     ← Phaser Scenes
│   │   └── managers/   ← 5個遊戲系統模組
│   ├── pages/          ← Next.js 頁面 + API
│   └── types/          ← TypeScript 型別定義
└── vercel.json         ← Vercel 部署設定
```
