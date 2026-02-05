import { getDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)

  const stmt = db.prepare(`
    INSERT INTO templates (category, name, content, created_at, updated_at)
    VALUES (?, ?, ?, datetime('now'), datetime('now'))
  `)

  const result = stmt.run(body.category, body.name, body.content)

  return {
    id: result.lastInsertRowid,
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
})
