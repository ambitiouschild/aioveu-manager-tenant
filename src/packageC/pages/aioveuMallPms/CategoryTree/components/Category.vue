<!-- 主组件文件 -->
<template>
  <!-- 组件容器 -->
  <view v-if="showCategoryTree" class="component-container">

    <!-- 调试标记 -->
    <view style="background: #52c41a; padding: 20rpx; margin-bottom: 20rpx; border-radius: 8rpx;">
      <text style="color: white; font-size: 28rpx;">
        🎯 删除 Category/index.vue 中的重复代码，让它只做容器,Category容器
      </text>
    </view>

    <!-- 替代el-tree的自定义树形组件 -->
    <CategoryTree
      ref="categoryTreeRef"
      :data="categoryOptions"
      :loading="loading"
      @node-click="handleNodeClick"
      @add="handleAdd"
      @update="handleUpdate"
      @delete="handleDelete"
    />


<!--    &lt;!&ndash; 新增/编辑分类对话框 &ndash;&gt;-->
<!--    <uni-popup ref="popupRef" type="dialog">-->
<!--      <uni-popup-dialog-->
<!--        :title="dialogTitle"-->
<!--        :type="popupType"-->
<!--        :before-close="true"-->
<!--        @confirm="submitForm"-->
<!--        @close="closeDialog"-->
<!--      >-->
<!--        &lt;!&ndash; 保持原有的表单结构 &ndash;&gt;-->
<!--        <view class="form-container">-->
<!--          <view class="form-item">-->
<!--            <view class="form-label">上级分类</view>-->
<!--            <input-->
<!--              v-model="parentCategory.name"-->
<!--              class="form-input"-->
<!--              placeholder="上级分类"-->
<!--              readonly-->
<!--              disabled-->
<!--            />-->
<!--          </view>-->

<!--          <view class="form-item">-->
<!--            <view class="form-label">分类名称</view>-->
<!--            <input-->
<!--              v-model="formData.name"-->
<!--              class="form-input"-->
<!--              placeholder="请输入分类名称"-->
<!--            />-->
<!--            <view v-if="errors.name" class="error-message">{{ errors.name }}</view>-->
<!--          </view>-->

<!--          &lt;!&ndash; 分类图标上传 &ndash;&gt;-->
<!--          <view class="form-item">-->
<!--            <view class="form-label">分类图标</view>-->
<!--            <view class="upload-container">-->
<!--              <image-->
<!--                v-if="formData.iconUrl"-->
<!--                :src="formData.iconUrl"-->
<!--                class="category-icon"-->
<!--                mode="aspectFit"-->
<!--              />-->
<!--              <view v-else class="upload-placeholder" @click="chooseImage">-->
<!--                <text class="icon">📷</text>-->
<!--                <text class="text">点击上传</text>-->
<!--              </view>-->
<!--              <view class="upload-tips">-->
<!--                最大图片大小：5MB，支持格式：JPG、JPEG、PNG-->
<!--              </view>-->
<!--            </view>-->
<!--          </view>-->

<!--          &lt;!&ndash; 显示状态 &ndash;&gt;-->
<!--          <view class="form-item">-->
<!--            <view class="form-label">显示状态</view>-->
<!--            <view class="radio-group">-->
<!--              <view-->
<!--                v-for="option in visibleOptions"-->
<!--                :key="option.value"-->
<!--                class="radio-item"-->
<!--                @click="formData.visible = option.value"-->
<!--              >-->
<!--                <view class="radio-icon">-->
<!--                  <text v-if="formData.visible === option.value" class="selected">●</text>-->
<!--                  <text v-else class="unselected">○</text>-->
<!--                </view>-->
<!--                <text class="radio-label">{{ option.label }}</text>-->
<!--              </view>-->
<!--            </view>-->
<!--          </view>-->

<!--          &lt;!&ndash; 排序 &ndash;&gt;-->
<!--          <view class="form-item">-->
<!--            <view class="form-label">排序</view>-->
<!--            <input-->
<!--              v-model="formData.sort"-->
<!--              class="form-input"-->
<!--              placeholder="请输入排序号"-->
<!--              type="number"-->
<!--            />-->
<!--          </view>-->
<!--        </view>-->
<!--      </uni-popup-dialog>-->
<!--    </uni-popup>-->

<!--    &lt;!&ndash; 删除确认对话框 &ndash;&gt;-->
<!--    <uni-popup ref="deletePopupRef" type="dialog">-->
<!--      <uni-popup-dialog-->
<!--        type="warn"-->
<!--        title="确认删除"-->
<!--        content="确认删除已选中的数据项?"-->
<!--        :before-close="true"-->
<!--        @confirm="confirmDelete"-->
<!--        @close="cancelDelete"-->
<!--      ></uni-popup-dialog>-->
<!--    </uni-popup>-->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app';
import CategoryTree from './CategoryTree.vue'




// 定义类型
interface Category {
  id: number
  name: string
  level: number
  parentId?: number
  iconUrl?: string
  visible?: number
  sort?: number
  children?: Category[]
  [key: string]: any
}

interface FormData {
  id?: number
  name: string
  parentId: number
  level?: number
  iconUrl: string
  visible: number
  sort: number
}

interface ParentCategory {
  id: number
  name: string
  level: number
}

// 定义组件事件
const emit = defineEmits<{
  (e: 'category-click', data: Category | null): void
}>()

// 响应式数据
const showCategoryTree = ref<boolean>(true)
const loading = ref<boolean>(true)
const categoryOptions = ref<Category[]>([])

// 对话框控制
const popupRef = ref<any>(null)
const deletePopupRef = ref<any>(null)
const dialogTitle = ref<string>('')
const popupType = ref<string>('info')

// 表单数据
const formData = reactive<FormData>({
  id: undefined,
  name: '',
  parentId: 0,
  level: undefined,
  iconUrl: '',
  visible: 1,
  sort: 1
})

// 错误信息
const errors = reactive<Record<string, string>>({
  name: ''
})

// 父级分类
const parentCategory = reactive<ParentCategory>({
  id: 0,
  name: '全部分类',
  level: 0
})

// 当前操作分类
const currentCategory = ref<Category | null>(null)
const categoryToDelete = ref<Category | null>(null)

// 组件引用
const categoryTreeRef = ref<InstanceType<typeof CategoryTree>>()

// 显示状态选项
const visibleOptions = [
  { label: '显示', value: 1 },
  { label: '隐藏', value: 0 }
]


/**
 * 树节点点击事件处理  保留它只做简单的容器功能
 */
const handleNodeClick = (row: Category) => {

  // 向父组件发射事件
  emit('category-click', row)
}


</script>

<style lang="scss" scoped>
.component-container {
  width: 100%;
  height: 100%;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #909399;
  font-size: 28rpx;
}
</style>
