import { getDatabase } from '~/server/database/db'

export default defineEventHandler((event) => {
  const db = getDatabase()
  
  const categories = db.prepare('SELECT * FROM categories ORDER BY id').all()

  return categories.map(row => ({
    id: row.id,
    name: row.name,
    color: row.color,
    icon: row.icon
  }))
})
