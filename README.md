# Nano Banana Studio

AI 圖片生成平台 - 使用提示詞樣板快速生成創意圖片

## 技術棧

- **框架**: Nuxt 4.2.1 (Nitro 2.12.9, Vite 7.2.2, Vue 3.5.24)
- **UI 庫**: Element Plus + Tailwind CSS
- **資料庫**: SQLite 3
- **語言**: 中文 / English 雙語支援

## 功能特色

- 📝 提示詞樣板管理（分類：一般、企劃、採購、業務、生產）
- 🎨 詞庫設定系統
- 🤖 Gemini API 整合
- 📊 歷史紀錄追蹤
- 🌐 中英雙語介面

## 快速開始

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

應用程式將運行在 http://localhost:3000

### 建置生產版本

```bash
npm run build
npm run preview
```

## 專案結構

```
nano-banana-studio/
├── assets/          # 靜態資源 (CSS, SCSS)
├── components/      # Vue 組件
├── composables/     # 組合式函數
├── layouts/         # 頁面布局
├── locales/         # i18n 語言檔
├── pages/           # 頁面路由
├── public/          # 公開靜態檔案
├── server/          # API 端點與資料庫
│   ├── api/         # API 路由
│   └── database/    # SQLite 設定
└── types/           # TypeScript 型別定義
```

## API 端點

- `GET /api/templates` - 取得所有樣板
- `POST /api/templates` - 新增樣板
- `PUT /api/templates/:id` - 更新樣板
- `DELETE /api/templates/:id` - 刪除樣板
- `GET /api/vocabulary` - 取得詞庫
- `POST /api/vocabulary` - 新增詞庫項目
- `GET /api/history` - 取得生成歷史
- `POST /api/history` - 新增生成紀錄

## License

MIT
