<!-- CategoryTreeNode.vue -->
<template>
  <view style="background-color: rgba(0, 255, 0, 0.2); min-height: 100rpx;">
    <!-- 修改 <view class="tree-node">的 :style，让它缩进更明显一点注意单位改成 rpx，数值加大 -->
    <!--    :style="{ paddingLeft: (level * 40) + 'rpx' }" 临时移除缩进-->
    <view
      class="tree-node"
      :class="['level-' + level, { 'has-children': node.children && node.children.length > 0 }]"
      style="background: blue; color: white; padding: 20rpx; margin: 5rpx;"
    >
      <view class="node-content" @click="onNodeClick(node)">
        <!-- 展开/收起图标 -->
        <view v-if="node.children && node.children.length > 0" class="expand-icon" @click.stop="toggleExpand">
          <text v-if="expanded" class="icon">▼</text>
          <text v-else class="icon">▶</text>
        </view>
        <view v-else class="expand-placeholder"></view>

        <!-- 三级分类显示图标 -->
        <image
          v-if="node.level === 3 && node.iconUrl"
          :src="node.iconUrl"
          class="node-icon"
          mode="aspectFit"
        />
        <view v-else-if="node.level === 3" class="icon-placeholder">
          <text class="icon">📁</text>
        </view>

        <!-- 分类名称 -->
        <!--        <text class="node-name">{{ node.name }}</text>-->

        <!-- 分类名称 -->
        <text class="node-name" style="color: red !important; background-color: yellow;">{{ node.name }}</text>

        <!-- 操作按钮 -->
        <view class="action-buttons" @click.stop>
          <!-- 非三级分类显示新增按钮 -->
          <view
            v-if="node.level !== 3"
            class="action-button add-button"
            @click="$emit('add', node)"
          >
            新增
          </view>

          <!-- 非根节点显示编辑按钮 -->
          <view
            v-if="node.id !== 0"
            class="action-button edit-button"
            @click="$emit('update', node)"
          >
            编辑
          </view>

          <!-- 叶子节点显示删除按钮 -->
          <view
            v-if="node.id && (!node.children || node.children.length === 0)"
            class="action-button delete-button"
            @click="$emit('delete', node)"
          >
            删除
          </view>
        </view>
      </view>
    </view>


    <!-- 调试信息 -->
    <!--    <view style="background: #faad14; padding: 10rpx; margin: 5rpx;">-->
    <!--      <text style="color: #333; font-size: 24rpx;">-->
    <!--        条件: expanded={{expanded}},-->
    <!--        children长度={{children.length}},-->
    <!--        应该渲染={{expanded && children.length > 0}}-->
    <!--      </text>-->
    <!--    </view>-->

    <!-- 调试信息 -->
    <!--    <view style="background: #faad14; padding: 10rpx; margin: 5rpx;">-->
    <!--      <text style="color: #333; font-size: 24rpx;">-->
    <!--        条件: expanded={{expanded}},-->
    <!--        children长度={{children.length}},-->
    <!--        应该渲染={{expanded && node.children.length > 0}}-->
    <!--      </text>-->
    <!--    </view>-->


    <!-- 子节点  是的！在递归组件中，组件需要引用自己  && node.children.length > 0-->
    <!--    <category-tree-node>是 kebab-case 写法，而 Vue 3 的 <script setup>中，组件不会自动注册 kebab-case 别名。-->
    <!-- 强制渲染子节点，不判断条件  expanded && -->
    <!--    <view v-if="children.length > 0" class="children-container">-->
    <view v-if="expanded && node.children && node.children.length > 0" class="children-container">

      <!-- 1. 保留你的调试文字，把颜色改成黑色确保能看到 -->
      <text style="color: black; background: yellow;">🎯 开始渲染 {{ node.children.length }} 个子节点</text>

            <!-- 调试：检查子组件是否渲染 -->
            <view style="background: red; padding: 20rpx; margin: 5rpx;">
              <text style="color: white;">🎯 子组件容器 - 应该显示</text>
            </view>

      <!-- 2. 【关键修复】使用动态组件渲染子节点 -->
      <!-- 先引入组件，然后用 <component :is="..."> 包裹 -->


      <component :is="CurrentComponent"
                 v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
        :expanded-nodes="expandedNodes"
        @node-click="$emit('node-click', $event)"
        @toggle-expand="handleToggleExpand"
        @add="$emit('add', $event)"
        @update="$emit('update', $event)"
        @delete="$emit('delete', $event)"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeMount, onMounted } from 'vue'
// import { defineOptions } from 'vue'

// defineEmits 和 defineExpose 是编译器宏，不需要导入
// defineProps 也是编译器宏，不需要导入

import { defineAsyncComponent, markRaw } from 'vue'
// ✅ 添加组件名
defineOptions({
  name: 'CategoryTreeNode'
})

// ✅ 异步导入自己
const CurrentComponent = markRaw(
  defineAsyncComponent(() => import('./CategoryTreeNode.vue'))
)

// <component :is="CurrentComponent">：这是 Vue 标准的动态组件写法。
// 相比于直接写 <CategoryTreeNode>，这种写法能更明确地让 Vue 的编译器识别出“这是一个组件标签”，从而正确处理递归渲染。

// 定义类型
interface CategoryNode {
  id: number
  name: string
  level: number
  parentId?: number
  iconUrl?: string
  children?: CategoryNode[]
  [key: string]: any
}

// 定义props
const props = defineProps<{
  node: CategoryNode
  level: number
  // expandedNodes: Set<number>

  expandedNodes: number[]  // ✅ 改为数组
}>()

// 定义事件
const emit = defineEmits<{
  (e: 'node-click', data: CategoryNode): void
  (e: 'toggle-expand', nodeId: number): void
  (e: 'add', data: CategoryNode): void
  (e: 'update', data: CategoryNode): void
  (e: 'delete', data: CategoryNode): void
}>()



// 计算展开状态
const expanded = computed(() => {

  console.log(`🔄 开始计算节点 ${props.node.name} 的展开状态`)

  // 检查 expandedNodes 的类型和方法
  if (!props.expandedNodes || typeof props.expandedNodes.includes !== 'function') {
    console.error(`❌ expandedNodes 不是有效的 Set:`, props.expandedNodes)
    return false
  }

  const isExpanded = props.expandedNodes.includes(props.node.id)
  console.log(`🔍 节点 ${props.node.name} (id:${props.node.id}) 展开状态:`, isExpanded)
  console.log(`🔍 expandedNodes:`, props.expandedNodes)
  console.log(`🔍 node.children:`, props.node.children)

  // 检查子节点的数据结构
  if (props.node.children && props.node.children.length > 0) {
    console.log(`🔍 第一个子节点:`, props.node.children[0])
    console.log(`🔍 第一个子节点的children:`, props.node.children[0]?.children)
  }
  console.log(`🔍计算展开状态:`, isExpanded)
  return isExpanded
})

onBeforeMount(() => {
  console.log(`📦 节点 ${props.node.name} 接收的 props:`)
  console.log(`📦 expandedNodes:`, props.expandedNodes)
  console.log(`📦 expandedNodes 类型:`, typeof props.expandedNodes)
  console.log(`📦 expandedNodes 是数组吗:`, Array.isArray(props.expandedNodes))
  console.log(`📦 expandedNodes.includes(${props.node.id}):`, props.expandedNodes.includes(props.node.id))
})


onMounted(() => {
  console.log(`🚀 节点 ${props.node.name} 挂载, level: ${props.level}`)
})

// 切换展开状态
const toggleExpand = () => {
  emit('toggle-expand', props.node.id)
}

// 添加 toggle-expand 事件处理
const handleToggleExpand = (nodeId: number) => {
  console.log(`📡 传递 toggle-expand 事件: ${nodeId}`)
  emit('toggle-expand', nodeId)
}

// 节点点击
const onNodeClick = (node: CategoryNode) => {
  emit('node-click', node)
}
</script>

<style lang="scss" scoped>
.tree-node {
  padding: 20rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }

  &.level-0 {
    background-color: #fafafa;
    font-weight: bold;
  }

  &.level-1 {
    background-color: #ffffff;
  }

  &.level-2 {
    background-color: #f9f9f9;
  }

  &.level-3 {
    background-color: #f3f3f3;
  }

  .node-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .expand-icon, .expand-placeholder {
    width: 40rpx;
    display: flex;
    justify-content: center;

    .icon {
      font-size: 24rpx;
      color: #909399;
    }
  }

  .node-icon {
    width: 40rpx;
    height: 40rpx;
    margin: 0 20rpx;
  }

  .icon-placeholder {
    width: 40rpx;
    height: 40rpx;
    margin: 0 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      font-size: 32rpx;
      color: #909399;
    }
  }

  .node-name {
    flex: 1;
    font-size: 28rpx;
    //color: #303133;  // 注意这个文字颜色！ //如果子组件的 <text>标签因为某种原因没有继承到这个深色，或者被子元素的白色背景覆盖了，你就会看到一个白底白字的“幽灵节点”。
    color: red !important; // 临时强制设为红色
  }

  .action-buttons {
    display: flex;
    gap: 20rpx;
  }

  .action-button {
    padding: 8rpx 16rpx;
    border-radius: 6rpx;
    font-size: 24rpx;
    min-width: 60rpx;
    text-align: center;

    &.add-button {
      background-color: #f0f9eb;
      color: #67c23a;
      border: 1rpx solid #e1f3d8;
    }

    &.edit-button {
      background-color: #fdf6ec;
      color: #e6a23c;
      border: 1rpx solid #faecd8;
    }

    &.delete-button {
      background-color: #fef0f0;
      color: #f56c6c;
      border: 1rpx solid #fde2e2;
    }
  }
}

.children-container {
  border-left: 4rpx solid #e4e7ed;
  /* 临时添加一个高亮背景色用于测试 */

  background-color: yellow !important;

  min-height: 200rpx; /* 给个最小高度 */
}
</style>
