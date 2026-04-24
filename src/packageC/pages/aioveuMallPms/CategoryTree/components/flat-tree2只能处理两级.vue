<!-- components/flat-tree.vue -->
<template>
  <view class="flat-tree">
    <view
      v-for="node in flattenedNodes"
      :key="node.id"
      class="tree-node"
      :style="{
        paddingLeft: (node.level * 30) + 'rpx',
        backgroundColor: node.id === selectedId ? '#f0f7ff' : 'transparent'
      }"
      @click="handleNodeClick(node)"
    >
      <!-- 缩进线 -->
      <view class="indent-line" v-if="node.level > 0"></view>

      <!-- 展开/收起图标 -->
      <view
        v-if="node.hasChildren"
        class="expand-icon"
        @click.stop="toggleExpand(node)"
      >
        <text>{{ node.expanded ? '▼' : '▶' }}</text>
      </view>

      <!-- 节点内容 -->
      <view class="node-content">
        <image
          v-if="node.iconUrl"
          :src="node.iconUrl"
          class="node-icon"
          mode="aspectFit"
        />
        <text class="node-label">{{ node.name }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'


// 当前的 FlatTree只能处理两级（根节点 + 一级），因为它没有正确计算每个节点的层级和展开状态。


interface TreeNode {
  id: number
  name: string
  level: number
  parentId?: number
  iconUrl?: string
  visible?: number
  sort?: number
  expanded?: boolean
  children?: TreeNode[]
}

const props = defineProps<{
  data: TreeNode[]
}>()

const emit = defineEmits<{
  nodeClick: [node: TreeNode]
}>()

// 选中的节点ID
const selectedId = ref<number>()

/**
 * 扁平化树形数据
 */
const flattenedNodes = computed(() => {
  const result: any[] = []

  const flatten = (nodes: TreeNode[], level: number = 0, parentExpanded: boolean = true) => {
    for (const node of nodes) {
      const hasChildren = node.children && node.children.length > 0

      result.push({
        ...node,
        level,
        hasChildren,
        // 如果父节点没展开，子节点就不显示
        _visible: level === 0 || parentExpanded
      })

      // 递归处理子节点
      if (hasChildren && node.expanded) {
        flatten(node.children || [], level + 1, node.expanded)
      }
    }
  }

  flatten(props.data)
  return result.filter(node => node._visible)
})

/**
 * 展开/收起节点
 */
const toggleExpand = (node: any) => {
  node.expanded = !node.expanded
  // 触发数据更新
  emit('nodeClick', node)
}

/**
 * 点击节点
 */
const handleNodeClick = (node: any) => {
  selectedId.value = node.id
  console.log('🌳 点击节点:', node)
  emit('nodeClick', node)
}
</script>

<style scoped>
.flat-tree {
  padding: 20rpx 0;
}

.tree-node {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
  position: relative;
}

.indent-line {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2rpx;
  background-color: #e0e0e0;
}

.expand-icon {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 24rpx;
  margin-right: 10rpx;
}

.node-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.node-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 15rpx;
  border-radius: 6rpx;
}

.node-label {
  font-size: 28rpx;
  color: #333;
}
</style>
