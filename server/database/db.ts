import Database from 'better-sqlite3'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'

let db: Database.Database | null = null

export function getDatabase() {
  if (db) return db

  // 確保資料目錄存在
  const dataDir = join(process.cwd(), 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = join(dataDir, 'nano-banana.sqlite')
  db = new Database(dbPath)

  // 啟用外鍵支援
  db.pragma('foreign_keys = ON')

  // 初始化資料表
  initTables(db)

  return db
}

function initTables(db: Database.Database) {
  // 分類表
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      icon TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 樣板表
  db.exec(`
    CREATE TABLE IF NOT EXISTS templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      images TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 詞庫表
  db.exec(`
    CREATE TABLE IF NOT EXISTS vocabulary (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      options TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 生成歷史表
  db.exec(`
    CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      prompt TEXT NOT NULL,
      image_url TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // API 設定表
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      gemini_api_key TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // 插入預設數據（如果表為空）
  const templateCount = db.prepare('SELECT COUNT(*) as count FROM templates').get() as { count: number }
  
  if (templateCount.count === 0) {
    // 插入預設樣板
    const insertTemplate = db.prepare(`
      INSERT INTO templates (category, name, content, images, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `)

    // 一般分類
    insertTemplate.run('一般', '基礎圖片生成', '生成一張 **{style}** 風格的圖片，主題是 **{subject}**，畫面要清晰明亮', null)
    insertTemplate.run('一般', '藝術創作', '創作一幅 **{style}** 風格的藝術作品，描繪 **{subject}**，充滿創意與想像力', null)
    insertTemplate.run('一般', '場景設計', '設計一個 **{subject}** 場景，採用 **{style}** 風格，氛圍要 **{mood}**', null)
    
    // 企劃分類
    insertTemplate.run('企劃', '產品概念圖', '為 **{product}** 設計一個 **{style}** 風格的概念圖，突出 **{feature}** 特色，適合提案使用', null)
    insertTemplate.run('企劃', '品牌視覺', '設計 **{product}** 的品牌視覺形象，風格為 **{style}**，傳達 **{feature}** 的品牌理念', null)
    insertTemplate.run('企劃', '使用情境圖', '展示 **{product}** 的使用情境，場景為 **{scene}**，氛圍 **{mood}**，真實自然', null)
    
    // 採購分類
    insertTemplate.run('採購', '產品型錄圖', '製作 **{product}** 的產品型錄圖片，背景為 **{background}**，專業商業攝影風格', null)
    insertTemplate.run('採購', '供應商簡報', '製作供應商簡報用圖，展示 **{product}**，風格 **{style}**，突出品質與價值', null)
    insertTemplate.run('採購', '比價分析圖', '設計產品比較圖表，比較 **{product}** 的不同款式，清晰易懂的信息圖表風格', null)
    
    // 業務分類
    insertTemplate.run('業務', '簡報封面', '製作一張專業的 **{theme}** 主題簡報封面，色調為 **{color}**，具有商業感與專業度', null)
    insertTemplate.run('業務', '客戶提案圖', '為 **{theme}** 產業製作客戶提案用圖，風格 **{style}**，傳達專業與信任感', null)
    insertTemplate.run('業務', '成功案例展示', '展示 **{theme}** 領域的成功案例，採用 **{style}** 風格，激勵人心', null)
    insertTemplate.run('業務', '數據視覺化', '將 **{theme}** 的數據製作成視覺化圖表，採用 **{color}** 配色，清晰專業', null)
    
    // 生產分類
    insertTemplate.run('生產', '製程說明圖', '展示 **{product}** 的生產製程，風格為 **{style}**，清楚標示各個步驟', null)
    insertTemplate.run('生產', '品質檢驗圖', '製作品質檢驗標準圖，檢驗項目為 **{feature}**，專業技術插圖風格', null)
    insertTemplate.run('生產', '工廠環境圖', '呈現 **{product}** 生產線的工廠環境，氛圍 **{mood}**，整潔有序的現代化工廠', null)
    insertTemplate.run('生產', '安全作業圖', '製作安全作業指導圖，說明 **{product}** 的安全操作流程，清晰的示意圖風格', null)
  }

  const vocabCount = db.prepare('SELECT COUNT(*) as count FROM vocabulary').get() as { count: number }
  
  if (vocabCount.count === 0) {
    // 插入預設詞庫
    const insertVocab = db.prepare(`
      INSERT INTO vocabulary (key, name, options, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `)

    insertVocab.run('style', '風格', JSON.stringify(['寫實', '卡通', '油畫', '水彩', '素描', '3D渲染', '扁平化', '賽博龐克', '蒸氣波', '極簡主義', '復古', '未來科技']))
    insertVocab.run('subject', '主題', JSON.stringify(['風景', '人物', '動物', '建築', '抽象', '科技', '自然', '城市', '太空', '海洋', '森林', '山脈']))
    insertVocab.run('product', '產品', JSON.stringify(['手機', '筆電', '家具', '服飾', '飲料', '汽車', '家電', '配件', '文具', '玩具', '運動器材', '智慧裝置']))
    insertVocab.run('feature', '特徵', JSON.stringify(['科技感', '簡約', '華麗', '環保', '創新', '傳統', '時尚', '實用', '高級', '親民', '專業', '溫暖']))
    insertVocab.run('theme', '主題', JSON.stringify(['商業', '科技', '教育', '醫療', '金融', '娛樂', '環保', '創新', '數位轉型', '永續發展', '團隊合作', '成長']))
    insertVocab.run('color', '色調', JSON.stringify(['藍色', '綠色', '紅色', '黃色', '紫色', '黑白', '粉色', '橘色', '青色', '暖色調', '冷色調', '莫蘭迪色']))
    insertVocab.run('mood', '氛圍', JSON.stringify(['溫暖', '冷峻', '活潑', '沉穩', '夢幻', '神秘', '歡樂', '寧靜', '緊張', '放鬆', '專業', '親切']))
    insertVocab.run('scene', '場景', JSON.stringify(['辦公室', '家庭', '戶外', '咖啡廳', '工廠', '實驗室', '商場', '公園', '海邊', '山區', '城市街道', '室內空間']))
    insertVocab.run('background', '背景', JSON.stringify(['純色背景', '漸層背景', '木質紋理', '大理石', '科技網格', '自然光', '工作室燈光', '戶外場景', '虛化背景', '幾何圖形']))
  }

  console.log('✅ 資料庫初始化完成')
}

export function closeDatabase() {
  if (db) {
    db.close()
    db = null
  }
}
