import { getDatabase, saveDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = await getDatabase()
  const id = getRouterParam(event, 'id')

  db.run('DELETE FROM vocabulary WHERE id = ?', [id])
  saveDatabase()

  return { success: true }
})
