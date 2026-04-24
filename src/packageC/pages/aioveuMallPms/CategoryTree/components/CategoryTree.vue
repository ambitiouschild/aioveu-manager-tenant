<!-- CategoryTree.vue - 修复完整版 -->
<template>
  <view v-if="showCategoryTree" class="category-tree-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 树形分类列表 -->
    <view v-else>
      <!-- 调试信息 -->
      <view class="debug-info" v-if="treeData.length > 0">
        <text>📊 共 {{ getTotalNodes(treeData) }} 个分类</text>
      </view>

      <!-- 树形组件 -->
      <scroll-view scroll-y class="tree-scroll-view" :style="{ height: listHeight }">
        <!-- ✅ 使用修复后的组件 -->
        <!-- ✅ 监听删除事件 -->
        <!-- ✅ 监听新增下级事件 -->
        <!-- ✅ 监听编辑事件 -->
        <FlatTree
          v-if="treeData.length > 0"
          :data="treeData"
          @node-click="handleNodeClick"
          @edit-click="onUpdate"
          @add-click="onAdd"
          @delete-click="onDelete"
        />

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <text>暂无分类数据</text>
        </view>
      </scroll-view>
    </view>

    <!-- 新增/编辑分类对话框 -->
    <uni-popup ref="popupRef" type="dialog" :animation="true">
      <uni-popup-dialog
        :title="dialogTitle"
        :type="popupType"
        :before-close="true"
        @confirm="submitForm"
        @close="closeDialog"
      >
        <view class="form-container">

          <!-- 在表单容器中添加层级提示 -->
          <!-- 当前层级提示 -->
          <view v-if="formData.level" class="level-tip">
            <text>当前层级：{{ getLevelText(formData.level) }}</text>
          </view>

          <!-- 上级分类（只读） -->
          <view class="form-item">
            <view class="form-label">上级分类</view>
            <input
              v-model="parentCategory.name"
              class="form-input"
              placeholder="上级分类"
              readonly
              disabled
            />
          </view>

          <!-- 分类名称 -->
          <view class="form-item">
            <view class="form-label">分类名称</view>
            <input
              v-model="formData.name"
              class="form-input"
              placeholder="请输入分类名称"
              adjust-position
            />
            <view v-if="errors.name" class="error-message">{{ errors.name }}</view>
          </view>

          <!-- 分类图标上传 -->
          <view class="form-item">
            <view class="form-label">分类图标</view>
            <view class="upload-container">
              <image
                v-if="formData.iconUrl"
                :src="formData.iconUrl"
                class="category-icon"
                mode="aspectFit"
              />
              <view v-else class="upload-placeholder" @click="chooseImage">
                <text class="icon">📷</text>
                <text class="text">点击上传</text>
              </view>
              <view class="upload-tips">
                最大图片大小：5MB，支持格式：JPG、JPEG、PNG
              </view>
            </view>
          </view>

          <!-- 显示状态 -->
          <view class="form-item">
            <view class="form-label">显示状态</view>
            <view class="radio-group">
              <view
                v-for="option in visibleOptions"
                :key="option.value"
                class="radio-item"
                @click="formData.visible = option.value"
              >
                <view class="radio-icon">
                  <text v-if="formData.visible === option.value" class="selected">●</text>
                  <text v-else class="unselected">○</text>
                </view>
                <text class="radio-label">{{ option.label }}</text>
              </view>
            </view>
          </view>

          <!-- 排序 -->
          <view class="form-item">
            <view class="form-label">排序</view>
            <input
              v-model="formData.sort"
              class="form-input"
              placeholder="请输入排序号"
              type="number"
            />
          </view>
        </view>
      </uni-popup-dialog>
    </uni-popup>

    <!-- 删除确认对话框 -->
    <uni-popup ref="deletePopupRef" type="dialog" :animation="true">
      <uni-popup-dialog
        type="warn"
        title="确认删除"
        content="确认删除已选中的数据项?"
        :before-close="true"
        @confirm="confirmDelete"
        @close="cancelDelete"
      ></uni-popup-dialog>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import FlatTree from './flat-tree.vue'
import PmsCategoryAPI from '@/packageC/api/aioveuMallPms/aioveuMallPmsCategory/pms-category'

// 定义类型
interface CategoryNode {
  id: number
  name: string
  level: number
  parentId?: number
  iconUrl?: string
  visible?: number
  sort?: number
  children?: CategoryNode[]
  expanded?: boolean
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
  (e: 'category-click', data: CategoryNode | null): void
}>()

// 响应式数据
const showCategoryTree = ref<boolean>(true)
const loading = ref<boolean>(true)
const listHeight = ref<string>('600rpx')
const rawCategoryList = ref<CategoryNode[]>([])
const treeData = ref<CategoryNode[]>([])

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
const currentCategory = ref<CategoryNode | null>(null)
const categoryToDelete = ref<CategoryNode | null>(null)

// 显示状态选项
const visibleOptions = [
  { label: '显示', value: 1 },
  { label: '隐藏', value: 0 }
]

/**
 * 计算总节点数
 */
const getTotalNodes = (nodes: any[]): number => {
  let count = 0
  const countNodes = (list: any[]) => {
    list.forEach(node => {
      count++
      if (node.children && node.children.length) {
        countNodes(node.children)
      }
    })
  }
  countNodes(nodes)
  return count
}

/**
 * ✅ 修复：构建树结构（支持多级）
 */
function buildTree(list: CategoryNode[], parentId: number = 0, level: number = 0): CategoryNode[] {
  return list
    .filter(item => item.parentId === parentId)
    .map(item => {
      // ✅ 修复：递归调用，传入 item.id 而不是 0
      // ❌ 这里只递归了一次，且传入的是 item.id，但后续没有继续递归
      const children = buildTree(list, item.id, level + 1)

      return {
        ...item,
        level: level,  // 使用传入的 level
        expanded: false,
        // ✅ 修复：必须赋值 children，即使为空数组
        children: children.length > 0 ? children : []
      }
    })
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
}
/**
 * 计算列表高度
 */
const calculateListHeight = () => {
  uni.getSystemInfo({
    success: (res) => {
      const windowHeight = res.windowHeight
      const statusBarHeight = res.statusBarHeight || 0
      const bottomSafeArea = 50
      listHeight.value = `${windowHeight - statusBarHeight - bottomSafeArea}px`
    }
  })
}

/**
 * 获取层级文本
 */
const getLevelText = (level: number) => {
  const levelMap = {
    1: '一级分类',
    2: '二级分类',
    3: '三级分类'
  }
  return levelMap[level] || `第${level}级分类`
}



/**
 * 查询分类数据
 */
const handleQuery = async () => {
  loading.value = true
  try {
    const response = await PmsCategoryAPI.getListCategories({})

    console.log('📊 原始数据:', response)

    if (Array.isArray(response)) {
      // 存储原始数据
      rawCategoryList.value = response

      // ✅ 构建完整的树结构
      // ✅ 直接使用原始数据（已经是树形结构）
      // const rootChildren = buildTree(response, 0)

      // 构建根节点
      treeData.value = [{
        id: 0,
        name: '全部分类',
        parentId: 0,
        level: 0,
        expanded: true,
        children: response.map(item => ({
          ...item,
          expanded: false
        }))
      }]

      // ✅ 调试：打印完整的树结构
      console.log('🌳 最终树结构:', treeData.value[0])
      console.log(JSON.stringify(treeData.value, null, 2))

      // ✅ 检查每个节点是否有 children
      const checkNode = (node: any, indent: string = '') => {
        console.log(`${indent}${node.name} (id:${node.id}, level:${node.level}): 有 ${node.children?.length || 0} 个子节点`)
        if (node.children) {
          node.children.forEach((child: any) => checkNode(child, indent + '  '))
        }
      }
      checkNode(treeData.value[0])

    } else {
      console.error('返回数据格式不正确:', response)
      treeData.value = []
    }
  } catch (error) {
    console.error('查询分类数据失败:', error)
    uni.showToast({
      title: '获取分类数据失败',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

/**
 * 节点点击事件
 */
const handleNodeClick = (node: any) => {
  console.log('🌳 点击节点:', node)

  // 如果是根节点，不执行业务逻辑
  if (node.id === 0) {
    console.log('点击了根节点，跳过业务逻辑')
    return
  }

  // 执行业务逻辑
  onNodeClick(node)
}

/**
 * 原 onNodeClick 函数
 */
const onNodeClick = (node: CategoryNode) => {
  // 保存当前分类信息
  currentCategory.value = { ...node }

  // 设置父级分类信息
  if (node.id === 0) {
    parentCategory.id = 0
    parentCategory.name = '全部分类'
    parentCategory.level = 0
  } else {
    // 这里简化处理，实际项目中需要根据父级ID查找
    parentCategory.id = node.parentId || 0
    parentCategory.name = node.parentId === 0 ? '全部分类' : '上级分类'
    parentCategory.level = node.level - 1
  }

  // 向父组件发射事件
  emit('category-click', node)
}

/**
 * 切换节点展开状态
 */
const onToggleExpand = (nodeId: number) => {
  const toggleNode = (nodes: CategoryNode[]) => {
    nodes.forEach(node => {
      if (node.id === nodeId) {
        node.expanded = !node.expanded
        console.log(`切换节点 ${node.name} 展开状态: ${node.expanded}`)
      }
      if (node.children) {
        toggleNode(node.children)
      }
    })
  }
  toggleNode(treeData.value)
}

/**
 * 新增分类
 */
const onAdd = (node: CategoryNode) => {
  dialogTitle.value = node.id === 0 ? '新增顶级分类' : '新增下级分类'
  popupType.value = 'info'
  resetForm()
  formData.id = undefined

  if (node.id === 0) {
    // 新增顶级分类
    parentCategory.id = 0
    parentCategory.name = '全部分类'
    parentCategory.level = 0
    formData.parentId = 0
    formData.level = 1
  } else {
    // 新增下级分类
    parentCategory.id = node.id
    parentCategory.name = node.name
    parentCategory.level = node.level


    // ✅ 关键：限制最多三级
    if (node.level >= 3) {
      uni.showToast({
        title: '最多只能创建三级分类',
        icon: 'none'
      })
      return
    }

    formData.parentId = node.id
    formData.level = (node.level || 0) + 1
  }

  popupRef.value?.open()
}

/**
 * 修改分类
 */
const onUpdate = (node: CategoryNode) => {
  onNodeClick(node)
  dialogTitle.value = '修改商品分类'
  popupType.value = 'info'

  Object.assign(formData, {
    id: node.id,
    name: node.name,
    parentId: node.parentId || 0,
    level: node.level,
    iconUrl: node.iconUrl || '',
    visible: node.visible || 1,
    sort: node.sort || 1
  })

  popupRef.value?.open()
}

/**
 * 删除分类
 */
const onDelete = (node: CategoryNode) => {
  categoryToDelete.value = node
  deletePopupRef.value?.open()
}

/**
 * 确认删除
 */
const confirmDelete = async () => {
  try {
    if (!categoryToDelete.value) return

    // ✅ 将数字转换为字符串
    const idStr = categoryToDelete.value.id.toString()

    // 这里调用删除API
    await PmsCategoryAPI.deleteByIds(idStr)

    await new Promise((resolve) => setTimeout(resolve, 500))

    uni.showToast({
      title: '删除成功',
      icon: 'success'
    })

    handleQuery()

    // 2. ✅ 关键修复：关闭删除弹窗
    deletePopupRef.value?.close()

    // 3. 可选：清空待删除对象
    categoryToDelete.value = null

  } catch (error) {
    console.error('删除失败:', error)
    uni.showToast({
      title: '删除失败',
      icon: 'none'
    })
  } finally {
    categoryToDelete.value = null
  }
}

/**
 * 取消删除
 */
const cancelDelete = () => {
  categoryToDelete.value = null
  deletePopupRef.value?.close() // 确保取消时也关闭
}

/**
 * 选择图片
 */
const chooseImage = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      formData.iconUrl = res.tempFilePaths[0]
    }
  })
}

/**
 * 提交表单
 */
const submitForm = async () => {
  if (!formData.name) {
    errors.name = '请输入分类名称'
    return
  } else {
    errors.name = ''
  }

  try {
    if (formData.id) {
      // 修改操作
      // await PmsCategoryAPI.updateCategory(formData)
      await new Promise((resolve) => setTimeout(resolve, 500))
      uni.showToast({ title: '修改成功', icon: 'success' })
    } else {
      // 新增操作
      const newData = {
        ...formData,
        parentId: parentCategory.id,
        level: (parentCategory.level || 0) + 1
      }

      // await PmsCategoryAPI.addCategory(newData)
      await new Promise((resolve) => setTimeout(resolve, 500))
      uni.showToast({ title: '新增成功', icon: 'success' })
    }

    closeDialog()
    handleQuery()
  } catch (error) {
    console.error('提交表单失败:', error)
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
}

/**
 * 重置表单
 */
const resetForm = () => {
  Object.assign(formData, {
    id: undefined,
    name: '',
    parentId: 0,
    level: undefined,
    iconUrl: '',
    visible: 1,
    sort: 1
  })

  Object.assign(parentCategory, {
    id: 0,
    name: '全部分类',
    level: 0
  })

  errors.name = ''
}

/**
 * 关闭对话框
 */
const closeDialog = () => {
  popupRef.value?.close()
  resetForm()
}

// 组件挂载
onMounted(() => {
  calculateListHeight()
  handleQuery()
})

// 监听窗口大小变化
onMounted(() => {
  uni.onWindowResize(() => {
    calculateListHeight()
  })
})

// 暴露方法给父组件
defineExpose({
  handleQuery
})
</script>

<style lang="scss" scoped>
.category-tree-container {
  width: 100%;
  height: 100%;
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #909399;
  font-size: 28rpx;

  .loading-text {
    text-align: center;
  }
}

.debug-info {
  background: #1890ff;
  padding: 20rpx;
  margin: 20rpx;
  border-radius: 8rpx;

  text {
    color: white;
    font-size: 28rpx;
  }
}

.tree-scroll-view {
  background-color: #ffffff;
  border-radius: 8rpx;
  overflow: hidden;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  color: #909399;
  font-size: 28rpx;
}

/* 表单样式 */
.form-container {
  padding: 20rpx 0;
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

.form-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #dcdfe6;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  background-color: #ffffff;
  box-sizing: border-box;

  &:focus {
    border-color: #409eff;
  }

  &:disabled {
    background-color: #f5f7fa;
    color: #c0c4cc;
  }
}

.error-message {
  color: #f56c6c;
  font-size: 24rpx;
  margin-top: 8rpx;
  margin-left: 4rpx;
}

.upload-container {
  .category-icon {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #dcdfe6;
    border-radius: 8rpx;
    margin-bottom: 20rpx;
  }

  .upload-placeholder {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #dcdfe6;
    border-radius: 8rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #909399;

    .icon {
      font-size: 60rpx;
      margin-bottom: 20rpx;
    }

    .text {
      font-size: 24rpx;
    }
  }

  .upload-tips {
    font-size: 24rpx;
    color: #909399;
    margin-top: 20rpx;
  }
}

.radio-group {
  display: flex;
  gap: 40rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;

  .radio-icon {
    margin-right: 12rpx;

    .selected {
      color: #409eff;
      font-size: 32rpx;
    }

    .unselected {
      color: #c0c4cc;
      font-size: 32rpx;
    }
  }

  .radio-label {
    font-size: 28rpx;
    color: #606266;
  }
}

.level-tip {
  background: #f0f9ff;
  border: 1px solid #91d5ff;
  border-radius: 6rpx;
  padding: 12rpx 20rpx;
  margin-bottom: 20rpx;
  font-size: 26rpx;
  color: #1890ff;
}


</style>
