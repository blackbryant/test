export interface Template {
  id: number
  category: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  color: string
  icon?: string
}

export interface VocabularyItem {
  id: number
  key: string
  name: string
  options: string[]
}

export interface GenerationHistory {
  id: number
  prompt: string
  imageUrl: string
  timestamp: string
}

export interface ApiSettings {
  geminiApiKey: string
}
