<template>
  <!-- 组件容器 -->
  <view class="component-container">
    <!-- 卡片容器 -->
    <view class="box-card">
      <!-- 第一行：显示当前选择的分类和提交按钮 -->
      <view class="row">
        <!-- 左侧：显示当前选择的分类 -->
        <view class="col left-col">
          <!-- 如果有选择的分类，显示分类名称 -->
          <view v-if="category && category.name" class="tag success-tag">
            {{ category.name }} {{ attributeTypeName }}
          </view>
          <!-- 如果没有选择分类，显示提示 -->
          <view v-else class="tag info-tag">
            <text class="icon">📁</text>
            请选择商品分类
          </view>
        </view>

        <!-- 右侧：提交按钮 -->
        <view class="col right-col">
          <button class="primary-button" @click="submitForm">
            <text class="button-icon">📤</text>
            提交
          </button>
        </view>
      </view>

      <!-- 第二行：属性/规格表单 -->
      <view class="form-container">
        <!-- 动态表单，如果分类有子分类，禁用表单 -->
        <view :class="['form-wrapper', { 'form-disabled': category?.childrenLen > 0 }]">
          <!-- 动态生成属性/规格输入项 -->
          <view v-for="(item, index) in formData.attributes"
                :key="index"
                class="form-item">
            <view class="form-label">{{ attributeTypeName }}{{ index + 1 }}</view>
            <view class="form-content">
              <!-- 属性名称输入框 -->
              <input
                v-model="item.name"
                class="form-input"
                :placeholder="`请输入${attributeTypeName}名称`"
                :disabled="category?.childrenLen > 0"
                @blur="validateAttribute(index)"
              />

              <!-- 按钮容器 -->
              <view class="button-group">
                <!-- 第一行显示添加按钮 -->
                <view v-if="index === 0"
                      class="icon-button add-button"
                      @click="handleAdd">
                  <text class="button-icon">➕</text>
                </view>

                <!-- 每一行都显示删除按钮 -->
                <view class="icon-button delete-button"
                      @click="handleDelete(index)">
                  <text class="button-icon">🗑️</text>
                </view>
              </view>
            </view>
            <!-- 错误提示 -->
            <view v-if="errors[index]" class="error-message">
              {{ errors[index] }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onUnmounted } from 'vue'

// 定义类型
interface AttributeItem {
  id?: number
  name: string
}

interface FormData {
  categoryId?: number
  type: number
  attributes: AttributeItem[]
}

interface Category {
  id?: number
  name: string
  childrenLen: number
}

// 定义组件接收的属性
const props = withDefaults(defineProps<{
  attributeType?: number
  category?: Category
}>(), {
  attributeType: 1,
  category: () => ({
    id: undefined,
    name: "",
    childrenLen: 0,
  })
})

// 计算属性：根据attributeType显示对应的中文名称
const attributeTypeName = computed(() =>
  props.attributeType === 1 ? "规格" : "属性"
)

// 响应式状态管理
const formData = reactive<FormData>({
  categoryId: undefined,
  type: 1,
  attributes: [
    {
      id: undefined,
      name: "",
    },
  ]
})

// 错误信息
const errors = ref<Record<number, string>>({})

// 验证属性名称
const validateAttribute = (index: number) => {
  if (!formData.attributes[index].name) {
    errors.value[index] = `请输入${attributeTypeName.value}名称`
  } else {
    delete errors.value[index]
  }
}

// 监听分类ID的变化，当选择不同分类时加载对应的属性列表
watch(
  () => props.category.id,
  () => {
    const categoryId = props.category.id
    if (categoryId) {
      // 清空错误信息
      errors.value = {}

      // 如果有分类ID，则加载该分类下的属性列表
      // 这里替换为你的实际API调用
      uni.request({
        url: '/api/category-attribute/list',
        method: 'GET',
        data: {
          categoryId,
          type: props.attributeType,
        },
        success: (response: any) => {
          const { data } = response
          if (data && data.length > 0) {
            // 如果后端返回了数据，则用返回的数据填充表单
            formData.attributes = data
          } else {
            // 如果没有数据，重置为一个空的属性项
            formData.attributes = [
              {
                id: undefined,
                name: "",
              },
            ]
          }
        },
        fail: (err: any) => {
          console.error('加载属性列表失败:', err)
          uni.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
    } else {
      // 如果没有选择分类，清空表单
      formData.attributes = [
        {
          id: undefined,
          name: "",
        },
      ]
      errors.value = {}
    }
  },
  { immediate: true }
)

/**
 * 添加一个新的属性/规格项
 */
const handleAdd = () => {
  formData.attributes.push({
    id: undefined,
    name: "",
  })
}

/**
 * 删除指定索引的属性/规格项
 * @param index - 要删除的项的索引
 */
const handleDelete = (index: number) => {
  // 如果只剩最后一个，不清空数组，而是重置为初始状态
  if (formData.attributes.length == 1) {
    formData.attributes = [
      {
        id: undefined,
        name: "",
      },
    ]
    return
  }

  // 删除指定项
  formData.attributes.splice(index, 1)
  // 删除对应的错误信息
  delete errors.value[index]
}

/**
 * 提交表单数据
 */
const submitForm = async () => {
  // 先验证所有输入
  let hasError = false
  formData.attributes.forEach((item, index) => {
    if (!item.name) {
      errors.value[index] = `请输入${attributeTypeName.value}名称`
      hasError = true
    }
  })

  if (hasError) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  if (!props.category.id) {
    uni.showToast({
      title: '请先选择商品分类',
      icon: 'none'
    })
    return
  }

  // 准备提交数据
  formData.categoryId = props.category.id
  formData.type = props.attributeType

  // 调用API保存数据
  try {
    // 这里替换为你的实际API调用
    await uni.request({
      url: '/api/category-attribute/batch-save',
      method: 'POST',
      data: formData
    })

    uni.showToast({
      title: '提交成功',
      icon: 'success'
    })
  } catch (error) {
    console.error('提交失败:', error)
    uni.showToast({
      title: '提交失败',
      icon: 'none'
    })
  }
}

/**
 * 组件卸载时的清理
 */
onUnmounted(() => {
  console.log('🗑️ Attribute组件卸载')
  // 清空数据
  formData.categoryId = undefined
  formData.type = 1
  formData.attributes = [
    {
      id: undefined,
      name: "",
    },
  ]
  errors.value = {}
})
</script>

<style lang="scss" scoped>
.component-container {
  margin-bottom: 40rpx;
}

.box-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 12rpx 0 rgba(0, 0, 0, 0.1);
  padding: 32rpx;
}

.row {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 20rpx;
}

.col {
  flex: 1;
}

.left-col {
  text-align: left;
}

.right-col {
  text-align: right;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 16rpx 24rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  font-weight: 500;

  .icon {
    margin-right: 8rpx;
  }
}

.success-tag {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 2rpx solid #e1f3d8;
}

.info-tag {
  background-color: #f4f4f5;
  color: #909399;
  border: 2rpx solid #e9e9eb;
}

.primary-button {
  background-color: #409eff;
  color: #ffffff;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:active {
    background-color: #3a8ee6;
    transform: scale(0.98);
  }

  .button-icon {
    margin-right: 8rpx;
  }
}

.form-container {
  margin-top: 20rpx;
}

.form-wrapper {
  &.form-disabled {
    opacity: 0.6;
  }
}

.form-item {
  margin-bottom: 40rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.form-label {
  font-size: 28rpx;
  color: #606266;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-content {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.form-input {
  flex: 1;
  height: 80rpx;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #ffffff;

  &:focus {
    border-color: #409eff;
    outline: none;
  }

  &:disabled {
    background-color: #f5f7fa;
    color: #c0c4cc;
    border-color: #e4e7ed;
  }
}

.button-group {
  display: flex;
  flex-direction: row;
  margin-left: 20rpx;
}

.icon-button {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;

  &:active {
    transform: scale(0.95);
  }
}

.add-button {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 2rpx solid #e1f3d8;
}

.delete-button {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 2rpx solid #fde2e2;
}

.button-icon {
  font-size: 28rpx;
}

.error-message {
  color: #f56c6c;
  font-size: 24rpx;
  margin-top: 8rpx;
  margin-left: 4rpx;
}
</style>
