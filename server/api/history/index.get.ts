import { getDatabase } from '~/server/database/db'

export default defineEventHandler(async (event) => {
  const db = await getDatabase()
  
  const result = db.exec('SELECT * FROM history ORDER BY timestamp DESC LIMIT 10')
  
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
      prompt: obj.prompt,
      imageUrl: obj.image_url,
      timestamp: obj.timestamp
    }
  })
})
