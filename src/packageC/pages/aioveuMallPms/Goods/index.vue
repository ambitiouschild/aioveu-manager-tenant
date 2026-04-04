<!-- 转换后的 UniApp 页面 goods-detail.vue -->
<template>
  <view class="goods-detail-container">
    <!-- 步骤条：显示商品创建/编辑的步骤流程 -->
    <view class="goods-steps">
      <view
        v-for="(step, index) in steps"
        :key="index"
        class="step-item"
        :class="{
          'active': activeStep === index,
          'finished': activeStep > index
        }"
        @tap="activeStep = index"
      >
        <view class="step-icon">
          <view v-if="activeStep > index" class="icon-finished">✓</view>
          <view v-else class="icon-number">{{ index + 1 }}</view>
        </view>
        <view class="step-text">
          <view class="step-title">{{ step.title }}</view>
          <view class="step-desc">{{ step.desc }}</view>
        </view>
        <view v-if="index < 3" class="step-line"></view>
      </view>
    </view>

    <!-- 先测试简单的文本 -->
    <view v-if="activeStep === 0" style="padding: 20rpx; background: red; color: white;">
      <text>这是步骤1的内容区域，如果看到这个说明v-if生效了</text>
    </view>

    <!-- 步骤1：商品分类选择组件 -->
    <GoodsCategory
      v-if="activeStep === 0"
      :goodsInfo="goodsInfo"
      @update:goodsInfo="handleGoodsInfoUpdate"
      @prev="handlePrevStep"
      @next="handleNextStep"
      @edit-goods="handleEditGoods"
    />

    <!-- 步骤2：商品信息填写组件 -->
    <GoodsInfo
      v-if="activeStep === 1"
      :goodsInfo="goodsInfo"
      @update:goodsInfo="handleGoodsInfoUpdate"
      @prev="handlePrevStep"
      @next="handleNextStep"
    />

    <!-- 步骤3：商品属性设置组件 -->
    <GoodsAttribute
      v-if="activeStep === 2"
      :goodsInfo="goodsInfo"
      @update:goodsInfo="handleGoodsInfoUpdate"
      @prev="handlePrevStep"
      @next="handleNextStep"
    />

    <!-- 步骤4：商品库存设置组件 -->
    <GoodsStock
      v-if="activeStep === 3"
      :goodsInfo="goodsInfo"
      @update:goodsInfo="handleGoodsInfoUpdate"
      @prev="handlePrevStep"
      @next="handleNextStep"
      @submit-success="handleSubmitSuccess"
    />

    <!-- 操作按钮区域 -->
    <view class="action-buttons" v-if="activeStep > 0">
      <button
        class="btn-prev"
        @tap="handlePrevStep"
        :disabled="activeStep === 0"
      >
        上一步
      </button>
      <button
        class="btn-next"
        @tap="handleNextStep"
        v-if="activeStep < 3"
      >
        下一步
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { onLoad, onShow, onHide, onUnload } from '@dcloudio/uni-app';

// 导入子组件
// 注意：子组件也需要相应转换为 UniApp 组件
import GoodsCategory from './components/GoodsCategory.vue';
import GoodsInfo from './components/GoodsInfo.vue';
import GoodsAttribute from './components/GoodsAttribute.vue';
import GoodsStock from './components/GoodsStock.vue';

// 导入API接口
import PmsSpuAPI from '@/packageC/api/aioveuMallPms/aioveuMallPmsSpu/pms-spu';

// 步骤数据
const steps = [
  { title: '选择商品分类', desc: '选择商品所属的分类' },
  { title: '填写商品信息', desc: '填写商品基本信息' },
  { title: '设置商品属性', desc: '设置商品规格属性' },
  { title: '设置商品库存', desc: '设置商品SKU和库存' }
];

// 步骤状态
const activeStep = ref(0);
const isDataLoaded = ref(false);

// 商品信息数据
const goodsInfo = ref({
  id: undefined,
  name: '',
  categoryId: undefined,
  brandId: undefined,
  originPrice: undefined,
  price: undefined,
  album: [],
  attrList: [],
  specList: [],
  skuList: [],
  detail: '',
  sales: 0,
  stock: 0,
  picUrl: '',
  categoryName: '',
  brandName: '',
});

// 商品信息更新
const handleGoodsInfoUpdate = (newGoodsInfo) => {
  goodsInfo.value = { ...goodsInfo.value, ...newGoodsInfo };
};

/**
 * 加载商品数据
 */
const loadGoodsData = async () => {
  try {
    const goodsId = goodsInfo.value.id;
    console.log('📦 加载商品数据，ID:', goodsId);

    if (goodsId) {
      console.log(`📦 编辑模式，加载商品ID: ${goodsId} 的数据`);

      // UniApp 中使用 uni.request
      // const response = await uni.request({
      //   url: `/api/spu/${goodsId}`,
      //   method: 'GET'
      // });

      // 模拟API调用
      // const response = await PmsSpuAPI.getSpuDetail(goodsId);

      // 这里用模拟数据
      // if (response && response.data) {
      //   const data = response.data;
      //   goodsInfo.value = {
      //     ...data,
      //     originPrice: data.originPrice ? Number(data.originPrice) / 100 : undefined,
      //     price: data.price ? Number(data.price) / 100 : undefined
      //   };
      //   console.log('✅ 商品数据加载完成', goodsInfo.value);
      // }
    } else {
      console.log('🆕 新增商品模式，初始化空数据');
    }

    isDataLoaded.value = true;
  } catch (error) {
    console.error('❌ 加载商品数据失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'error'
    });
    isDataLoaded.value = true;
  }
};

/**
 * 上一步
 */
const handlePrevStep = () => {
  if (activeStep.value > 0) {
    const previousStep = activeStep.value;
    activeStep.value--;
    console.log(`⬅️ 返回上一步: ${previousStep} -> ${activeStep.value}`);

    // 如果从步骤1返回步骤0，重置为新增
    if (previousStep === 1 && activeStep.value === 0) {
      const currentCategoryId = goodsInfo.value.categoryId;
      // 重置商品信息，保留分类
      goodsInfo.value = {
        id: undefined,
        name: '',
        categoryId: currentCategoryId,
        brandId: undefined,
        originPrice: undefined,
        price: undefined,
        album: [],
        attrList: [],
        specList: [],
        skuList: [],
        detail: '',
        sales: 0,
        stock: 0,
        picUrl: '',
        categoryName: '',
        brandName: '',
      };
      console.log('🔄 从编辑模式返回，重置为新增模式，分类ID:', currentCategoryId);
    }
  }
};

/**
 * 下一步
 */
const handleNextStep = () => {
  if (activeStep.value < 3) {
    activeStep.value++;
    console.log(`➡️ 进入下一步，当前步骤: ${activeStep.value}`);
  }
};

/**
 * 处理提交成功
 */
const handleSubmitSuccess = (categoryId) => {
  console.log('✅ 商品提交成功，分类ID:', categoryId);

  if (categoryId) {
    goodsInfo.value.categoryId = categoryId;
  }

  // 返回第一步
  activeStep.value = 0;

  uni.showToast({
    title: '商品保存成功，可以继续添加商品',
    icon: 'success'
  });
};

/**
 * 处理编辑商品
 */
const handleEditGoods = async (goodsId) => {
  console.log('🎯 父组件收到编辑商品请求，ID:', goodsId);

  goodsInfo.value.id = goodsId;
  await loadGoodsData();

  console.log('➡️ 商品数据加载完成，切换到步骤1');
  activeStep.value = 1;
};

// UniApp 生命周期
onLoad(async (options) => {
  console.log('🔄 商品详情页面开始加载');
  console.log('✅ GoodsDetail 页面激活');

  // 从页面参数获取商品ID
  if (options.id) {
    const goodsId = Number(options.id);
    console.log('📦 从页面参数获取商品ID:', goodsId);
    goodsInfo.value.id = goodsId;
    await loadGoodsData();

    // 编辑模式默认进入步骤1
    if (activeStep.value === 0) {
      console.log('➡️ 编辑模式，自动切换到步骤1');
      activeStep.value = 1;
    }
  } else {
    console.log('🆕 新增模式，重置数据');
    isDataLoaded.value = true;
  }

  // 从页面参数获取步骤
  if (options.step) {
    const stepNum = parseInt(options.step, 10);
    if (stepNum >= 0 && stepNum <= 3) {
      activeStep.value = stepNum;
    }
  }

  await nextTick();
  console.log('✅ 商品详情页面加载完成');
});

onShow(() => {
  console.log('🔆 GoodsDetail 页面显示');
});

onHide(() => {
  console.log('🌙 GoodsDetail 页面隐藏');
});

onUnload(() => {
  console.log('🗑️ GoodsDetail 页面卸载');
});

// 监听步骤变化
watch(activeStep, (newStep, oldStep) => {
  console.log(`🔄 步骤变化: ${oldStep} -> ${newStep}`);

  // 更新页面参数
  // uni.redirectTo({
  //   url: `/pages/goods/detail?id=${goodsInfo.value.id || ''}&step=${newStep}`,
  //   fail: (err) => {
  //     console.log('更新URL失败:', err);
  //   }
  // });
});
</script>

<style lang="scss" scoped>
.goods-detail-container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f8f9fa;
  box-sizing: border-box;
}

/* 步骤条样式 */
.goods-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 20rpx;
  margin-bottom: 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  position: relative;

  .step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;
    position: relative;
    z-index: 1;

    &.active {
      .step-icon {
        background-color: #409eff;
        border-color: #409eff;
        .icon-number {
          color: #ffffff;
        }
      }
      .step-title {
        color: #409eff;
        font-weight: 600;
      }
    }

    &.finished {
      .step-icon {
        background-color: #67c23a;
        border-color: #67c23a;
        .icon-finished {
          color: #ffffff;
        }
      }
      .step-title {
        color: #67c23a;
      }
    }

    .step-icon {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      border: 2rpx solid #dcdfe6;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15rpx;
      background-color: #ffffff;

      .icon-number {
        font-size: 28rpx;
        color: #909399;
        font-weight: 500;
      }

      .icon-finished {
        font-size: 28rpx;
        color: #ffffff;
      }
    }

    .step-text {
      text-align: center;

      .step-title {
        font-size: 28rpx;
        color: #303133;
        margin-bottom: 8rpx;
        font-weight: 500;
      }

      .step-desc {
        font-size: 22rpx;
        color: #909399;
        line-height: 1.4;
      }
    }

    .step-line {
      position: absolute;
      top: 30rpx;
      right: -50%;
      width: 100%;
      height: 4rpx;
      background-color: #ebeef5;
      z-index: 0;
    }

    &:last-child .step-line {
      display: none;
    }
  }
}

/* 操作按钮区域 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  padding: 30rpx 20rpx;
  margin-top: 30rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 -4rpx 12rpx rgba(0, 0, 0, 0.05);

  button {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 30rpx;
    border: none;

    &::after {
      border: none;
    }

    &.btn-prev {
      background-color: #ffffff;
      color: #409eff;
      border: 2rpx solid #409eff;
      margin-right: 20rpx;

      &[disabled] {
        color: #c0c4cc;
        border-color: #c0c4cc;
        background-color: #f5f7fa;
      }
    }

    &.btn-next {
      background: linear-gradient(135deg, #409eff, #66b1ff);
      color: #ffffff;
    }
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .goods-steps {
    padding: 20rpx 15rpx;

    .step-item {
      .step-icon {
        width: 50rpx;
        height: 50rpx;
        margin-bottom: 10rpx;

        .icon-number,
        .icon-finished {
          font-size: 24rpx;
        }
      }

      .step-text {
        .step-title {
          font-size: 24rpx;
        }

        .step-desc {
          font-size: 20rpx;
        }
      }
    }
  }

  .action-buttons {
    padding: 20rpx 15rpx;

    button {
      height: 70rpx;
      line-height: 70rpx;
      font-size: 28rpx;
    }
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 步骤内容区域 */
.step-content {
  animation: fadeIn 0.3s ease-in-out;
  margin-bottom: 100rpx; /* 给底部按钮留出空间 */
}
</style>
