import { getDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = await getDatabase()
  
  const result = db.exec('SELECT * FROM templates ORDER BY updated_at DESC')
  
  if (result.length === 0 || !result[0].values.length) {
    return []
  }

  const columns = result[0].columns
  const values = result[0].values

  return values.map((row: any[]) => {
    const obj: any = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return {
      id: obj.id,
      category: obj.category,
      name: obj.name,
      content: obj.content,
      images: obj.images ? JSON.parse(obj.images) : [],
      createdAt: obj.created_at,
      updatedAt: obj.updated_at
    }
  })
})
