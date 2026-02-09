<template>
  <div class="app-container">
    <!-- 頂部標題欄 -->
    <header class="mb-6">
      <div class="bg-white rounded-xl shadow-lg p-6 flex justify-between items-center">
        <div>
          <h1 class="text-4xl font-bold text-brand-blue">
            {{ $t('app.title') }}
          </h1>
          <p class="text-gray-600 mt-2">{{ $t('app.subtitle') }}</p>
        </div>
        <div class="flex gap-4 items-center">
          <el-select v-model="currentLocale" @change="changeLocale" style="width: 120px">
            <el-option label="繁體中文" value="zh" />
            <el-option label="English" value="en" />
          </el-select>
        </div>
      </div>
    </header>

    <!-- 主要三欄布局 -->
    <div class="grid grid-cols-12 gap-6">
      <!-- 左側：提示詞樣板區 (3 columns) -->
      <div class="col-span-12 md:col-span-3">
        <TemplatePanel
          v-if="categories.length > 0"
          :categories="categories"
          :templates="templates"
          @select-template="handleSelectTemplate"
          @update-categories="loadCategories"
          @update-templates="loadTemplates"
          @add-category="handleAddCategory"
          @delete-category="handleDeleteCategory"
        />
      </div>

      <!-- 中間：核心作業區 (動態調整寬度) -->
      <div 
        class="col-span-12 transition-all duration-300"
        :class="showVocabularyPanel ? 'md:col-span-6' : 'md:col-span-9'"
      >
        <WorkspacePanel
          :selected-template="selectedTemplate"
          :vocabulary-list="vocabularyList"
          :history="generationHistory"
          @generate="handleGenerate"
        />
      </div>

      <!-- 右側：詞庫設定區 (3 columns，可隱藏) -->
      <transition name="slide-fade">
        <div 
          v-show="showVocabularyPanel"
          class="col-span-12 md:col-span-3"
        >
          <VocabularyPanel
            :vocabulary-list="vocabularyList"
            @update-vocabulary="loadVocabulary"
            @close-sidebar="toggleVocabularyPanel"
          />
        </div>
      </transition>
    </div>

    <!-- 懸浮按鈕：切換詞庫面板顯示 -->
    <el-button
      circle
      size="large"
      :type="showVocabularyPanel ? 'primary' : 'default'"
      class="fixed bottom-6 right-6 shadow-lg z-50"
      @click="toggleVocabularyPanel"
    >
      <el-icon><component :is="showVocabularyPanel ? 'Hide' : 'View'" /></el-icon>
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { View, Hide } from '@element-plus/icons-vue'
import type { Template, Category, VocabularyItem, GenerationHistory } from '~/types'

const { locale } = useI18n()
const currentLocale = ref<string>(locale.value)

// 詞庫面板顯示狀態
const showVocabularyPanel = ref(true)

// 切換詞庫面板
const toggleVocabularyPanel = () => {
  showVocabularyPanel.value = !showVocabularyPanel.value
  // 保存狀態到 localStorage
  localStorage.setItem('showVocabularyPanel', String(showVocabularyPanel.value))
}

// 分類數據
const categories = ref<Category[]>([
  { id: 0, name: '全部', color: '#909399' },
  { id: 1, name: '一般', color: '#67c23a' },
  { id: 2, name: '企劃', color: '#409eff' },
  { id: 3, name: '採購', color: '#e6a23c' },
  { id: 4, name: '業務', color: '#f56c6c' },
  { id: 5, name: '生產', color: '#909399' }
])

// 樣板數據
const templates = ref<Template[]>([])
const selectedTemplate = ref<Template | null>(null)

// 詞庫數據
const vocabularyList = ref<VocabularyItem[]>([])

// 生成歷史
const generationHistory = ref<GenerationHistory[]>([])

// 切換語言
const changeLocale = (newLocale: string) => {
  locale.value = newLocale as 'zh' | 'en'
  localStorage.setItem('locale', newLocale)
}

// 載入分類
const loadCategories = async () => {
  // 保留預設分類，不從 API 載入（因為分類是前端管理的）
  console.log('Categories loaded:', categories.value.length)
}

// 載入樣板
const loadTemplates = async () => {
  try {
    const data = await $fetch('/api/templates')
    templates.value = data as Template[]
  } catch (error) {
    console.error('Failed to load templates:', error)
    // 使用預設樣板
    templates.value = [
      {
        id: 1,
        category: '一般',
        name: '基礎圖片生成',
        content: '生成一張 **{style}** 風格的圖片，主題是 **{subject}**',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  }
}

// 載入詞庫
const loadVocabulary = async () => {
  try {
    const data = await $fetch('/api/vocabulary')
    vocabularyList.value = data as VocabularyItem[]
  } catch (error) {
    console.error('Failed to load vocabulary:', error)
    // 使用預設詞庫
    vocabularyList.value = [
      {
        id: 1,
        key: 'style',
        name: '風格',
        options: ['寫實', '卡通', '油畫', '水彩', '素描']
      },
      {
        id: 2,
        key: 'subject',
        name: '主題',
        options: ['風景', '人物', '動物', '建築', '抽象']
      }
    ]
  }
}

// 載入歷史紀錄
const loadHistory = () => {
  const stored = localStorage.getItem('generationHistory')
  if (stored) {
    generationHistory.value = JSON.parse(stored)
  }
}

// 選擇樣板
const handleSelectTemplate = (template: Template) => {
  selectedTemplate.value = template
}

// 新增分類
const handleAddCategory = (category: Category) => {
  // 檢查是否已存在同名分類
  const exists = categories.value.find(c => c.name === category.name)
  if (!exists) {
    categories.value.push(category)
    // 保存到 localStorage
    localStorage.setItem('categories', JSON.stringify(categories.value))
  }
}

// 刪除分類
const handleDeleteCategory = (categoryId: number) => {
  const index = categories.value.findIndex(c => c.id === categoryId)
  if (index > -1) {
    categories.value.splice(index, 1)
    // 保存到 localStorage
    localStorage.setItem('categories', JSON.stringify(categories.value))
  }
}

// 處理生成
const handleGenerate = async (data: { prompt: string; imageUrl: string }) => {
  // 儲存到歷史紀錄
  const newHistory: GenerationHistory = {
    id: Date.now(),
    prompt: data.prompt,
    imageUrl: data.imageUrl,
    timestamp: new Date().toISOString()
  }
  
  generationHistory.value.unshift(newHistory)
  
  // 只保留最近 5 筆
  if (generationHistory.value.length > 5) {
    generationHistory.value = generationHistory.value.slice(0, 5)
  }
  
  // 儲存到 localStorage
  localStorage.setItem('generationHistory', JSON.stringify(generationHistory.value))
  
  // 儲存到資料庫
  try {
    await $fetch('/api/history', {
      method: 'POST',
      body: newHistory
    })
  } catch (error) {
    console.error('Failed to save history to database:', error)
  }
}

// 初始化
onMounted(() => {
  // 載入保存的分類（如果有）
  const savedCategories = localStorage.getItem('categories')
  if (savedCategories) {
    try {
      categories.value = JSON.parse(savedCategories)
    } catch (e) {
      console.error('Failed to parse saved categories')
    }
  }
  
  // 載入詞庫面板顯示狀態
  const savedShowVocabulary = localStorage.getItem('showVocabularyPanel')
  if (savedShowVocabulary !== null) {
    showVocabularyPanel.value = savedShowVocabulary === 'true'
  }
  
  loadTemplates()
  loadVocabulary()
  loadHistory()
  
  // 載入儲存的語言設定
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale) {
    currentLocale.value = savedLocale
    locale.value = savedLocale as 'zh' | 'en'
  }
})
</script>

<style scoped>
.app-container {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 詞庫面板滑入滑出動畫 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
