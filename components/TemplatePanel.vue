<template>
  <div class="section-card modern-panel">
    <div class="panel-header mb-4">
      <h2 class="text-xl font-bold text-gray-700">
        {{ t('template.title') }}
      </h2>
      <div class="flex gap-2">
        <el-button
          type="primary"
          size="small"
          @click="addNewTemplate"
          class="add-template-btn"
        >
          <el-icon><Plus /></el-icon>
          <span class="ml-1">新增樣板</span>
        </el-button>
        <el-button
          size="small"
          @click="showCategoryDialog = true"
          class="icon-btn"
        >
          <el-icon><Setting /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 分類標籤 -->
    <div class="mb-4">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-tag"
          :class="{ 'category-tag-active': selectedCategory === category.name }"
          :style="{
            '--category-color': category.color,
            backgroundColor: selectedCategory === category.name ? category.color : `${category.color}15`,
            color: selectedCategory === category.name ? '#ffffff' : category.color,
            borderColor: category.color
          }"
          @click="selectCategory(category.name)"
        >
          {{ category.name }}
        </div>
      </div>
    </div>

    <!-- 搜尋框 -->
    <div class="mb-4">
      <el-input
        v-model="searchQuery"
        placeholder="搜尋樣板..."
        clearable
        prefix-icon="Search"
        class="search-input"
      />
    </div>

    <!-- 樣板列表 -->
    <div class="template-list space-y-3 max-h-[600px] overflow-y-auto pr-2">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        :class="{ 'template-card-active': selectedTemplateId === template.id }"
        @click="selectTemplate(template)"
      >
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-medium text-gray-700 flex-1">{{ template.name }}</h3>
          <el-button
            text
            size="small"
            @click.stop="editTemplate(template)"
            class="edit-btn"
          >
            <el-icon><Edit /></el-icon>
            <span class="ml-1">編輯</span>
          </el-button>
        </div>
        <p
          class="text-sm text-gray-500 leading-relaxed"
          v-html="formatTemplateContent(template.content)"
        ></p>
      </div>
    </div>

    <!-- 分類設定對話框 -->
    <el-dialog
      v-model="showCategoryDialog"
      :title="t('template.settings')"
      width="700px"
    >
      <el-tabs v-model="categoryTabActive">
        <!-- Tab 1: 新增分類 -->
        <el-tab-pane label="設定新分類" name="new">
          <div class="space-y-4">
            <el-form label-position="top">
              <el-form-item label="分類名稱">
                <el-input
                  v-model="newCategoryName"
                  placeholder="輸入新分類名稱"
                >
                  <template #append>
                    <el-button @click="addCategory">
                      <el-icon><Plus /></el-icon>
                      新增
                    </el-button>
                  </template>
                </el-input>
              </el-form-item>
            </el-form>
            
            <div class="space-y-2">
              <h4 class="text-sm font-semibold text-gray-700 mb-2">現有分類</h4>
              <div
                v-for="category in categories"
                :key="category.id"
                class="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-8 h-8 rounded-full"
                    :style="{ backgroundColor: category.color }"
                  ></div>
                  <span class="font-medium">{{ category.name }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <el-color-picker v-model="category.color" size="small" />
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="deleteCategory(category.id)"
                  >
                    刪除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 2: 樣板配對 -->
        <el-tab-pane label="樣板配對" name="mapping">
          <div class="space-y-4">
            <el-alert
              type="info"
              :closable="false"
              show-icon
            >
              將樣板指派到對應的分類，可多選
            </el-alert>
            
            <div
              v-for="template in props.templates"
              :key="template.id"
              class="template-mapping-item p-4 border rounded-lg"
            >
              <div class="flex justify-between items-start gap-4">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-800">{{ template.name }}</h4>
                  <p class="text-xs text-gray-500 mt-1">{{ template.content.substring(0, 60) }}...</p>
                </div>
                <el-select
                  v-model="templateCategoryMap[template.id]"
                  placeholder="選擇分類"
                  style="width: 150px"
                  @change="updateTemplateCategory(template.id)"
                >
                  <el-option
                    v-for="cat in categories"
                    :key="cat.id"
                    :label="cat.name"
                    :value="cat.name"
                  >
                    <div class="flex items-center gap-2">
                      <div
                        class="w-3 h-3 rounded-full"
                        :style="{ backgroundColor: cat.color }"
                      ></div>
                      <span>{{ cat.name }}</span>
                    </div>
                  </el-option>
                </el-select>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="showCategoryDialog = false">關閉</el-button>
        <el-button type="primary" @click="saveCategorySettings">儲存設定</el-button>
      </template>
    </el-dialog>

    <!-- API 設定對話框 -->
    <el-dialog
      v-model="showApiDialog"
      :title="t('template.apiSettings')"
      width="500px"
    >
      <el-form label-position="top">
        <el-form-item :label="t('template.geminiApi')">
          <el-input
            v-model="geminiApiKey"
            type="password"
            show-password
            placeholder="Enter your Gemini API Key"
          />
        </el-form-item>
        <el-button type="primary" @click="saveApiSettings">
          {{ t('common.save') }}
        </el-button>
      </el-form>
    </el-dialog>

    <!-- 編輯樣板對話框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="editingTemplate?.id ? t('vocabulary.edit') : t('template.editTemplate')"
      width="650px"
    >
      <el-form label-position="top">
        <el-form-item label="樣板名稱">
          <el-input v-model="editingTemplate.name" placeholder="輸入樣板名稱" />
        </el-form-item>
        <el-form-item label="分類">
          <el-select v-model="editingTemplate.category" class="w-full" placeholder="選擇分類">
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            >
              <div class="flex items-center gap-2">
                <div
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: cat.color }"
                ></div>
                <span>{{ cat.name }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="樣板內容">
          <el-input
            v-model="editingTemplate.content"
            type="textarea"
            :rows="8"
            placeholder="使用 **{key}** 標示關鍵參數，例如：生成一張 **{style}** 風格的圖片"
          />
        </el-form-item>
        <el-form-item label="上傳圖片">
          <el-upload
            v-model:file-list="uploadedImages"
            :auto-upload="false"
            :on-change="handleImageChange"
            :on-remove="handleImageRemove"
            multiple
            list-type="picture-card"
            accept="image/*"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div class="text-xs text-gray-500 mt-1">
            可上傳多張圖片作為參考（點擊 X 可刪除圖片）
          </div>
        </el-form-item>
        <el-alert
          type="info"
          :closable="false"
          show-icon
          class="mb-4"
        >
          <template #title>
            <div>
              <div class="font-semibold mb-1">提示：使用 <code>**{key}**</code> 來標示需要替換的參數</div>
              <div class="text-xs">可用的詞庫 key：
                <el-tag
                  v-for="vocab in availableVocabularyKeys"
                  :key="vocab"
                  size="small"
                  class="ml-1"
                  @click="insertVocabKey(vocab)"
                  style="cursor: pointer"
                >
                  {{ vocab }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-alert>
        <div class="flex justify-end gap-2">
          <el-button @click="showEditDialog = false">
            {{ t('common.cancel') }}
          </el-button>
          <el-button
            v-if="editingTemplate.id"
            type="danger"
            @click="deleteTemplate"
          >
            刪除樣板
          </el-button>
          <el-button type="primary" @click="saveTemplate">
            {{ t('common.save') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Setting, Key, Edit, Plus, Search } from '@element-plus/icons-vue'
import type { Template, Category } from '~/types'
import type { UploadUserFile } from 'element-plus'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  categories?: Category[]
  templates?: Template[]
}>(), {
  categories: () => [],
  templates: () => []
})

const emit = defineEmits<{
  selectTemplate: [template: Template]
  updateCategories: []
  updateTemplates: []
  addCategory: [category: { id: number; name: string; color: string }]
  deleteCategory: [categoryId: number]
}>()

const searchQuery = ref('')
const selectedCategory = ref<string>('全部')
const selectedTemplateId = ref<number | null>(null)
const showCategoryDialog = ref(false)
const showApiDialog = ref(false)
const showEditDialog = ref(false)
const newCategoryName = ref('')
const geminiApiKey = ref('')
const categoryTabActive = ref('new')
const templateCategoryMap = ref<Record<number, string>>({})
const availableVocabularyKeys = ref<string[]>([])
const uploadedImages = ref<UploadUserFile[]>([])

const editingTemplate = ref<Partial<Template>>({
  name: '',
  category: '',
  content: ''
})

// 過濾樣板
const filteredTemplates = computed(() => {
  if (!props.templates) return []
  let filtered = props.templates
  
  // 依分類過濾
  if (selectedCategory.value !== '全部') {
    filtered = filtered.filter(t => t.category === selectedCategory.value)
  }
  
  // 依搜尋詞過濾
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.content.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// 選擇分類
const selectCategory = (categoryName: string) => {
  selectedCategory.value = categoryName
}

// 選擇樣板
const selectTemplate = (template: Template) => {
  selectedTemplateId.value = template.id
  emit('selectTemplate', template)
}

// 格式化樣板內容（粗體顯示參數）
const formatTemplateContent = (content: string) => {
  return content.replace(/\*\*\{([^}]+)\}\*\*/g, '<strong class="text-blue-600">{$1}</strong>')
}

// 處理圖片變更
const handleImageChange = async (file: any) => {
  // 上傳圖片到伺服器
  if (file.raw) {
    const formData = new FormData()
    formData.append('file', file.raw)
    
    try {
      const response = await $fetch<{ success: boolean; paths: string[] }>('/api/upload-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.success && response.paths.length > 0) {
        if (!editingTemplate.value.images) {
          editingTemplate.value.images = []
        }
        editingTemplate.value.images.push(...response.paths)
        ElMessage.success('圖片上傳成功')
      }
    } catch (error) {
      console.error('圖片上傳失敗:', error)
      ElMessage.error('圖片上傳失敗')
    }
  }
}

// 處理圖片刪除
const handleImageRemove = (file: UploadUserFile) => {
  try {
    // 從 editingTemplate 的 images 陣列中移除對應的圖片 URL
    if (editingTemplate.value.images && file.url) {
      const index = editingTemplate.value.images.indexOf(file.url)
      if (index > -1) {
        editingTemplate.value.images.splice(index, 1)
        ElMessage.success('圖片已從樣板中移除')
      }
    }
    
    // 同時從 uploadedImages 中移除
    const uploadIndex = uploadedImages.value.findIndex(img => img.uid === file.uid)
    if (uploadIndex > -1) {
      uploadedImages.value.splice(uploadIndex, 1)
    }
  } catch (error) {
    console.error('圖片刪除失敗:', error)
    ElMessage.error('圖片刪除失敗')
  }
}

// 編輯樣板
const editTemplate = (template: Template) => {
  editingTemplate.value = { ...template, images: template.images ? [...template.images] : [] }
  uploadedImages.value = []
  // 載入已有的圖片路徑
  if (template.images) {
    uploadedImages.value = template.images.map((path, idx) => ({
      uid: idx,
      name: path.split('/').pop() || `image-${idx}`,
      url: path
    }))
  }
  showEditDialog.value = true
}

// 新增樣板
const addNewTemplate = () => {
  editingTemplate.value = {
    name: '',
    category: selectedCategory.value !== '全部' ? selectedCategory.value : props.categories[0]?.name || '',
    content: '',
    images: []
  }
  uploadedImages.value = []
  showEditDialog.value = true
}

// 儲存樣板
const saveTemplate = async () => {
  try {
    if (editingTemplate.value.id) {
      // 更新
      await $fetch(`/api/templates/${editingTemplate.value.id}`, {
        method: 'PUT',
        body: editingTemplate.value
      })
    } else {
      // 新增
      await $fetch('/api/templates', {
        method: 'POST',
        body: {
          ...editingTemplate.value,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      })
    }
    showEditDialog.value = false
    ElMessage.success(t('common.success'))
    // 通知父組件重新載入樣板
    emit('updateTemplates')
  } catch (error) {
    ElMessage.error(t('common.error'))
  }
}

// 新增分類
const addCategory = () => {
  if (newCategoryName.value.trim()) {
    const newCategory = {
      id: Date.now(),
      name: newCategoryName.value,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    }
    emit('addCategory', newCategory)
    newCategoryName.value = ''
    ElMessage.success('分類已新增')
  }
}

// 刪除分類
const deleteCategory = async (categoryId: number) => {
  try {
    await ElMessageBox.confirm('確定要刪除此分類嗎？', '警告', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('deleteCategory', categoryId)
    ElMessage.success('分類已刪除')
  } catch {
    // 用戶取消
  }
}

// 更新樣板分類
const updateTemplateCategory = async (templateId: number) => {
  const newCategory = templateCategoryMap.value[templateId]
  if (!newCategory) return
  
  try {
    await $fetch(`/api/templates/${templateId}`, {
      method: 'PUT',
      body: { category: newCategory }
    })
    ElMessage.success('分類已更新')
    emit('updateTemplates')
  } catch (error) {
    ElMessage.error('更新失敗')
  }
}

// 儲存分類設定
const saveCategorySettings = () => {
  showCategoryDialog.value = false
  // 不需要觸發 updateCategories，因為分類已經通過 emit 更新了
  ElMessage.success('設定已儲存')
}

// 插入詞庫 key
const insertVocabKey = (key: string) => {
  const template = editingTemplate.value.content || ''
  editingTemplate.value.content = template + ` **{${key}}**`
}

// 刪除樣板
const deleteTemplate = async () => {
  try {
    await ElMessageBox.confirm('確定要刪除此樣板嗎？', '警告', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await $fetch(`/api/templates/${editingTemplate.value.id}`, {
      method: 'DELETE'
    })
    
    showEditDialog.value = false
    ElMessage.success('樣板已刪除')
    emit('updateTemplates')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 儲存 API 設定
const saveApiSettings = () => {
  localStorage.setItem('geminiApiKey', geminiApiKey.value)
  showApiDialog.value = false
  ElMessage.success(t('common.success'))
}

// 載入 API 設定
onMounted(() => {
  const savedKey = localStorage.getItem('geminiApiKey')
  if (savedKey) {
    geminiApiKey.value = savedKey
  }
  
  // 初始化樣板分類映射
  props.templates.forEach(template => {
    templateCategoryMap.value[template.id] = template.category
  })
  
  // 載入可用的詞庫 keys
  loadAvailableVocabularyKeys()
})

// 載入可用的詞庫 keys
const loadAvailableVocabularyKeys = async () => {
  try {
    const data = await $fetch('/api/vocabulary')
    availableVocabularyKeys.value = (data as any[]).map((v: any) => v.key)
  } catch (error) {
    console.error('Failed to load vocabulary keys:', error)
  }
}
</script>

<style scoped>
.modern-panel {
  background: linear-gradient(to bottom, #ffffff, #fafbfc);
  border: 1px solid #e8eaed;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.add-template-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
  transition: all 0.3s ease;
}

.add-template-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.icon-btn {
  border: 1px solid #e8eaed;
  background: #ffffff;
  color: #5f6368;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #f8f9fa;
  border-color: #dadce0;
}

.category-tag {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1.5px solid;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.category-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.category-tag-active {
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid #e8eaed;
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  border-color: #c6c9cc;
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.template-card {
  padding: 16px;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  background: #ffffff;
  position: relative;
  overflow: hidden;
}

.template-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: linear-gradient(to bottom, #667eea, #764ba2);
  opacity: 0;
  transition: opacity 0.25s ease;
}

.template-card:hover {
  border-color: #c6c9cc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.template-card:hover::before {
  opacity: 1;
}

.template-card-active {
  border-color: #667eea;
  background: linear-gradient(to right, #f7f8ff, #ffffff);
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.15);
}

.template-card-active::before {
  opacity: 1;
}

.edit-btn {
  color: #667eea;
  padding: 4px 12px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #f0f3ff;
  color: #5568d3;
}

.template-list::-webkit-scrollbar {
  width: 6px;
}

.template-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.template-list::-webkit-scrollbar-thumb {
  background: linear-gradient(to bottom, #667eea, #764ba2);
  border-radius: 3px;
  transition: background 0.3s ease;
}

.template-list::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(to bottom, #5568d3, #6a42a0);
}

code {
  background: #f0f3ff;
  padding: 2px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #667eea;
  font-weight: 500;
}

.template-mapping-item {
  transition: all 0.3s ease;
}

.template-mapping-item:hover {
  background-color: #f9fafb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
