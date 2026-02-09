import { getDatabase, saveDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = await getDatabase()
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  db.run(`
    UPDATE vocabulary
    SET key = ?, name = ?, options = ?
    WHERE id = ?
  `, [body.key, body.name, JSON.stringify(body.options), id])

  saveDatabase()

  return {
    id: Number(id),
    ...body
  }
})
