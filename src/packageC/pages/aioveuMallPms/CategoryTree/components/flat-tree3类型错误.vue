<!-- flat-tree.vue -->
<template>
  <view class="tree-container">

    <!-- 在模板中添加 -->
    <view style="background: #f5f5f5; padding: 10rpx; margin: 10rpx;">
      <text style="font-size: 24rpx; color: #666;">
        当前显示 {{ displayList.length }} 个节点 |
        选中: {{ selectedId }} |
        层级: {{ node.level }}
      </text>
    </view>

    <!-- 遍历扁平化后的节点列表 -->
    <view
      v-for="item in displayList"
      :key="item.id"
      class="tree-item"
      :style="{
        paddingLeft: `${item.level * 40}rpx`,
        display: item.visible ? 'flex' : 'none'
      }"
    >
      <!-- 缩进线（可选样式） -->
      <view class="indent-line" v-if="item.level > 0"></view>

      <!-- 展开/收起图标 -->
      <view
        v-if="item.hasChildren"
        class="expand-icon"
        @tap.stop="toggleExpand(item)"
      >
        <text class="icon">{{ item.expanded ? '▼' : '▶' }}</text>
      </view>
      <view v-else class="expand-placeholder"></view>

      <!-- 节点内容 -->
      <view
        class="node-content"
        :class="{ selected: item.id === selectedId }"
        @tap.stop="handleClick(item)"
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

        <!-- 操作按钮（可选） -->
        <view class="node-actions" v-if="item.id !== 0">
          <text class="action-btn" @tap.stop="emit('add', item)">➕</text>
          <text class="action-btn" @tap.stop="emit('update', item)">✏️</text>
          <text class="action-btn" @tap.stop="emit('delete', item)">🗑️</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// 支持无限层级的版本

// 定义类型
interface TreeNode {
  id: number
  name: string
  level: number
  parentId?: number
  iconUrl?: string
  visible?: number
  sort?: number
  children?: TreeNode[]
  [key: string]: any
}

interface FlatNode extends TreeNode {
  expanded: boolean
  visible: boolean
  hasChildren: boolean
  _parentIds: number[]  // 所有父级ID数组
}

const props = defineProps<{
  data: TreeNode[]
}>()

const emit = defineEmits<{
  nodeClick: [node: TreeNode]
  add: [node: TreeNode]
  update: [node: TreeNode]
  delete: [node: TreeNode]
}>()

// 存储扁平化的节点
const flatNodes = ref<FlatNode[]>([])
// 选中的节点ID
const selectedId = ref<number>()

/**
 * 递归扁平化树结构
 */
const flattenTree = (nodes: TreeNode[], parentIds: number[] = [], level: number = 0): FlatNode[] => {
  const result: FlatNode[] = []

  for (const node of nodes) {
    const currentParentIds = [...parentIds, node.id]
    const hasChildren = !!(node.children && node.children.length > 0)

    const flatNode: FlatNode = {
      ...node,
      expanded: false,  // 默认不展开
      visible: true,    // 默认可见
      hasChildren,
      _parentIds: currentParentIds,  // 记录所有父级ID
      level
    }

    result.push(flatNode)

    // 递归处理子节点
    if (hasChildren) {
      result.push(...flattenTree(node.children!, currentParentIds, level + 1))
    }
  }

  return result
}

/**
 * 监听数据变化，初始化扁平化节点
 */
watch(() => props.data, (newData) => {
  if (newData && newData.length > 0) {
    flatNodes.value = flattenTree(newData)
    console.log('📊 扁平化后的节点:', flatNodes.value)
  }
}, { immediate: true, deep: true })

/**
 * 计算显示的节点列表
 */
const displayList = computed(() => {
  const result: FlatNode[] = []

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
      result.push(node)
    }
  }

  return result
})

/**
 * 展开/收起节点
 */
const toggleExpand = (node: FlatNode) => {
  if (node.hasChildren) {
    node.expanded = !node.expanded
    console.log(`切换节点 ${node.name} 展开状态: ${node.expanded}`)
  }
}

/**
 * 点击节点
 */
const handleClick = (node: TreeNode) => {
  selectedId.value = node.id
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

.indent-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background-color: #e8e8e8;
  margin-left: 20rpx;
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

.node-actions {
  display: flex;
  gap: 20rpx;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.tree-item:hover .node-actions {
  opacity: 1;
}

.action-btn {
  font-size: 28rpx;
  padding: 5rpx 10rpx;
  border-radius: 6rpx;
  background-color: #f5f5f5;
  cursor: pointer;
}
</style>
