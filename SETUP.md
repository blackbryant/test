# 安裝指令與開發說明

## 步驟 1: 安裝依賴

在專案根目錄執行：

```powershell
npm install
```

## 步驟 2: 啟動開發伺服器

```powershell
npm run dev
```

應用程式將在 http://localhost:3000 運行

## 步驟 3: 建置生產版本

```powershell
npm run build
npm run preview
```

## 專案功能

✅ 三欄式布局（樣板區、作業區、詞庫區）
✅ 提示詞樣板管理（新增、編輯、刪除、分類）
✅ 詞庫系統（動態下拉選單）
✅ Gemini & ChatGPT 整合連結
✅ 歷史紀錄追蹤（LocalStorage + SQLite）
✅ 中英雙語支援
✅ 響應式設計
✅ Element Plus UI 組件
✅ SQLite 資料庫持久化

## 資料庫結構

- templates: 提示詞樣板
- vocabulary: 詞庫選項
- history: 生成歷史
- categories: 分類管理
- api_settings: API 設定

## 技術亮點

- Nuxt 4.2.1 完整生態系統
- Vue 3.5.24 Composition API
- Element Plus 美觀 UI
- Tailwind CSS 快速樣式
- better-sqlite3 本地資料庫
- TypeScript 型別安全

## 下一步開發建議

1. 整合真實的 AI 圖片生成 API（如 DALL-E, Midjourney, Stable Diffusion）
2. 加入用戶認證系統
3. 實作圖片上傳與管理
4. 增加更多樣板分類
5. 加入團隊協作功能
