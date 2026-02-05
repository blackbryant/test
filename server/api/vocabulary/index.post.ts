import { getDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)

  const stmt = db.prepare(`
    INSERT INTO vocabulary (key, name, options, created_at)
    VALUES (?, ?, ?, datetime('now'))
  `)

  const result = stmt.run(
    body.key,
    body.name,
    JSON.stringify(body.options)
  )

  return {
    id: result.lastInsertRowid,
    ...body
  }
})
