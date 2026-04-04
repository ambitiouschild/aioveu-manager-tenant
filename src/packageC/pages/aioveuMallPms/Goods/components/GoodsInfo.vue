<!-- 转换后的 UniApp 组件 GoodsInfo.vue -->
<template>
  <scroll-view
    scroll-y
    class="component-container"
    :style="{ height: scrollHeight + 'px' }"
    refresher-enabled
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
  >
    <!-- 主要内容区域 -->
    <view class="component-container__main">
      <form class="goods-form" ref="dataFormRef">
        <!-- 商品名称 -->
        <view class="form-item" :class="{ 'has-error': errors.name }">
          <view class="form-label">
            <text class="label-text">商品名称</text>
            <text class="required">*</text>
          </view>
          <view class="form-control">
            <input
              v-model="goodsInfo.name"
              placeholder="请输入商品名称"
              class="form-input"
              placeholder-class="placeholder"
              maxlength="100"
              @input="handleNameInput"
              @blur="validateField('name')"
            />
            <view v-if="errors.name" class="error-text">
              {{ errors.name }}
            </view>
            <view class="input-hint">
              <text>{{ goodsInfo.name?.length || 0 }}/100</text>
            </view>
          </view>
        </view>

        <!-- 商品品牌 -->
        <view class="form-item" :class="{ 'has-error': errors.brandId }">
          <view class="form-label">
            <text class="label-text">商品品牌</text>
            <text class="required">*</text>
          </view>
          <view class="form-control">
            <picker
              mode="selector"
              :range="brandOptions"
              range-key="name"
              :value="selectedBrandIndex"
              @change="handleBrandChange"
            >
              <view class="picker-box">
                <text v-if="selectedBrand" class="picker-value">
                  {{ selectedBrand.name }}
                </text>
                <text v-else class="picker-placeholder">请选择商品品牌</text>
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
            <view v-if="errors.brandId" class="error-text">
              {{ errors.brandId }}
            </view>
            <view v-if="selectedBrand" class="brand-preview">
              <text class="brand-name-hint">已选品牌：{{ selectedBrand.name }}</text>
            </view>
          </view>
        </view>

        <!-- 零售价 -->
        <view class="form-item" :class="{ 'has-error': errors.originPrice }">
          <view class="form-label">
            <text class="label-text">零售价</text>
            <text class="required">*</text>
          </view>
          <view class="form-control">
            <view class="price-input-group">
              <text class="price-prefix">¥</text>
              <input
                v-model="goodsInfo.originPrice"
                placeholder="请输入零售价"
                type="digit"
                class="price-input"
                placeholder-class="placeholder"
                @input="handlePriceInput('originPrice')"
                @blur="validateField('originPrice')"
              />
            </view>
            <view v-if="errors.originPrice" class="error-text">
              {{ errors.originPrice }}
            </view>
            <view v-if="goodsInfo.originPrice" class="price-hint">
              零售价：¥{{ formatPrice(goodsInfo.originPrice) }}
            </view>
          </view>
        </view>

        <!-- 促销价 -->
        <view class="form-item" :class="{ 'has-error': errors.price }">
          <view class="form-label">
            <text class="label-text">促销价</text>
            <text class="required">*</text>
          </view>
          <view class="form-control">
            <view class="price-input-group">
              <text class="price-prefix">¥</text>
              <input
                v-model="goodsInfo.price"
                placeholder="请输入促销价"
                type="digit"
                class="price-input"
                placeholder-class="placeholder"
                @input="handlePriceInput('price')"
                @blur="validateField('price')"
              />
            </view>
            <view v-if="errors.price" class="error-text">
              {{ errors.price }}
            </view>
            <view v-if="goodsInfo.price && goodsInfo.originPrice" class="price-hint">
              促销价：¥{{ formatPrice(goodsInfo.price) }}
              <text v-if="Number(goodsInfo.price) > Number(goodsInfo.originPrice)" class="price-warning">
                （促销价不能高于零售价）
              </text>
            </view>
          </view>
        </view>

        <!-- 商品主图 -->
        <view class="form-item" :class="{ 'has-error': errors.picUrl }">
          <view class="form-label">
            <text class="label-text">商品主图</text>
            <text class="required">*</text>
          </view>
          <view class="form-control">
            <view class="image-upload-container">
              <view
                v-if="goodsInfo.picUrl"
                class="main-image-preview"
                @tap="previewMainImage"
              >
                <image
                  :src="goodsInfo.picUrl"
                  mode="aspectFill"
                  class="main-image"
                />
                <view class="image-overlay">
                  <text class="overlay-text">预览</text>
                </view>
              </view>

              <view
                v-else
                class="upload-trigger"
                @tap="chooseMainImage"
              >
                <view class="upload-icon">+</view>
                <view class="upload-text">选择图片</view>
              </view>
            </view>
            <view v-if="errors.picUrl" class="error-text">
              {{ errors.picUrl }}
            </view>
            <view class="upload-tip">
              建议尺寸：800×800px，最大5MB，支持格式：JPG、JPEG、PNG
            </view>
          </view>
        </view>

        <!-- 商品轮播图 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">商品轮播图</text>
          </view>
          <view class="form-control">
            <view class="album-upload-container">
              <!-- 已有的轮播图 -->
              <view
                v-if="goodsInfo.album && goodsInfo.album.length > 0"
                class="album-preview"
              >
                <view class="album-title">
                  当前轮播图 ({{ goodsInfo.album.length }})
                </view>
                <scroll-view
                  scroll-x
                  class="album-scroll"
                >
                  <view class="album-images">
                    <view
                      v-for="(url, index) in goodsInfo.album"
                      :key="index"
                      class="album-image-item"
                      @tap="previewAlbumImage(index)"
                    >
                      <image
                        :src="url"
                        mode="aspectFill"
                        class="album-image"
                      />
                      <view class="image-index">{{ index + 1 }}</view>
                      <view
                        class="delete-btn"
                        @tap.stop="removeAlbumImage(index)"
                      >
                        ×
                      </view>
                    </view>
                  </view>
                </scroll-view>
              </view>

              <!-- 添加按钮 -->
              <view
                v-if="!goodsInfo.album || goodsInfo.album.length < 10"
                class="album-add-btn"
                @tap="chooseAlbumImages"
              >
                <view class="add-icon">+</view>
                <view class="add-text">添加轮播图</view>
                <view class="add-tip">最多10张</view>
              </view>
            </view>
            <view class="upload-tip">
              支持格式：JPG、JPEG、PNG，每张最大2MB
            </view>
          </view>
        </view>

        <!-- 商品简介 -->
        <view class="form-item">
          <view class="form-label">
            <text class="label-text">商品简介</text>
          </view>
          <view class="form-control">
            <textarea
              v-model="goodsInfo.description"
              placeholder="请输入商品简介，最多500字"
              class="description-textarea"
              placeholder-class="placeholder"
              maxlength="500"
              auto-height
              @input="handleDescriptionInput"
            />
            <view class="textarea-hint">
              <text>{{ (goodsInfo.description || '').length }}/500</text>
            </view>
          </view>
        </view>

        <!-- 商品详情 -->
        <view class="form-item" :class="{ 'has-error': errors.detail }">
          <view class="form-label">
            <text class="label-text">商品详情</text>
            <text class="required">*</text>
          </view>
          <view class="form-control">
            <textarea
              v-model="goodsInfo.detail"
              placeholder="请输入商品详情内容"
              class="detail-textarea"
              placeholder-class="placeholder"
              auto-height
              @input="handleDetailInput"
              @blur="validateField('detail')"
            />
            <view v-if="errors.detail" class="error-text">
              {{ errors.detail }}
            </view>
            <view class="textarea-hint">
              <text>{{ (goodsInfo.detail || '').length }} 字符</text>
            </view>
          </view>
        </view>
      </form>
    </view>

    <!-- 底部操作按钮 -->
    <view class="component-container__footer">
      <button
        class="btn-prev"
        @tap="handlePrev"
        hover-class="btn-hover"
        hover-start-time="20"
        hover-stay-time="70"
      >
        上一步，选择商品分类
      </button>
      <button
        class="btn-next"
        @tap="handleNext"
        hover-class="btn-hover"
        hover-start-time="20"
        hover-stay-time="70"
      >
        下一步，设置商品属性
      </button>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { onLoad, onShow, onHide, onReady } from '@dcloudio/uni-app';

// 类型定义
class BrandOption {
  id = undefined;
  name = '';
  logoUrl = '';

  constructor(data = {}) {
    Object.assign(this, data);
  }
}

// Props 和 Emit
// const props = defineProps({
//   goodsInfo: {
//     type: Object,
//     default: () => ({})
//   }
// });

const emit = defineEmits([
  'prev',
  'next',
  'update:goodsInfo'
]);

// 响应式数据
const errors = ref({});               // 表单错误信息
const brandOptions = ref([]);         // 品牌选项
const selectedBrandIndex = ref(-1);   // 选中的品牌索引
const scrollHeight = ref(500);        // 滚动区域高度
const refreshing = ref(false);        // 下拉刷新状态
const systemInfo = uni.getSystemInfoSync();

// 商品信息双向绑定
const goodsInfo = computed({
  get: () => {
    const data = props.goodsInfo || {};
    // 确保必要字段存在
    if (!data.album || !Array.isArray(data.album)) {
      data.album = [];
    }
    return data;
  },
  set: (value) => {
    emit('update:goodsInfo', value);
  }
});

// 计算属性
const selectedBrand = computed(() => {
  if (selectedBrandIndex.value >= 0 && brandOptions.value[selectedBrandIndex.value]) {
    return brandOptions.value[selectedBrandIndex.value];
  }
  return null;
});

// 加载品牌数据
const loadBrandData = async () => {
  try {
    console.log('📦 开始加载品牌数据');

    const response = await uni.request({
      url: '/api/brand/list',
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      }
    });

    if (response.statusCode === 200 && response.data) {
      const resData = response.data;
      if (resData.code === 0 && Array.isArray(resData.data)) {
        brandOptions.value = resData.data.map(item => new BrandOption({
          id: item.id,
          name: item.name,
          logoUrl: item.logoUrl
        }));

        console.log(`✅ 品牌数据加载成功，共 ${brandOptions.value.length} 条`);

        // 如果商品有品牌ID，设置选中
        if (goodsInfo.value.brandId) {
          const index = brandOptions.value.findIndex(brand => brand.id === goodsInfo.value.brandId);
          if (index >= 0) {
            selectedBrandIndex.value = index;
          }
        }
      } else {
        console.warn('⚠️ 品牌数据格式错误');
        uni.showToast({
          title: '品牌数据加载失败',
          icon: 'none',
          duration: 2000
        });
      }
    }
  } catch (error) {
    console.error('❌ 加载品牌数据失败:', error);
    uni.showToast({
      title: '加载失败，请重试',
      icon: 'error',
      duration: 2000
    });
  }
};

// 表单验证
const validateField = (field) => {
  let error = '';
  const value = goodsInfo.value[field];

  switch (field) {
    case 'name':
      if (!value || value.trim() === '') {
        error = '请填写商品名称';
      } else if (value.length < 2) {
        error = '商品名称至少2个字符';
      } else if (value.length > 100) {
        error = '商品名称不能超过100个字符';
      }
      break;

    case 'brandId':
      if (!value) {
        error = '请选择商品品牌';
      }
      break;

    case 'originPrice':
      if (!value || isNaN(value) || Number(value) <= 0) {
        error = '请输入有效的零售价';
      }
      break;

    case 'price':
      if (!value || isNaN(value) || Number(value) <= 0) {
        error = '请输入有效的促销价';
      } else if (goodsInfo.value.originPrice && Number(value) > Number(goodsInfo.value.originPrice)) {
        error = '促销价不能高于零售价';
      }
      break;

    case 'picUrl':
      if (!value) {
        error = '请上传商品主图';
      }
      break;

    case 'detail':
      if (!value || value.trim() === '') {
        error = '请填写商品详情';
      }
      break;
  }

  if (error) {
    errors.value[field] = error;
  } else {
    delete errors.value[field];
  }
};

// 验证所有字段
const validateAllFields = () => {
  validateField('name');
  validateField('brandId');
  validateField('originPrice');
  validateField('price');
  validateField('picUrl');
  validateField('detail');

  return Object.keys(errors.value).length === 0;
};

// 处理商品名称输入
const handleNameInput = (e) => {
  goodsInfo.value.name = e.detail.value;
  delete errors.value.name;
};

// 处理品牌选择
const handleBrandChange = (e) => {
  const index = e.detail.value;
  selectedBrandIndex.value = index;

  if (index >= 0 && brandOptions.value[index]) {
    goodsInfo.value.brandId = brandOptions.value[index].id;
  } else {
    goodsInfo.value.brandId = undefined;
  }

  delete errors.value.brandId;
};

// 处理价格输入
const handlePriceInput = (field) => {
  const value = goodsInfo.value[field];
  // 限制两位小数
  if (value && value.includes('.')) {
    const parts = value.split('.');
    if (parts[1] && parts[1].length > 2) {
      goodsInfo.value[field] = parts[0] + '.' + parts[1].substring(0, 2);
    }
  }
  delete errors.value[field];
};

// 选择主图
const chooseMainImage = async () => {
  try {
    const res = await uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (chooseResult) => {
        if (chooseResult.tempFilePaths.length > 0) {
          const tempFilePath = chooseResult.tempFilePaths[0];

          // 获取文件信息
          const fileInfo = await uni.getFileInfo({ filePath: tempFilePath });
          const fileSize = fileInfo.size;

          if (fileSize > 5 * 1024 * 1024) {
            uni.showToast({
              title: '图片大小不能超过5MB',
              icon: 'none',
              duration: 2000
            });
            return;
          }

          // 上传图片
          await uploadMainImage(tempFilePath);
        }
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        if (err.errMsg.includes('cancel')) {
          console.log('用户取消选择');
        }
      }
    });
  } catch (error) {
    console.error('选择图片出错:', error);
  }
};

// 上传主图
const uploadMainImage = async (tempFilePath) => {
  uni.showLoading({ title: '上传中...' });

  try {
    const uploadResult = await uni.uploadFile({
      url: '/api/upload/image',
      filePath: tempFilePath,
      name: 'file',
      formData: {
        category: 'product',
        type: 'main'
      },
      header: {
        'Authorization': 'Bearer ' + uni.getStorageSync('token')
      }
    });

    if (uploadResult.statusCode === 200) {
      const data = JSON.parse(uploadResult.data);
      if (data.code === 0 && data.data && data.data.url) {
        goodsInfo.value.picUrl = data.data.url;
        delete errors.value.picUrl;

        uni.showToast({
          title: '上传成功',
          icon: 'success',
          duration: 2000
        });
      } else {
        throw new Error(data.msg || '上传失败');
      }
    } else {
      throw new Error('上传失败');
    }
  } catch (error) {
    console.error('上传图片失败:', error);
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'error',
      duration: 2000
    });
  } finally {
    uni.hideLoading();
  }
};

// 预览主图
const previewMainImage = () => {
  if (goodsInfo.value.picUrl) {
    uni.previewImage({
      current: goodsInfo.value.picUrl,
      urls: [goodsInfo.value.picUrl]
    });
  }
};

// 选择轮播图
const chooseAlbumImages = async () => {
  const currentCount = goodsInfo.value.album?.length || 0;
  const maxCount = 10 - currentCount;

  if (maxCount <= 0) {
    uni.showToast({
      title: '最多只能上传10张轮播图',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  try {
    const res = await uni.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (chooseResult) => {
        if (chooseResult.tempFilePaths.length > 0) {
          // 验证每张图片大小
          for (const tempFilePath of chooseResult.tempFilePaths) {
            const fileInfo = await uni.getFileInfo({ filePath: tempFilePath });
            if (fileInfo.size > 2 * 1024 * 1024) {
              uni.showToast({
                title: '每张图片不能超过2MB',
                icon: 'none',
                duration: 2000
              });
              return;
            }
          }

          // 上传所有图片
          await uploadAlbumImages(chooseResult.tempFilePaths);
        }
      },
      fail: (err) => {
        console.error('选择轮播图失败:', err);
      }
    });
  } catch (error) {
    console.error('选择轮播图出错:', error);
  }
};

// 上传轮播图
const uploadAlbumImages = async (tempFilePaths) => {
  uni.showLoading({ title: '上传中...' });

  try {
    const uploadPromises = tempFilePaths.map(tempFilePath =>
      uni.uploadFile({
        url: '/api/upload/image',
        filePath: tempFilePath,
        name: 'file',
        formData: {
          category: 'product',
          type: 'album'
        },
        header: {
          'Authorization': 'Bearer ' + uni.getStorageSync('token')
        }
      })
    );

    const results = await Promise.all(uploadPromises);
    const newAlbumUrls = [];

    for (const result of results) {
      if (result.statusCode === 200) {
        const data = JSON.parse(result.data);
        if (data.code === 0 && data.data && data.data.url) {
          newAlbumUrls.push(data.data.url);
        }
      }
    }

    if (newAlbumUrls.length > 0) {
      if (!goodsInfo.value.album) {
        goodsInfo.value.album = [];
      }
      goodsInfo.value.album = [...goodsInfo.value.album, ...newAlbumUrls];

      uni.showToast({
        title: `成功上传${newAlbumUrls.length}张图片`,
        icon: 'success',
        duration: 2000
      });
    }
  } catch (error) {
    console.error('上传轮播图失败:', error);
    uni.showToast({
      title: '上传失败，请重试',
      icon: 'error',
      duration: 2000
    });
  } finally {
    uni.hideLoading();
  }
};

// 预览轮播图
const previewAlbumImage = (index) => {
  if (goodsInfo.value.album && goodsInfo.value.album.length > index) {
    uni.previewImage({
      current: goodsInfo.value.album[index],
      urls: goodsInfo.value.album
    });
  }
};

// 删除轮播图
const removeAlbumImage = (index) => {
  if (goodsInfo.value.album && goodsInfo.value.album.length > index) {
    uni.showModal({
      title: '提示',
      content: '确定要删除这张图片吗？',
      success: (res) => {
        if (res.confirm) {
          goodsInfo.value.album.splice(index, 1);
          goodsInfo.value.album = [...goodsInfo.value.album]; // 触发更新

          uni.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  }
};

// 处理商品简介输入
const handleDescriptionInput = (e) => {
  goodsInfo.value.description = e.detail.value;
};

// 处理商品详情输入
const handleDetailInput = (e) => {
  goodsInfo.value.detail = e.detail.value;
  delete errors.value.detail;
};

// 格式化价格
const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0.00';
  return Number(price).toFixed(2);
};

// 上一步
const handlePrev = () => {
  console.log('⬅️ 返回上一步');
  emit('prev');
};

// 下一步
const handleNext = async () => {
  try {
    const isValid = validateAllFields();

    if (!isValid) {
      uni.showToast({
        title: '请填写完整的商品信息',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 额外的业务验证
    if (goodsInfo.value.price && goodsInfo.value.originPrice &&
      Number(goodsInfo.value.price) > Number(goodsInfo.value.originPrice)) {
      uni.showToast({
        title: '促销价不能高于零售价',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    console.log('✅ 表单验证通过');
    console.log('商品信息:', goodsInfo.value);

    emit('next');
  } catch (error) {
    console.error('验证出错:', error);
    uni.showToast({
      title: '验证出错，请重试',
      icon: 'error',
      duration: 2000
    });
  }
};

// 计算滚动区域高度
const calculateScrollHeight = () => {
  const query = uni.createSelectorQuery().in(this);
  query.select('.component-container').boundingClientRect(data => {
    if (data) {
      const windowHeight = systemInfo.windowHeight;
      const containerTop = data.top;
      const footerHeight = 120; // 底部按钮高度

      scrollHeight.value = windowHeight - containerTop - footerHeight;
    }
  }).exec();
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  setTimeout(() => {
    refreshing.value = false;
  }, 1000);
};

// 监听价格变化
watch(() => [goodsInfo.value.price, goodsInfo.value.originPrice], () => {
  if (goodsInfo.value.price && goodsInfo.value.originPrice &&
    Number(goodsInfo.value.price) > Number(goodsInfo.value.originPrice)) {
    delete errors.value.price;
  }
});

// 监听品牌ID变化
watch(() => goodsInfo.value.brandId, (newBrandId) => {
  if (newBrandId) {
    const index = brandOptions.value.findIndex(brand => brand.id === newBrandId);
    if (index >= 0) {
      selectedBrandIndex.value = index;
    }
  }
});

// 生命周期
onLoad(() => {
  console.log('🔄 GoodsInfo 组件加载');
  loadBrandData();
});

onReady(() => {
  nextTick(() => {
    calculateScrollHeight();
  });
});

onShow(() => {
  console.log('🔆 GoodsInfo 组件显示');
  calculateScrollHeight();
});

onHide(() => {
  console.log('🌙 GoodsInfo 组件隐藏');
});

onUnmounted(() => {
  console.log('🗑️ GoodsInfo 组件卸载');
});
</script>

<style lang="scss" scoped>
.component-container {
  background-color: #f8f9fa;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: env(safe-area-inset-bottom);

  &__main {
    padding: 20rpx 30rpx 120rpx;
    box-sizing: border-box;

    .goods-form {
      background-color: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
      padding: 30rpx;

      .form-item {
        margin-bottom: 40rpx;
        position: relative;

        &:last-child {
          margin-bottom: 0;
        }

        &.has-error {
          .form-control {
            border-color: #f56c6c;
          }
        }

        .form-label {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;

          .label-text {
            font-size: 32rpx;
            font-weight: 600;
            color: #303133;
            margin-right: 8rpx;
          }

          .required {
            color: #f56c6c;
            font-size: 28rpx;
          }
        }

        .form-control {
          .form-input,
          .price-input,
          .description-textarea,
          .detail-textarea {
            width: 100%;
            padding: 20rpx 30rpx;
            background-color: #f5f7fa;
            border: 2rpx solid #e4e7ed;
            border-radius: 10rpx;
            font-size: 30rpx;
            color: #303133;
            box-sizing: border-box;

            &:focus {
              border-color: #409eff;
              background-color: #ffffff;
            }
          }

          .price-input-group {
            display: flex;
            align-items: center;
            background-color: #f5f7fa;
            border: 2rpx solid #e4e7ed;
            border-radius: 10rpx;
            overflow: hidden;

            .price-prefix {
              padding: 0 20rpx;
              background-color: #e4e7ed;
              height: 80rpx;
              line-height: 80rpx;
              color: #606266;
              font-size: 30rpx;
              font-weight: 500;
              flex-shrink: 0;
            }

            .price-input {
              flex: 1;
              border: none;
              background-color: transparent;
              padding: 20rpx;
            }
          }

          .description-textarea,
          .detail-textarea {
            min-height: 200rpx;
            line-height: 1.5;
            font-size: 28rpx;
          }

          .error-text {
            color: #f56c6c;
            font-size: 24rpx;
            margin-top: 8rpx;
            min-height: 32rpx;
          }

          .input-hint,
          .textarea-hint {
            text-align: right;
            color: #909399;
            font-size: 24rpx;
            margin-top: 8rpx;
          }

          .brand-preview,
          .price-hint {
            margin-top: 10rpx;

            .brand-name-hint,
            .price-hint {
              font-size: 28rpx;
              color: #67c23a;
            }

            .price-warning {
              color: #f56c6c;
              font-size: 26rpx;
              margin-left: 10rpx;
            }
          }

          // 选择器样式
          .picker-box {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20rpx 30rpx;
            background-color: #f5f7fa;
            border: 2rpx solid #e4e7ed;
            border-radius: 10rpx;

            .picker-value {
              font-size: 30rpx;
              color: #303133;
            }

            .picker-placeholder {
              font-size: 30rpx;
              color: #c0c4cc;
            }

            .picker-arrow {
              color: #c0c4cc;
              font-size: 24rpx;
              margin-left: 10rpx;
            }
          }

          // 图片上传样式
          .image-upload-container {
            .main-image-preview {
              position: relative;
              width: 200rpx;
              height: 200rpx;
              border-radius: 10rpx;
              overflow: hidden;
              border: 2rpx dashed #dcdfe6;

              .main-image {
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

            .upload-trigger {
              width: 200rpx;
              height: 200rpx;
              border: 2rpx dashed #dcdfe6;
              border-radius: 10rpx;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: #f5f7fa;

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
            margin-top: 10rpx;
            line-height: 1.4;
          }

          // 轮播图样式
          .album-upload-container {
            .album-preview {
              margin-bottom: 20rpx;

              .album-title {
                font-size: 28rpx;
                color: #606266;
                margin-bottom: 15rpx;
                font-weight: 500;
              }

              .album-scroll {
                .album-images {
                  display: flex;
                  gap: 20rpx;

                  .album-image-item {
                    position: relative;
                    width: 120rpx;
                    height: 120rpx;
                    border-radius: 8rpx;
                    overflow: hidden;
                    flex-shrink: 0;

                    .album-image {
                      width: 100%;
                      height: 100%;
                    }

                    .image-index {
                      position: absolute;
                      top: 5rpx;
                      left: 5rpx;
                      background-color: rgba(0, 0, 0, 0.7);
                      color: #ffffff;
                      font-size: 20rpx;
                      padding: 2rpx 6rpx;
                      border-radius: 4rpx;
                    }

                    .delete-btn {
                      position: absolute;
                      top: 5rpx;
                      right: 5rpx;
                      width: 30rpx;
                      height: 30rpx;
                      background-color: rgba(245, 108, 108, 0.9);
                      color: #ffffff;
                      border-radius: 50%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 24rpx;
                    }
                  }
                }
              }
            }

            .album-add-btn {
              width: 120rpx;
              height: 120rpx;
              border: 2rpx dashed #dcdfe6;
              border-radius: 8rpx;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background-color: #f5f7fa;

              .add-icon {
                font-size: 40rpx;
                color: #909399;
                margin-bottom: 5rpx;
              }

              .add-text {
                font-size: 24rpx;
                color: #606266;
              }

              .add-tip {
                font-size: 20rpx;
                color: #909399;
                margin-top: 5rpx;
              }
            }
          }
        }
      }
    }
  }

  &__footer {
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

      &.btn-next {
        background: linear-gradient(135deg, #409eff, #66b1ff);
        color: #ffffff;
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

      .goods-form {
        padding: 20rpx;

        .form-item {
          margin-bottom: 30rpx;

          .form-label {
            .label-text {
              font-size: 30rpx;
            }
          }

          .form-control {
            .form-input,
            .price-input,
            .description-textarea,
            .detail-textarea {
              padding: 15rpx 20rpx;
              font-size: 28rpx;
            }

            .price-input-group {
              .price-input {
                padding: 15rpx;
              }
            }

            .description-textarea,
            .detail-textarea {
              min-height: 150rpx;
              font-size: 26rpx;
            }

            .image-upload-container {
              .main-image-preview,
              .upload-trigger {
                width: 150rpx;
                height: 150rpx;
              }

              .album-upload-container {
                .album-add-btn {
                  width: 100rpx;
                  height: 100rpx;
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

      .goods-form {
        padding: 15rpx;

        .form-item {
          .form-label {
            flex-direction: column;
            align-items: flex-start;
            gap: 5rpx;

            .label-text {
              font-size: 28rpx;
            }
          }
        }
      }
    }
  }
}
</style>
