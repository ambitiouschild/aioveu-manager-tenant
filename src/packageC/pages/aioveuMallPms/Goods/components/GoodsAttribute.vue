<!-- 转换后的 UniApp 组件 GoodsAttribute.vue -->
<template>
  <view class="component-container">
    <!-- 主要内容区域 -->
    <view class="component-container__main">
      <view class="card-container">
        <!-- 卡片头部：标题和添加按钮 -->
        <view class="card-header">
          <text class="card-title">商品属性</text>
          <button
            class="btn-add"
            @tap="handleAddAttribute"
            hover-class="btn-hover"
            hover-start-time="20"
            hover-stay-time="70"
          >
            <text class="icon-add">+</text>
            添加属性
          </button>
        </view>

        <!-- 属性表单 -->
        <form class="attribute-form" ref="attributeFormRef">
          <!-- 属性表格 -->
          <scroll-view
            v-if="goodsInfo.attrList && goodsInfo.attrList.length > 0"
            scroll-y
            class="attribute-table"
            :style="{ height: tableHeight + 'px' }"
          >
            <view v-for="(item, index) in goodsInfo.attrList" :key="index" class="table-row">
              <!-- 属性名称 -->
              <view class="table-cell name-cell">
                <view class="form-item">
                  <input
                    v-model="item.name"
                    placeholder="请输入属性名称"
                    class="input-field"
                    placeholder-class="placeholder"
                    @input="handleAttributeInput($event, index, 'name')"
                    @blur="validateField('name', index)"
                  />
                  <view v-if="errors[index] && errors[index].name" class="error-text">
                    {{ errors[index].name }}
                  </view>
                </view>
              </view>

              <!-- 属性值 -->
              <view class="table-cell value-cell">
                <view class="form-item">
                  <input
                    v-model="item.value"
                    placeholder="请输入属性值"
                    class="input-field"
                    placeholder-class="placeholder"
                    @input="handleAttributeInput($event, index, 'value')"
                    @blur="validateField('value', index)"
                  />
                  <view v-if="errors[index] && errors[index].value" class="error-text">
                    {{ errors[index].value }}
                  </view>
                </view>
              </view>

              <!-- 操作按钮 -->
              <view class="table-cell action-cell">
                <button
                  v-if="index > 0"
                  class="btn-delete"
                  @tap.stop="handleRemoveAttribute(index)"
                  hover-class="btn-hover"
                  hover-start-time="20"
                  hover-stay-time="70"
                >
                  删除
                </button>
                <view v-else class="disabled-placeholder"></view>
              </view>
            </view>
          </scroll-view>

          <!-- 空状态提示 -->
          <view v-else class="empty-state">
            <image src="/static/empty.png" class="empty-image" mode="aspectFit" />
            <text class="empty-text">暂无商品属性</text>
            <button
              class="btn-empty-add"
              @tap="handleAddAttribute"
              hover-class="btn-hover"
              hover-start-time="20"
              hover-stay-time="70"
            >
              添加属性
            </button>
          </view>
        </form>
      </view>
    </view>

    <!-- 底部操作按钮 <view class="component-container__footer">-->
    <view class="action-bar">
      <button
        class="btn-prev"
        @tap="handlePrev"
        hover-class="btn-hover"
        hover-start-time="20"
        hover-stay-time="70"
      >
        上一步，填写商品信息
      </button>
      <button
        class="btn-next"
        @tap="handleNext"
        hover-class="btn-hover"
        hover-start-time="20"
        hover-stay-time="70"
      >
        下一步，设置商品库存
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { onReady, onLoad, onShow, onHide } from "@dcloudio/uni-app";
import PmsSpuAttributeAPI from "@/packageC/api/aioveuMallPms/aioveuMallPmsSpuAttribute/pms-spu-attribute";
// ==================== 类型定义 ====================
/**
 * 商品属性项接口
 */
interface GoodsAttributeData {
  id?: number;
  name: string;
  value: string;
  type?: number;
  categoryId?: number;
}

class GoodsAttribute {
  id?: number = undefined;
  name: string = "";
  value: string = "";
  type?: number = undefined;
  categoryId?: number = undefined;

  constructor(data: Partial<GoodsAttributeData> = {}) {
    Object.assign(this, data);
  }
}

/**
 * 商品信息接口
 */
interface GoodsInfoData {
  id?: number;
  categoryId?: number;
  attrList: GoodsAttributeData[];
  [key: string]: any;
}

class GoodsInfo {
  id?: number = undefined;
  categoryId?: number = undefined;
  attrList: GoodsAttributeData[] = [];

  constructor(data: Partial<GoodsInfoData> = {}) {
    Object.assign(this, data);
  }
}

// 错误信息类型
interface AttributeError {
  name?: string;
  value?: string;
}

// ==================== Props和Emit ====================
interface Props {
  goodsInfo?: GoodsInfoData;
}

const props = withDefaults(defineProps<Props>(), {
  goodsInfo: () => ({
    id: undefined,
    categoryId: undefined,
    attrList: [],
  }),
});

const emit = defineEmits<{
  (e: "prev"): void; // 上一步事件
  (e: "next"): void; // 下一步事件
  (e: "update:goodsInfo", value: GoodsInfoData): void; // 更新商品信息
}>();

// ==================== 响应式数据 ====================
// 表单验证错误信息
const errors = ref<AttributeError[]>([]);

// 表格高度
const tableHeight = ref<number>(300);

// 商品信息双向绑定
const goodsInfo = computed({
  get: (): GoodsInfoData => {
    const data = props.goodsInfo || {};
    // if (!data.attrList || !Array.isArray(data.attrList)) {
    //   data.attrList = [new GoodsAttribute()];
    // }

    // ❌ 不要修改原始数据
    // ✅ 返回新对象

    return {
      id: data.id,
      categoryId: data.categoryId,
      attrList: data.attrList.map((attr) => new GoodsAttribute(attr)),
    };
  },
  set: (value: GoodsInfoData) => {
    // 添加防重复触发检查
    const current = props.goodsInfo;
    if (JSON.stringify(current) === JSON.stringify(value)) {
      console.log("跳过相同数据的更新");
      return;
    }
    console.log("触发商品信息更新", value);
    emit("update:goodsInfo", value);
  },
});

// 加载状态
const loading = ref<boolean>(false);

// 系统信息
const systemInfo = uni.getSystemInfoSync();

// ==================== 业务方法 ====================
/**
 * 监听分类变化，加载对应分类的属性
 */
const watchCategoryChange = (): void => {
  watch(
    () => goodsInfo.value.categoryId,
    async (newCategoryId) => {
      console.log("🔄 分类ID变化:", newCategoryId);

      // 如果是编辑模式（有商品ID），加载对应的属性
      if (goodsInfo.value.id && goodsInfo.value.attrList && goodsInfo.value.attrList.length > 0) {
        // 这里应该加载这个商品已经设置的属性
        // 可能是从商品数据中获取，也可能是从分类中获取默认值
        console.log("📝 编辑模式，商品已有属性，保持原有属性");
        // 编辑模式，保持商品原有属性
        console.log("商品当前属性:", goodsInfo.value.attrList);
        return;
      }

      // 新增模式，console.log('🆕 新增模式，加载分类的默认属性');
      // 新增模式 或 编辑模式但没有属性
      if (newCategoryId) {
        console.log("🆕 加载分类的默认属性，分类ID:", newCategoryId);
        await loadCategoryAttributes(newCategoryId);
      } else {
        // 没有选择分类，重置属性列表
        // resetAttributeList();
      }
    },
    {
      // immediate: true, // 立即执行一次
      deep: true, // 深度监听
    }
  );
};

/**
 * 加载分类属性
 */
const loadCategoryAttributes = async (categoryId: number) => {
  try {
    loading.value = true;
    console.log(`📦 开始加载分类 ${categoryId} 的属性`);

    // UniApp API 调用
    // const response = await uni.request({
    //   url: '/api/attribute/list',
    //   method: 'GET',
    //   data: {
    //     categoryId,
    //     type: 2
    //   },
    //   header: {
    //     'Content-Type': 'application/json'
    //   }
    // });

    const response = await PmsSpuAttributeAPI.getAttributeList({
      categoryId,
      type: 2, // type=2 表示商品分类下的属性
    });

    console.log("API返回的属性数据:", response);

    if (response && Array.isArray(response)) {
      const data: any[] = response;
      if (response && Array.isArray(response)) {
        // 转换API数据格式
        const attributes = data.map(
          (item) =>
            new GoodsAttribute({
              id: item.id,
              name: item.name || "",
              value: item.value || "",
              type: item.type,
            })
        );

        // 如果有数据，使用API数据，否则添加一个空行
        if (attributes.length > 0) {
          const newGoodsInfo = { ...goodsInfo.value, attrList: attributes };
          goodsInfo.value = newGoodsInfo;
          console.log(`✅ 加载成功，共 ${attributes.length} 个属性`);

          // 清空错误信息
          errors.value = new Array(attributes.length).fill({});
        } else {
          resetAttributeList();
          console.log("ℹ️ 该分类下无默认属性");
        }
      } else {
        resetAttributeList();
        console.warn("⚠️ 属性数据格式错误");
      }
    } else {
      resetAttributeList();
      console.warn("⚠️ API请求失败");
    }
  } catch (error: any) {
    console.error("❌ 加载分类属性失败:", error);
    uni.showToast({
      title: "加载属性失败",
      icon: "error",
      duration: 2000,
    });
    resetAttributeList();
  } finally {
    loading.value = false;
  }
};

/**
 * 重置属性列表
 */
const resetAttributeList = (): void => {
  const newGoodsInfo = { ...goodsInfo.value, attrList: [new GoodsAttribute()] };
  // goodsInfo.value = newGoodsInfo;

  // ✅ 直接触发 emit，不通过 computed
  emit("update:goodsInfo", newGoodsInfo);

  errors.value = [{}];
  console.log("🔄 重置属性列表");
};

/**
 * 添加属性行
 */
const handleAddAttribute = (): void => {
  const newAttrList = [...(goodsInfo.value.attrList || []), new GoodsAttribute()];
  const newGoodsInfo = { ...goodsInfo.value, attrList: newAttrList };
  goodsInfo.value = newGoodsInfo;

  errors.value.push({});

  console.log("➕ 添加属性行，当前总数:", newAttrList.length);

  // 滚动到最后一行
  nextTick(() => {
    const query = uni.createSelectorQuery().in(this);
    query
      .select(".attribute-table")
      .boundingClientRect((data: any) => {
        if (data) {
          uni.pageScrollTo({
            duration: 300,
            scrollTop: data.height,
          });
        }
      })
      .exec();
  });
};

/**
 * 删除属性行
 */
const handleRemoveAttribute = (index: number): void => {
  if (goodsInfo.value.attrList.length <= 1) {
    uni.showToast({
      title: "至少需要保留一个属性",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  const newAttrList = [...goodsInfo.value.attrList];
  const removedItem = newAttrList[index];
  console.log("🗑️ 删除属性:", removedItem);

  newAttrList.splice(index, 1);
  const newGoodsInfo = { ...goodsInfo.value, attrList: newAttrList };
  goodsInfo.value = newGoodsInfo;

  errors.value.splice(index, 1);
  console.log("删除后剩余:", newAttrList.length, "个属性");
};

/**
 * 处理属性输入
 */
const handleAttributeInput = (e: any, index: number, field: "name" | "value"): void => {
  const value = e.detail ? e.detail.value : e.target.value;
  // ✅ 创建新的数组，不直接修改 computed
  const newAttrList = [...goodsInfo.value.attrList];

  if (!newAttrList[index]) {
    newAttrList[index] = new GoodsAttribute();
  }

  newAttrList[index] = { ...newAttrList[index], [field]: value };

  const newGoodsInfo = { ...goodsInfo.value, attrList: newAttrList };

  // goodsInfo.value = newGoodsInfo;
  // ✅ 直接触发更新，不经过 computed
  emit("update:goodsInfo", newGoodsInfo);

  console.log(`📝 属性${field}变化:`, value);

  // 清除该字段的错误信息
  if (errors.value[index]) {
    const newErrors = [...errors.value];
    newErrors[index] = { ...newErrors[index] };
    delete newErrors[index][field];
    errors.value = newErrors;
  }
};

/**
 * 验证字段
 */
const validateField = (field: "name" | "value", index: number): void => {
  const value = goodsInfo.value.attrList[index][field];
  let error = "";

  if (!value || value.trim() === "") {
    error = `${field === "name" ? "属性名称" : "属性值"}不能为空`;
  } else if (value.length < 1) {
    error = `${field === "name" ? "属性名称" : "属性值"}至少1个字符`;
  } else if (field === "name" && value.length > 50) {
    error = "属性名称不能超过50个字符";
  } else if (field === "value" && value.length > 100) {
    error = "属性值不能超过100个字符";
  }

  if (error) {
    if (!errors.value[index]) {
      errors.value[index] = {};
    }
    errors.value[index][field] = error;
  } else if (errors.value[index]) {
    delete errors.value[index][field];
  }
};

/**
 * 验证所有字段
 */
const validateAllFields = (): boolean => {
  let isValid = true;
  const newErrors: AttributeError[] = [];

  goodsInfo.value.attrList.forEach((attr, index) => {
    const error: AttributeError = {};

    // 验证名称
    if (!attr.name || attr.name.trim() === "") {
      error.name = "属性名称不能为空";
      isValid = false;
    } else if (attr.name.length > 50) {
      error.name = "属性名称不能超过50个字符";
      isValid = false;
    }

    // 验证值
    if (!attr.value || attr.value.trim() === "") {
      error.value = "属性值不能为空";
      isValid = false;
    } else if (attr.value.length > 100) {
      error.value = "属性值不能超过100个字符";
      isValid = false;
    }

    newErrors.push(error);
  });

  errors.value = newErrors;
  return isValid;
};

/**
 * 检查重复属性名
 */
const checkDuplicateNames = () => {
  const nameSet = new Set();
  let duplicateFound = false;

  goodsInfo.value.attrList.forEach((attr, index) => {
    if (attr.name && attr.name.trim()) {
      const name = attr.name.trim();
      if (nameSet.has(name)) {
        if (!errors.value[index]) {
          errors.value[index] = {};
        }
        errors.value[index].name = `属性名称"${name}"重复`;
        duplicateFound = true;
      } else {
        nameSet.add(name);
      }
    }
  });

  return !duplicateFound;
};

/**
 * 上一步
 */
const handlePrev = () => {
  console.log("⬅️ 返回上一步");
  emit("prev");
};

/**
 * 下一步
 */
const handleNext = async () => {
  console.log("➡️ 点击下一步按钮");

  try {
    // 验证所有字段
    const fieldsValid = validateAllFields();
    if (!fieldsValid) {
      uni.showToast({
        title: "请填写完整的属性信息",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    // 检查重复属性名
    const noDuplicate = checkDuplicateNames();
    if (!noDuplicate) {
      uni.showToast({
        title: "属性名称不能重复",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    console.log("✅ 属性验证通过");
    console.log("属性数据:", goodsInfo.value.attrList);
    // 验证通过，触发下一步事件
    emit("next");
  } catch (error) {
    console.error("表单验证出错:", error);
    uni.showToast({
      title: "验证出错，请重试",
      icon: "error",
      duration: 2000,
    });
  }
};
import { getCurrentInstance } from "vue";
// 获取组件实例
const instance = getCurrentInstance();

/**
 * 计算表格高度
 */
const calculateTableHeight = () => {
  if (!instance) {
    console.warn("无法获取组件实例");
    return;
  }

  const query = uni.createSelectorQuery().in(instance);
  query
    .select(".component-container")
    .boundingClientRect((data: any) => {
      if (data) {
        const windowHeight = systemInfo.windowHeight;
        const containerTop = data.top;
        const footerHeight = 100; // 底部按钮高度
        const headerHeight = 100; // 头部高度

        tableHeight.value = windowHeight - containerTop - footerHeight - headerHeight - 20;
      }
    })
    .exec();
};

// ==================== 生命周期钩子 ====================
onMounted(() => {
  console.log("🔄 商品属性组件挂载");

  // ❌ 移除这个自动重置
  // if (!goodsInfo.value.attrList || goodsInfo.value.attrList.length === 0) {
  //   resetAttributeList();  // ❌ 这里会触发循环
  // }

  // ✅ 改为简单的检查
  console.log("📊 当前属性数据:", goodsInfo.value.attrList);

  // ❌ 移除这个会触发循环的监听
  // watchCategoryChange();

  // 计算表格高度
  nextTick(() => {
    calculateTableHeight();
  });
});

onReady(() => {
  // 页面首次渲染完成
  nextTick(() => {
    calculateTableHeight();
  });
});

onShow(() => {
  calculateTableHeight();
});

// 页面卸载
onUnmounted(() => {
  console.log("🗑️ 商品属性组件卸载");
});

// ==================== 暴露给父组件的方法 ====================
defineExpose({
  /**
   * 手动验证表单
   */
  validateForm: async () => {
    return validateAllFields() && checkDuplicateNames();
  },

  /**
   * 获取当前属性数据
   */
  getAttributes: () => {
    return goodsInfo.value.attrList || [];
  },

  /**
   * 清空属性
   */
  clearAttributes: () => {
    resetAttributeList();
  },
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

    .card-container {
      background-color: #ffffff;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
      overflow: hidden;
      height: 100%;

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

        .btn-add {
          background-color: #67c23a;
          color: #ffffff;
          border: none;
          border-radius: 10rpx;
          padding: 12rpx 24rpx;
          font-size: 28rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;

          &::after {
            border: none;
          }

          .icon-add {
            margin-right: 8rpx;
            font-size: 32rpx;
            font-weight: bold;
          }
        }
      }

      .attribute-form {
        height: calc(100% - 100rpx);

        .attribute-table {
          width: 100%;

          .table-row {
            display: flex;
            align-items: stretch;
            border-bottom: 2rpx solid #f0f0f0;
            min-height: 120rpx;

            &:last-child {
              border-bottom: none;
            }

            .table-cell {
              display: flex;
              align-items: center;
              padding: 20rpx;
              box-sizing: border-box;

              &.name-cell {
                flex: 1;
                min-width: 0;
                border-right: 2rpx solid #f0f0f0;
              }

              &.value-cell {
                flex: 1.5;
                min-width: 0;
                border-right: 2rpx solid #f0f0f0;
              }

              &.action-cell {
                width: 160rpx;
                justify-content: center;
              }

              .form-item {
                width: 100%;

                .input-field {
                  width: 100%;
                  height: 80rpx;
                  background-color: #f5f7fa;
                  border: 2rpx solid #e4e7ed;
                  border-radius: 10rpx;
                  padding: 0 20rpx;
                  font-size: 30rpx;
                  color: #303133;
                  box-sizing: border-box;

                  &:focus {
                    border-color: #409eff;
                    background-color: #ffffff;
                  }

                  &::placeholder {
                    color: #c0c4cc;
                  }
                }

                .error-text {
                  color: #f56c6c;
                  font-size: 24rpx;
                  margin-top: 8rpx;
                  min-height: 32rpx;
                }
              }

              .btn-delete {
                background-color: #f56c6c;
                color: #ffffff;
                border: none;
                border-radius: 10rpx;
                padding: 12rpx 24rpx;
                font-size: 28rpx;
                line-height: 1;

                &::after {
                  border: none;
                }
              }

              .disabled-placeholder {
                width: 120rpx;
                height: 60rpx;
                background-color: #f5f7fa;
                border-radius: 10rpx;
              }
            }
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40rpx;

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
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    padding: 20rpx 30rpx;
    background-color: #ffffff;
    border-top: 2rpx solid #f0f0f0;
    box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
    position: relative;
    z-index: 100;
    min-height: 120rpx;
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

/* ==========================================
   2. 底部按钮栏 (独立出来，实现固定)
   ========================================== */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx; // 按钮区域高度
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20rpx;
  background-color: #ffffff;
  border-top: 2rpx solid #f0f0f0;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
  z-index: 999;

  // 适配iPhone底部安全区
  padding-bottom: calc(10rpx + env(safe-area-inset-bottom));

  button {
    height: 64rpx;
    line-height: 64rpx;
    border-radius: 32rpx;
    font-size: 28rpx;
    border: none;
    font-weight: 500;
    margin: 0;

    &::after {
      border: none;
    }

    &.btn-prev {
      width: 300rpx;
      background-color: #ffffff;
      color: #409eff;
      border: 2rpx solid #409eff;
      margin-right: 20rpx;
    }

    &.btn-submit {
      width: 300rpx;
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

// 输入框占位符样式
.placeholder {
  color: #c0c4cc;
  font-size: 30rpx;
}

// 响应式设计
@media (max-width: 768px) {
  .component-container {
    &__main {
      padding: 15rpx;

      .card-container {
        .card-header {
          flex-direction: column;
          align-items: stretch;
          gap: 20rpx;
          padding: 20rpx 20rpx 15rpx;

          .card-title {
            text-align: center;
            font-size: 32rpx;
          }

          .btn-add {
            align-self: center;
            padding: 10rpx 20rpx;
            font-size: 26rpx;
          }
        }

        .attribute-form {
          .attribute-table {
            .table-row {
              flex-direction: column;
              min-height: auto;
              padding: 20rpx;
              border-bottom: 2rpx solid #f0f0f0;

              .table-cell {
                width: 100% !important;
                border: none !important;
                padding: 10rpx 0;

                &.action-cell {
                  justify-content: flex-start;
                  margin-top: 20rpx;

                  .btn-delete {
                    width: 100%;
                  }

                  .disabled-placeholder {
                    display: none;
                  }
                }
              }
            }
          }
        }
      }
    }

    &__footer {
      flex-direction: column;
      gap: 15rpx;
      padding: 15rpx 20rpx;

      button {
        width: 100%;
        margin: 0 !important;
      }
    }
  }
}

@media (max-width: 480px) {
  .component-container {
    &__main {
      padding: 10rpx;

      .card-container {
        .card-header {
          .card-title {
            font-size: 28rpx;
          }
        }

        .attribute-form {
          .empty-state {
            .empty-text {
              font-size: 28rpx;
            }
          }
        }
      }
    }
  }
}
</style>
