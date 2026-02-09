import { getDatabase, saveDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = await getDatabase()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const images = body.images ? JSON.stringify(body.images) : null

  db.run(`
    UPDATE templates
    SET category = ?, name = ?, content = ?, images = ?, updated_at = datetime('now')
    WHERE id = ?
  `, [body.category, body.name, body.content, images, id])

  saveDatabase()

  return {
    id: Number(id),
    ...body,
    updatedAt: new Date().toISOString()
  }
})
