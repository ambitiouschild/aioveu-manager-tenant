<!-- flat-tree.vue - 修复版，支持无限层级 -->
<template>
  <view class="tree-container">
    <!-- 遍历扁平化后的显示列表 -->
    <!-- ✅ 添加这行：整行点击事件 -->
    <view
      v-for="item in displayList"
      :key="item.id"
      class="tree-item"
      :style="{
        paddingLeft: (item.level * 40) + 'rpx',
        display: item._visible ? 'flex' : 'none'
      }"
      @tap.stop="handleRowClick(item)"
    >
      <!-- 展开/收起图标 -->
      <view
        v-if="item.children && item.children.length > 0"
        class="expand-icon"
        @tap.stop="toggleExpand(item)"
      >
        <text class="icon">{{ item.expanded ? '▼' : '▶' }}</text>
      </view>
      <view v-else class="expand-placeholder"></view>

      <!-- 节点内容      @tap.stop="handleClick(item)"-->
      <view
        class="node-content"
        :class="{ selected: item.id === selectedId }"

      >
        <!-- 图标 -->
        <image
          v-if="item.iconUrl"
          :src="item.iconUrl"
          class="node-icon"
          mode="aspectFit"
        />
        <view v-else class="icon-placeholder"></view>

        <!-- 名称 -->
        <text class="node-label">{{ item.name }}</text>
      </view>

      <!-- ✅ 新增：操作按钮 -->
      <view class="node-actions">

        <!-- 编辑和删除：非根节点才显示 -->
        <text
          v-if="item.id !== 0"
          class="action-btn edit"
          @tap.stop="$emit('edit-click', item)"
        >
          ✏️
        </text>

        <!-- 新增：所有节点都显示，但显示文字不同 -->
        <!-- 修改新增按钮逻辑 -->
        <text
          class="action-btn add"
          @tap.stop="$emit('add-click', item)"
          :title="item.id === 0 ? '新增一级分类' : '新增下级分类'"
          v-if="canAddChild(item)"
        >
          {{ item.id === 0 ? '🏠 ' : '➕' }}
        </text>

        <!-- 删除：非根节点才显示 -->
        <text
          v-if="item.id !== 0"
          class="action-btn delete"
          @tap.stop="$emit('delete-click', item)"
        >
          🗑️
        </text>

      </view>

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 定义节点类型
interface TreeNode {
  id: number
  name: string
  level: number
  parentId?: number
  iconUrl?: string
  visible?: number
  sort?: number
  children?: TreeNode[]
  expanded?: boolean
  [key: string]: any
}

interface FlatTreeNode extends TreeNode {
  _visible: boolean
  _parentIds: number[]
}

const props = defineProps<{
  data: TreeNode[]
}>()

const emit = defineEmits<{
  nodeClick: [node: TreeNode]
  editClick: [node: TreeNode]     // ✅ 新增
  addClick: [node: TreeNode]      // ✅ 新增
  deleteClick: [node: TreeNode]   // ✅ 新增
}>()

// 扁平化后的节点列表
const flatNodes = ref<FlatTreeNode[]>([])
// 选中的节点ID
const selectedId = ref<number>(0)

/**
 * 递归扁平化树结构
 */
const flattenTree = (nodes: TreeNode[], parentIds: number[] = []): FlatTreeNode[] => {
  const result: FlatTreeNode[] = []

  for (const node of nodes) {
    const currentParentIds = [...parentIds, node.id]

    const flatNode: FlatTreeNode = {
      ...node,
      _visible: true,  // 默认可见
      _parentIds: currentParentIds
    }

    result.push(flatNode)

    // 如果有子节点，递归处理
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, currentParentIds))
    }
  }

  return result
}


/**
 * ✅ 修复：点击整行展开/收起
 */
const handleRowClick = (item: FlatTreeNode) => {
  console.log('=== 点击事件开始 ===')
  console.log('节点:', item.name, 'ID:', item.id)
  console.log('是否有子节点:', item.children?.length || 0)
  console.log('当前展开状态:', item.expanded)
  console.log('=== 点击事件结束 ===')

  // 直接判断是否有子节点
  if (item.children && item.children.length > 0) {
    // 有子节点，切换展开状态
    toggleExpand(item)
  } else {
    // 叶子节点，触发点击事件
    // 叶子节点，触发点击事件
    console.log('叶子节点，触发点击')
    selectedId.value = item.id
    emit('nodeClick', item)
  }
}

/**
 * 检查是否可以新增子分类
 */
const canAddChild = (item: TreeNode) => {
  // 根节点（全部分类）可以新增一级分类
  if (item.id === 0) return true

  // 三级分类不能新增子分类
  if (item.level >= 3) {
    return false
  }

  return true
}



/**
 * 计算显示的节点列表
 */
const displayList = computed(() => {
  const result: FlatTreeNode[] = []

  for (const node of flatNodes.value) {
    // 检查节点是否应该显示
    let shouldShow = true

    // 检查所有父节点是否展开
    for (let i = 0; i < node._parentIds.length - 1; i++) {
      const parentId = node._parentIds[i]
      const parentNode = flatNodes.value.find(n => n.id === parentId)

      // 如果某个父节点未展开，则该节点不显示
      if (parentNode && !parentNode.expanded) {
        shouldShow = false
        break
      }
    }

    if (shouldShow) {
      result.push(node)  // ✅ 修复：直接 push node，不要重新创建对象
    }
  }
  console.log('🔄 显示列表更新:', result.map(n => `${n.name} (展开:${n.expanded})`))
  return result
})

/**
 * 监听数据变化，初始化扁平化节点
 */
watch(() => props.data, (newData) => {
  if (newData && newData.length > 0) {
    flatNodes.value = flattenTree(newData)
    console.log('📊 扁平化后的节点:', flatNodes.value)

    // 根节点默认展开
    if (flatNodes.value.length > 0) {
      const rootNode = flatNodes.value.find(n => n.level === 0)
      if (rootNode) {
        rootNode.expanded = true
      }
    }
  }
}, { immediate: true, deep: true })

/**
 * 展开/收起节点
 */
const toggleExpand = (node: FlatTreeNode) => {
  // ✅ 修复：使用 Vue 的响应式更新
  if (node.children && node.children.length > 0) {
    node.expanded = !node.expanded

    // ✅ 修复：强制触发计算属性重新计算
    // 这里需要让 Vue 知道 flatNodes.value 发生了变化
    flatNodes.value = [...flatNodes.value]

    console.log(`切换节点 ${node.name} 展开状态: ${node.expanded}`)
  }
}

/**
 * 点击节点
 */
const handleClick = (node: TreeNode) => {
  selectedId.value = node.id
  console.log('点击节点:', node)
  emit('nodeClick', node)
}
</script>

<style scoped>
.tree-container {
  padding: 20rpx 0;
}

.tree-item {
  display: flex;
  align-items: center;
  min-height: 80rpx;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

/* 添加点击效果 */
.tree-item:active {
  background-color: rgba(0, 0, 0, 0.05);
  transition: background-color 0.1s;
}

.expand-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10rpx;
  z-index: 1;
}

.expand-icon .icon {
  font-size: 24rpx;
  color: #999;
  transition: transform 0.2s;
}

.expand-placeholder {
  width: 40rpx;
  height: 40rpx;
  margin-right: 10rpx;
}

.node-content {
  display: flex;
  align-items: center;
  flex: 1;
  padding: 20rpx 0;
  transition: background-color 0.2s;
}

.node-content.selected {
  background-color: #f0f7ff;
  border-radius: 8rpx;
}

.node-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 15rpx;
  border-radius: 6rpx;
}

.icon-placeholder {
  width: 40rpx;
  height: 40rpx;
  margin-right: 15rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
}

.node-label {
  font-size: 30rpx;
  color: #333;
  flex: 1;
}

/* 节点操作按钮 */
.node-actions {
  display: flex;
  gap: 20rpx;
  margin-left: auto; /* 推到最右边 */
  opacity: 0.5;
  transition: opacity 0.2s;
}

.tree-item:hover .node-actions {
  opacity: 1; /* 鼠标悬停时显示 */
}

.action-btn {
  font-size: 28rpx;
  cursor: pointer;
  padding: 5rpx;
  border-radius: 4rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
}

.action-btn.edit {
  color: #409eff;
  background-color: #ecf5ff;
}

.action-btn.add {
  color: #67c23a;
  background-color: #f0f9eb;
}

.action-btn.delete {
  color: #f56c6c;
  background-color: #fef0f0;
}

/*给用户一个“点击感”，比如按钮点击时变色或缩放 按钮悬停/点击反馈*/
.action-btn:active {
  transform: scale(0.9);
  opacity: 0.8;
}


</style>
