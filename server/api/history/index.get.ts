import { getDatabase } from '~/server/database/db'

export default defineEventHandler((event) => {
  const db = getDatabase()
  
  const history = db.prepare(`
    SELECT * FROM history ORDER BY timestamp DESC LIMIT 10
  `).all()

  return history.map(row => ({
    id: row.id,
    prompt: row.prompt,
    imageUrl: row.image_url,
    timestamp: row.timestamp
  }))
})
