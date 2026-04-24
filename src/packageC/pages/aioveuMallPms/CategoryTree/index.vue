<template>
  <view class="app-container">

    <!-- 调试：测试组件是否加载 -->
    <view v-if="false" style="padding: 20rpx;">
      <text>Category组件是否存在: {{ categoryComponentLoaded }}</text>
    </view>


    <!-- 移动端适配布局：上下结构 -->
    <view class="main-content">
      <!--
        左侧列：商品分类树
        移动端改为上下结构
      -->
      <view class="category-section">
        <!-- 卡片组件，用于包裹分类树 -->
        <view class="box-card">
          <view class="card-header">
            商品分类
          </view>
          <view class="card-body">
            <!-- Category 组件：商品分类树组件 -->
            <Category
              ref="categoryRef"
              @category-click="handleCategoryClick"
            />
          </view>
        </view>
      </view>

      <!--
        右侧列：规格属性管理
        移动端改为上下结构
      -->
      <view class="attribute-section">
        <!--
          卡片组件，用于包裹规格属性管理区域
        -->
        <view class="box-card">
          <view class="card-header">
            {{ category.name || '' }} 规格属性
          </view>
          <view class="card-body">
            <!--
              Attribute 组件：商品规格管理组件
            -->
            <Attribute
              ref="specificationRef"
              :attributeType="1"
              :category="category"
            />
            <!--
              Attribute 组件：商品属性管理组件
            -->
            <Attribute
              ref="attributeRef"
              :attributeType="2"
              :category="category"
              class="attribute-margin"
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import type { Ref } from 'vue'

// 调试：检查组件导入
console.log('🔍 开始导入组件...')
// 方式1：相对路径（最可能）
import Category from './components/Category.vue'
console.log('✅ Category组件导入:', Category)
// 同样检查Attribute组件
import Attribute from './components/Attribute.vue'
console.log('✅ Attribute组件导入:', Attribute)


// 定义类型
interface Category {
  id?: number
  name: string
  childrenLen: number
  children?: any[]
}

interface CategoryRow {
  id: number
  name: string
  children: any[]
}

// 组件名称定义
defineOptions({
  name: "CategoryTree",
})

// 使用 ref 定义响应式数据
const category: Ref<Category> = ref({
  id: undefined,
  name: "",
  childrenLen: 0,
})

// 调试：检查组件是否成功导入
const categoryComponentLoaded = ref(false)
const attributeComponentLoaded = ref(false)


// 组件引用
const categoryRef = ref<InstanceType<any> | null>(null)
const specificationRef = ref<InstanceType<any> | null>(null)
const attributeRef = ref<InstanceType<any> | null>(null)

/**
 * 处理分类点击事件
 * 当左侧分类树中的分类被点击时触发
 * @param categoryRow - 点击的分类节点数据
 */
const handleCategoryClick = (categoryRow: CategoryRow | null) => {
  // 如果有选中分类，更新当前选中的分类信息
  if (categoryRow) {
    category.value = {
      id: categoryRow.id,
      name: categoryRow.name,
      childrenLen: categoryRow.children?.length || 0,
    }
  } else {
    // 如果没有选中分类（如取消选择），重置分类信息
    category.value = {
      id: undefined,
      name: "",
      childrenLen: 0,
    }
  }
}

onMounted(() => {
  console.log('🔍 页面挂载，开始检查组件...')
  console.log('Category组件:', categoryRef.value)
  console.log('specificationRef组件:', specificationRef.value)
  console.log('attributeRef组件:', attributeRef.value)
  console.log('category数据:', category.value)
})

/**
 * 组件卸载时的清理
 */
onUnmounted(() => {
  console.log('🗑️ CategoryPage 组件卸载')

  // 手动清理子组件引用
  if (categoryRef.value) {
    const categoryTree = categoryRef.value

    // 调用子组件的清理方法（如果子组件暴露了）
    if (typeof categoryTree.cleanup === 'function') {
      categoryTree.cleanup()
    }

    categoryRef.value = null
  }

  specificationRef.value = null
  attributeRef.value = null

  // 清空 category 数据
  category.value = {
    id: undefined,
    name: "",
    childrenLen: 0,
  }

  // 强制触发垃圾回收（如果支持）
  if (typeof window !== 'undefined' && (window as any).gc) {
    (window as any).gc()
  }
})
</script>

<style lang="scss" scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20rpx;
  box-sizing: border-box;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.category-section,
.attribute-section {
  width: 100%;
}

.box-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

.card-header {
  padding: 24rpx 32rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #303133;
  border-bottom: 2rpx solid #f0f0f0;
  background-color: #fafafa;
}

.card-body {
  padding: 32rpx;
  min-height: 300rpx;
}

.attribute-margin {
  margin-top: 30rpx;
}

/* 适配不同屏幕尺寸 */
@media (min-width: 768px) {
  .main-content {
    flex-direction: row;
  }

  .category-section {
    width: 58.3333%; /* 14/24 ≈ 58.33% */
  }

  .attribute-section {
    width: 41.6667%; /* 10/24 ≈ 41.67% */
  }
}
</style>
