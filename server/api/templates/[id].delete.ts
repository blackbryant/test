import { getDatabase } from '~/server/database/db'

export default defineEventHandler((event) => {
  const db = getDatabase()
  const id = getRouterParam(event, 'id')

  const stmt = db.prepare('DELETE FROM templates WHERE id = ?')
  stmt.run(id)

  return { success: true }
})
