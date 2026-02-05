<template>
  <div class="section-card vocabulary-panel">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-blue-600">
        {{ t('vocabulary.title') }}
      </h2>
      <el-button
        type="primary"
        size="small"
        circle
        @click="addNewVocabulary"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <!-- 詞庫列表 -->
    <div class="vocabulary-list space-y-4 max-h-[700px] overflow-y-auto">
      <div
        v-for="vocab in vocabularyList"
        :key="vocab.id"
        class="vocab-card border-2 border-dashed border-blue-300 rounded-xl p-4 bg-blue-50"
      >
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h3 class="font-bold text-blue-700 text-lg">
              {{ vocab.name }}
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              Key: <code class="bg-white px-2 py-1 rounded">{{ vocab.key }}</code>
            </p>
          </div>
          <div class="flex gap-1">
            <el-button
              link
              type="primary"
              size="small"
              @click="editVocabulary(vocab)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button
              link
              type="danger"
              size="small"
              @click="deleteVocabulary(vocab.id)"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 選項標籤 -->
        <div class="options-tags flex flex-wrap gap-2">
          <el-tag
            v-for="(option, idx) in vocab.options"
            :key="idx"
            type="primary"
            round
            closable
            @close="removeOption(vocab.id, idx)"
          >
            {{ option }}
          </el-tag>
          <el-tag
            type="info"
            round
            class="cursor-pointer"
            @click="addOption(vocab.id)"
          >
            <el-icon><Plus /></el-icon>
          </el-tag>
        </div>
      </div>
    </div>

    <!-- 編輯/新增詞庫對話框 -->
    <el-dialog
      v-model="showEditDialog"
      :title="editingVocab?.id ? t('vocabulary.edit') : t('vocabulary.add')"
      width="500px"
    >
      <el-form label-position="top">
        <el-form-item :label="t('vocabulary.key')">
          <el-input
            v-model="editingVocab.key"
            placeholder="例如: style, subject"
          />
          <div class="text-xs text-gray-500 mt-1">
            在樣板中使用 **{key}** 來引用此詞庫
          </div>
        </el-form-item>
        
        <el-form-item :label="t('vocabulary.name')">
          <el-input
            v-model="editingVocab.name"
            placeholder="例如: 風格, 主題"
          />
        </el-form-item>

        <el-form-item :label="t('vocabulary.options')">
          <div class="space-y-2">
            <div
              v-for="(option, idx) in editingVocab.options"
              :key="idx"
              class="flex gap-2"
            >
              <el-input
                v-model="editingVocab.options[idx]"
                placeholder="輸入選項"
              />
              <el-button
                type="danger"
                @click="editingVocab.options.splice(idx, 1)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button
              type="primary"
              plain
              class="w-full"
              @click="editingVocab.options.push('')"
            >
              <el-icon><Plus /></el-icon>
              {{ t('vocabulary.addOption') }}
            </el-button>
          </div>
        </el-form-item>

        <div class="flex justify-end gap-2 mt-4">
          <el-button @click="showEditDialog = false">
            {{ t('common.cancel') }}
          </el-button>
          <el-button type="primary" @click="saveVocabulary">
            {{ t('common.save') }}
          </el-button>
        </div>
      </el-form>
    </el-dialog>

    <!-- 快速新增選項對話框 -->
    <el-dialog
      v-model="showAddOptionDialog"
      title="新增選項"
      width="400px"
    >
      <el-input
        v-model="newOptionValue"
        placeholder="輸入新選項"
        @keyup.enter="confirmAddOption"
      />
      <template #footer>
        <el-button @click="showAddOptionDialog = false">
          {{ t('common.cancel') }}
        </el-button>
        <el-button type="primary" @click="confirmAddOption">
          {{ t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import type { VocabularyItem } from '~/types'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  vocabularyList?: VocabularyItem[]
}>(), {
  vocabularyList: () => []
})

const emit = defineEmits<{
  updateVocabulary: []
}>()

const showEditDialog = ref(false)
const showAddOptionDialog = ref(false)
const currentVocabId = ref<number | null>(null)
const newOptionValue = ref('')

const editingVocab = ref<Partial<VocabularyItem>>({
  key: '',
  name: '',
  options: []
})

// 新增詞庫
const addNewVocabulary = () => {
  editingVocab.value = {
    key: '',
    name: '',
    options: ['']
  }
  showEditDialog.value = true
}

// 編輯詞庫
const editVocabulary = (vocab: VocabularyItem) => {
  editingVocab.value = { ...vocab, options: [...vocab.options] }
  showEditDialog.value = true
}

// 儲存詞庫
const saveVocabulary = async () => {
  // 驗證
  if (!editingVocab.value.key || !editingVocab.value.name) {
    ElMessage.warning('請填寫完整資訊')
    return
  }

  // 過濾空選項
  editingVocab.value.options = editingVocab.value.options?.filter(opt => opt.trim() !== '') || []

  if (editingVocab.value.options.length === 0) {
    ElMessage.warning('請至少新增一個選項')
    return
  }

  try {
    if (editingVocab.value.id) {
      // 更新
      await $fetch(`/api/vocabulary/${editingVocab.value.id}`, {
        method: 'PUT',
        body: editingVocab.value
      })
    } else {
      // 新增
      await $fetch('/api/vocabulary', {
        method: 'POST',
        body: editingVocab.value
      })
    }
    
    showEditDialog.value = false
    ElMessage.success(t('common.success'))
    emit('updateVocabulary')
  } catch (error) {
    ElMessage.error(t('common.error'))
  }
}

// 刪除詞庫
const deleteVocabulary = async (id: number) => {
  try {
    await ElMessageBox.confirm(
      '確定要刪除此詞庫嗎？',
      '警告',
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )
    
    await $fetch(`/api/vocabulary/${id}`, {
      method: 'DELETE'
    })
    
    ElMessage.success('刪除成功')
    emit('updateVocabulary')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

// 新增選項
const addOption = (vocabId: number) => {
  currentVocabId.value = vocabId
  newOptionValue.value = ''
  showAddOptionDialog.value = true
}

// 確認新增選項
const confirmAddOption = async () => {
  if (!newOptionValue.value.trim()) {
    ElMessage.warning('請輸入選項內容')
    return
  }

  const vocab = props.vocabularyList.find(v => v.id === currentVocabId.value)
  if (vocab) {
    vocab.options.push(newOptionValue.value)
    
    try {
      await $fetch(`/api/vocabulary/${vocab.id}`, {
        method: 'PUT',
        body: vocab
      })
      ElMessage.success('新增成功')
      emit('updateVocabulary')
    } catch (error) {
      ElMessage.error('新增失敗')
    }
  }

  showAddOptionDialog.value = false
}

// 移除選項
const removeOption = async (vocabId: number, optionIndex: number) => {
  const vocab = props.vocabularyList.find(v => v.id === vocabId)
  if (vocab) {
    vocab.options.splice(optionIndex, 1)
    
    try {
      await $fetch(`/api/vocabulary/${vocab.id}`, {
        method: 'PUT',
        body: vocab
      })
      ElMessage.success('移除成功')
      emit('updateVocabulary')
    } catch (error) {
      ElMessage.error('移除失敗')
    }
  }
}
</script>

<style scoped>
.vocabulary-panel {
  border: 3px dashed #60a5fa;
}

.vocab-card {
  animation: slideIn 0.3s ease-out;
  transition: all 0.3s;
}

.vocab-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.2);
}

.vocabulary-list::-webkit-scrollbar {
  width: 6px;
}

.vocabulary-list::-webkit-scrollbar-thumb {
  background: #60a5fa;
  border-radius: 3px;
}

code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #3b82f6;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.options-tags {
  min-height: 40px;
}
</style>
