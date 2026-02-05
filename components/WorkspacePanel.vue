<template>
  <div class="section-card bg-light-blue">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-gray-800">
        {{ t('workspace.title') }}
      </h2>
      <div class="flex gap-2">
        <el-button
          type="primary"
          size="small"
          @click="linkToGemini"
        >
          🤖 {{ t('workspace.linkGemini') }}
        </el-button>
        <el-button
          type="success"
          size="small"
          @click="linkToChatGPT"
        >
          💬 {{ t('workspace.linkChatGPT') }}
        </el-button>
      </div>
    </div>

    <!-- Prompt 輸入看板 -->
    <div class="prompt-editor bg-white p-4 rounded-xl mb-4 shadow-sm">
      <h3 class="text-sm font-semibold text-gray-700 mb-2">
        {{ t('workspace.promptInput') }}
      </h3>
      
      <!-- 樣板內容區域（帶下拉選單） -->
      <div class="template-content mb-4 p-3 bg-gray-50 rounded-lg">
        <div
          v-if="selectedTemplate"
          class="rich-content"
          v-html="renderTemplateWithSelects()"
        ></div>
        <div v-else class="text-gray-400 text-center py-4">
          請從左側選擇一個樣板
        </div>
      </div>

      <!-- 主要敘述 -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">
          {{ t('workspace.mainDescription') }}
        </label>
        <el-input
          v-model="mainDescription"
          type="textarea"
          :rows="4"
          placeholder="輸入您的主要敘述內容..."
          class="mb-4"
        />
      </div>
    </div>

    <!-- 提示詞預覽 -->
    <div class="preview-box bg-white p-4 rounded-xl mb-4 shadow-sm">
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-sm font-semibold text-gray-700">
          {{ t('workspace.preview') }}
        </h3>
        <el-button
          size="small"
          @click="copyPrompt"
        >
          <el-icon><CopyDocument /></el-icon>
          {{ t('workspace.copy') }}
        </el-button>
      </div>
      <div class="preview-content p-3 bg-gray-50 rounded-lg text-gray-700 min-h-[80px]">
        {{ finalPrompt }}
      </div>
    </div>

    <!-- 生成按鈕 -->
    <el-button
      type="primary"
      size="large"
      class="w-full mb-4"
      :loading="isGenerating"
      @click="generate"
    >
      <span class="text-lg">🎨 {{ t('workspace.generate') }}</span>
    </el-button>

    <!-- 功能顯示區 -->
    <div v-if="generatedImageUrl" class="result-area bg-white p-4 rounded-xl mb-4 shadow-sm">
      <h3 class="text-sm font-semibold text-gray-700 mb-2">
        {{ t('workspace.resultImage') }}
      </h3>
      <div class="image-container flex justify-center">
        <img
          :src="generatedImageUrl"
          alt="Generated"
          class="max-w-full rounded-lg shadow-md"
        />
      </div>
    </div>

    <!-- 歷史紀錄 -->
    <div v-if="history && history.length > 0" class="history-section bg-white p-4 rounded-xl shadow-sm">
      <h3 class="text-sm font-semibold text-gray-700 mb-3">
        {{ t('workspace.history') }}
      </h3>
      <div class="flex gap-3 overflow-x-auto pb-2">
        <div
          v-for="item in history"
          :key="item.id"
          class="history-item flex-shrink-0 cursor-pointer hover:scale-105 transition-transform"
          @click="viewHistoryItem(item)"
        >
          <img
            :src="item.imageUrl"
            :alt="item.prompt"
            class="w-24 h-24 object-cover rounded-lg shadow-md"
          />
          <div class="text-xs text-gray-500 mt-1 text-center">
            {{ formatDate(item.timestamp) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CopyDocument } from '@element-plus/icons-vue'
import type { Template, VocabularyItem, GenerationHistory } from '~/types'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  selectedTemplate?: Template | null
  vocabularyList?: VocabularyItem[]
  history?: GenerationHistory[]
}>(), {
  selectedTemplate: null,
  vocabularyList: () => [],
  history: () => []
})

const emit = defineEmits<{
  generate: [data: { prompt: string; imageUrl: string }]
}>()

const mainDescription = ref('')
const isGenerating = ref(false)
const generatedImageUrl = ref('')
const templateParams = ref<Record<string, string>>({})

// 計算最終提示詞
const finalPrompt = computed(() => {
  if (!props.selectedTemplate) return ''
  
  let prompt = props.selectedTemplate.content
  
  // 替換參數
  Object.entries(templateParams.value).forEach(([key, value]) => {
    const regex = new RegExp(`\\*\\*\\{${key}\\}\\*\\*`, 'g')
    prompt = prompt.replace(regex, value || `{${key}}`)
  })
  
  // 添加主要敘述
  if (mainDescription.value) {
    prompt += `\n\n${mainDescription.value}`
  }
  
  return prompt
})

// 渲染樣板並插入下拉選單
const renderTemplateWithSelects = () => {
  if (!props.selectedTemplate) return ''
  
  let content = props.selectedTemplate.content
  
  // 找出所有參數 **{key}**
  const paramRegex = /\*\*\{([^}]+)\}\*\*/g
  const matches = [...content.matchAll(paramRegex)]
  
  matches.forEach(match => {
    const key = match[1]
    const vocab = props.vocabularyList.find(v => v.key === key)
    
    if (vocab && vocab.options.length > 0) {
      // 初始化參數值
      if (!templateParams.value[key]) {
        templateParams.value[key] = vocab.options[0]
      }
      
      // 創建選擇框的 HTML ID
      const selectId = `select-${key}`
      const replacement = `<span class="inline-select-wrapper">
        <select
          id="${selectId}"
          class="cute-select px-3 py-1 border-2 border-blue-300 rounded-full bg-white text-blue-600 font-semibold cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onchange="window.updateTemplateParam('${key}', this.value)"
        >
          ${vocab.options.map(opt => `<option value="${opt}" ${templateParams.value[key] === opt ? 'selected' : ''}>${opt}</option>`).join('')}
        </select>
      </span>`
      
      content = content.replace(match[0], replacement)
    } else {
      // 沒有對應詞庫，顯示為可編輯輸入框
      const replacement = `<span class="inline-input-wrapper">
        <input
          type="text"
          class="cute-input px-3 py-1 border-2 border-blue-300 rounded-full bg-white text-blue-600 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
          value="${templateParams.value[key] || ''}"
          placeholder="${key}"
          onchange="window.updateTemplateParam('${key}', this.value)"
        />
      </span>`
      
      content = content.replace(match[0], replacement)
    }
  })
  
  return content
}

// 全局更新參數函數
if (process.client) {
  (window as any).updateTemplateParam = (key: string, value: string) => {
    templateParams.value[key] = value
  }
}

// 複製提示詞
const copyPrompt = async () => {
  try {
    await navigator.clipboard.writeText(finalPrompt.value)
    ElMessage.success('已複製到剪貼簿')
  } catch (error) {
    ElMessage.error('複製失敗')
  }
}

// 生成圖片
const generate = async () => {
  if (!finalPrompt.value) {
    ElMessage.warning('請先選擇樣板並填寫內容')
    return
  }
  
  isGenerating.value = true
  
  // 模擬生成過程
  console.log('生成提示詞:', finalPrompt.value)
  
  setTimeout(() => {
    // 使用 placeholder 圖片
    const imageUrl = `https://via.placeholder.com/512x512/667eea/ffffff?text=Generated+Image`
    generatedImageUrl.value = imageUrl
    
    // 發送生成事件
    emit('generate', {
      prompt: finalPrompt.value,
      imageUrl
    })
    
    isGenerating.value = false
    ElMessage.success('生成完成！')
  }, 2000)
}

// 連結到 Gemini
const linkToGemini = () => {
  if (!finalPrompt.value) {
    ElMessage.warning('請先填寫提示詞')
    return
  }
  const url = `https://gemini.google.com/?q=${encodeURIComponent(finalPrompt.value)}`
  window.open(url, '_blank')
}

// 連結到 ChatGPT
const linkToChatGPT = () => {
  if (!finalPrompt.value) {
    ElMessage.warning('請先填寫提示詞')
    return
  }
  const url = `https://chatgpt.com/?prompt=${encodeURIComponent(finalPrompt.value)}`
  window.open(url, '_blank')
}

// 查看歷史項目
const viewHistoryItem = (item: GenerationHistory) => {
  generatedImageUrl.value = item.imageUrl
  ElMessage.info('已載入歷史記錄')
}

// 格式化日期
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

// 重置參數當樣板改變
watch(() => props.selectedTemplate, () => {
  templateParams.value = {}
  mainDescription.value = ''
  generatedImageUrl.value = ''
})
</script>

<style scoped>
.prompt-editor {
  border: 2px solid #e6f2ff;
}

.preview-box {
  border: 2px dashed #409eff;
}

.preview-content {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', monospace;
}

.rich-content {
  line-height: 2;
}

.rich-content :deep(.cute-select),
.rich-content :deep(.cute-input) {
  margin: 0 4px;
  transition: all 0.3s;
}

.rich-content :deep(.cute-select:hover),
.rich-content :deep(.cute-input:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.history-section::-webkit-scrollbar {
  height: 6px;
}

.history-section::-webkit-scrollbar-thumb {
  background: #409eff;
  border-radius: 3px;
}

.result-area {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
