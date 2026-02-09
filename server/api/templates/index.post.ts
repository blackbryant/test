import { getDatabase, saveDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = await getDatabase()
  const body = await readBody(event)

  const images = body.images ? JSON.stringify(body.images) : null

  db.run(`
    INSERT INTO templates (category, name, content, images, created_at, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
  `, [body.category, body.name, body.content, images])

  const result = db.exec('SELECT last_insert_rowid() as id')
  const id = result[0].values[0][0]

  saveDatabase()

  return {
    id,
    ...body,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
})
