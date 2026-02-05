import { getDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)

  const stmt = db.prepare(`
    INSERT INTO history (prompt, image_url, timestamp)
    VALUES (?, ?, datetime('now'))
  `)

  const result = stmt.run(body.prompt, body.imageUrl)

  return {
    id: result.lastInsertRowid,
    ...body,
    timestamp: new Date().toISOString()
  }
})
