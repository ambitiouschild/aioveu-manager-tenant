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
          <view v-else class="picker-placeholder">请选择商品分类</view>
          <view class="picker-arrow">▼</view>
        </view>
      </picker>

      <!-- 分类路径显示 -->
      <view class="path-display" v-if="pathLabels.length > 0">
        <text class="path-label">您选择的商品分类:</text>
        <view class="path-items">
          <text v-for="(item, index) in pathLabels" :key="index" class="path-item">
            {{ item }}
            <text v-if="index < pathLabels.length - 1" class="separator">></text>
          </text>
        </view>
      </view>

      <!-- 在下面显示该第三级分类的商品列表 -->
      <view v-if="showProductSection" class="product-section">
        <!-- 批量操作工具栏 -->
        <view v-if="goodsList.length > 0" class="batch-toolbar">
          <view class="batch-checkbox">
            <checkbox-group @change="handleBatchSelect">
              <label class="checkbox-item">
                <checkbox :value="selectAll ? 'all' : ''" />
                <text class="checkbox-label">全选</text>
              </label>
            </checkbox-group>
            <text class="selected-count">已选 {{ selectedIds.length }} 个</text>
          </view>

          <view v-if="selectedIds.length > 0" class="batch-actions">
            <button
              class="btn-batch-action"
              :class="{ 'btn-shelf': batchAction === 1, 'btn-off': batchAction === 0 }"
              @tap="handleBatchToggleShelf"
              hover-class="btn-hover"
              hover-start-time="20"
              hover-stay-time="70"
            >
              {{ batchAction === 1 ? "批量上架" : "批量下架" }}
            </button>
            <button
              class="btn-batch-action btn-delete"
              @tap="handleBatchDelete"
              hover-class="btn-hover"
              hover-start-time="20"
              hover-stay-time="70"
            >
              批量删除
            </button>
          </view>
        </view>

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
          <!-- 修改商品项，添加复选框 -->
          <view
            v-for="(item, index) in goodsList"
            :key="item.id"
            class="goods-item"
            :class="item.status !== 1 ? 'disabled-item' : ''"
            @tap.stop="() => {}"
          >
            <!-- 商品选择框 -->
            <!--            选择框导致滑动不了是因为 checkbox-group 和 checkbox 在 UniApp-->
            <!--            中默认会阻止触摸事件的冒泡，这会影响滚动-->
            <!-- 关键：阻止事件冒泡 -->
            <view class="goods-checkbox">
              <!--              <checkbox-group @change="handleItemSelect(item.id!, $event)">-->
              <!--                <checkbox-->
              <!--                  :value="item.id"-->
              <!--                  :checked="selectedIds.includes(item.id!)"-->
              <!--                  @tap.stop="() => {}"-->
              <!--                />-->
              <!--              </checkbox-group>-->
              <!-- 临时用 view 代替 -->
              <!--              <view-->
              <!--                class="temp-checkbox"-->
              <!--                :class="{ checked: selectedIds.includes(item.id!) }"-->
              <!--                @tap="handleItemSelect(item.id!)"-->
              <!--              >-->
              <!--                {{ selectedIds.includes(item.id!) ? "✓" : "" }}-->
              <!--              </view>-->
            </view>

            <!-- 商品图片 -->
            <view class="goods-image-container">
              <image v-if="item.picUrl" :src="item.picUrl" mode="aspectFill" class="goods-image" />
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

              <!-- 新增：隐藏/显示按钮 -->
              <button
                v-if="item.status !== undefined"
                class="btn-status"
                :class="item.status === 1 ? 'btn-off-shelf' : 'btn-on-shelf'"
                @tap.stop="handleToggleShelf(item)"
                hover-class="btn-hover"
                hover-start-time="20"
                hover-stay-time="70"
              >
                {{ item.status === 1 ? "下架" : "上架" }}
              </button>
              <!-- 新增：删除按钮 -->
              <button
                class="btn-delete"
                @tap.stop="handleDeleteGoods(item, index)"
                hover-class="btn-hover"
                hover-start-time="20"
                hover-stay-time="70"
              >
                删除
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
          <image src="/static/empty-goods.png" class="empty-image" mode="aspectFit" />
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

    <!-- 底部按钮     <view class="component-container__footer">-->
    <view class="action-bar">
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
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { onLoad, onShow, onHide, onReady } from "@dcloudio/uni-app";

// 导入API
import PmsCategoryAPI from "@/packageC/api/aioveuMallPms/aioveuMallPmsCategory/pms-category";
import PmsSpuAPI from "@/packageC/api/aioveuMallPms/aioveuMallPmsSpu/pms-spu";

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
  name: string = "";
  label: string = "";
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
  name: string = "";
  picUrl: string = "";
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
  name: string = "";
  picUrl: string = "";
  price?: number = undefined;
  originPrice?: number = undefined;
  album: any[] = [];
  detail: string = "";
  attrList: any[] = [];
  specList: any[] = [];
  skuList: any[] = [];
  sales: number = 0;
  stock: number = 0;
  categoryName: string = "";
  brandName: string = "";

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
  goodsInfo: () =>
    ({
      id: undefined,
      categoryId: undefined,
      name: "",
      picUrl: "",
      price: undefined,
      originPrice: undefined,
      album: [],
      detail: "",
      attrList: [],
      specList: [],
      skuList: [],
      sales: 0,
      stock: 0,
      categoryName: "",
      brandName: "",
    }) as GoodsInfoData,
});

// 修改这里 ↑↑↑

const emit = defineEmits<{
  (e: "next"): void; // 下一步事件
  (e: "update:goodsInfo", value: GoodsInfoData): void; // 更新商品信息
  (e: "edit-goods", goodsId: number): void; // 编辑商品事件
}>();

// 响应式数据
const categoryOptions = ref<CategoryOptionData[]>([]); // 原始分类数据
const multiOptions = ref<CategoryOptionData[][]>([[], [], []]); // 多列选择器数据
const multiIndex = ref<number[]>([0, 0, 0]); // 多列选择器索引
const pathLabels = ref<string[]>([]); // 分类路径标签
const goodsList = ref<GoodsItemData[]>([]); // 商品列表
const loadingGoods = ref<boolean>(false); // 商品加载状态
const selectedThirdLevelName = ref<string>(""); // 三级分类名称
const listHeight = ref<number>(400); // 列表高度

//----------------------------------------------
// 批量操作相关
const selectedIds = ref<number[]>([]); // 选中的商品ID数组
const selectAll = ref<boolean>(false); // 是否全选
const batchAction = ref<number>(1); // 批量操作类型：1=上架，0=下架
const isBatchProcessing = ref<boolean>(false); // 是否正在批量处理
//----------------------------------------------
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
    emit("update:goodsInfo", value);
  },
});

const showProductSection = computed((): boolean => {
  return pathLabels.value.length === 3 && goodsInfo.value.categoryId !== undefined;
});

const selectedCategoryLabel = computed((): string => {
  if (pathLabels.value.length === 0) return "";
  return pathLabels.value.join(" / ");
});

// 初始化分类数据
const loadCategoryData = async () => {
  try {
    console.log("📦 开始加载商品分类数据");

    const response = await PmsCategoryAPI.getCategoryOptions();

    console.log("📦 原始API响应:", response);
    console.log("📦 响应类型:", typeof response);
    console.log("📦 是否是数组:", Array.isArray(response));
    console.log("📦 响应字符串:", JSON.stringify(response));

    console.log("📦 开始加载商品分类数据：{}", response);

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
      const options = data.map(
        (item) =>
          new CategoryOption({
            id: item.value, // 使用 value 作为 id
            name: item.label, // 使用 label 作为 name
            label: item.label, // label 保持不变
            value: item.value, // value 保持不变
            children: item.children || [],
          })
      );

      console.log("✅ 转换数据格式:{}", options);

      categoryOptions.value = options;
      updateMultiOptions(options);
      console.log("✅ 商品分类数据加载完成，共", options.length, "个一级分类");
    } else {
      console.warn("⚠️ 商品分类数据为空或格式错误");
      uni.showToast({
        title: "暂无商品分类数据",
        icon: "none",
        duration: 2000,
      });
    }
  } catch (error: any) {
    console.error("❌ 加载商品分类数据失败:", error);
    uni.showToast({
      title: "加载商品分类失败",
      icon: "error",
      duration: 2000,
    });
  }
};

// 更新多列选择器数据
const updateMultiOptions = (
  options: CategoryOptionData[],
  level = 0,
  selectedIndices = [0, 0, 0]
): void => {
  if (level === 0) {
    // 第一列：一级分类
    multiOptions.value[0] = options.map((opt) => ({ ...opt }));

    // 第二列：二级分类
    const firstIndex = selectedIndices[0];
    if (options[firstIndex]?.children) {
      multiOptions.value[1] = options[firstIndex].children!.map((child) => ({ ...child }));
    } else {
      multiOptions.value[1] = [];
    }

    // 第三列：三级分类
    const secondIndex = selectedIndices[1];
    if (multiOptions.value[1][secondIndex]?.children) {
      multiOptions.value[2] = multiOptions.value[1][secondIndex].children!.map((child) => ({
        ...child,
      }));
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

  console.log("🔍 选中的分类选项:", {
    firstOption: firstOption?.label,
    secondOption: secondOption?.label,
    thirdOption: thirdOption?.label,
    hasThirdOption: !!thirdOption,
  });

  if (!firstOption) return;

  // 构建路径标签
  const labels = [firstOption.label];
  if (secondOption) labels.push(secondOption.label);
  if (thirdOption) labels.push(thirdOption.label);

  pathLabels.value = labels;

  console.log("🔍 路径标签:", labels);
  console.log("🔍 标签长度:", labels.length);

  // ✅ 修改：只有选择三级分类时才设置 categoryId
  // ✅ 修改：三级分类使用 value 作为 id
  if (labels.length === 3 && thirdOption && thirdOption.value) {
    const selectedCategoryId = thirdOption.value; // 使用 value
    selectedThirdLevelName.value = thirdOption.label;

    // 更新商品信息

    /*
     * 当您设置 goodsInfo.value.categoryId时，Vue 会调用 computed 的 getter 获取当前值，
     * 然后修改这个值的 categoryId属性，但这个修改不会自动触发 computed 的 setter，
     * 因为您只是修改了对象的一个属性，而不是整个对象。
     *
     * */
    // ✅ 关键修复：直接通过 emit 更新父组件
    const updatedGoodsInfo = {
      ...props.goodsInfo, // 保留已有的商品信息
      categoryId: selectedCategoryId, // 更新分类ID
      id: undefined, // 重置商品ID（新增模式）
      categoryName: thirdOption.label, // 保存分类名称
    };

    // ✅ 直接触发更新事件
    emit("update:goodsInfo", updatedGoodsInfo);

    // goodsInfo.value.categoryId = selectedCategoryId;
    // goodsInfo.value.id = undefined; // 重置商品ID（新增模式）

    console.log("✅ 确认是三级分类，ID:", selectedCategoryId);
    console.log("✅ 设置 goodsInfo.categoryId:", goodsInfo.value.categoryId);
    console.log("✅ 分类名称:", selectedThirdLevelName.value);
    console.log("✅ 已更新父组件商品信息");
    // 加载三级分类下的商品
    console.log("🔍 开始加载商品列表...");
    await loadGoodsByCategory(selectedCategoryId);
  } else {
    // 选择了一级或二级分类
    console.log("⚠️ 不是三级分类:", {
      labelsLength: labels.length,
      hasThirdOption: !!thirdOption,
      thirdOptionId: thirdOption?.id,
    });

    // ✅ 重要：清空 categoryId，让用户知道需要选择三级分类
    // goodsInfo.value.categoryId = undefined;
    // goodsInfo.value.id = undefined;

    // ✅ 清空父组件的分类ID
    const updatedGoodsInfo = {
      ...props.goodsInfo,
      categoryId: undefined,
      categoryName: "",
    };
    emit("update:goodsInfo", updatedGoodsInfo);

    selectedThirdLevelName.value = "";

    // 清空商品列表
    goodsList.value = [];
  }
};

// 加载分类下的商品
const loadGoodsByCategory = async (categoryId: number) => {
  try {
    loadingGoods.value = true;

    const response = await PmsSpuAPI.getPage({
      categoryId,
      pageNum: 1,
      pageSize: 10,
    });

    console.log("📝 加载分类下的商品：", response);

    if (response) {
      const resData = response;
      if (resData && Array.isArray(resData.list)) {
        goodsList.value = resData.list.map(
          (item) =>
            new GoodsItem({
              id: item.id,
              name: item.name || "未命名商品",
              picUrl: item.picUrl,
              price: item.price || 0,
              stock: item.stock || 0,
              status: item.status || 0,
            })
        );

        console.log(`✅ 加载到 ${goodsList.value.length} 个商品`);
      } else {
        goodsList.value = [];
        console.log("📝 该分类下暂无商品");
      }
    } else {
      goodsList.value = [];
    }
  } catch (error) {
    console.error("❌ 加载商品列表失败:", error);
    uni.showToast({
      title: "加载商品列表失败",
      icon: "error",
      duration: 2000,
    });
    goodsList.value = [];
  } finally {
    loadingGoods.value = false;
  }
};
//----------------------------------------------
// 添加批量操作方法
// 单个商品选择/取消选择
const handleItemSelect = (goodsId: number, e?: any) => {
  const index = selectedIds.value.indexOf(goodsId);
  if (index === -1) {
    // 选中
    selectedIds.value.push(goodsId);
  } else {
    // 取消选中
    selectedIds.value.splice(index, 1);
  }

  // 更新全选状态
  selectAll.value = selectedIds.value.length === goodsList.value.length;
  console.log("🔍 当前选中:", selectedIds.value);
};

// 批量选择（全选/取消全选）
const handleBatchSelect = () => {
  if (selectAll.value) {
    // 取消全选
    selectedIds.value = [];
  } else {
    // 全选
    selectedIds.value = goodsList.value
      .filter((item) => item.id !== undefined)
      .map((item) => item.id!);
  }

  selectAll.value = !selectAll.value;
  console.log("🔍 全选状态:", selectAll.value, "选中数量:", selectedIds.value.length);
};

// 批量上架/下架
const handleBatchToggleShelf = async () => {
  if (selectedIds.value.length === 0 || isBatchProcessing.value) {
    return;
  }

  const action = batchAction.value === 1 ? "上架" : "下架";
  uni.showModal({
    title: "批量操作确认",
    content: `确定要${action}选中的 ${selectedIds.value.length} 个商品吗？`,
    success: async (res) => {
      if (res.confirm) {
        isBatchProcessing.value = true;
        uni.showLoading({ title: `${action}处理中...` });

        try {
          let response;
          if (batchAction.value === 1) {
            // 批量上架
            response = await PmsSpuAPI.batchShelf({
              spuIds: selectedIds.value,
            });
          } else {
            // 批量下架
            response = await PmsSpuAPI.batchOffShelf({
              spuIds: selectedIds.value,
            });
          }

          uni.hideLoading();
          isBatchProcessing.value = false;

          if (response.code === "00000") {
            // 批量更新本地列表状态
            goodsList.value = goodsList.value.map((item) => {
              if (selectedIds.value.includes(item.id!)) {
                return {
                  ...item,
                  status: batchAction.value,
                };
              }
              return item;
            });

            // 更新列表（触发响应式）
            goodsList.value = [...goodsList.value];
            // 清空选中状态
            selectedIds.value = [];
            selectAll.value = false;
          }

          uni.showModal({
            title: `批量${action}成功`,
            icon: "success",
            showCancel: false,
            success: () => {
              // 自动切换批量操作类型
              batchAction.value = batchAction.value === 1 ? 0 : 1;
            },
          });
        } catch (error) {
          uni.hideLoading();
          isBatchProcessing.value = false;
          uni.showToast({
            title: "批量操作失败",
            icon: "error",
            duration: 2000,
          });
        }
      }
    },
  });
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0 || isBatchProcessing.value) {
    return;
  }

  uni.showModal({
    title: "批量删除确认",
    content: `确定要删除选中的 ${selectedIds.value.length} 个商品吗？删除后将无法恢复。`,
    confirmText: "删除",
    confirmColor: "#f56c6c",
    success: async (res) => {
      if (res.confirm) {
        isBatchProcessing.value = true;
        uni.showLoading({ title: "批量删除中..." });

        try {
          // 调用批量删除接口
          const response = await PmsSpuAPI.batchRemove({
            spuIds: selectedIds.value,
          });

          uni.hideLoading();
          isBatchProcessing.value = false;

          if (response.code === "00000") {
            // 从列表中移除已删除的商品
            goodsList.value = goodsList.value.filter(
              (item) => !selectedIds.value.includes(item.id!)
            );

            // 更新列表（触发响应式）
            goodsList.value = [...goodsList.value];

            // 检查是否有当前正在编辑的商品被删除
            if (selectedIds.value.includes(goodsInfo.value.id!)) {
              goodsInfo.value = {
                ...goodsInfo.value,
                id: undefined,
              };
            }

            // 清空选中状态
            selectedIds.value = [];
            selectAll.value = false;

            uni.showModal({
              title: "批量删除成功",
              icon: "success",
              showCancel: false,
            });
          } else {
            throw new Error(response.msg || "删除失败");
          }
        } catch (error) {
          uni.hideLoading();
          isBatchProcessing.value = false;
          uni.showToast({
            title: "批量删除失败",
            icon: "error",
            duration: 2000,
          });
        }
      }
    },
  });
};
//----------------------------------------------
// 查看商品
const handleViewGoods = (goods: GoodsItemData) => {
  console.log("👀 查看商品:", goods);
  uni.navigateTo({
    url: `/pages/goods/detail?id=${goods.id}&mode=view`,
  });
};

// 编辑商品
const handleEditGoods = (goods: GoodsItemData) => {
  console.log("✏️ 编辑商品:", goods);

  // 设置商品ID
  goodsInfo.value.id = goods.id;

  // 触发编辑商品事件
  emit("edit-goods", goods.id || 0);

  // 不在这里跳转，由父组件控制步骤切换
};

// 获取状态文本
const getStatusText = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: "已下架",
    1: "上架中",
    2: "待审核", // 如果有审核流程
  };
  return statusMap[status] || "未知";
};

// 切换商品状态（上架/下架）修改 handleToggleShelf 方法，删除后自动取消选中
const handleToggleShelf = async (goods: GoodsItemData) => {
  try {

    // goods 应该是完整的商品对象
    console.log("🔍 handleToggleShelf 接收到的参数:", goods);

    if (!goods.id) {
      uni.showToast({
        title: "商品ID不存在",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    const newStatus = goods.status === 1 ? 0 : 1; // 切换状态
    const action = newStatus === 1 ? "上架" : "下架";

    uni.showModal({
      title: "确认",
      content: `确定要${action}这个商品吗？`,
      success: async (res) => {
        if (res.confirm) {
          // 显示加载中
          uni.showLoading({ title: "处理中..." });

          try {
            const response = await PmsSpuAPI.updateStatus({
              id: goods.id!, // 添加 ! 断言
              status: newStatus,
            });

            uni.hideLoading();

            if (response.code === "00000") {
              // 更新本地列表中的商品状态
              const index = goodsList.value.findIndex((item) => item.id === goods.id);
              if (index !== -1) {
                goodsList.value[index].status = newStatus;

                // 使用 Vue 的响应式更新
                goodsList.value = [...goodsList.value];

                uni.showToast({
                  title: `${action}成功`,
                  icon: "success",
                  duration: 2000,
                });

                // 从选中列表中移除
                const selectedIndex = selectedIds.value.indexOf(goods.id!);
                if (selectedIndex !== -1) {
                  selectedIds.value.splice(selectedIndex, 1);
                }
              }
            } else {
              throw new Error(response.msg || "操作失败");
            }
          } catch (error: any) {
            uni.hideLoading();
            uni.showToast({
              title: error.message || "操作失败",
              icon: "error",
              duration: 2000,
            });
          }
        }
      },
    });
  } catch (error) {
    console.error("切换商品状态失败:", error);
    uni.showToast({
      title: "操作失败",
      icon: "error",
      duration: 2000,
    });
  }
};

// 删除商品
const handleDeleteGoods = async (goods: GoodsItemData, index: number) => {
  try {
    if (!goods.id) {
      uni.showToast({
        title: "商品ID不存在",
        icon: "none",
        duration: 2000,
      });
      return;
    }

    uni.showModal({
      title: "删除确认",
      content: "确定要删除这个商品吗？删除后将无法恢复。",
      confirmText: "删除",
      confirmColor: "#f56c6c",
      success: async (res) => {
        if (res.confirm) {
          // 显示加载中
          uni.showLoading({ title: "删除中..." });

          try {
            const response = await PmsSpuAPI.remove(goods.id!);

            uni.hideLoading();

            if (response.code === "00000") {
              // 从列表中移除
              goodsList.value.splice(index, 1);

              // 使用 Vue 的响应式更新
              goodsList.value = [...goodsList.value];

              uni.showToast({
                title: "删除成功",
                icon: "success",
                duration: 2000,
              });

              // 如果删除的是当前正在编辑的商品
              if (goodsInfo.value.id === goods.id) {
                // 重置商品信息
                goodsInfo.value = {
                  ...goodsInfo.value,
                  id: undefined,
                };
              }
            } else {
              throw new Error(response.msg || "删除失败");
            }
          } catch (error: any) {
            uni.hideLoading();
            uni.showToast({
              title: error.message || "删除失败",
              icon: "error",
              duration: 2000,
            });
          }
        }
      },
    });
  } catch (error) {
    console.error("删除商品失败:", error);
    uni.showToast({
      title: "操作失败",
      icon: "error",
      duration: 2000,
    });
  }
};

// 新增商品 // 确保是三级分类
const handleAddGoods = () => {
  console.log("➕ 新增商品");

  if (pathLabels.value.length !== 3 || !goodsInfo.value.categoryId) {
    uni.showToast({
      title: "请先选择完整的三级分类",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  // 确保是新增模式
  goodsInfo.value.id = undefined;

  console.log("✅ 在三级分类下新增商品，分类ID:", goodsInfo.value.categoryId);
  console.log("✅ 分类名称:", selectedThirdLevelName.value);

  // 触发下一步
  emit("next");
};

// 下一步
const handleNext = () => {
  // 确保是三级分类
  if (pathLabels.value.length !== 3 || !goodsInfo.value.categoryId) {
    uni.showToast({
      title: "请先选择完整的三级分类",
      icon: "none",
      duration: 2000,
    });
    return;
  }

  // 新增模式：清除商品信息，保留分类ID
  if (!goodsInfo.value.id) {
    const categoryId = goodsInfo.value.categoryId;
    goodsInfo.value = {
      id: undefined,
      name: "",
      categoryId: categoryId,
      picUrl: "",
      price: undefined,
      originPrice: undefined,
      album: [],
      detail: "",
      attrList: [],
      specList: [],
      skuList: [],
      sales: 0,
      stock: 0,
      categoryName: "",
      brandName: "",
    };
  }

  console.log("➡️ 进入下一步，三级分类ID,模式:", goodsInfo.value.id ? "编辑" : "新增");
  console.log("➡️ 已选分类ID:", goodsInfo.value.categoryId);

  emit("next");
};

// 格式化价格
const formatPrice = (price: number) => {
  if (!price) return "0.00";
  return (price / 100).toFixed(2);
};

import { getCurrentInstance } from "vue";
// 获取组件实例
const instance = getCurrentInstance();

// 计算列表高度
const calculateListHeight = () => {
  console.log("📏 计算高度");

  if (!instance) {
    console.warn("⚠️ 无法获取组件实例");
    return;
  }

  // ✅ 使用正确的实例
  const query = uni.createSelectorQuery().in(instance);

  query
    .select(".component-container")
    .boundingClientRect((data: any) => {
      if (!data || typeof data.top !== "number") {
        console.warn("⚠️ 无法获取容器位置，使用默认高度");
        listHeight.value = 500; // ✅ 提高默认值
        return;
      }

      if (data) {
        const windowHeight = systemInfo.windowHeight;
        const containerTop = data.top;

        console.log("📊 容器位置:", { windowHeight, containerTop });

        // ✅ 简化：只减去必要的固定高度
        // 不要减太多，给滚动区域留足够空间

        const pickerHeight = 120; // 选择器区域高度
        const pathHeight = 80; // 路径显示高度
        const headerHeight = 100; // 标题区域高度
        const footerHeight = 120; // 底部按钮高度

        // ✅ 修正计算逻辑
        // containerTop 已经包含了顶部所有元素的高度
        // 我们只需要减去底部按钮即可

        const calculatedHeight =
          windowHeight -
          containerTop -
          // pickerHeight -
          // pathHeight -
          // headerHeight -
          footerHeight -
          20;

        console.log("📈 计算详情:", {
          屏幕高度: windowHeight,
          容器顶部: containerTop,
          底部按钮: footerHeight,
          边距: 20,
          计算结果: calculatedHeight,
        });
        // ✅ 限制最小和最大高度，避免极端值
        listHeight.value = Math.max(300, Math.min(calculatedHeight, windowHeight * 0.55));

        console.log(`📐 屏幕高: ${windowHeight}, 最终高度: ${listHeight.value}`);
      }
    })
    .exec();
};

// 监听商品列表变化
watch(
  () => goodsList.value,
  (newList) => {
    // 如果列表中有上架商品，批量操作按钮显示"批量下架"
    // 如果列表中全是下架商品，批量操作按钮显示"批量上架"
    const hasOnShelf = newList.some((item) => item.status === 1);
    const allOffShelf = newList.length > 0 && newList.every((item) => item.status === 0);

    if (hasOnShelf) {
      batchAction.value = 0; // 显示"批量下架"
    } else if (allOffShelf) {
      batchAction.value = 1; // 显示"批量上架"
    }
  },
  { deep: true }
);

// 生命周期
onMounted(async () => {
  console.log("🔄 商品分类组件加载");
  await loadCategoryData();
});

onReady(() => {
  // 页面渲染完成后计算高度
  nextTick(() => {
    calculateListHeight();
  });
});

onShow(() => {
  console.log("🔆 商品分类组件显示");
  // 重新计算高度
  calculateListHeight();
});

onHide(() => {
  console.log("🌙 商品分类组件隐藏");
});

onUnmounted(() => {
  console.log("🗑️ 商品分类组件卸载");
});
</script>

<style lang="scss" scoped>
.component-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 必须保留，确保撑满屏幕 */
  // overflow: hidden; /* ❌ 删除这一行！ */
  background-color: #f8f9fa;
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

      //====================================================
      // 批量操作工具栏

      .batch-toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20rpx 30rpx;
        background-color: #f8f9fa;
        border-bottom: 2rpx solid #e4e7ed;

        .batch-checkbox {
          display: flex;
          align-items: center;
          gap: 20rpx;

          .checkbox-item {
            display: flex;
            align-items: center;
            font-size: 28rpx;
            color: #606266;

            checkbox {
              transform: scale(0.8);
              margin-right: 10rpx;
            }

            .checkbox-label {
              font-size: 28rpx;
            }
          }

          .selected-count {
            font-size: 26rpx;
            color: #409eff;
            font-weight: 500;
          }
        }

        .batch-actions {
          display: flex;
          gap: 15rpx;

          .btn-batch-action {
            padding: 8rpx 20rpx;
            border: none;
            border-radius: 6rpx;
            font-size: 24rpx;
            color: #ffffff;

            &::after {
              border: none;
            }

            &.btn-shelf {
              background-color: #67c23a;
            }

            &.btn-off {
              background-color: #e6a23c;
            }

            &.btn-delete {
              background-color: #f56c6c;
            }

            &[disabled] {
              opacity: 0.5;
            }
          }
        }
      }

      // 商品项中的选择框
      .goods-item {
        display: flex;
        align-items: center;
        padding: 20rpx 30rpx;
        border-bottom: 2rpx solid #f0f0f0;
        background-color: #ffffff;

        .goods-checkbox {
          flex-shrink: 0;
          margin-right: 20rpx;

          checkbox {
            transform: scale(1.1);
          }
        }

        .goods-image-container {
          width: 120rpx;
          height: 120rpx;
          margin-right: 20rpx;
          // ... 其他样式
        }

        // ... 其他商品项样式
      }

      // 被选中的商品项
      .goods-item.selected {
        background-color: #f0f9ff;
        border-left: 4rpx solid #409eff;
      }

      // 下架商品样式
      .disabled-item {
        opacity: 0.6;
        background-color: #f8f9fa;

        .goods-name {
          color: #909399;
        }

        .goods-price {
          color: #909399;
        }
      }

      //====================================================
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
            min-width: 140rpx; // 增加宽度以适应更多按钮

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

              // 新增：隐藏按钮样式
              &.btn-status {
                &.btn-on-shelf {
                  background-color: #67c23a;
                  color: #ffffff;
                }

                &.btn-off-shelf {
                  background-color: #e6a23c;
                  color: #ffffff;
                }
              }

              // 新增：删除按钮样式
              &.btn-delete {
                background-color: #f56c6c;
                color: #ffffff;
              }
            }
          }

          // 被禁用的商品项样式
          .disabled-item {
            opacity: 0.6;
            background-color: #f8f9fa;

            .goods-name {
              text-decoration: line-through;
              color: #909399;
            }
            .goods-price {
              color: #909399;
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

    &.btn-next {
      width: 400rpx;
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

// 响应式调整
@media (max-width: 768px) {
  .batch-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 15rpx;
    padding: 15rpx 20rpx;

    .batch-checkbox {
      justify-content: space-between;
    }

    .batch-actions {
      justify-content: flex-end;

      .btn-batch-action {
        flex: 1;
        font-size: 26rpx;
        padding: 10rpx 0;
      }
    }
  }

  .goods-item {
    padding: 15rpx 20rpx;

    .goods-checkbox {
      margin-right: 15rpx;
    }

    .goods-image-container {
      width: 100rpx;
      height: 100rpx;
      margin-right: 15rpx;
    }
  }
}
</style>
