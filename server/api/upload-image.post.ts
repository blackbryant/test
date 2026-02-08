import { writeFile, mkdir } from 'fs/promises'
import { join, extname } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: '未找到上傳的圖片'
      })
    }

    const uploadedPaths: string[] = []
    const imagesDir = join(process.cwd(), 'data', 'images')
    
    // 確保 images 目錄存在
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }

    for (const file of formData) {
      if (file.filename && file.data) {
        // 生成唯一檔名
        const timestamp = Date.now()
        const ext = extname(file.filename)
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}${ext}`
        const filepath = join(imagesDir, filename)
        
        // 寫入檔案
        await writeFile(filepath, file.data)
        
        // 回傳 API 路徑
        uploadedPaths.push(`/api/data/images/${filename}`)
      }
    }

    return {
      success: true,
      paths: uploadedPaths
    }
  } catch (error) {
    console.error('圖片上傳失敗:', error)
    throw createError({
      statusCode: 500,
      message: '圖片上傳失敗'
    })
  }
})
