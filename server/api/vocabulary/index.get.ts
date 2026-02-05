import { getDatabase } from '~/server/database/db'

export default defineEventHandler((event) => {
  const db = getDatabase()
  
  const vocabulary = db.prepare('SELECT * FROM vocabulary ORDER BY id').all()

  return vocabulary.map(row => ({
    id: row.id,
    key: row.key,
    name: row.name,
    options: JSON.parse(row.options)
  }))
})
