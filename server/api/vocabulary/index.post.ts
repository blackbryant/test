import { getDatabase, saveDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = await getDatabase()
  const body = await readBody(event)

  db.run(`
    INSERT INTO vocabulary (key, name, options, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `, [body.key, body.name, JSON.stringify(body.options)])

  const result = db.exec('SELECT last_insert_rowid() as id')
  const id = result[0].values[0][0]

  saveDatabase()

  return {
    id,
    ...body
  }
})
