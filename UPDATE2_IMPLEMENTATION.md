# Update 2 功能實現說明

## 已完成功能 (2026/02/09)

### 1. ✅ 樣板圖片刪除功能

**位置**: 左側提示詞樣板區

**功能描述**:
- 使用者可以在編輯樣板時刪除已上傳的圖片
- 點擊圖片預覽卡片上的 ❌ 按鈕即可刪除
- 刪除的圖片會從樣板資料結構中移除
- 保存樣板時會更新到資料庫

**實現位置**:
- `components/TemplatePanel.vue` - `handleImageRemove()` 函數
- Element Plus Upload 組件的 `on-remove` 事件

---

### 2. ✅ 詞庫設定區顯示/隱藏功能

**位置**: 右下角懸浮按鈕

**功能描述**:
- 新增右下角懸浮按鈕，可切換詞庫設定區的顯示狀態
- 詞庫面板隱藏時，工作區會自動擴展填充空間（從 6 欄擴展到 9 欄）
- 狀態會保存在 localStorage，重新載入頁面時保持上次的設定
- 具有流暢的滑入滑出動畫效果

**實現位置**:
- `pages/index.vue` - `showVocabularyPanel` 狀態管理
- 右下角懸浮圓形按鈕
- CSS 過渡動畫 `.slide-fade-enter-active`

**使用方式**:
1. 點擊右下角圓形按鈕切換顯示/隱藏
2. 眼睛圖標表示當前狀態（View = 顯示，Hide = 隱藏）
3. 按鈕顏色：藍色（primary）= 顯示中，灰色（default）= 已隱藏

---

### 3. ✅ 預設資料載入控制

**位置**: 資料庫初始化邏輯

**功能描述**:
- 提供環境變數 `LOAD_DEFAULT_DATA` 控制是否載入預設資料
- 開發環境：設定為 `true`（預設），會載入預設樣板和詞庫
- 正式環境：設定為 `false`，不載入預設資料
- 適用於空資料庫首次初始化時

**實現位置**:
- `server/database/db.ts` - `initTables()` 函數
- `.env.example` - 環境變數範例檔案

**環境變數設定**:
```bash
# 開發環境：載入預設資料
LOAD_DEFAULT_DATA=true

# 正式環境：不載入預設資料
LOAD_DEFAULT_DATA=false
```

**使用方式**:
1. 複製 `.env.example` 為 `.env`
2. 修改 `LOAD_DEFAULT_DATA` 的值
3. 重新啟動應用程式

**說明**:
- 只在資料表為空時才會檢查此設定
- 如果資料庫已有資料，此設定不會影響現有資料
- 適合用於測試環境快速建立範例資料，正式環境保持資料庫清空

---

## 技術細節

### 資料庫初始化邏輯
```typescript
// 檢查環境變數
const shouldLoadDefaults = process.env.LOAD_DEFAULT_DATA !== 'false'

// 只在表為空且允許載入時才插入
if (templateCount === 0 && shouldLoadDefaults) {
  // 插入預設樣板...
}
```

### 詞庫面板控制
```typescript
// 狀態管理
const showVocabularyPanel = ref(true)

// 動態調整工作區寬度
:class="showVocabularyPanel ? 'md:col-span-6' : 'md:col-span-9'"

// 保存狀態
localStorage.setItem('showVocabularyPanel', String(showVocabularyPanel.value))
```

### 圖片刪除處理
```typescript
const handleImageRemove = (file: UploadUserFile) => {
  // 從樣板 images 陣列中移除
  const index = editingTemplate.value.images.indexOf(file.url)
  if (index > -1) {
    editingTemplate.value.images.splice(index, 1)
  }
  
  // 從上傳列表中移除
  uploadedImages.value = uploadedImages.value.filter(img => img.uid !== file.uid)
}
```

---

## 測試建議

1. **圖片刪除測試**:
   - 編輯有圖片的樣板
   - 刪除其中一張或多張圖片
   - 保存並重新載入，確認圖片已移除

2. **詞庫面板切換測試**:
   - 點擊右下角按鈕切換顯示/隱藏
   - 檢查工作區是否自動調整寬度
   - 重新載入頁面，確認狀態保持

3. **環境變數測試**:
   - 刪除 `data/nano-banana.sqlite` 檔案
   - 設定 `LOAD_DEFAULT_DATA=true`，啟動應用
   - 確認有預設資料
   - 刪除資料庫，設定 `LOAD_DEFAULT_DATA=false`，啟動應用
   - 確認資料庫為空

---

## 版本記錄

- **2026/02/09**: 完成 Update2.md 所有需求
  - 樣板圖片刪除功能
  - 詞庫設定區顯示/隱藏
  - 預設資料載入控制
