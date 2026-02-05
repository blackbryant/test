import { getDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const stmt = db.prepare(`
    UPDATE vocabulary
    SET key = ?, name = ?, options = ?
    WHERE id = ?
  `)

  stmt.run(body.key, body.name, JSON.stringify(body.options), id)

  return {
    id: Number(id),
    ...body
  }
})
