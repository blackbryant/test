# Nano Banana Studio - 專案結構完整說明

## 📁 專案架構

```
f:\test\
├── 📄 package.json              # 專案依賴與腳本
├── 📄 nuxt.config.ts            # Nuxt 4.2.1 配置檔
├── 📄 tailwind.config.js        # Tailwind CSS 配置
├── 📄 tsconfig.json             # TypeScript 配置
├── 📄 README.md                 # 專案說明
├── 📄 SETUP.md                  # 安裝與開發指引
├── 📄 .gitignore                # Git 忽略檔案
├── 📄 .env.example              # 環境變數範例
│
├── 📁 assets/                   # 靜態資源
│   ├── css/
│   │   ├── main.css            # 主要樣式
│   │   └── tailwind.css        # Tailwind 導入
│   └── scss/
│       └── element-variables.scss  # Element Plus 主題變數
│
├── 📁 components/               # Vue 組件
│   ├── TemplatePanel.vue       # 左側：提示詞樣板區
│   ├── WorkspacePanel.vue      # 中間：核心作業區
│   └── VocabularyPanel.vue     # 右側：詞庫設定區
│
├── 📁 pages/                    # 頁面路由
│   └── index.vue               # 首頁（三欄布局）
│
├── 📁 layouts/                  # 頁面布局（可擴展）
│
├── 📁 locales/                  # 國際化語言檔
│   ├── zh-TW.json              # 繁體中文
│   └── en-US.json              # 英文
│
├── 📁 types/                    # TypeScript 型別定義
│   └── index.ts                # 共用型別
│
├── 📁 server/                   # 後端 API
│   ├── database/
│   │   └── db.ts               # SQLite 資料庫設定
│   └── api/
│       ├── templates/          # 樣板 API
│       │   ├── index.get.ts    # 取得所有樣板
│       │   ├── index.post.ts   # 新增樣板
│       │   ├── [id].put.ts     # 更新樣板
│       │   └── [id].delete.ts  # 刪除樣板
│       ├── vocabulary/         # 詞庫 API
│       │   ├── index.get.ts    # 取得所有詞庫
│       │   ├── index.post.ts   # 新增詞庫
│       │   ├── [id].put.ts     # 更新詞庫
│       │   └── [id].delete.ts  # 刪除詞庫
│       ├── history/            # 歷史紀錄 API
│       │   ├── index.get.ts    # 取得歷史
│       │   └── index.post.ts   # 新增歷史
│       └── categories/         # 分類 API
│           └── index.get.ts    # 取得分類
│
├── 📁 data/                     # 資料庫檔案（自動生成）
│   └── nano-banana.sqlite      # SQLite 資料庫
│
└── 📁 public/                   # 公開靜態檔案

```

## 🎨 核心功能模組

### 1. **左側 - 提示詞樣板區** (`TemplatePanel.vue`)
- ✅ 分類管理（一般、企劃、採購、業務、生產）
- ✅ 樣板列表顯示與篩選
- ✅ 新增/編輯/刪除樣板
- ✅ 分類設定對話框
- ✅ Gemini API Key 設定
- ✅ 樣板內容使用 `**{key}**` 標記參數

### 2. **中間 - 核心作業區** (`WorkspacePanel.vue`)
- ✅ 動態提示詞輸入（樣板 + 詞庫下拉選單）
- ✅ 主要敘述文字框
- ✅ 提示詞預覽與複製功能
- ✅ 生成按鈕（模擬生成圖片）
- ✅ 生成結果顯示
- ✅ 歷史紀錄橫向縮圖（最近 5 筆）
- ✅ 連結到 Gemini / ChatGPT

### 3. **右側 - 詞庫設定區** (`VocabularyPanel.vue`)
- ✅ 詞庫列表顯示
- ✅ 新增/編輯/刪除詞庫
- ✅ 管理詞庫選項（新增/刪除）
- ✅ 可愛圓角設計
- ✅ Key-Value 資料結構

## 🗄️ 資料庫結構

### Templates 表（樣板）
```sql
- id: INTEGER PRIMARY KEY
- category: TEXT (分類)
- name: TEXT (樣板名稱)
- content: TEXT (樣板內容)
- created_at: TEXT (建立時間)
- updated_at: TEXT (更新時間)
```

### Vocabulary 表（詞庫）
```sql
- id: INTEGER PRIMARY KEY
- key: TEXT UNIQUE (鍵值，如 style, subject)
- name: TEXT (顯示名稱)
- options: TEXT (JSON 陣列，儲存選項)
- created_at: TEXT
```

### History 表（歷史紀錄）
```sql
- id: INTEGER PRIMARY KEY
- prompt: TEXT (提示詞)
- image_url: TEXT (圖片 URL)
- timestamp: TEXT (時間戳記)
```

### Categories 表（分類）
```sql
- id: INTEGER PRIMARY KEY
- name: TEXT (分類名稱)
- color: TEXT (顏色代碼)
- icon: TEXT (圖示，可選)
```

## 🔧 技術特色

1. **Nuxt 4.2.1 完整生態**
   - Nitro 2.12.9 伺服器引擎
   - Vite 7.2.2 快速建置
   - Vue 3.5.24 Composition API

2. **Element Plus UI 庫**
   - 企業級組件
   - 圓潤可愛風格自訂
   - 完整表單與對話框

3. **Tailwind CSS**
   - Grid 系統佈局
   - 快速樣式撰寫
   - 響應式設計

4. **SQLite3 本地資料庫**
   - better-sqlite3 高效能
   - 無需額外伺服器
   - 自動初始化與預設資料

5. **i18n 雙語支援**
   - 繁體中文 / English
   - Cookie 儲存偏好
   - 動態切換

6. **LocalStorage + 資料庫雙重儲存**
   - 歷史紀錄即時存取
   - 資料持久化
   - 離線可用

## 🚀 快速開始

### 安裝依賴
```powershell
npm install
```

### 開發模式
```powershell
npm run dev
```
訪問: http://localhost:3000

### 建置生產版本
```powershell
npm run build
npm run preview
```

## 📝 使用流程

1. **選擇樣板**
   - 從左側選擇分類
   - 點擊樣板載入到中間區域

2. **填寫提示詞**
   - 樣板參數自動轉換為下拉選單（使用右側詞庫）
   - 填寫主要敘述

3. **預覽與生成**
   - 查看完整提示詞
   - 點擊「開始生成」
   - 查看生成結果

4. **管理詞庫**
   - 右側新增/編輯詞庫
   - 詞庫 Key 對應樣板中的 `{key}`

5. **歷史紀錄**
   - 查看最近 5 筆生成
   - 點擊縮圖重新載入

## 🎯 預設資料

### 預設樣板
- 基礎圖片生成（一般）
- 產品概念圖（企劃）
- 簡報封面（業務）

### 預設詞庫
- style（風格）: 寫實、卡通、油畫等
- subject（主題）: 風景、人物、動物等
- product（產品）: 手機、筆電、家具等
- feature（特徵）: 科技感、簡約、華麗等
- theme（主題）: 商業、科技、教育等
- color（色調）: 藍色、綠色、紅色等

## 🔗 API 端點

| 方法 | 路徑 | 說明 |
|------|------|------|
| GET | /api/templates | 取得所有樣板 |
| POST | /api/templates | 新增樣板 |
| PUT | /api/templates/:id | 更新樣板 |
| DELETE | /api/templates/:id | 刪除樣板 |
| GET | /api/vocabulary | 取得所有詞庫 |
| POST | /api/vocabulary | 新增詞庫 |
| PUT | /api/vocabulary/:id | 更新詞庫 |
| DELETE | /api/vocabulary/:id | 刪除詞庫 |
| GET | /api/history | 取得歷史紀錄 |
| POST | /api/history | 新增歷史紀錄 |
| GET | /api/categories | 取得分類 |

## 🎨 設計風格

- **主色調**: 企業藍 (#409eff, #3b82f6)
- **背景**: 漸層紫色
- **卡片**: 白色背景，圓角 15px
- **邊框**: 虛線邊框（詞庫區）
- **標籤**: 橢圓形標籤
- **動畫**: 滑入、淡入、懸停效果

## 📦 下一步擴展

1. **整合真實 AI API**
   - DALL-E 3
   - Midjourney
   - Stable Diffusion

2. **用戶系統**
   - 註冊/登入
   - 個人樣板庫
   - 團隊協作

3. **進階功能**
   - 批次生成
   - 圖片編輯
   - 版本控制
   - 樣板市場

4. **效能優化**
   - 圖片 CDN
   - 快取機制
   - 懶載入

## 📄 授權

MIT License

---

🎉 **專案已完整建置，所有功能均已實作！**
