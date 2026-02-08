import { getDatabase } from '~/server/database/db'

export default defineEventHandler((event) => {
  const db = getDatabase()
  
  const templates = db.prepare(`
    SELECT * FROM templates ORDER BY updated_at DESC
  `).all()

  return templates.map((row: any) => ({
    id: row.id,
    category: row.category,
    name: row.name,
    content: row.content,
    images: row.images ? JSON.parse(row.images) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }))
})
