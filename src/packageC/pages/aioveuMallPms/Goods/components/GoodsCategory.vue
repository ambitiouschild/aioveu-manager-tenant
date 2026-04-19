<!-- 转换后的 UniApp 组件 GoodsCategory.vue -->
<template>
  <view class="component-container">
    <!-- 主要内容区域 -->
    <view class="component-container__main">
      <!-- 级联选择器（3级分类） -->
      <picker
        mode="multiSelector"
        :value="multiIndex"
        :range="multiOptions"
        range-key="label"
        @change="handlePickerChange"
        @columnchange="handlePickerColumnChange"
        class="category-picker"
      >
        <view class="picker-trigger">
          <view v-if="selectedCategoryLabel" class="selected-category">
            {{ selectedCategoryLabel }}
          </view>
          <view v-else class="picker-placeholder">
            请选择商品分类
          </view>
          <view class="picker-arrow">▼</view>
        </view>
      </picker>

      <!-- 分类路径显示 -->
      <view class="path-display" v-if="pathLabels.length > 0">
        <text class="path-label">您选择的商品分类:</text>
        <view class="path-items">
          <text
            v-for="(item, index) in pathLabels"
            :key="index"
            class="path-item"
          >
            {{ item }}
            <text v-if="index < pathLabels.length - 1" class="separator">></text>
          </text>
        </view>
      </view>

      <!-- 在下面显示该第三级分类的商品列表 -->
      <view v-if="showProductSection" class="product-section">
        <view class="section-header">
          <text class="section-title">{{ selectedThirdLevelName }} - 商品列表</text>
          <button
            class="btn-add-goods"
            @tap="handleAddGoods"
            hover-class="btn-hover"
            hover-start-time="20"
            hover-stay-time="70"
            :disabled="pathLabels.length !== 3"
          >
            新增商品
          </button>
        </view>

        <!-- 商品列表 -->
        <scroll-view
          v-if="goodsList.length > 0"
          scroll-y
          class="goods-list"
          :style="{ height: listHeight + 'px' }"
        >
          <view
            v-for="(item, index) in goodsList"
            :key="item.id"
            class="goods-item"
            @tap="handleViewGoods(item)"
          >
            <!-- 商品图片 -->
            <view class="goods-image-container">
              <image
                v-if="item.picUrl"
                :src="item.picUrl"
                mode="aspectFill"
                class="goods-image"
              />
              <view v-else class="goods-image-placeholder">无图</view>
            </view>

            <!-- 商品信息 -->
            <view class="goods-info">
              <view class="goods-name">{{ item.name }}</view>
              <view class="goods-details">
                <text class="goods-price">¥{{ formatPrice(item.price) }}</text>
                <text class="goods-stock">库存: {{ item.stock }}</text>
                <view class="goods-status">
                  <view
                    class="status-badge"
                    :class="item.status === 1 ? 'status-on' : 'status-off'"
                  >
                    {{ item.status === 1 ? "上架" : "下架" }}
                  </view>
                </view>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="goods-actions">
              <button
                class="btn-view"
                @tap.stop="handleViewGoods(item)"
                hover-class="btn-hover"
                hover-start-time="20"
                hover-stay-time="70"
              >
                查看
              </button>
              <button
                class="btn-edit"
                @tap.stop="handleEditGoods(item)"
                hover-class="btn-hover"
                hover-start-time="20"
                hover-stay-time="70"
              >
                编辑
              </button>
            </view>
          </view>

          <!-- 加载更多 -->
          <view v-if="loadingGoods" class="loading-more">
            <text>加载中...</text>
          </view>
        </scroll-view>

        <!-- 空状态 -->
        <view v-else-if="!loadingGoods" class="empty-goods">
          <image
            src="/static/empty-goods.png"
            class="empty-image"
            mode="aspectFit"
          />
          <text class="empty-text">该分类下暂无商品</text>
          <button
            class="btn-empty-add"
            @tap="handleAddGoods"
            hover-class="btn-hover"
            hover-start-time="20"
            hover-stay-time="70"
            :disabled="pathLabels.length !== 3"
          >
            新增商品
          </button>
        </view>

        <!-- 加载中 -->
        <view v-else class="loading-container">
          <view class="loading-spinner"></view>
          <text class="loading-text">加载中...</text>
        </view>
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="component-container__footer">
      <button
        class="btn-next"
        :disabled="pathLabels.length !== 3 || !goodsInfo.categoryId"
        @tap="handleNext"
        hover-class="btn-hover"
        hover-start-time="20"
        hover-stay-time="70"
      >
        下一步，填写商品信息
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { onLoad, onShow, onHide, onReady } from '@dcloudio/uni-app';

// 导入API
import PmsCategoryAPI from '@/packageC/api/aioveuMallPms/aioveuMallPmsCategory/pms-category';
import PmsSpuAPI from '@/packageC/api/aioveuMallPms/aioveuMallPmsSpu/pms-spu';

interface CategoryOptionData {
  id?: number;
  name: string;
  label: string;
  value?: number;
  children?: CategoryOptionData[];
}


// 类型定义
class CategoryOption {
  id?: number = undefined;
  name: string = '';
  label: string = '';
  value?: number = undefined;
  children: CategoryOptionData[] = [];

  constructor(data: Partial<CategoryOptionData> = {}) {
    Object.assign(this, data);
  }
}

interface GoodsItemData {
  id?: number;
  name: string;
  picUrl: string;
  price: number;
  stock: number;
  status: number;
}

class GoodsItem {
  id?: number = undefined;
  name: string = '';
  picUrl: string = '';
  price: number = 0;
  stock: number = 0;
  status: number = 0;

  constructor(data: Partial<GoodsItemData> = {}) {
    Object.assign(this, data);
  }
}

interface GoodsInfoData {
  id?: number;
  categoryId?: number;
  name: string;
  picUrl: string;
  price?: number;
  originPrice?: number;
  album: any[];
  detail: string;
  attrList: any[];
  specList: any[];
  skuList: any[];
  sales: number;
  stock: number;
  categoryName: string;
  brandName: string;
}

class GoodsInfo {
  id?: number = undefined;
  categoryId?: number = undefined;
  name: string = '';
  picUrl: string = '';
  price?: number = undefined;
  originPrice?: number = undefined;
  album: any[] = [];
  detail: string = '';
  attrList: any[] = [];
  specList: any[] = [];
  skuList: any[] = [];
  sales: number = 0;
  stock: number = 0;
  categoryName: string = '';
  brandName: string = '';

  constructor(data: Partial<GoodsInfoData> = {}) {
    Object.assign(this, data);
  }
}

// Props 和 Emit
interface Props {
  goodsInfo?: GoodsInfoData;
}

// 使用内联对象字面量
const props = withDefaults(defineProps<Props>(), {
  goodsInfo: () => ({
    id: undefined,
    categoryId: undefined,
    name: '',
    picUrl: '',
    price: undefined,
    originPrice: undefined,
    album: [],
    detail: '',
    attrList: [],
    specList: [],
    skuList: [],
    sales: 0,
    stock: 0,
    categoryName: '',
    brandName: '',
  } as GoodsInfoData)

});


// 修改这里 ↑↑↑



const emit = defineEmits<{
  (e: 'next'): void; // 下一步事件
  (e: 'update:goodsInfo', value: GoodsInfoData): void; // 更新商品信息
  (e: 'edit-goods', goodsId: number): void; // 编辑商品事件
}>();


// 响应式数据
const categoryOptions = ref<CategoryOptionData[]>([]);           // 原始分类数据
const multiOptions = ref<CategoryOptionData[][]>([[], [], []]);  // 多列选择器数据
const multiIndex = ref<number[]>([0, 0, 0]);                     // 多列选择器索引
const pathLabels = ref<string[]>([]);                           // 分类路径标签
const goodsList = ref<GoodsItemData[]>([]);                     // 商品列表
const loadingGoods = ref<boolean>(false);                       // 商品加载状态
const selectedThirdLevelName = ref<string>('');                 // 三级分类名称
const listHeight = ref<number>(400);                            // 列表高度

// 系统信息
const systemInfo = uni.getSystemInfoSync();

// 商品信息双向绑定
const goodsInfo = computed({
  get: () => {
    // const data =  new GoodsInfo();  //props.goodsInfo ||
    // return data;

    // 如果父组件传入了 goodsInfo，就使用它
    // 否则返回一个空的 GoodsInfo 实例
    // 直接返回 props.goodsInfo，确保使用的是父组件传入的数据
    if (props.goodsInfo && Object.keys(props.goodsInfo).length > 0) {
      return new GoodsInfo(props.goodsInfo);
    } else {
      return new GoodsInfo();
    }

  },
  set: (value: GoodsInfoData) => {
    emit('update:goodsInfo', value);
  }
});

const showProductSection = computed((): boolean => {
  return pathLabels.value.length === 3 && goodsInfo.value.categoryId !== undefined;
});

const selectedCategoryLabel = computed((): string => {
  if (pathLabels.value.length === 0) return '';
  return pathLabels.value.join(' / ');
});

// 初始化分类数据
const loadCategoryData = async () => {
  try {
    console.log('📦 开始加载商品分类数据');


    const response = await PmsCategoryAPI.getCategoryOptions();

    console.log('📦 原始API响应:', response);
    console.log('📦 响应类型:', typeof response);
    console.log('📦 是否是数组:', Array.isArray(response));
    console.log('📦 响应字符串:', JSON.stringify(response));

    console.log('📦 开始加载商品分类数据：{}',response);

    let data: any[] = [];
    // if (response.statusCode === 200 && response.data) {
    //   const resData = response.data;
    //   if (resData.code === 0 && Array.isArray(resData.data)) {
    //     data = resData.data;
    //   } else if (Array.isArray(resData)) {
    //     data = resData;
    //   }
    // }

    data = response as any[];

    if (data && data.length > 0) {
      // 转换数据格式
      //数据结构显示三级分类有 value属性但没有 id属性
      const options = data.map(item => new CategoryOption({
        id: item.value,      // 使用 value 作为 id
        name: item.label,    // 使用 label 作为 name
        label: item.label,   // label 保持不变
        value: item.value,   // value 保持不变
        children: item.children || []
      }));

      console.log('✅ 转换数据格式:{}', options);


      categoryOptions.value = options;
      updateMultiOptions(options);
      console.log('✅ 商品分类数据加载完成，共', options.length, '个一级分类');
    } else {
      console.warn('⚠️ 商品分类数据为空或格式错误');
      uni.showToast({
        title: '暂无商品分类数据',
        icon: 'none',
        duration: 2000
      });
    }
  } catch (error: any) {
    console.error('❌ 加载商品分类数据失败:', error);
    uni.showToast({
      title: '加载商品分类失败',
      icon: 'error',
      duration: 2000
    });
  }
};

// 更新多列选择器数据
const updateMultiOptions = (options: CategoryOptionData[], level = 0, selectedIndices = [0, 0, 0]): void => {
  if (level === 0) {
    // 第一列：一级分类
    multiOptions.value[0] = options.map(opt => ({ ...opt }));

    // 第二列：二级分类
    const firstIndex = selectedIndices[0];
    if (options[firstIndex]?.children) {
      multiOptions.value[1] = options[firstIndex].children!.map(child => ({ ...child }));
    } else {
      multiOptions.value[1] = [];
    }

    // 第三列：三级分类
    const secondIndex = selectedIndices[1];
    if (multiOptions.value[1][secondIndex]?.children) {
      multiOptions.value[2] = multiOptions.value[1][secondIndex].children!.map(child => ({ ...child }));
    } else {
      multiOptions.value[2] = [];
    }
  }
};

// 处理选择器列变化
const handlePickerColumnChange = (e: any) => {
  const { column, value } = e.detail;
  const newIndex = [...multiIndex.value];
  newIndex[column] = value;

  // 重置后面的列
  for (let i = column + 1; i < 3; i++) {
    newIndex[i] = 0;
  }

  multiIndex.value = newIndex;

  // 更新多列数据
  updateMultiOptions(categoryOptions.value, 0, newIndex);
};

// 处理选择器确认
const handlePickerChange = async (e: any) => {
  const { value } = e.detail;
  multiIndex.value = value;

  // 获取选中的分类
  const firstOption = multiOptions.value[0][value[0]];
  const secondOption = multiOptions.value[1][value[1]];
  const thirdOption = multiOptions.value[2][value[2]];

  console.log('🔍 选中的分类选项:', {
    firstOption: firstOption?.label,
    secondOption: secondOption?.label,
    thirdOption: thirdOption?.label,
    hasThirdOption: !!thirdOption
  });


  if (!firstOption) return;

  // 构建路径标签
  const labels = [firstOption.label];
  if (secondOption) labels.push(secondOption.label);
  if (thirdOption) labels.push(thirdOption.label);

  pathLabels.value = labels;

  console.log('🔍 路径标签:', labels);
  console.log('🔍 标签长度:', labels.length);


  // ✅ 修改：只有选择三级分类时才设置 categoryId
  // ✅ 修改：三级分类使用 value 作为 id
  if (labels.length === 3 && thirdOption && thirdOption.value) {
    const selectedCategoryId = thirdOption.value;   // 使用 value
    selectedThirdLevelName.value = thirdOption.label;

    // 更新商品信息
    goodsInfo.value.categoryId = selectedCategoryId;
    goodsInfo.value.id = undefined; // 重置商品ID（新增模式）

    console.log('✅ 确认是三级分类，ID:', selectedCategoryId);
    console.log('✅ 设置 goodsInfo.categoryId:', goodsInfo.value.categoryId);
    console.log('✅ 分类名称:', selectedThirdLevelName.value);

    // 加载三级分类下的商品
    console.log('🔍 开始加载商品列表...');
    await loadGoodsByCategory(selectedCategoryId);

  } else {
    // 选择了一级或二级分类
    console.log('⚠️ 不是三级分类:', {
      labelsLength: labels.length,
      hasThirdOption: !!thirdOption,
      thirdOptionId: thirdOption?.id
    });

    // ✅ 重要：清空 categoryId，让用户知道需要选择三级分类
    goodsInfo.value.categoryId = undefined;
    goodsInfo.value.id = undefined;
    selectedThirdLevelName.value = '';

    // 清空商品列表
    goodsList.value = [];
  }

};

// 加载分类下的商品
const loadGoodsByCategory = async (categoryId: number) => {
  try {
    loadingGoods.value = true;


    const response = await PmsSpuAPI.getPage(
      {
        categoryId,
        pageNum: 1,
        pageSize: 10,
      }

    );

    console.log('📝 加载分类下的商品：',response);


    if (response) {
      const resData = response;
      if (resData && Array.isArray(resData.list)) {
        goodsList.value = resData.list.map(item => new GoodsItem({
          id: item.id,
          name: item.name || '未命名商品',
          picUrl: item.picUrl,
          price: item.price || 0,
          stock: item.stock || 0,
          status: item.status || 0
        }));

        console.log(`✅ 加载到 ${goodsList.value.length} 个商品`);
      } else {
        goodsList.value = [];
        console.log('📝 该分类下暂无商品');
      }
    } else {
      goodsList.value = [];
    }
  } catch (error) {
    console.error('❌ 加载商品列表失败:', error);
    uni.showToast({
      title: '加载商品列表失败',
      icon: 'error',
      duration: 2000
    });
    goodsList.value = [];
  } finally {
    loadingGoods.value = false;
  }
};

// 查看商品
const handleViewGoods = (goods: GoodsItemData) => {
  console.log('👀 查看商品:', goods);
  uni.navigateTo({
    url: `/pages/goods/detail?id=${goods.id}&mode=view`
  });
};

// 编辑商品
const handleEditGoods = (goods: GoodsItemData) => {
  console.log('✏️ 编辑商品:', goods);

  // 设置商品ID
  goodsInfo.value.id = goods.id;

  // 触发编辑商品事件
  emit('edit-goods', goods.id || 0);

  // 不在这里跳转，由父组件控制步骤切换
};

// 新增商品 // 确保是三级分类
const handleAddGoods = () => {
  console.log('➕ 新增商品');

  if (pathLabels.value.length !== 3 || !goodsInfo.value.categoryId) {
    uni.showToast({
      title: '请先选择完整的三级分类',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 确保是新增模式
  goodsInfo.value.id = undefined;

  console.log('✅ 在三级分类下新增商品，分类ID:', goodsInfo.value.categoryId);
  console.log('✅ 分类名称:', selectedThirdLevelName.value);

  // 触发下一步
  emit('next');
};

// 下一步
const handleNext = () => {

  // 确保是三级分类
  if (pathLabels.value.length !== 3 || !goodsInfo.value.categoryId) {
    uni.showToast({
      title: '请先选择完整的三级分类',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  // 新增模式：清除商品信息，保留分类ID
  if (!goodsInfo.value.id) {
    const categoryId = goodsInfo.value.categoryId;
    goodsInfo.value = {
      id: undefined,
      name: '',
      categoryId: categoryId,
      picUrl: '',
      price: undefined,
      originPrice: undefined,
      album: [],
      detail: '',
      attrList: [],
      specList: [],
      skuList: [],
      sales: 0,
      stock: 0,
      categoryName: '',
      brandName: '',
    };
  }

  console.log('➡️ 进入下一步，三级分类ID,模式:', goodsInfo.value.id ? '编辑' : '新增');
  console.log('➡️ 已选分类ID:', goodsInfo.value.categoryId);

  emit('next');
};

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return '0.00';
  return (price / 100).toFixed(2);
};

// 计算列表高度
const calculateListHeight = () => {
  const query = uni.createSelectorQuery().in(this);
  query.select('.component-container').boundingClientRect((data: any) => {
    if (data) {
      const windowHeight = systemInfo.windowHeight;
      const containerTop = data.top;
      const pickerHeight = 120; // 选择器区域高度
      const pathHeight = 80;   // 路径显示高度
      const headerHeight = 100; // 标题区域高度
      const footerHeight = 120; // 底部按钮高度

      listHeight.value = windowHeight - containerTop - pickerHeight - pathHeight
        - headerHeight - footerHeight - 100;
    }
  }).exec();
};

// 生命周期
onMounted(async () => {
  console.log('🔄 商品分类组件加载');
  await loadCategoryData();
});

onReady(() => {
  // 页面渲染完成后计算高度
  nextTick(() => {
    calculateListHeight();
  });
});

onShow(() => {
  console.log('🔆 商品分类组件显示');
  // 重新计算高度
  calculateListHeight();
});

onHide(() => {
  console.log('🌙 商品分类组件隐藏');
});

onUnmounted(() => {
  console.log('🗑️ 商品分类组件卸载');
});
</script>

<style lang="scss" scoped>
.component-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f9fa;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom);

  &__main {
    flex: 1;
    width: 100%;
    padding: 20rpx;
    box-sizing: border-box;
    overflow: hidden;

    // 分类选择器
    .category-picker {
      width: 100%;
      margin-bottom: 20rpx;

      .picker-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx 30rpx;
        background-color: #ffffff;
        border: 2rpx solid #e4e7ed;
        border-radius: 10rpx;
        font-size: 30rpx;
        color: #303133;
        box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

        .selected-category {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .picker-placeholder {
          flex: 1;
          color: #c0c4cc;
        }

        .picker-arrow {
          color: #c0c4cc;
          font-size: 24rpx;
          margin-left: 10rpx;
        }
      }
    }

    // 分类路径显示
    .path-display {
      padding: 20rpx 30rpx;
      background-color: #ffffff;
      border-radius: 10rpx;
      border: 2rpx solid #e4e7ed;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);

      .path-label {
        font-size: 28rpx;
        color: #909399;
        font-weight: 500;
        margin-right: 10rpx;
      }

      .path-items {
        margin-top: 10rpx;

        .path-item {
          font-size: 30rpx;
          color: #409eff;
          font-weight: 500;

          .separator {
            margin: 0 10rpx;
            color: #909399;
            font-size: 24rpx;
          }
        }
      }
    }

    // 商品列表区域
    .product-section {
      background-color: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
      overflow: hidden;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx 30rpx 20rpx;
        border-bottom: 2rpx solid #f0f0f0;

        .section-title {
          font-size: 36rpx;
          font-weight: 600;
          color: #303133;
        }

        .btn-add-goods {
          background-color: #409eff;
          color: #ffffff;
          border: none;
          border-radius: 10rpx;
          padding: 12rpx 24rpx;
          font-size: 28rpx;

          &::after {
            border: none;
          }
        }
      }

      // 商品列表
      .goods-list {
        .goods-item {
          display: flex;
          align-items: center;
          padding: 20rpx 30rpx;
          border-bottom: 2rpx solid #f0f0f0;
          background-color: #ffffff;

          &:active {
            background-color: #f8f9fa;
          }

          .goods-image-container {
            width: 120rpx;
            height: 120rpx;
            border-radius: 8rpx;
            overflow: hidden;
            background-color: #f5f7fa;
            margin-right: 20rpx;
            flex-shrink: 0;

            .goods-image {
              width: 100%;
              height: 100%;
            }

            .goods-image-placeholder {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #e4e7ed;
              color: #909399;
              font-size: 24rpx;
            }
          }

          .goods-info {
            flex: 1;
            min-width: 0;

            .goods-name {
              font-size: 30rpx;
              color: #303133;
              font-weight: 500;
              margin-bottom: 10rpx;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              line-height: 1.4;
            }

            .goods-details {
              display: flex;
              align-items: center;
              flex-wrap: wrap;
              gap: 20rpx;

              .goods-price {
                font-size: 28rpx;
                color: #f56c6c;
                font-weight: 600;
              }

              .goods-stock {
                font-size: 24rpx;
                color: #909399;
              }

              .goods-status {
                .status-badge {
                  padding: 4rpx 12rpx;
                  border-radius: 6rpx;
                  font-size: 22rpx;
                  font-weight: 500;

                  &.status-on {
                    background-color: #f0f9eb;
                    color: #67c23a;
                  }

                  &.status-off {
                    background-color: #f4f4f5;
                    color: #909399;
                  }
                }
              }
            }
          }

          .goods-actions {
            display: flex;
            flex-direction: column;
            gap: 10rpx;
            flex-shrink: 0;

            button {
              width: 120rpx;
              height: 50rpx;
              line-height: 50rpx;
              border: none;
              border-radius: 8rpx;
              font-size: 24rpx;

              &::after {
                border: none;
              }

              &.btn-view {
                background-color: #409eff;
                color: #ffffff;
              }

              &.btn-edit {
                background-color: #67c23a;
                color: #ffffff;
              }
            }
          }
        }

        .loading-more {
          padding: 30rpx;
          text-align: center;
          color: #909399;
          font-size: 28rpx;
        }
      }

      // 空状态
      .empty-goods {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60rpx 30rpx;

        .empty-image {
          width: 200rpx;
          height: 200rpx;
          margin-bottom: 30rpx;
          opacity: 0.6;
        }

        .empty-text {
          font-size: 32rpx;
          color: #909399;
          margin-bottom: 40rpx;
        }

        .btn-empty-add {
          background-color: #409eff;
          color: #ffffff;
          border: none;
          border-radius: 10rpx;
          padding: 20rpx 40rpx;
          font-size: 32rpx;

          &::after {
            border: none;
          }
        }
      }

      // 加载中
      .loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 60rpx 30rpx;

        .loading-spinner {
          width: 60rpx;
          height: 60rpx;
          border: 4rpx solid #e4e7ed;
          border-top-color: #409eff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20rpx;
        }

        .loading-text {
          font-size: 28rpx;
          color: #909399;
        }
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    padding: 20rpx 30rpx;
    background-color: #ffffff;
    border-top: 2rpx solid #f0f0f0;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 100;
    min-height: 120rpx;
    box-sizing: border-box;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

    .btn-next {
      width: 100%;
      max-width: 600rpx;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 40rpx;
      font-size: 32rpx;
      border: none;
      background: linear-gradient(135deg, #409eff, #66b1ff);
      color: #ffffff;

      &::after {
        border: none;
      }

      &[disabled] {
        background: linear-gradient(135deg, #c0c4cc, #dcdfe6);
        opacity: 0.6;
      }
    }
  }
}

// 按钮悬停效果
.btn-hover {
  opacity: 0.7;
  transform: scale(0.98);
  transition: all 0.2s ease;
}

// 旋转动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .component-container {
    &__main {
      padding: 15rpx;

      .product-section {
        .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 20rpx;
          padding: 20rpx 20rpx 15rpx;

          .section-title {
            font-size: 32rpx;
          }

          .btn-add-goods {
            align-self: flex-end;
            padding: 10rpx 20rpx;
            font-size: 26rpx;
          }
        }

        .goods-list {
          .goods-item {
            flex-direction: column;
            align-items: flex-start;
            padding: 20rpx;

            .goods-image-container {
              width: 100rpx;
              height: 100rpx;
              margin-right: 0;
              margin-bottom: 15rpx;
            }

            .goods-info {
              width: 100%;
              margin-bottom: 15rpx;

              .goods-name {
                font-size: 28rpx;
                -webkit-line-clamp: 2;
              }

              .goods-details {
                justify-content: space-between;
              }
            }

            .goods-actions {
              width: 100%;
              flex-direction: row;
              justify-content: flex-end;

              button {
                width: auto;
                flex: 1;
                margin: 0 5rpx;
              }
            }
          }
        }
      }
    }

    &__footer {
      padding: 15rpx 20rpx;

      .btn-next {
        height: 70rpx;
        line-height: 70rpx;
        font-size: 28rpx;
      }
    }
  }
}

@media (max-width: 480px) {
  .component-container {
    &__main {
      padding: 10rpx;

      .category-picker {
        .picker-trigger {
          padding: 15rpx 20rpx;
          font-size: 28rpx;
        }
      }

      .path-display {
        padding: 15rpx 20rpx;

        .path-label {
          font-size: 26rpx;
        }

        .path-item {
          font-size: 28rpx;
        }
      }

      .product-section {
        .section-header {
          .section-title {
            font-size: 28rpx;
          }
        }
      }
    }
  }
}
</style>
