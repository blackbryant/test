import { getDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const stmt = db.prepare(`
    UPDATE templates
    SET category = ?, name = ?, content = ?, updated_at = datetime('now')
    WHERE id = ?
  `)

  stmt.run(body.category, body.name, body.content, id)

  return {
    id: Number(id),
    ...body,
    updatedAt: new Date().toISOString()
  }
})
