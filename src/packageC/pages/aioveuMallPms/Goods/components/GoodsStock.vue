<!-- 转换后的 UniApp 组件 GoodsStock.vue -->
<template>

  <!-- 滚动容器：留出底部空间给按钮区域 -->
  <scroll-view
    scroll-y
    class="component-container"
    :style="{
    height: scrollHeight + 'px',
    paddingBottom: '100rpx' // 按钮区域高度，根据实际调整
  }"
    refresher-enabled
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
  >
    <!-- 主要内容区域 -->
    <view class="component-container__main">
      <!-- 规格设置卡片 -->
      <view class="spec-card">
        <!-- 卡片头部 -->
        <view class="card-header">
          <text class="card-title">商品规格</text>
          <button
            class="btn-add-spec"
            @tap="handleAddSpec"
            :disabled="specForm.specList.length >= 3"
            hover-class="btn-hover"
            hover-start-time="20"
            hover-stay-time="70"
          >
            添加规格项
          </button>
        </view>

        <!-- 规格表单 -->
        <view class="spec-form" v-if="specForm.specList.length > 0">
          <view
            v-for="(spec, specIndex) in specForm.specList"
            :key="spec.id"
            class="spec-item"
          >
            <!-- 规格名称 -->
            <view class="spec-name-section">
              <view class="form-label">
                <text class="label-text">规格名</text>
                <text class="required">*</text>
              </view>
              <input
                v-model="spec.name"
                placeholder="请输入规格名称"
                class="spec-name-input"
                placeholder-class="placeholder"
                maxlength="20"
                @input="handleSpecChange"
                @blur="validateSpecName(specIndex)"
                :disabled="false"
              />
              <view v-if="specErrors[specIndex]" class="error-text">
                {{ specErrors[specIndex] }}
              </view>
            </view>

            <!-- 规格值 -->
            <view class="spec-values-section">
              <view class="form-label">
                <text class="label-text">规格值</text>
                <text v-if="specIndex === 0" class="image-tip">（默认第一条规格包含图片）</text>
              </view>

              <!-- 规格值标签 -->
              <view class="spec-tags">
                <view
                  v-for="value in spec.values"
                  :key="value.id"
                  class="spec-tag"
                  :style="{ borderColor: getTagColor(specIndex) }"
                >
                  <text class="tag-text">{{ value.value }}</text>
                  <view
                    v-if="value.picUrl"
                    class="has-image-icon"
                    @tap="previewSpecImage(value.picUrl)"
                  >
                    🖼️
                  </view>
                  <!-- 新增模式下显示删除按钮 -->
                  <view
                    class="tag-close"
                    @tap.stop="handleRemoveSpecValue(specIndex, value.id)"
                    v-if="!hasSkuData(value.id)"
                  >
                    ×
                  </view>
                </view>

                <!-- 规格值输入框 -->
                <input
                  v-if="tagInputs[specIndex]?.visible"
                  v-model="tagInputs[specIndex].value"
                  placeholder="请输入规格值"
                  class="spec-value-input"
                  placeholder-class="placeholder"
                  confirm-type="done"
                  @confirm="handleInputSpecValue(specIndex)"
                  @blur="handleInputSpecValue(specIndex)"
                />

                <!-- 添加规格值按钮 -->
                <button
                  v-else
                  class="btn-add-value"
                  @tap="showSpecInput(specIndex)"
                  hover-class="btn-hover"
                  hover-start-time="20"
                  hover-stay-time="70"
                >
                  添加规格值
                </button>
              </view>

              <!-- 第一个规格项的图片上传 -->
              <view v-if="specIndex === 0 && spec.values.length > 0" class="spec-image-section">
                <view class="image-upload-area" @tap="uploadSpecImage(specIndex)">
                  <view v-if="getFirstSpecImage(spec)" class="image-preview">
                    <image
                      :src="getFirstSpecImage(spec)"
                      mode="aspectFill"
                      class="spec-image"
                    />
                    <view class="image-overlay">
                      <text class="overlay-text">点击更换</text>
                    </view>
                  </view>
                  <view v-else class="upload-placeholder">
                    <view class="upload-icon">+</view>
                    <view class="upload-text">上传图片</view>
                  </view>
                </view>
                <view class="upload-tip">
                  最大图片大小：5MB，支持格式：JPG、JPEG、PNG
                </view>
              </view>


            </view>

            <!-- 删除规格按钮 -->
            <view class="spec-action">
              <button
                class="btn-delete-spec"
                @tap.stop="handleRemoveSpec(specIndex)"
                hover-class="btn-hover"
                hover-start-time="20"
                hover-stay-time="70"
                v-if="!hasSkuDataForSpec(spec.id)"
              >
                删除规格
              </button>
            </view>
          </view>
        </view>

        <!-- 空状态 -->
        <view v-else class="empty-state">
          <image
            src="/static/empty-spec.png"
            class="empty-image"
            mode="aspectFit"
          />
          <text class="empty-text">暂无规格配置</text>
          <button
            class="btn-empty-add"
            @tap="handleAddSpec"
            hover-class="btn-hover"
            hover-start-time="20"
            hover-stay-time="70"
          >
            添加规格
          </button>
        </view>
      </view>

      <!-- 库存设置卡片 -->
<!--      <view-->
<!--        class="stock-card"-->
<!--        v-if="hasValidSpecs"-->
<!--      >-->
<!--        <view class="card-header">-->
<!--          <text class="card-title">商品库存</text>-->
<!--          <text class="sku-count">共 {{ skuForm.skuList.length }} 个SKU</text>-->
<!--        </view>-->

<!--        &lt;!&ndash; SKU表格 &ndash;&gt;-->
<!--        <view class="sku-form" v-if="skuForm.skuList.length > 0">-->
<!--          <scroll-view-->
<!--            scroll-x-->
<!--            class="sku-table-wrapper"-->
<!--            :style="{ height: skuTableHeight + 'px' }"-->
<!--          >-->
<!--            <view class="sku-table">-->
<!--              &lt;!&ndash; 表头 &ndash;&gt;-->
<!--              <view class="table-header">-->
<!--                &lt;!&ndash; 动态规格列 &ndash;&gt;-->
<!--                <view-->
<!--                  v-for="(title, index) in specTitles"-->
<!--                  :key="index"-->
<!--                  class="header-cell spec-header"-->
<!--                >-->
<!--                  <text class="header-text">{{ title }}</text>-->
<!--                </view>-->

<!--                &lt;!&ndash; SKU编码 &ndash;&gt;-->
<!--                <view class="header-cell sku-sn-header">-->
<!--                  <text class="header-text">SKU编码</text>-->
<!--                </view>-->

<!--                &lt;!&ndash; 价格 &ndash;&gt;-->
<!--                <view class="header-cell price-header">-->
<!--                  <text class="header-text">价格(元)</text>-->
<!--                </view>-->

<!--                &lt;!&ndash; 库存 &ndash;&gt;-->
<!--                <view class="header-cell stock-header">-->
<!--                  <text class="header-text">库存</text>-->
<!--                </view>-->

<!--                &lt;!&ndash; 规格图片 &ndash;&gt;-->
<!--                <view class="header-cell image-header">-->
<!--                  <text class="header-text">规格图片</text>-->
<!--                </view>-->
<!--              </view>-->

<!--              &lt;!&ndash; 表格内容 &ndash;&gt;-->
<!--              <view-->
<!--                v-for="(sku, skuIndex) in skuForm.skuList"-->
<!--                :key="skuIndex"-->
<!--                class="table-row"-->
<!--              >-->
<!--                &lt;!&ndash; 动态规格值 &ndash;&gt;-->
<!--                <view-->
<!--                  v-for="i in specTitles.length"-->
<!--                  :key="i"-->
<!--                  class="table-cell spec-cell"-->
<!--                >-->
<!--                  <text class="spec-value-text">{{ sku[`specValue${i}`] }}</text>-->
<!--                </view>-->

<!--                &lt;!&ndash; SKU编码 &ndash;&gt;-->
<!--                <view class="table-cell sku-sn-cell">-->
<!--                  <input-->
<!--                    v-model="sku.skuSn"-->
<!--                    placeholder="如: SKU001"-->
<!--                    class="sku-input"-->
<!--                    placeholder-class="placeholder"-->
<!--                    maxlength="50"-->
<!--                    @blur="validateSkuSn(skuIndex)"-->
<!--                  />-->
<!--                  <view v-if="skuErrors[skuIndex]?.skuSn" class="error-text">-->
<!--                    {{ skuErrors[skuIndex].skuSn }}-->
<!--                  </view>-->
<!--                </view>-->

<!--                &lt;!&ndash; 价格 &ndash;&gt;-->
<!--                <view class="table-cell price-cell">-->
<!--                  <view class="price-input-group">-->
<!--                    <text class="price-prefix">¥</text>-->
<!--                    <input-->
<!--                      v-model.number="sku.price"-->
<!--                      type="digit"-->
<!--                      placeholder="0.00"-->
<!--                      class="price-input"-->
<!--                      placeholder-class="placeholder"-->
<!--                      @input="handlePriceChange(sku, skuIndex)"-->
<!--                      @blur="validatePrice(skuIndex)"-->
<!--                    />-->
<!--                  </view>-->
<!--                  <view v-if="skuErrors[skuIndex]?.price" class="error-text">-->
<!--                    {{ skuErrors[skuIndex].price }}-->
<!--                  </view>-->
<!--                </view>-->

<!--                &lt;!&ndash; 库存 &ndash;&gt;-->
<!--                <view class="table-cell stock-cell">-->
<!--                  <input-->
<!--                    v-model.number="sku.stock"-->
<!--                    type="number"-->
<!--                    placeholder="0"-->
<!--                    class="stock-input"-->
<!--                    placeholder-class="placeholder"-->
<!--                    @blur="validateStock(skuIndex)"-->
<!--                  />-->
<!--                  <view v-if="skuErrors[skuIndex]?.stock" class="error-text">-->
<!--                    {{ skuErrors[skuIndex].stock }}-->
<!--                  </view>-->
<!--                </view>-->

<!--                &lt;!&ndash; SKU图片 &ndash;&gt;-->
<!--                <view class="table-cell image-cell">-->
<!--                  <view class="sku-image-container">-->
<!--                    <view-->
<!--                      v-if="sku.picUrl"-->
<!--                      class="sku-image-preview"-->
<!--                      @tap="previewSkuImage(sku.picUrl)"-->
<!--                    >-->
<!--                      <image-->
<!--                        :src="sku.picUrl"-->
<!--                        mode="aspectFill"-->
<!--                        class="sku-image"-->
<!--                      />-->
<!--                      <view class="image-action">-->
<!--                        <view-->
<!--                          class="btn-replace"-->
<!--                          @tap.stop="uploadSkuImage(skuIndex)"-->
<!--                        >-->
<!--                          更换-->
<!--                        </view>-->
<!--                        <view-->
<!--                          class="btn-delete"-->
<!--                          @tap.stop="removeSkuImage(skuIndex)"-->
<!--                        >-->
<!--                          删除-->
<!--                        </view>-->
<!--                      </view>-->
<!--                    </view>-->
<!--                    <view-->
<!--                      v-else-->
<!--                      class="sku-image-upload"-->
<!--                      @tap="uploadSkuImage(skuIndex)"-->
<!--                    >-->
<!--                      <view class="upload-icon">+</view>-->
<!--                      <view class="upload-text">上传图片</view>-->
<!--                    </view>-->
<!--                  </view>-->
<!--                </view>-->
<!--              </view>-->
<!--            </view>-->
<!--          </scroll-view>-->

<!--          &lt;!&ndash; 表格提示 &ndash;&gt;-->
<!--          <view class="table-tips">-->
<!--            <text>横向滑动查看更多列</text>-->
<!--          </view>-->
<!--        </view>-->

<!--        &lt;!&ndash; SKU空状态 &ndash;&gt;-->
<!--        <view v-else class="empty-state">-->
<!--          <image-->
<!--            src="/static/empty-sku.png"-->
<!--            class="empty-image"-->
<!--            mode="aspectFit"-->
<!--          />-->
<!--          <text class="empty-text">请先配置规格值</text>-->
<!--        </view>-->
<!--      </view>-->


      <!-- SKU表格改为卡片式布局 -->
      <view
        class="stock-card"
        v-if="hasValidSpecs"
      >
        <view class="card-header">
          <text class="card-title">商品库存</text>
          <text class="sku-count">共 {{ skuForm.skuList.length }} 个SKU</text>
        </view>

        <!-- SKU卡片列表 -->
        <view class="sku-list" v-if="skuForm.skuList.length > 0">
          <view
            v-for="(sku, skuIndex) in skuForm.skuList"
            :key="skuIndex"
            class="sku-card"
          >

            <!-- 在SKU卡片开头添加 -->
<!--            <view style="border: 2rpx solid #00ff5d; padding: 10rpx; margin: 10rpx;">-->
<!--              <text style="color: #0051ff; font-size: 24rpx;">-->
<!--                调试: 价格={{sku.price}}, 类型={{typeof sku.price}}-->
<!--              </text>-->
<!--            </view>-->

            <!-- 添加红色调试信息 -->
<!--            <view style="background: #ff0000; color: white; padding: 10rpx; margin: 10rpx; border-radius: 8rpx;">-->
<!--              <text style="font-size: 24rpx;">-->
<!--                SKU {{skuIndex+1}}: 价格={{sku.price}}, 库存={{sku.stock}}, 图片URL长度={{sku.picUrl ? sku.picUrl.length : 0}}-->
<!--              </text>-->

<!--              <text style="font-size: 24rpx;">-->
<!--                SKU {{skuIndex+1}}: 库存sn={{sku.skuSn}}}-->
<!--              </text>-->
<!--            </view>-->

            <view class="sku-card-header">
              <text class="sku-specs">
                <text
                  v-for="i in specTitles.length"
                  :key="i"
                  class="spec-item"
                >
                  <text class="spec-name">{{ specTitles[i-1] }}:</text>
                  <text class="spec-value">{{ sku[`specValue${i}`] }}</text>
<!--                  通过动态属性来展示规格值的-->
                  <text v-if="i < specTitles.length" class="separator"> / </text>
                </text>
              </text>
              <view class="sku-status" v-if="sku.id">
                <text class="status-text">已保存</text>
              </view>
            </view>

            <view class="sku-card-content">
              <!-- SKU编码 -->
              <view class="form-item">
                <view class="form-label">
                  <text class="label-text">SKU编码</text>
                  <text class="required">*</text>
                </view>
                <input
                  v-model="sku.skuSn"
                  placeholder="如: SKU001"
                  class="form-input"
                  placeholder-class="placeholder"
                  maxlength="50"
                  @blur="validateSkuSn(skuIndex)"
                />
                <view v-if="skuErrors[skuIndex]?.skuSn" class="error-text">
                  {{ skuErrors[skuIndex].skuSn }}
                </view>
              </view>

              <!-- 价格和库存 -->
              <view class="form-row">
                <view class="form-item half">
                  <view class="form-label">
                    <text class="label-text">价格(元)</text>
                    <text class="required">*</text>
                  </view>
                  <view class="price-input-group">
                    <text class="price-prefix">¥</text>
                    <input
                      v-model.number="sku.price"
                      type="digit"
                      placeholder="0.00"
                      class="price-input"
                      placeholder-class="placeholder"
                      @input="handlePriceChange(sku, skuIndex)"
                      @blur="validatePrice(skuIndex)"
                    />
                  </view>
                  <view v-if="skuErrors[skuIndex]?.price" class="error-text">
                    {{ skuErrors[skuIndex].price }}
                  </view>
                </view>

                <view class="form-item half">
                  <view class="form-label">
                    <text class="label-text">库存</text>
                    <text class="required">*</text>
                  </view>
                  <input
                    v-model.number="sku.stock"
                    type="number"
                    placeholder="0"
                    class="form-input"
                    placeholder-class="placeholder"
                    @blur="validateStock(skuIndex)"
                  />
                  <view v-if="skuErrors[skuIndex]?.stock" class="error-text">
                    {{ skuErrors[skuIndex].stock }}
                  </view>
                </view>
              </view>

              <!-- SKU图片 -->
              <view class="form-item">
                <view class="form-label">
                  <text class="label-text">规格图片</text>
                </view>
                <view class="image-upload-area" @tap="uploadSkuImage(skuIndex)">
                  <view v-if="sku.picUrl" class="image-preview">
                    <image
                      :src="sku.picUrl"
                      mode="aspectFill"
                      class="uploaded-image"
                    />
                    <view class="image-actions">
                      <view
                        class="btn-action replace"
                        @tap.stop="uploadSkuImage(skuIndex)"
                      >
                        更换
                      </view>
                      <view
                        class="btn-action delete"
                        @tap.stop="removeSkuImage(skuIndex)"
                      >
                        删除
                      </view>
                    </view>
                  </view>
                  <view v-else class="upload-placeholder">
                    <view class="upload-icon">+</view>
                    <view class="upload-text">点击上传图片</view>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- SKU空状态 -->
        <view v-else class="empty-state">
          <image
            src="/static/empty-sku.png"
            class="empty-image"
            mode="aspectFit"
          />
          <text class="empty-text">请先配置规格值</text>
        </view>
      </view>




    </view>


  </scroll-view>

  <!-- 底部操作按钮 -->
<!--  我们需要把按钮区域从原来的位置（可能在规格卡片下方）提取出来，放到整个滚动容器的最底部，-->
<!--  使用 fixed定位或者 sticky定位固定在底部。考虑到滚动体验，这里用 fixed定位更合适，同时给滚动容器留出底部空间，避免内容被按钮遮挡。-->
  <!-- 按钮区域：固定在底部 -->
  <view class="action-bar">
    <button
      class="btn-prev"
      @tap="handlePrev"
      hover-class="btn-hover"
      hover-start-time="20"
      hover-stay-time="70"
    >
      上一步，设置商品属性
    </button>
    <button
      class="btn-submit"
      @tap="handleSubmit"
      hover-class="btn-hover"
      hover-start-time="20"
      hover-stay-time="70"
    >
      提交商品
    </button>
  </view>


</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { onLoad, onShow, onHide, onReady } from '@dcloudio/uni-app';
import PmsSpuAPI, { PmsSpuPageVO} from "@/packageC/api/aioveuMallPms/aioveuMallPmsSpu/pms-spu";


// 类型定义
class SpecValue {
  id: string = '';
  value: string = '';
  picUrl: string = '';

  constructor(data = {}) {
    Object.assign(this, data);
  }
}

class Specification {
  id: string = '';
  name: string = '';
  values: SpecValue[] = [];  // ✅ 添加类型

  constructor(data = {}) {
    Object.assign(this, data);
  }
}

class SkuItem {
  id?: number = undefined;
  skuSn: string = '';
  price: number = 0;
  stock: number = 0;
  Lockedstock: number = 0;
  specIds: string = '';
  specValues: string = '';
  picUrl: string = '';


  // 动态规格值属性
  [key: `specValue${number}`]: string;

  constructor(data = {}) {
    Object.assign(this, data);
  }
}

// Props 和 Emit
interface Props {
  goodsInfo?: Record<string, any>;
}

const props = withDefaults(defineProps<Props>(), {
  goodsInfo: () => ({})
});

const emit = defineEmits<{
  (e: 'prev'): void;
  (e: 'update:goodsInfo', value: Record<string, any>): void;
  (e: 'submit-success', categoryId?: number): void;
}>();

// 响应式数据
// 规格表单数据

// 响应式数据
// 规格表单数据
interface SpecFormData {
  specList: Specification[];
}

interface SkuFormData {
  skuList: SkuItem[];
}

interface TagInput {
  value?: string;
  visible: boolean;
}

const specForm = ref<SpecFormData>({
  specList: [],
});

const skuForm = ref<SkuFormData>({
  skuList: []
});


const specTitles = ref<string[]>([]);
const specErrors = ref<string[]>([]);
const skuErrors = ref<Array<Record<string, string>>>([]);
const tagInputs = ref<TagInput[]>([]);
const scrollHeight = ref<number>(500);
const skuTableHeight = ref<number>(300);
const refreshing = ref<boolean>(false);
const TEMP_ID_PREFIX = 'temp_';
// 计算滚动容器高度（适配不同设备）
const systemInfo = uni.getSystemInfoSync();

// 商品信息双向绑定
const goodsInfo = computed({
  get: () => {
    const data = props.goodsInfo || {};

    console.log("📝 GoodsStock 商品信息 getter 执行:", data);

    if (!data.specList || !Array.isArray(data.specList)) {
      data.specList = [];
    }
    if (!data.skuList || !Array.isArray(data.skuList)) {
      data.skuList = [];
    }

    console.log("📝 查看返回的,商品信息双向绑定:{}",data);
    // ✅ 关键：返回一个新的对象，确保每个字段都有值
    return {
      id: data.id,
      categoryId: data.categoryId,
      specList: Array.isArray(data.specList) ? data.specList : [],
      skuList: Array.isArray(data.skuList) ? data.skuList : [],
      attrList: Array.isArray(data.attrList) ? data.attrList : [],
      name: data.name || '',
      picUrl: data.picUrl || '',
      price: data.price !== undefined ? data.price : undefined,
      originPrice: data.originPrice !== undefined ? data.originPrice : undefined,
      album: Array.isArray(data.album) ? data.album : [],
      detail: data.detail || '',
      // ... 其他字段
    };
  },
  set: (value: Record<string, any>) => {
    console.log("📝 GoodsStock 商品信息 setter 执行:", value);
    emit('update:goodsInfo', value);
  }
});


// 计算属性
const hasValidSpecs = computed(() => {
  return specForm.value.specList.some(spec => spec.values.length > 0);
});


// 计算属性
const getFirstSpecImage = (spec: Specification): string => {
  return spec.values[0]?.picUrl || '';
};

// 工具函数
const generateTempId = () => {
  return `${TEMP_ID_PREFIX}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const isTempId = (id?: string): boolean => {
  return id?.startsWith(TEMP_ID_PREFIX) || false;
};

const getTagColor = (index: number): string => {
  const colors = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c', '#909399'];
  return colors[index % colors.length];
};

// 加载商品数据
const loadGoodsData = async () => {
  try {
    const goodsId = goodsInfo.value.id;
    const isEditMode = !!goodsId;  // 是否为编辑模式


    console.log(`🔍 ${isEditMode ? '编辑' : '新增'}模式，开始加载商品数据`);

    if (!isEditMode) {
      // 新增模式：清空数据
      specForm.value = { specList: [] };
      skuForm.value = { skuList: [] };
      console.log('📝 新增模式，初始化空数据');
      return;
    }

    // 编辑模式：加载已有数据
    console.log('📦 编辑模式，加载商品ID:', goodsId);

    console.log('🔍 检查 goodsInfo 的结构:', {
      原始值: props.goodsInfo,
      computed值: goodsInfo.value,
      specList: goodsInfo.value.specList,
      skuList: goodsInfo.value.skuList,
      isArray: Array.isArray(goodsInfo.value.skuList)
    });


    console.log('🔍 加载商品规格数据，商品信息:', {
      id: goodsId,
      hasSpecList: !!goodsInfo.value.specList,
      hasSkuList: !!goodsInfo.value.skuList
    });

    if (!goodsId) {
      console.log('📝 没有商品ID，跳过数据加载');
      return;
    }

    // 处理规格数据
    if (goodsInfo.value.specList?.length > 0) {
      console.log('📦 开始处理规格数据:', goodsInfo.value.specList);
      await processSpecList(goodsInfo.value.specList);
    } else {
      console.log('📝 商品没有规格数据');
    }

    // 处理SKU数据
    if (goodsInfo.value.skuList?.length > 0) {
      console.log('📦 开始处理SKU数据:', goodsInfo.value.skuList);
      await processSkuList(goodsInfo.value.skuList);
    } else {
      console.log('📝 商品没有SKU数据');


      // ❌ 编辑模式下绝对不要重新生成SKU列表
      // ✅ 只在新增模式且没有SKU数据时才生成SKU列表
      if (!isEditMode && specForm.value.specList.some(spec => spec.values.length > 0)) {
        console.log('🔄 新增模式，生成初始SKU列表');
        generateSkuList();
      }
    }

  } catch (error) {
    console.error('加载商品数据失败:', error);
    uni.showToast({
      title: '加载数据失败',
      icon: 'error',
      duration: 2000
    });
  }
};

// 处理规格列表
const processSpecList = async (specList: any[]) => {
  const specs: Specification[] = [];
  const specMap = new Map<string, Specification>();

  // 按规格名称分组
  specList.forEach((item) => {
    if (!specMap.has(item.name)) {
      specMap.set(item.name, new Specification({
        id: item.id ? String(item.id) : generateTempId(),
        name: item.name || '',
        values: []
      }));
    }

    const spec = specMap.get(item.name);
    if (spec) {
      spec.values.push(new SpecValue({
        id: item.id ? String(item.id) : generateTempId(),
        value: item.value || '',
        picUrl: item.picUrl
      }));
    }
  });

  // 转换为数组
  specMap.forEach(spec => {
    specs.push(spec);
  });

  specForm.value.specList = specs;
  specErrors.value = specs.map(() => '');
  tagInputs.value = specs.map(() => ({ value: undefined, visible: false }));
  updateSpecTitles();

  console.log('✅ 处理规格数据完成:', specs);

  console.log('是否为编辑模式:', goodsInfo.value.id ? '是' : '否');
};

// 处理SKU列表
const processSkuList = async (skuList: any[])=> {

  console.log('🔄 开始处理SKU列表，原始数据:', skuList);

  const processedSkus = skuList.map((sku, index) => {

    console.log(`处理第 ${index + 1} 个SKU:`, {
      id: sku.id,
      skuSn: sku.skuSn,
      price: sku.price,  // 原始价格（分）
      stock: sku.stock,  // 库存
      picUrl: sku.picUrl,  // 图片
      specValues: sku.specValues,  // 规格值字符串
      specIds: sku.specIds  // 规格ID   // 规格ID，如 "947_949"
    });

    //由于类型发生了改变，Vue 3 的 Object.assign无法让这几个新属性具备响应式特性，所以输入框和图片区域“看不见”这些数据。

    // 分转元
    const priceInYuan = sku.price ? Number(sku.price) / 100 : 0;
    console.log(`价格转换: ${sku.price}分 = ${priceInYuan}元`);


    // 直接返回纯对象，Vue 3 能完美追踪其变化
    const skuItem = {
      id: sku.id,
      skuSn: sku.skuSn || `SKU_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      price: sku.price ? sku.price / 100 : 0,   // 分转元    // 变成了 number 类型
      stock: sku.stock,   // 变成了 number 类型
      Lockedstock: sku.Lockedstock,
      specIds: sku.specIds,
      specValues: sku.specValues,
      picUrl: sku.picUrl    // 使用name字段作为规格值显示   // 变成了 string 或 undefined
    };

    console.log(`SKU转换后:`, {
      id: skuItem.id,
      skuSn: skuItem.skuSn,
      price: skuItem.price,  // 应该是元
      stock: skuItem.stock,
      picUrl: skuItem.picUrl,
      specValues: skuItem.specValues
    });


    // 解析规格值  // 方法1：从 specIds 反查规格值
    // 方法1：从 specIds 反查规格值
    if (sku.specIds) {
      const specIdArray = sku.specIds.split('_');  // 如 ["947", "949"]
      console.log(`规格ID数组:`, specIdArray);

      specIdArray.forEach((specId: string, index: number) => {
        // 在所有规格中查找这个ID对应的规格值
        let specValue = '';

        for (const spec of specForm.value.specList) {
          const valueObj = spec.values.find(v => String(v.id) === specId);
          if (valueObj) {
            specValue = valueObj.value;
            break;
          }
        }

        if (specValue) {
          (skuItem as any)[`specValue${index + 1}`] = specValue;
          console.log(`设置 specValue${index + 1}:`, specValue);
        } else {
          console.warn(`未找到规格ID ${specId} 对应的规格值`);
        }
      });
    }
    // 方法2：从 specValues 解析
    else if (sku.specValues) {    // 这里为 false，因为 specValues 是空字符串
      const values: string[] = sku.specValues.split('_');
      values.forEach((value: string, index: number) => {
        (skuItem as any)[`specValue${index + 1}`] = value;
      });
    }

    return skuItem;
  });

  // 使用 reactive 包装整个数组
  skuForm.value.skuList = processedSkus;
  skuErrors.value = processedSkus.map(() => ({}));
  console.log('✅ 处理SKU数据完成，最终数据:', processedSkus);


  // 详细验证
  skuForm.value.skuList.forEach((sku, index) => {
    console.log(`验证SKU ${index + 1}的数据:`, {
      id: sku.id,
      skuSn: sku.skuSn,
      price: sku.price,  // 检查是否是元
      stock: sku.stock,
      picUrl: sku.picUrl,
      specValue1: sku.specValue1,
      specValue2: sku.specValue2
    });
  });

};

// 更新规格标题
const updateSpecTitles = () => {
  specTitles.value = specForm.value.specList
    .filter(spec => spec.values.length > 0)
    .map(spec => spec.name);
  console.log('📊 规格标题:', specTitles.value);
};

// 添加规格
const handleAddSpec = () => {
  if (specForm.value.specList.length >= 3) {
    uni.showToast({
      title: '最多支持3个规格',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  const newSpec = new Specification({
    id: generateTempId(),
    name: '',
    values: []
  });

  specForm.value.specList.push(newSpec);
  specErrors.value.push('');
  tagInputs.value.push({ value: undefined, visible: false });

  console.log(`➕ 添加规格，当前共 ${specForm.value.specList.length} 个`);
  updateSpecTitles();
};

// 删除规格
const handleRemoveSpec = (index: number) => {

  // 编辑模式下检查是否被SKU使用
  if (goodsInfo.value.id && hasSkuDataForSpec(specForm.value.specList[index].id)) {
    uni.showModal({
      title: '提示',
      content: '此规格已被SKU使用，无法删除。请先删除相关SKU。',
      showCancel: false
    });
    return;
  }


  if (specForm.value.specList.length <= 1) {
    uni.showToast({
      title: '至少需要保留一个规格',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  console.log(`🗑️ 删除规格: ${specForm.value.specList[index].name}`);
  specForm.value.specList.splice(index, 1);
  specErrors.value.splice(index, 1);
  tagInputs.value.splice(index, 1);

  generateSkuList();
  updateSpecTitles();
};

// 验证规格名称
const validateSpecName = (index: number) => {
  const spec = specForm.value.specList[index];
  let error = '';

  if (!spec.name || spec.name.trim() === '') {
    error = '请输入规格名称';
  } else if (spec.name.length > 20) {
    error = '规格名称不能超过20个字符';
  }

  specErrors.value[index] = error;
  return !error;
};

// 显示规格值输入框
const showSpecInput = (index: number) => {
  tagInputs.value[index] = { value: undefined, visible: true };

  //在 UniApp 的 Vue 模板中，当 input从隐藏变为显示时，通常会自动获取焦点。你可以直接

  // nextTick(() => {
  //   const inputs = uni.createSelectorQuery().in(this).selectAll('.spec-value-input');
  //   inputs.fields({ dataset: true }, (res: any) => {
  //     if (res[index]) {
  //       uni.createSelectorQuery().in(this).select(`.spec-value-input:nth-child(${index + 1})`).focus();
  //     }
  //   }).exec();
  // });

};

// 处理规格值输入
const handleInputSpecValue = (index: number) => {
  const inputValue = tagInputs.value[index].value?.trim();

  if (!inputValue) {
    tagInputs.value[index] = { value: undefined, visible: false };
    return;
  }

  const spec = specForm.value.specList[index];
  const exists = spec.values.some(v => v.value === inputValue);

  if (exists) {
    uni.showToast({
      title: '规格值已存在',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  const newValue = new SpecValue({
    id: generateTempId(),
    value: inputValue
  });

  spec.values.push(newValue);
  console.log(`➕ 添加规格值: ${inputValue}`);

  tagInputs.value[index] = { value: undefined, visible: false };
  generateSkuList();
  updateSpecTitles();
};

// 删除规格值
const handleRemoveSpecValue = (specIndex : number, valueId: string) => {

  // 编辑模式下检查是否被SKU使用
  if (goodsInfo.value.id && hasSkuData(valueId)) {
    uni.showModal({
      title: '提示',
      content: '此规格值已被SKU使用，无法删除。请先删除相关SKU。',
      showCancel: false
    });
    return;
  }



  const spec = specForm.value.specList[specIndex];
  const valueIndex = spec.values.findIndex(v => v.id === valueId);

  if (valueIndex === -1) return;

  const removedValue = spec.values[valueIndex];
  console.log(`🗑️ 删除规格值: ${removedValue.value}`);

  spec.values.splice(valueIndex, 1);
  generateSkuList();
  updateSpecTitles();
};

// 处理规格变化
const handleSpecChange = () => {
  updateSpecTitles();
};

// 生成SKU列表
const generateSkuList = () => {

  // ✅ 编辑模式下如果有SKU数据，不重新生成
  if (goodsInfo.value.id && skuForm.value.skuList.length > 0) {
    console.log('编辑模式，已有SKU数据，跳过重新生成');
    return;
  }


  console.log('🔄 开始生成SKU列表');

  const validSpecs = specForm.value.specList.filter(spec => spec.values.length > 0);

  if (validSpecs.length === 0) {
    skuForm.value.skuList = [];
    skuErrors.value = [];
    console.log('📝 无有效规格，清空SKU列表');
    return;
  }

  // 计算笛卡尔积
  const cartesianProduct = (...arrays: any[][]): any[][]  => {
    return arrays.reduce(
      (acc, curr) => acc.flatMap(x => curr.map(y => [...x, y])),
      [[]]
    );
  };

  const valueCombinations = cartesianProduct(...validSpecs.map(spec => spec.values));

  const newSkus = valueCombinations.map((values, index) => {
    const specValues = values.map(v => v.value).join('|');
    // 数据库中的 specIds可能是下划线分隔，而您生成的 specIds是竖线分隔
    const specIds = values.map(v => v.id).join('|');


    // 编辑模式下：尝试找到对应的已有SKU
    const existingSku = skuForm.value.skuList.find(sku => {
      // 如果已有SKU的规格ID与当前组合匹配
      if (sku.specIds && sku.specIds === specIds) {
        return true;
      }
      // 或者规格值匹配
      if (sku.specValues && sku.specValues === specValues) {
        return true;
      }
      return false;
    });

    console.log('📝 编辑模式下,尝试找到对应的已有SKU',existingSku);

    const sku = new SkuItem({
      id: existingSku?.id,
      skuSn: existingSku?.skuSn || `SKU_${Date.now().toString(36).substr(2, 4)}_${index + 1}`.toUpperCase(),
      price: existingSku?.price || 0,
      stock: existingSku?.stock || 0,
      Lockedstock: existingSku?.Lockedstock || 0,
      specIds,
      specValues,
      picUrl: existingSku?.picUrl || ''
    });

    values.forEach((value, i) => {
      sku[`specValue${i + 1}`] = value.value;
    });

    return sku;
  });

  skuForm.value.skuList = newSkus;
  skuErrors.value = newSkus.map(() => ({}));

  // 👇 添加这一行，强制刷新视图
  nextTick(() => {
    console.log('🔄 SKU列表已更新，强制刷新视图');
  });



  console.log(`✅ 生成 ${newSkus.length} 个SKU，其中${newSkus.filter(s => s.id).length}个是已有的`);




};

// 验证SKU编码
const validateSkuSn = (index: number) => {
  const sku = skuForm.value.skuList[index];
  let error = '';

  if (!sku.skuSn || sku.skuSn.trim() === '') {
    error = '请输入SKU编码';
  } else if (sku.skuSn.length > 50) {
    error = 'SKU编码不能超过50个字符';
  }

  if (!skuErrors.value[index]) {
    skuErrors.value[index] = {};
  }
  skuErrors.value[index].skuSn = error;
  return !error;
};

// 验证价格
const validatePrice = (index: number) => {
  const sku = skuForm.value.skuList[index];
  let error = '';

  if (sku.price === undefined || sku.price === null) {
    error = '请输入价格';
  } else if (isNaN(Number(sku.price))) {
    error = '价格必须是数字';
  } else if (Number(sku.price) < 0) {
    error = '价格不能小于0';
  } else if (Number(sku.price) > 9999999) {
    error = '价格超出范围';
  }

  if (!skuErrors.value[index]) {
    skuErrors.value[index] = {};
  }
  skuErrors.value[index].price = error;
  return !error;
};

// 验证库存
const validateStock = (index: number) => {
  const sku = skuForm.value.skuList[index];
  let error = '';

  if (sku.stock === undefined || sku.stock === null) {
    error = '请输入库存';
  } else if (isNaN(Number(sku.stock))) {
    error = '库存必须是数字';
  } else if (!Number.isInteger(Number(sku.stock))) {
    error = '库存必须是整数';
  } else if (Number(sku.stock) < 0) {
    error = '库存不能小于0';
  } else if (Number(sku.stock) > 999999) {
    error = '库存超出范围';
  }

  if (!skuErrors.value[index]) {
    skuErrors.value[index] = {};
  }
  skuErrors.value[index].stock = error;
  return !error;
};

// 处理价格变化
const handlePriceChange = (sku: SkuItem, index: number) => {
  if (sku.price < 0) {
    sku.price = 0;
    uni.showToast({
      title: '价格不能小于0',
      icon: 'none',
      duration: 2000
    });
  }
  delete skuErrors.value[index]?.price;
};


import FileAPI from "@/packageC/api/file/file";

// 上传规格图片
const uploadSpecImage = async (specIndex: number) => {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    });

    if (res.tempFilePaths.length > 0) {
      const tempFilePath = res.tempFilePaths[0];

      // 验证文件大小
      const fileInfo = await uni.getFileInfo({ filePath: tempFilePath });
      if (fileInfo.size > 5 * 1024 * 1024) {
        uni.showToast({
          title: '图片大小不能超过5MB',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      // 上传图片
      uni.showLoading({ title: '上传中...' });


      console.log('📤 开始上传规格主图:', tempFilePath);

      const uploadResult = await FileAPI.uploadUniFile({
        filePath: tempFilePath,
        category: 'product',
        type: 'main',
        fileName: `product_main_${Date.now()}.jpg`,
        onProgress: (percent) => {
          console.log(`📈 上传进度: ${percent}%`);
          // 可以在这里更新进度条
        }
      });

      uni.hideLoading();

      console.log('✅ 上传成功，结果:', uploadResult);


      if (uploadResult.code === "00000") {
        if (uploadResult.data?.url) {
          const spec = specForm.value.specList[specIndex];
          if (spec.values[0]) {
            spec.values[0].picUrl = uploadResult.data.url;
            generateSkuList();
            uni.showToast({
              title: '图片上传成功',
              icon: 'success',
              duration: 2000
            });
          }
        } else {
          throw new Error(uploadResult.msg || '上传失败');
        }
      } else {
        throw new Error('上传失败');
      }
    }
  } catch (error) {
    console.error('上传规格图片失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'error',
      duration: 2000
    });
  }
};

// 预览规格图片
const previewSpecImage = (imageUrl: string) => {
  if (imageUrl) {
    uni.previewImage({
      current: imageUrl,
      urls: [imageUrl]
    });
  }
};

// 上传SKU图片
const uploadSkuImage = async (skuIndex: number) => {
  try {


    // 1. 选择图片
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    }).catch(err => {
      // 如果用户取消，直接返回
      if (err.errMsg && err.errMsg.includes('cancel')) {
        console.log('用户取消了图片选择');
        return null;
      }
      throw err;
    });


    if (!res) return; // 用户取消选择

    if (res.tempFilePaths.length === 0) {
      console.log('未选择图片');
      return;
    }

    if (res.tempFilePaths.length > 0) {
      const tempFilePath = res.tempFilePaths[0];

      const fileInfo = await uni.getFileInfo({ filePath: tempFilePath });
      if (fileInfo.size > 5 * 1024 * 1024) {
        uni.showToast({
          title: '图片大小不能超过5MB',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      uni.showLoading({ title: '上传中...' });

      uni.showLoading({ title: 'SKU图片上传中...' });

      const uploadResult = await FileAPI.uploadUniFile({
        filePath: tempFilePath,
        category: 'SKU',
        type: 'main',
        fileName: `product_main_${Date.now()}.jpg`,
        onProgress: (percent) => {
          console.log(`📈 上传进度: ${percent}%`);
          // 可以在这里更新进度条
        }
      });

      uni.hideLoading();

      console.log('✅ SKU图片上传成功，结果:', uploadResult);

      if (uploadResult.code === "00000") {
        if (uploadResult.data?.url) {
          skuForm.value.skuList[skuIndex].picUrl = uploadResult.data.url;
          uni.showToast({
            title: 'SKU图片上传成功',
            icon: 'success',
            duration: 2000
          });
        } else {
          throw new Error(uploadResult.msg || '上传失败');
        }
      } else {
        throw new Error('上传失败');
      }
    }
  } catch (error: any) {
    console.error('上传SKU图片失败:', error);
    uni.hideLoading();


    // 检查是否是用户取消操作
    const isUserCancel = error.message && (
      error.message.includes('cancel') ||
      error.message.includes('取消')
    );


    if (!isUserCancel) {
      uni.showToast({
        title: '上传失败，请重试',
        icon: 'error',
        duration: 2000
      });
    }


  }
};

// 预览SKU图片
const previewSkuImage = (imageUrl: string) => {
  if (imageUrl) {
    uni.previewImage({
      current: imageUrl,
      urls: [imageUrl]
    });
  }
};

// 检查规格值是否被SKU使用
const hasSkuData = (valueId: string): boolean => {
  if (!goodsInfo.value.id) return false; // 新增模式，肯定没被使用

  return skuForm.value.skuList.some(sku => {
    if (!sku.specIds) return false;
    return sku.specIds.split('|').includes(valueId);
  });
};


// 检查规格是否被SKU使用
const hasSkuDataForSpec = (specId: string): boolean => {
  if (!goodsInfo.value.id) return false; // 新增模式，肯定没被使用

  // 获取此规格的所有规格值ID
  const spec = specForm.value.specList.find(s => s.id === specId);
  if (!spec) return false;

  const specValueIds = spec.values.map(v => v.id);

  return skuForm.value.skuList.some(sku => {
    if (!sku.specIds) return false;
    const skuSpecIds = sku.specIds.split('|');
    return skuSpecIds.some(id => specValueIds.includes(id));
  });
};


// 删除SKU图片
const removeSkuImage = (skuIndex: number) => {
  uni.showModal({
    title: '提示',
    content: '确定要删除这张图片吗？',
    success: (res) => {
      if (res.confirm) {
        skuForm.value.skuList[skuIndex].picUrl = '';
        uni.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 1500
        });
      }
    }
  });
};

// 验证所有规格
const validateAllSpecs = () => {
  let isValid = true;

  specForm.value.specList.forEach((spec, index) => {
    if (!validateSpecName(index)) {
      isValid = false;
    }
  });

  const hasSpecValues = specForm.value.specList.some(spec => spec.values.length > 0);
  if (!hasSpecValues) {
    uni.showToast({
      title: '请至少为一个规格添加规格值',
      icon: 'none',
      duration: 2000
    });
    return false;
  }

  return isValid;
};

// 验证所有SKU
const validateAllSkus = () => {
  let isValid = true;

  skuForm.value.skuList.forEach((sku, index) => {
    if (!validateSkuSn(index) || !validatePrice(index) || !validateStock(index)) {
      isValid = false;
    }
  });

  return isValid;
};

// 上一步
const handlePrev = () => {
  console.log('⬅️ 返回上一步');
  emit('prev');
};

// 提交表单
const handleSubmit = async () => {
  try {
    console.log('📤 开始提交表单');

    // 1. 检查分类
    if (!goodsInfo.value.categoryId) {
      uni.showToast({
        title: '请先选择商品分类',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 2. 验证规格
    if (!validateAllSpecs()) {
      uni.showToast({
        title: '请填写完整的规格信息',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 3. 验证SKU
    if (skuForm.value.skuList.length === 0) {
      uni.showToast({
        title: '未生成商品SKU',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    if (!validateAllSkus()) {
      uni.showToast({
        title: '请填写完整的SKU信息',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 4. 准备提交数据
    const submitData = { ...goodsInfo.value };

    // 处理规格数据
    const processedSpecs: any[] = [];
    specForm.value.specList.forEach(spec => {
      spec.values.forEach(value => {
        const specObj : any = {
          name: spec.name || '',
          value: value.value || '',
          picUrl: value.picUrl || ''
        };

        if (value.id && !isTempId(value.id)) {
          specObj.id = value.id;
        } else {
          specObj.id = generateTempId();
        }

        processedSpecs.push(specObj);
      });
    });
    submitData.specList = processedSpecs;

    // 处理SKU数据
    const processedSkus = skuForm.value.skuList.map(sku => ({
      id: sku.id,
      skuSn: sku.skuSn,
      price: Math.round(Number(sku.price) * 100),
      stock: Number(sku.stock),
      Lockedstock: Number(sku.Lockedstock),
      specIds: sku.specIds,
      specValues: sku.specValues,
      picUrl: sku.picUrl || ''
    }));
    submitData.skuList = processedSkus;

    // 价格转换
    if (goodsInfo.value.originPrice !== undefined) {
      submitData.originPrice = Math.round(Number(goodsInfo.value.originPrice) * 100);
    }
    if (goodsInfo.value.price !== undefined) {
      submitData.price = Math.round(Number(goodsInfo.value.price) * 100);
    }

    console.log('📤 完整提交数据:', submitData);

    // 5. 调用API
    uni.showLoading({ title: '提交中...' });

    let result: any;
    if (goodsInfo.value.id) {
      // 编辑
      // response = await uni.request({
      //   url: `/api/spu/${goodsInfo.value.id}`,
      //   method: 'PUT',
      //   data: submitData,
      //   header: {
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Bearer ' + uni.getStorageSync('token')
      //   }
      // });


      // 编辑
      result = await PmsSpuAPI.update(goodsInfo.value.id, submitData);

      // console.log('📤 update API 原始返回:', result);
      // console.log('📤 update API 返回类型:', typeof result);
      // console.log('📤 update API 返回字符串:', JSON.stringify(result));

    } else {
      // 新增
      // response = await uni.request({
      //   url: '/api/spu',
      //   method: 'POST',
      //   data: submitData,
      //   header: {
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Bearer ' + uni.getStorageSync('token')
      //   }
      // });

      // 新增
      result =  await PmsSpuAPI.add(submitData);

      // console.log('📤 add API 原始返回:', result);
      // console.log('📤 add API 返回类型:', typeof result);
      // console.log('📤 add API 返回字符串:', JSON.stringify(result));

    }

    console.info("商品上架提交结果:", result);

    uni.hideLoading();

    if (result) {
      uni.showToast({
        title: goodsInfo.value.id ? '商品编辑成功' : '商品新增成功',
        icon: 'success',
        duration: 2000
      });

      // 重置商品信息
      const resetInfo = {
        ...goodsInfo.value,
        id: undefined,
        name: '',
        picUrl: '',
        specList: [],
        skuList: [],
        attrList: [],
        price: undefined,
        originPrice: undefined,
        album: [],
        detail: '',
        categoryId: goodsInfo.value.categoryId
      };

      emit('update:goodsInfo', resetInfo);
      emit('submit-success', goodsInfo.value.categoryId);

    } else {
      throw new Error(result.data?.msg || '提交失败');
    }

  } catch (error: any) {
    console.error('❌ 提交失败:', error);
    uni.hideLoading();
    uni.showToast({
      title: `提交失败: ${error.message || '未知错误'}`,
      icon: 'error',
      duration: 2000
    });
  }
};

// 计算高度
const calculateHeights = () : void  => {
  const query = uni.createSelectorQuery().in(this);
  query.select('.component-container').boundingClientRect((data: any) => {
    if (data) {
      const windowHeight = systemInfo.windowHeight;
      const containerTop = data.top;
      const footerHeight = 120;

      scrollHeight.value = windowHeight - containerTop - footerHeight;
      skuTableHeight.value = 500; // 固定高度
    }
  }).exec();
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  setTimeout(() => {
    refreshing.value = false;

    // 这里添加刷新逻辑，比如重新拉取数据

  }, 1000);
};

// 生命周期
onLoad(() => {
  console.log('🔄 GoodsStock 组件加载');
  loadGoodsData();
});

onReady(() => {
  nextTick(() => {
    calculateHeights();
  });
});

onShow(() => {
  console.log('🔆 GoodsStock 组件显示');
  calculateHeights();
});

onHide(() => {
  console.log('🌙 GoodsStock 组件隐藏');
});

onUnmounted(() => {
  console.log('🗑️ GoodsStock 组件卸载');
});

// 监听规格变化
watch(() => specForm.value.specList, () => {
  generateSkuList();
}, { deep: true });

const hasLoaded = ref(false);

// 监听商品信息变化
watch(() => props.goodsInfo, (newValue) => {
  console.log('🔄 GoodsStock 监听到父组件数据变化');
  if (newValue.id) {
    console.log('编辑模式，商品ID:', newValue.id);

    // 只有首次加载时才处理数据
    if (!hasLoaded.value) {
      console.log('首次加载商品数据');
      loadGoodsData();
      hasLoaded.value = true;
    }
  } else {
    // 新增模式
    hasLoaded.value = false;
  }
}, { deep: true, immediate: true });

</script>

<style lang="scss" scoped>
.component-container {
  background-color: #f8f9fa;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom);



//--------------------------------

  /* 方案1的样式 */
  .sku-list {
    padding: 20rpx;
  }

  .sku-card {
    background: #ffffff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
    overflow: hidden;
    border: 2rpx solid #f0f0f0;

    &.has-error {
      border-color: #f56c6c;
    }
  }

  .sku-card-header {
    padding: 20rpx 30rpx;
    background: linear-gradient(135deg, #f8f9fa, #ffffff);
    border-bottom: 2rpx solid #f5f5f5;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .sku-specs {
    font-size: 28rpx;
    color: #303133;
    line-height: 1.4;

    .spec-item {
      display: inline-block;

      .spec-name {
        color: #606266;
        font-weight: 500;
      }

      .spec-value {
        color: #409eff;
        font-weight: 600;
        margin-left: 8rpx;
      }

      .separator {
        color: #909399;
        margin: 0 10rpx;
      }
    }
  }

  .sku-status {
    background: #67c23a;
    border-radius: 20rpx;
    padding: 4rpx 12rpx;

    .status-text {
      color: #ffffff;
      font-size: 22rpx;
    }
  }

  .sku-card-content {
    padding: 30rpx;
  }

  .form-item {
    margin-bottom: 30rpx;

    &.half {
      flex: 1;
    }

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    display: flex;
    align-items: center;
    margin-bottom: 15rpx;

    .label-text {
      font-size: 28rpx;
      color: #303133;
      font-weight: 500;
    }

    .required {
      color: #f56c6c;
      font-size: 24rpx;
      margin-left: 5rpx;
    }
  }

  .form-row {
    display: flex;
    gap: 20rpx;
    align-items: flex-start; /* 关键修改：防止子元素被拉伸下沉 */
    /* 如果行高过大，也可以加上 line-height: 1; */
  }

  .form-input, .price-input {
    width: 100%;
    height: 80rpx;
    background: #ffffff !important;  /* 改为白色背景 */
    border: 2rpx solid #409eff !important;  /* 蓝色边框 */
    border-radius: 10rpx;
    padding: 0 20rpx;
    font-size: 28rpx;
    color: #000000 !important;  /* 纯黑色文字 */
    box-sizing: border-box;

    &:focus {
      border-color: #409eff;
      background: #ffffff;
    }
  }

  .price-input-group {
    display: flex;
    align-items: center;
    background: #f5f7fa;
    border: 2rpx solid #e4e7ed;
    border-radius: 10rpx;
    overflow: hidden;

    .price-prefix {
      padding: 0 20rpx;
      background: #e4e7ed;
      height: 80rpx;
      line-height: 80rpx;
      color: #606266;
      font-size: 28rpx;
      font-weight: 500;
    }

    .price-input {
      flex: 1;
      border: none;
      background: transparent;
    }
  }

  .image-upload-area {
    //width: 100%;
    //height: 200rpx;
    //border: 2rpx dashed #dcdfe6;
    //border-radius: 10rpx;
    //overflow: hidden;
    //background: #f8f9fa;
    //position: relative;
    width: 100%;  /* 固定宽度，确保图片不会太窄 */
    height: 520rpx;  /* 固定高度 320rpx */
    border: 2rpx dashed #dcdfe6;
    border-radius: 12rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #fafafa;
    overflow: hidden; /* 裁剪超出部分 */
    position: relative;

    .image-preview {
      width: 100%;
      height: 100%;
      position: relative;
      border-radius: 12rpx; /* 保持圆角 */

      .uploaded-image {
        width: 100%;
        height: 100%;
        object-fit: cover; /* 关键：图片自适应填充 */
      }

      .image-actions {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        padding: 15rpx;
        gap: 10rpx;

        .btn-action {
          flex: 1;
          height: 60rpx;
          line-height: 60rpx;
          text-align: center;
          color: #ffffff;
          font-size: 24rpx;
          border-radius: 8rpx;

          &.replace {
            background: #409eff;
          }

          &.delete {
            background: #f56c6c;
          }
        }
      }
    }

    .upload-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .upload-icon {
        font-size: 60rpx;
        color: #909399;
        margin-bottom: 10rpx;
      }

      .upload-text {
        font-size: 28rpx;
        color: #606266;
      }
    }
  }

  .error-text {
    color: #f56c6c;
    font-size: 24rpx;
    margin-top: 8rpx;
    min-height: 32rpx;
  }




  //------------------------










  &__main {
    padding: 20rpx 30rpx 120rpx;
    box-sizing: border-box;

    // 规格卡片
    .spec-card,
    .stock-card {
      background-color: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
      margin-bottom: 30rpx;
      overflow: hidden;

      &:last-child {
        margin-bottom: 0;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx 30rpx 20rpx;
        border-bottom: 2rpx solid #f0f0f0;
        background-color: #f8f9fa;

        .card-title {
          font-size: 36rpx;
          font-weight: 600;
          color: #303133;
        }

        .btn-add-spec {
          background-color: #67c23a;
          color: #ffffff;
          border: none;
          border-radius: 10rpx;
          padding: 12rpx 24rpx;
          font-size: 28rpx;

          &::after {
            border: none;
          }

          &[disabled] {
            background-color: #c0c4cc;
            opacity: 0.6;
          }
        }

        .sku-count {
          font-size: 28rpx;
          color: #909399;
        }
      }

      .empty-state {
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
    }

    // 规格表单
    .spec-form {
      padding: 30rpx;

      .spec-item {
        margin-bottom: 40rpx;
        padding-bottom: 30rpx;
        border-bottom: 2rpx solid #f0f0f0;

        &:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        .spec-name-section {

          .spec-name-input {
            width: 100%;
            height: 80rpx; /* 确保足够的高度 */
            padding: 18rpx 30rpx; /* 调整上下的 padding，从 20rpx 改为 18rpx */
            margin: 0; /* 关键修改：清除默认的外边距 */

            background-color: #f5f7fa;
            border: 2rpx solid #e4e7ed;
            border-radius: 10rpx;
            font-size: 30rpx;    /* 输入文字颜色 */
            color: #303133;
            box-sizing: border-box;
            line-height: 44rpx; /* 添加行高，帮助文字居中 */


            /* placeholder 样式 */
            &::placeholder {
              color: #c0c4cc; /* 占位符颜色 */
              opacity: 1; /* 确保完全显示 */
            }

            /* 聚焦状态 */
            &:focus {
              border-color: #409eff;
              background-color: #f5f7fa; /* 保持不变，消除视觉跳动 */
              /* 可选：如果需要，可以在聚焦时稍微放大一点，增强交互感 */
              /* transform: scale(1.02); */
            }
          }

        }
        .spec-values-section {
          margin-bottom: 30rpx;

          .form-label {
            display: flex;
            align-items: center;
            margin-bottom: 20rpx;

            .label-text {
              font-size: 30rpx;
              font-weight: 600;
              color: #303133;
              margin-right: 8rpx;
            }

            .required {
              color: #f56c6c;
              font-size: 28rpx;
            }

            .image-tip {
              font-size: 24rpx;
              color: #909399;
              margin-left: 10rpx;
            }
          }

          .error-text {
            color: #f56c6c;
            font-size: 24rpx;
            margin-top: 8rpx;
            min-height: 32rpx;
          }
        }

        .spec-values-section {
          .spec-tags {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 20rpx;
            margin-bottom: 20rpx;

            .spec-tag {
              display: flex;
              align-items: center;
              padding: 12rpx 30rpx;
              border: 2rpx solid;
              border-radius: 8rpx;
              background-color: #ffffff;
              position: relative;

              .tag-text {
                font-size: 28rpx;
                color: #606266;
                margin-right: 10rpx;
              }

              .has-image-icon {
                font-size: 24rpx;
                margin-right: 20rpx;
                cursor: pointer;
              }

              .tag-close {
                position: absolute;
                top: -10rpx;
                right: -10rpx;
                width: 30rpx;
                height: 30rpx;
                background-color: #f56c6c;
                color: #ffffff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24rpx;
                cursor: pointer;
              }
            }

            .spec-value-input {
              width: 200rpx;
              padding: 12rpx 20rpx;
              background-color: #f5f7fa;
              border: 2rpx solid #e4e7ed;
              border-radius: 8rpx;
              font-size: 28rpx;
              color: #303133;

              &:focus {
                border-color: #409eff;
                background-color: #ffffff;
              }
            }

            .btn-add-value {
              background-color: #409eff;
              color: #ffffff;
              border: none;
              border-radius: 8rpx;
              padding: 12rpx 24rpx;
              font-size: 28rpx;

              &::after {
                border: none;
              }
            }
          }

          .spec-image-section {
            .image-upload-area {
              width: 200rpx;
              height: 200rpx;
              border: 2rpx dashed #dcdfe6;
              border-radius: 10rpx;
              overflow: hidden;
              background-color: #f5f7fa;
              margin-bottom: 10rpx;

              .image-preview {
                position: relative;
                width: 100%;
                height: 100%;

                .spec-image {
                  width: 100%;
                  height: 100%;
                }

                .image-overlay {
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background-color: rgba(0, 0, 0, 0.5);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  opacity: 0;
                  transition: opacity 0.2s;

                  .overlay-text {
                    color: #ffffff;
                    font-size: 28rpx;
                  }
                }

                &:active .image-overlay {
                  opacity: 1;
                }
              }

              .upload-placeholder {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                .upload-icon {
                  font-size: 60rpx;
                  color: #909399;
                  margin-bottom: 10rpx;
                }

                .upload-text {
                  font-size: 28rpx;
                  color: #606266;
                }
              }
            }

            .upload-tip {
              font-size: 24rpx;
              color: #909399;
              line-height: 1.4;
            }
          }
        }

        .spec-action {
          display: flex;
          justify-content: flex-end;

          .btn-delete-spec {
            background-color: #f56c6c;
            color: #ffffff;
            border: none;
            border-radius: 8rpx;
            padding: 12rpx 24rpx;
            font-size: 28rpx;

            &::after {
              border: none;
            }
          }
        }
      }
    }

    // SKU表格
    .sku-form {
      padding: 30rpx;

      .sku-table-wrapper {
        border: 2rpx solid #e4e7ed;
        border-radius: 10rpx;
        overflow: hidden;

        .sku-table {
          min-width: 1000rpx;

          .table-header {
            display: flex;
            background-color: #f5f7fa;
            border-bottom: 2rpx solid #e4e7ed;

            .header-cell {
              padding: 20rpx 15rpx;
              text-align: center;
              font-weight: 600;
              color: #303133;
              font-size: 28rpx;
              border-right: 1rpx solid #e4e7ed;

              &:last-child {
                border-right: none;
              }

              &.spec-header {
                width: 120rpx;
                min-width: 120rpx;
              }

              &.sku-sn-header {
                width: 180rpx;
                min-width: 180rpx;
              }

              &.price-header {
                width: 150rpx;
                min-width: 150rpx;
              }

              &.stock-header {
                width: 120rpx;
                min-width: 120rpx;
              }

              &.image-header {
                width: 300rpx;
                min-width: 300rpx;
              }

              .header-text {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
            }
          }

          .table-row {
            display: flex;
            border-bottom: 1rpx solid #e4e7ed;

            &:last-child {
              border-bottom: none;
            }

            &:nth-child(even) {
              background-color: #f8f9fa;
            }

            .table-cell {
              padding: 20rpx 15rpx;
              border-right: 1rpx solid #e4e7ed;

              &:last-child {
                border-right: none;
              }

              &.spec-cell {
                width: 120rpx;
                min-width: 120rpx;
                display: flex;
                align-items: center;
                justify-content: center;

                .spec-value-text {
                  font-size: 28rpx;
                  color: #606266;
                  text-align: center;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  padding: 8rpx 12rpx;
                  background-color: #f5f7fa;
                  border-radius: 6rpx;
                }
              }

              &.sku-sn-cell,
              &.price-cell,
              &.stock-cell {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;

                .sku-input,
                .stock-input {
                  width: 100%;
                  padding: 15rpx 20rpx;
                  background-color: #f5f7fa;
                  border: 2rpx solid #e4e7ed;
                  border-radius: 8rpx;
                  font-size: 28rpx;
                  color: #303133;
                  text-align: center;
                  box-sizing: border-box;

                  &:focus {
                    border-color: #409eff;
                    background-color: #ffffff;
                  }
                }

                .price-input-group {
                  display: flex;
                  align-items: center;
                  width: 100%;
                  background-color: #f5f7fa;
                  border: 2rpx solid #e4e7ed;
                  border-radius: 8rpx;
                  overflow: hidden;

                  .price-prefix {
                    padding: 0 15rpx;
                    background-color: #e4e7ed;
                    height: 70rpx;
                    line-height: 70rpx;
                    color: #606266;
                    font-size: 28rpx;
                    font-weight: 500;
                    flex-shrink: 0;
                  }

                  .price-input {
                    flex: 1;
                    border: none;
                    background-color: transparent;
                    padding: 15rpx 20rpx;
                    font-size: 28rpx;
                    color: #303133;
                    text-align: center;
                  }
                }

                .error-text {
                  color: #f56c6c;
                  font-size: 22rpx;
                  margin-top: 5rpx;
                  min-height: 28rpx;
                  text-align: center;
                }
              }

              &.sku-sn-cell {
                width: 180rpx;
                min-width: 180rpx;
              }

              &.price-cell {
                width: 150rpx;
                min-width: 150rpx;
              }

              &.stock-cell {
                width: 120rpx;
                min-width: 120rpx;
              }

              &.image-cell {
                width: 300rpx;
                min-width: 300rpx;
                padding: 20rpx;

                .sku-image-container {
                  .sku-image-preview {
                    position: relative;
                    width: 150rpx;
                    height: 150rpx;
                    border-radius: 8rpx;
                    overflow: hidden;
                    margin: 0 auto;

                    .sku-image {
                      width: 100%;
                      height: 100%;
                    }

                    .image-action {
                      position: absolute;
                      bottom: 0;
                      left: 0;
                      right: 0;
                      background-color: rgba(0, 0, 0, 0.7);
                      display: flex;
                      justify-content: space-around;
                      padding: 10rpx;

                      .btn-replace,
                      .btn-delete {
                        color: #ffffff;
                        font-size: 24rpx;
                        padding: 5rpx 10rpx;
                        cursor: pointer;
                      }

                      .btn-replace {
                        color: #409eff;
                      }

                      .btn-delete {
                        color: #f56c6c;
                      }
                    }
                  }

                  .sku-image-upload {
                    width: 120rpx;
                    height: 120rpx;
                    border: 2rpx dashed #dcdfe6;
                    border-radius: 8rpx;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    background-color: #f5f7fa;
                    margin: 0 auto;

                    .upload-icon {
                      font-size: 40rpx;
                      color: #909399;
                      margin-bottom: 5rpx;
                    }

                    .upload-text {
                      font-size: 24rpx;
                      color: #606266;
                    }
                  }
                }
              }
            }
          }
        }
      }

      .table-tips {
        font-size: 24rpx;
        color: #909399;
        text-align: center;
        margin-top: 10rpx;
      }
    }
  }


}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 100;
  box-sizing: border-box;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));

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
    }

    &.btn-submit {
      background: linear-gradient(135deg, #409eff, #66b1ff);
      color: #ffffff;
    }
  }
}

// 按钮悬停效果
.btn-hover {
  opacity: 0.7;
  transform: scale(0.98);
  transition: all 0.2s ease;
}

// 占位符样式
.placeholder {
  color: #c0c4cc;
  font-size: 30rpx;
}

// 响应式设计
@media (max-width: 768px) {
  .component-container {
    &__main {
      padding: 15rpx 20rpx 100rpx;

      .spec-card,
      .stock-card {
        .card-header {
          padding: 20rpx 20rpx 15rpx;

          .card-title {
            font-size: 32rpx;
          }

          .btn-add-spec {
            padding: 10rpx 20rpx;
            font-size: 26rpx;
          }

          .sku-count {
            font-size: 26rpx;
          }
        }

        .spec-form {
          padding: 20rpx;

          .spec-item {
            .spec-values-section {
              .spec-tags {
                flex-direction: column;
                align-items: flex-start;
                gap: 15rpx;

                .spec-tag {
                  width: 100%;
                  justify-content: space-between;
                }

                .spec-value-input {
                  width: 100%;
                }

                .btn-add-value {
                  width: 100%;
                }
              }
            }

            .spec-action {
              .btn-delete-spec {
                width: 100%;
              }
            }
          }
        }

        .sku-form {
          padding: 20rpx;

          .sku-table-wrapper {
            .sku-table {
              .table-header {
                .header-cell {
                  font-size: 26rpx;
                  padding: 15rpx 10rpx;

                  &.image-header {
                    width: 200rpx;
                    min-width: 200rpx;
                  }
                }
              }

              .table-row {
                .table-cell {
                  font-size: 26rpx;
                  padding: 15rpx 10rpx;

                  &.image-cell {
                    width: 200rpx;
                    min-width: 200rpx;
                  }
                }
              }
            }
          }
        }
      }
    }

    &__footer {
      padding: 15rpx 20rpx;

      button {
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
      padding: 10rpx 15rpx 90rpx;

      .spec-card,
      .stock-card {
        .card-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 15rpx;

          .card-title {
            font-size: 30rpx;
          }
        }

        .empty-state {
          .empty-text {
            font-size: 28rpx;
          }
        }
      }

      .sku-form {
        .sku-table-wrapper {
          .sku-table {
            .table-header {
              .header-cell {
                font-size: 24rpx;

                &.image-header {
                  width: 150rpx;
                  min-width: 150rpx;
                }
              }
            }

            .table-row {
              .table-cell {
                font-size: 24rpx;

                &.image-cell {
                  width: 150rpx;
                  min-width: 150rpx;

                  .sku-image-container {
                    .sku-image-preview {
                      width: 100rpx;
                      height: 100rpx;
                    }

                    .sku-image-upload {
                      width: 80rpx;
                      height: 80rpx;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}


</style>
