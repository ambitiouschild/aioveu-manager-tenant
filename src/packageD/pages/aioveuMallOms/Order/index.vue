<template>
  <view class="order-container">
    <!-- 顶部状态栏 -->
    <view class="status-bar">
      <view class="status-info">
        <view class="status-item">
          <text class="status-label">今日订单</text>
          <text class="status-value today-order">{{ formatNumber(todayOrders) }}</text>
        </view>
        <view class="status-divider"></view>
        <view class="status-item">
          <text class="status-label">待处理</text>
          <text class="status-value pending-order">{{ formatNumber(pendingOrders) }}</text>
        </view>
        <view class="status-divider"></view>
        <view class="status-item">
          <text class="status-label">总收入</text>
          <text class="status-value today-income">¥{{ formatMoney(todayIncome) }}</text>
        </view>
      </view>

      <!-- 快捷筛选 -->
      <view class="quick-filter">
        <view
          v-for="filter in quickFilters"
          :key="filter.value"
          class="filter-item"
          :class="{ active: activeQuickFilter === filter.value }"
          @click="onQuickFilterClick(filter.value)"
        >
          <text>{{ filter.label }}</text>
        </view>
      </view>
    </view>

    <!-- 订单筛选 -->
    <view class="order-filter">
      <!-- 时间筛选 -->
      <view class="time-filter">
        <picker
          mode="date"
          :value="dateRange.start"
          @change="onStartDateChange"
          class="date-picker"
        >
          <view class="picker-trigger">
            {{ formatDate(dateRange.start) }}
            <text class="iconfont icon-arrow-down"></text>
          </view>
        </picker>
        <text class="separator">至</text>
        <picker mode="date" :value="dateRange.end" @change="onEndDateChange" class="date-picker">
          <view class="picker-trigger">
            {{ formatDate(dateRange.end) }}
            <text class="iconfont icon-arrow-down"></text>
          </view>
        </picker>
        <view class="date-btn today" @click="setToday">今日</view>
        <view class="date-btn week" @click="setThisWeek">本周</view>
      </view>

      <!-- 状态筛选 -->
      <view class="status-filter">
        <view
          v-for="status in orderStatusList"
          :key="status.value"
          class="status-tag"
          :class="{
            active: activeStatus === status.value,
            [status.class]: true,
          }"
          @click="onStatusClick(status.value)"
        >
          <text>{{ status.label }}</text>
          <text v-if="status.count > 0" class="count-badge">{{ status.count }}</text>
        </view>
      </view>

      <!-- 高级筛选 -->
      <view class="advanced-filter" @click="toggleAdvancedFilter">
        <text>高级筛选</text>
        <text class="iconfont" :class="showAdvanced ? 'icon-arrow-up' : 'icon-arrow-down'"></text>
      </view>

      <!-- 高级筛选面板 -->
      <view v-if="showAdvanced" class="advanced-panel">
        <view class="filter-group">
          <text class="group-title">订单来源</text>
          <view class="source-options">
            <view
              v-for="source in orderSources"
              :key="source.value"
              class="source-option"
              :class="{ active: advancedFilter.source === source.value }"
              @click="toggleSource(source.value)"
            >
              <text>{{ source.label }}</text>
            </view>
          </view>
        </view>

        <view class="filter-group">
          <text class="group-title">订单金额</text>
          <view class="amount-range">
            <input
              v-model="advancedFilter.minAmount"
              type="digit"
              placeholder="最低金额"
              class="amount-input"
            />
            <text class="range-separator">-</text>
            <input
              v-model="advancedFilter.maxAmount"
              type="digit"
              placeholder="最高金额"
              class="amount-input"
            />
          </view>
        </view>

        <view class="filter-group">
          <text class="group-title">搜索条件</text>
          <view class="search-options">
            <input
              v-model="advancedFilter.keyword"
              type="text"
              placeholder="订单号/手机号/收货人"
              class="keyword-input"
            />
            <button
              class="search-btn"
              @click="applyAdvancedFilter"
              :disabled="!advancedFilter.keyword"
            >
              搜索
            </button>
          </view>
        </view>

        <view class="filter-actions">
          <button class="btn-reset" @click="resetAdvancedFilter">重置</button>
          <button class="btn-confirm" @click="confirmAdvancedFilter">确定</button>
        </view>
      </view>
    </view>

    <!-- 订单列表 -->
    <scroll-view
      scroll-y
      class="order-list"
      :style="{ height: listHeight + 'px' }"
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 列表为空 -->
      <view v-if="!loading && orderList.length === 0" class="empty-order">
        <image src="/static/images/order/empty-order.png" class="empty-image" mode="aspectFit" />
        <text class="empty-text">暂无订单</text>
        <text class="empty-tip">当前筛选条件下没有找到订单</text>
      </view>

      <!-- 订单卡片 -->
      <view
        v-for="order in orderList"
        :key="order.id"
        class="order-card"
        @click="viewOrderDetail(order.orderSn)"
      >
        <!-- 订单头部 -->
        <view class="order-header">
          <view class="order-info">
            <text class="order-no">订单号: {{ order.orderSn }}</text>
            <text class="order-time">{{ formatDateTime(order.createTime) }}</text>
          </view>
          <view class="order-status">
            <view class="status-badge" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </view>
            <text class="order-amount">¥{{ formatMoney(order.totalAmount) }}</text>
          </view>
        </view>

        <!-- 商品信息 -->
        <view class="goods-section">
          <scroll-view scroll-x class="goods-scroll" v-if="order.orderItems.length > 1">
            <view v-for="(item, index) in order.orderItems" :key="index" class="goods-item-scroll">
              <image :src="item.picUrl" class="goods-image-small" mode="aspectFill" />
            </view>
          </scroll-view>
          <view v-else class="goods-single">
            <image :src="order.orderItems[0].picUrl" class="goods-image" mode="aspectFill" />
            <view class="goods-info">
              <text class="goods-name">{{ order.orderItems[0].spuName }}</text>
              <text class="goods-spec">{{ order.orderItems[0].skuName || "默认规格" }}</text>
              <view class="goods-price">
                <text>¥{{ formatMoney(order.orderItems[0].price) }}</text>
                <text class="goods-quantity">×{{ order.orderItems[0].quantity }}</text>
              </view>
            </view>
          </view>

          <view v-if="order.orderItems.length > 1" class="goods-count">
            共{{ order.totalQuantity }}件商品
          </view>
        </view>

        <!-- 订单信息 -->
        <view class="order-details">
          <view class="detail-row">
            <text class="detail-label">收货人:</text>
            <text class="detail-value">{{ order.receiverName }} {{ order.receiverPhone }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">收货地址:</text>
            <text class="detail-value address">{{ order.fullAddress }}</text>
          </view>
          <view class="detail-row" v-if="order.remark">
            <text class="detail-label">买家留言:</text>
            <text class="detail-value remark">{{ order.remark }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="order-actions">
          <button
            v-if="showActionButton(order, 'view')"
            class="btn-view"
            @click.stop="viewOrderDetail(order.orderSn)"
          >
            查看详情
          </button>
          <button
            v-if="showActionButton(order, 'ship')"
            class="btn-ship"
            @click.stop="handleShip(order)"
          >
            发货
          </button>
          <button
            v-if="showActionButton(order, 'confirm')"
            class="btn-confirm"
            @click.stop="handleConfirm(order)"
          >
            确认收货
          </button>
          <button
            v-if="showActionButton(order, 'cancel')"
            class="btn-cancel"
            @click.stop="handleCancel(order)"
          >
            取消订单
          </button>
          <button
            v-if="showActionButton(order, 'refund')"
            class="btn-refund"
            @click.stop="handleRefund(order)"
          >
            处理退款
          </button>
          <button
            v-if="showActionButton(order, 'print')"
            class="btn-print"
            @click.stop="handlePrint(order)"
          >
            打印订单
          </button>
        </view>
      </view>

      <!-- 加载更多 -->
      <view v-if="loading" class="loading-more">
        <view class="loading-spinner"></view>
        <text>加载中...</text>
      </view>
      <view v-if="!hasMore && orderList.length > 0" class="no-more">没有更多订单了</view>
    </scroll-view>

    <!-- 底部操作栏 -->
    <view class="bottom-bar">
      <view class="order-stat">
        <text>已选 {{ selectedCount }} 单</text>
        <text class="total-amount">合计: ¥{{ formatMoney(selectedAmount) }}</text>
      </view>
      <view class="batch-actions">
        <button class="btn-batch-ship" :disabled="selectedCount === 0" @click="batchShip">
          批量发货
        </button>
        <button class="btn-batch-print" :disabled="selectedCount === 0" @click="batchPrint">
          批量打印
        </button>
        <button class="btn-export" @click="exportOrders">导出订单</button>
      </view>
    </view>

    <!-- 发货弹窗 -->
    <uni-popup ref="shipPopup" type="bottom" :safe-area="false">
      <view class="ship-popup">
        <view class="popup-header">
          <text class="popup-title">订单发货</text>
          <text class="iconfont icon-close" @click="closeShipPopup"></text>
        </view>
        <view class="popup-content">
          <view class="form-group">
            <text class="form-label">物流公司</text>
            <picker
              mode="selector"
              :range="logisticsCompanies"
              :value="logisticsCompanyIndex"
              @change="onLogisticsChange"
              class="company-picker"
            >
              <view class="picker-trigger">
                {{ currentLogisticsCompany || "请选择物流公司" }}
                <text class="iconfont icon-arrow-down"></text>
              </view>
            </picker>
          </view>
          <view class="form-group">
            <text class="form-label">运单号</text>
            <input
              v-model="shipForm.trackingNo"
              type="text"
              placeholder="请输入运单号"
              class="form-input"
            />
          </view>
          <view class="form-group">
            <text class="form-label">发货备注</text>
            <textarea
              v-model="shipForm.remark"
              placeholder="请输入发货备注（选填）"
              class="form-textarea"
            />
          </view>
        </view>
        <view class="popup-footer">
          <button class="btn-cancel" @click="closeShipPopup">取消</button>
          <button class="btn-confirm" @click="confirmShip" :disabled="!canConfirmShip">
            确认发货
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { onLoad, onShow, onReady } from "@dcloudio/uni-app";
import { formatMoney, formatDate, formatDateTime, formatNumber } from "@/utils/format";

import {
  cancelOrder as cancelOrderApi,
  deleteOrder as deleteOrderApi,
  listOrdersWithPage,
  getOrderStatistics,
  // 导入退款相关的API
  applyRefund as applyRefundApi,
  getRefundDetail,
  shipOrder,
  exportOmsOrders,
  downloadExportFile,
} from "@/packageD/api/oms/order";
import { OrderItemVO, OrderVO } from "@/packageD/types/oms/order";
import { ResultCodeEnum } from "@/enums/ResultCodeEnum";
// 系统信息
const systemInfo = uni.getSystemInfoSync();

// 响应式数据
const todayOrders = ref(0); //今日订单
const pendingOrders = ref(0); //待处理
const todayIncome = ref(0); //今日总收入
const orderList = ref<OrderVO[]>([]); //订单列表
const loading = ref(false);
const hasMore = ref(true);
const pageNum = ref(1);
const pageSize = ref(20);
const refreshing = ref(false);

// 筛选相关
const activeStatus = ref(-1); // -1表示全部
const dateRange = ref({
  start: formatDate(new Date()),
  end: formatDate(new Date()),
});
const showAdvanced = ref(false);
const activeQuickFilter = ref("today");
const selectedOrders = ref(new Set());

// 发货表单
const shipForm = ref({
  orderIds: [] as number[], // 使用类型断言
  logisticsCompany: "",
  trackingNo: "",
  remark: "",
});
const currentOrder = ref<OrderVO>();
const logisticsCompanies = ref(["顺丰", "圆通", "中通", "韵达", "申通", "京东", "邮政"]);
const logisticsCompanyIndex = ref(0);
const currentLogisticsCompany = ref("");

// 高级筛选
const advancedFilter = ref({
  source: null,
  minAmount: null, //订单金额
  maxAmount: null, //订单金额
  keyword: "",
});

// 计算属性
const listHeight = computed(() => {
  return systemInfo.windowHeight - 400;
});

const selectedCount = computed(() => {
  return selectedOrders.value.size;
});

const selectedAmount = computed(() => {
  return orderList.value
    .filter((order) => selectedOrders.value.has(order.id))
    .reduce((sum, order) => sum + order.actualAmount, 0);
});

// 订单状态配置
const orderStatusList = ref([
  { value: -1, label: "全部", class: "all", count: 0 },
  { value: 0, label: "待付款", class: "pending-payment", count: 0 },
  { value: 1, label: "待发货", class: "pending-ship", count: 0 },
  { value: 2, label: "已发货", class: "shipped", count: 0 },
  { value: 3, label: "已完成", class: "completed", count: 0 },
  { value: 4, label: "已取消", class: "cancelled", count: 0 },
  { value: 5, label: "退款中", class: "refunding", count: 0 },
]);

// 快捷筛选
const quickFilters = ref([
  { value: "today", label: "今日" },
  { value: "yesterday", label: "昨日" },
  { value: "thisWeek", label: "本周" },
  { value: "thisMonth", label: "本月" },
]);

// 订单来源
const orderSources = ref([
  { value: null, label: "全部" }, // null 表示全部
  { value: 1, label: "微信小程序" }, // 假设 1=微信小程序
  { value: 2, label: "APP" }, // 2=APP
  { value: 3, label: "H5网页" }, // 3=H5
]);

// 方法
// 加载订单数据
const loadOrders = async (reset = false) => {
  if (loading.value) return;

  if (reset) {
    pageNum.value = 1;
    hasMore.value = true;
    orderList.value = []; // 重置时清空数组
    console.log("重置后，订单列表设置为新数据，长度为：", orderList.value.length);
  }

  if (!hasMore.value) return;

  loading.value = true;

  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: activeStatus.value,
      startTime: dateRange.value.start + " 00:00:00",
      endTime: dateRange.value.end + " 23:59:59",
      ...advancedFilter.value,
    };

    console.log("订单列表参数:", params);

    // 调用API
    const response = await listOrdersWithPage(params);

    console.log("订单列表响应:", response);

    if (response.code === "00000") {
      const data = response.data as { list: OrderVO[]; total: number };

      // 使用可选链确保安全
      // 现在 TypeScript 知道 data.list 是 OrderVO[] 类型
      const newList = data?.list || [];
      const total = data?.total || 0;

      if (reset) {
        orderList.value = data.list || [];

        // 访问 order 对象的属性时有完整类型提示
        orderList.value.forEach((order) => {
          console.log(`订单 ${order.orderSn}:`);
          console.log(`- 状态: ${order.status} (${order.statusLabel})`);
          console.log(`- 金额: ${order.totalAmount / 100} 元`);
          console.log(`- 商品数: ${order.totalQuantity}`);
          console.log(`- 商品列表:`, order.orderItems);

          // 安全访问
          if (order.orderItems && order.orderItems.length > 0) {
            const firstItem = order.orderItems[0];
            console.log(`- 第一个商品: ${firstItem.spuName}, 价格: ${firstItem.price / 100} 元`);
          }
        });
      } else {
        // 使用可选链确保 orderList.value 有值
        const currentList = orderList.value || [];
        orderList.value = [...currentList, ...newList];
      }

      console.log("订单列表:", orderList.value);

      // 自己计算是否有下一页,安全计算是否有下一页
      const currentTotal = orderList.value.length || 0;
      hasMore.value = currentTotal < total;
      pageNum.value = pageNum.value + 1;

      // 调用API
      try {
        const statistics = await getOrderStatistics(params);
        console.log("订单统计响应:", statistics);
        // 更新统计
        updateOrderStats(statistics);
      } catch (error) {
        console.error("加载订单统计响应失败:", error);
        uni.showToast({
          title: "加载失败",
          icon: "error",
        });
      }
    }
  } catch (error) {
    console.error("加载订单失败:", error);
    uni.showToast({
      title: "加载失败",
      icon: "error",
    });
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

// 更新订单统计
const updateOrderStats = (statistics: any) => {
  // 更新各个状态的数量
  if (statistics.statusCounts) {
    orderStatusList.value.forEach((status) => {
      const count = statistics.statusCounts[status.value] || 0;
      status.count = count;
    });
  }

  // 更新今日数据
  todayOrders.value = statistics.todayOrderCount || 0;
  pendingOrders.value = statistics.pendingCount || 0;
  todayIncome.value = statistics.todayIncome || 0;
};

// 下拉刷新
const onRefresh = () => {
  refreshing.value = true;
  loadOrders(true);
};

// 加载更多
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    loadOrders(false);
  }
};

// 状态点击
const onStatusClick = (status: number) => {
  if (activeStatus.value === status) {
    activeStatus.value = -1; // 点击已激活状态则取消筛选
  } else {
    activeStatus.value = status;
  }
  loadOrders(true);
};

// 快捷筛选点击
const onQuickFilterClick = (filter: string) => {
  activeQuickFilter.value = filter;

  const now = new Date();
  switch (filter) {
    case "today":
      setToday();
      break;
    case "yesterday":
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      dateRange.value = {
        start: formatDate(yesterday),
        end: formatDate(yesterday),
      };
      break;
    case "thisWeek":
      setThisWeek();
      break;
    case "thisMonth":
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      dateRange.value = {
        start: formatDate(firstDay),
        end: formatDate(lastDay),
      };
      break;
  }

  loadOrders(true);
};

// 设置今天
const setToday = () => {
  const today = formatDate(new Date());
  dateRange.value = {
    start: today,
    end: today,
  };
};

// 设置本周
const setThisWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  dateRange.value = {
    start: formatDate(monday),
    end: formatDate(sunday),
  };
};

// 日期选择
const onStartDateChange = (e: any) => {
  dateRange.value.start = e.detail.value;
  loadOrders(true);
};

const onEndDateChange = (e: any) => {
  dateRange.value.end = e.detail.value;
  loadOrders(true);
};

// 高级筛选
const toggleAdvancedFilter = () => {
  showAdvanced.value = !showAdvanced.value;
};

const toggleSource = (source: any) => {
  advancedFilter.value.source = source;
};

const applyAdvancedFilter = () => {
  loadOrders(true);
  showAdvanced.value = false;
};

const confirmAdvancedFilter = () => {
  loadOrders(true);
  showAdvanced.value = false;
};

const resetAdvancedFilter = () => {
  advancedFilter.value = {
    source: null, // 改为 null
    minAmount: null, // 改为 null
    maxAmount: null, // 改为 null
    keyword: "",
  };
};

// 查看订单详情
const viewOrderDetail = (orderSn: string) => {
  uni.navigateTo({
    url: `/pages/business/order/detail?orderSn=${orderSn}`,
    animationType: "slide-in-right",
  });
};

// 获取状态类名
const getStatusClass = (status: number) => {
  const statusMap: { [key: number]: string } = {
    0: "pending-payment",
    1: "pending-ship",
    2: "shipped",
    3: "completed",
    4: "cancelled",
    5: "refunding",
  };
  return statusMap[status] || "all";
};

// 获取状态文本
const getStatusText = (status: number) => {
  const statusTextMap: { [key: number]: string } = {
    0: "待付款",
    1: "待发货",
    2: "已发货",
    3: "已完成",
    4: "已取消",
    5: "退款中",
  };
  return statusTextMap[status] || "未知";
};

// 定义可用的操作类型
type OrderAction = "view" | "ship" | "confirm" | "cancel" | "refund" | "print";

// 显示操作按钮
const showActionButton = (order: OrderVO, action: OrderAction) => {
  const actionMap: Record<OrderAction, boolean> = {
    view: true, // 总是显示查看
    ship: order.status === 1, // 待发货
    confirm: order.status === 2, // 已发货
    cancel: [0, 1].includes(order.status), // 待付款、待发货
    refund: [5, 6].includes(order.status), // 退款相关状态
    print: [1, 2, 3].includes(order.status), // 已发货、已完成
  };
  return actionMap[action] || false;
};

// 首先，在组件顶部定义 ref
const shipPopup = ref<any>(null); // 使用 any 或具体的组件类型

// 发货处理
const handleShip = (order: OrderVO) => {
  shipForm.value.orderIds = [order.id] as number[];
  currentLogisticsCompany.value = "";
  shipForm.value.trackingNo = "";
  shipForm.value.remark = "";

  // ✅ 这里把 order 存起来
  currentOrder.value = order;

  // 使用组件 ref 而不是 uni.$refs
  shipPopup.value?.open();
};

// 物流公司选择
const onLogisticsChange = (e: any) => {
  logisticsCompanyIndex.value = e.detail.value;
  currentLogisticsCompany.value = logisticsCompanies.value[e.detail.value];
};

// 确认发货
const confirmShip = async () => {
  if (!currentOrder.value) return;

  if (!currentLogisticsCompany.value) {
    uni.showToast({
      title: "请选择物流公司",
      icon: "none",
    });
    return;
  }

  if (!shipForm.value.trackingNo.trim()) {
    uni.showToast({
      title: "请输入运单号",
      icon: "none",
    });
    return;
  }

  try {
    const res = await shipOrder(currentOrder.value.orderSn, {
      logisticsCompany: currentLogisticsCompany.value,
      trackingNo: shipForm.value.trackingNo,
      remark: shipForm.value.remark,
    });

    if (res.code === ResultCodeEnum.SUCCESS) {
      uni.showToast({
        title: "发货成功",
        icon: "success",
      });

      // 关闭弹窗
      closeShipPopup();

      // 刷新列表
      loadOrders(true);
    }
  } catch (error) {
    console.error("发货失败:", error);
    uni.showToast({
      title: "发货失败",
      icon: "error",
    });
  }
};

// 关闭发货弹窗
const closeShipPopup = () => {
  shipPopup.value?.close();
};

// 其他操作
const handleConfirm = async (order: OrderVO) => {
  // 确认收货逻辑
};

const handleCancel = async (order: OrderVO) => {
  // 取消订单逻辑
};

const handleRefund = async (order: OrderVO) => {
  // 处理退款逻辑
};

const handlePrint = (order: OrderVO) => {
  // 打印订单逻辑
  console.log("打印订单:", order.orderNo);
};

// 批量操作
const batchShip = () => {
  if (selectedCount.value === 0) {
    uni.showToast({
      title: "请先选择订单",
      icon: "none",
    });
    return;
  }

  // ✅ 明确 Set<number>
  shipForm.value.orderIds = Array.from(selectedOrders.value as Set<number>);
  shipPopup.value?.open();
};

const batchPrint = () => {
  if (selectedCount.value === 0) {
    uni.showToast({
      title: "请先选择订单",
      icon: "none",
    });
    return;
  }

  console.log("批量打印订单:", Array.from(selectedOrders.value));
};

// 创建导出任务 + 下载 （只拿 exportNo）
const exportOrders = async () => {
  try {
    const params = {
      ...getFilterParams(),
      exportType: "excel",
    };

    //await exportOmsOrders()返回的是 ResponseData<ExportTaskResp>​
    const res = await exportOmsOrders(params);

    // // 后端返回的是文件流
    // const blob = new Blob([response.data as BlobPart], {
    //   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // });
    // const fileName = `订单导出_${formatDate(new Date())}.xlsx`;
    //
    // downloadExcel(blob, fileName);

    if (res.code === "00000") {
      const exportNo = res.data.exportNo; // ✅ 100% OK

      uni.showToast({
        title: "导出任务已创建",
        icon: "success",
      });

      // ✅ 可以刷新任务列表
      // loadExportTaskList();
    }

    uni.showToast({ title: "导出任务已创建", icon: "success" });
  } catch (error) {
    console.error("导出失败:", error);
    uni.showToast({
      title: "导出失败",
      icon: "error",
    });
  }
};

// 下载已有任务
const handleDownload = async (exportNo: string) => {
  try {
    const res = await downloadExportFile(exportNo);

    const blob = new Blob([res.data as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `订单导出_${exportNo}.xlsx`;

    downloadExcel(blob, fileName);

    uni.showToast({ title: "下载成功", icon: "success" });
  } catch (e) {
    console.error(e);
    uni.showToast({ title: "文件不存在或已过期", icon: "error" });
  }
};

/**
 * 通用 Excel 下载（H5 + APP‑PLUS）
 * 下载逻辑合并 ✅（你已经做到了）
 */
const downloadExcel = (blob: Blob, fileName: string) => {
  if (!blob) {
    uni.showToast({ title: "文件下载失败", icon: "error" });
    return;
  }

  // #ifdef H5
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(link.href);
  // #endif

  // #ifdef APP-PLUS
  plus.io.resolveLocalFileSystemURL(
    "_doc/",
    (dirEntry: any) => {
      dirEntry.getFile(
        fileName,
        { create: true, exclusive: false },
        (fileEntry: any) => {
          fileEntry.createWriter((writer: any) => {
            writer.onwriteend = () => {
              plus.runtime.openFile(fileEntry.toURL());
            };

            // ✅ 安全写法（Android 必稳）
            const reader = new FileReader();
            reader.onload = () => {
              writer.write(reader.result as ArrayBuffer);
            };
            reader.readAsArrayBuffer(blob);
          });
        },
        () => {
          uni.showToast({ title: "创建文件失败", icon: "error" });
        }
      );
    },
    () => {
      uni.showToast({ title: "访问目录失败", icon: "error" });
    }
  );
  // #endif
};

// 获取筛选参数
const getFilterParams = () => {
  return {
    status: activeStatus.value,
    startTime: dateRange.value.start + " 00:00:00",
    endTime: dateRange.value.end + " 23:59:59",
    ...advancedFilter.value,
  };
};

// 计算是否可以确认发货
const canConfirmShip = computed(() => {
  return currentLogisticsCompany.value && shipForm.value.trackingNo.trim();
});

// 生命周期
onLoad(() => {
  console.log("商家订单管理页面加载");
  loadOrders(true);
});

onShow(() => {
  console.log("商家订单管理页面显示");
});

onReady(() => {
  console.log("商家订单管理页面准备就绪");
});

onUnmounted(() => {
  console.log("商家订单管理页面卸载");
});
</script>

<style lang="scss" scoped>
.order-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
  overflow: hidden;
}

.status-bar {
  background: linear-gradient(135deg, #409eff, #66b1ff);
  color: #fff;
  padding: 20rpx 30rpx;

  .status-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .status-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;

      .status-label {
        font-size: 24rpx;
        opacity: 0.9;
        margin-bottom: 8rpx;
      }

      .status-value {
        font-size: 36rpx;
        font-weight: bold;

        &.today-order {
          color: #ffd700;
        }

        &.pending-order {
          color: #ff6b6b;
        }

        &.today-income {
          color: #67c23a;
        }
      }
    }

    .status-divider {
      width: 1px;
      height: 40rpx;
      background: rgba(255, 255, 255, 0.3);
    }
  }

  .quick-filter {
    display: flex;
    gap: 20rpx;

    .filter-item {
      padding: 8rpx 20rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20rpx;
      font-size: 24rpx;
      transition: all 0.3s;

      &.active {
        background: #fff;
        color: #409eff;
        font-weight: bold;
      }
    }
  }
}

.order-filter {
  background: #fff;
  padding: 20rpx 30rpx;
  border-radius: 0 0 20rpx 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

  .time-filter {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    flex-wrap: wrap;

    .date-picker {
      flex: 1;

      .picker-trigger {
        padding: 12rpx 20rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #303133;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .iconfont {
          font-size: 24rpx;
          color: #c0c4cc;
        }
      }
    }

    .separator {
      margin: 0 20rpx;
      color: #909399;
    }

    .date-btn {
      padding: 12rpx 20rpx;
      background: #409eff;
      color: #fff;
      border-radius: 8rpx;
      font-size: 24rpx;
      margin-left: 20rpx;

      &.week {
        background: #67c23a;
      }
    }
  }

  .status-filter {
    display: flex;
    gap: 20rpx;
    overflow-x: auto;
    padding-bottom: 10rpx;
    margin-bottom: 20rpx;

    .status-tag {
      padding: 8rpx 20rpx;
      background: #f5f7fa;
      border-radius: 20rpx;
      font-size: 24rpx;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 8rpx;
      transition: all 0.3s;

      &.active {
        font-weight: bold;

        &.all {
          background: #409eff;
          color: #fff;
        }

        &.pending-payment {
          background: #e6a23c;
          color: #fff;
        }

        &.pending-ship {
          background: #409eff;
          color: #fff;
        }

        &.shipped {
          background: #67c23a;
          color: #fff;
        }

        &.completed {
          background: #909399;
          color: #fff;
        }

        &.cancelled {
          background: #f56c6c;
          color: #fff;
        }

        &.refunding {
          background: #f56c6c;
          color: #fff;
        }
      }

      .count-badge {
        background: #f56c6c;
        color: #fff;
        font-size: 20rpx;
        padding: 2rpx 8rpx;
        border-radius: 10rpx;
        min-width: 30rpx;
        text-align: center;
      }
    }
  }

  .advanced-filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;
    color: #409eff;
    font-size: 28rpx;
  }

  .advanced-panel {
    padding: 20rpx 0;
    border-top: 1px solid #f0f0f0;
    margin-top: 20rpx;

    .filter-group {
      margin-bottom: 30rpx;

      .group-title {
        display: block;
        font-size: 28rpx;
        color: #303133;
        margin-bottom: 20rpx;
        font-weight: 500;
      }

      .source-options {
        display: flex;
        gap: 20rpx;

        .source-option {
          padding: 12rpx 20rpx;
          background: #f5f7fa;
          border-radius: 8rpx;
          font-size: 24rpx;

          &.active {
            background: #409eff;
            color: #fff;
          }
        }
      }

      .amount-range {
        display: flex;
        align-items: center;
        gap: 20rpx;

        .amount-input {
          flex: 1;
          padding: 12rpx 20rpx;
          background: #f5f7fa;
          border-radius: 8rpx;
          font-size: 28rpx;
        }

        .range-separator {
          color: #909399;
        }
      }

      .search-options {
        display: flex;
        gap: 20rpx;

        .keyword-input {
          flex: 1;
          padding: 12rpx 20rpx;
          background: #f5f7fa;
          border-radius: 8rpx;
          font-size: 28rpx;
        }

        .search-btn {
          background: #409eff;
          color: #fff;
          border-radius: 8rpx;
          font-size: 28rpx;
          padding: 0 30rpx;
          line-height: 60rpx;
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 20rpx;

      button {
        flex: 1;
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 8rpx;
        font-size: 28rpx;

        &.btn-reset {
          background: #f5f7fa;
          color: #606266;
        }

        &.btn-confirm {
          background: #409eff;
          color: #fff;
        }
      }
    }
  }
}

.order-list {
  flex: 1;
  padding: 20rpx 30rpx;

  .empty-order {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 100rpx 0;

    .empty-image {
      width: 200rpx;
      height: 200rpx;
      margin-bottom: 30rpx;
      opacity: 0.6;
    }

    .empty-text {
      font-size: 32rpx;
      color: #909399;
      margin-bottom: 10rpx;
    }

    .empty-tip {
      font-size: 24rpx;
      color: #c0c4cc;
    }
  }

  .order-card {
    background: #fff;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: 1px solid #f0f0f0;

      .order-info {
        flex: 1;

        .order-no {
          display: block;
          font-size: 28rpx;
          color: #303133;
          font-weight: 500;
          margin-bottom: 8rpx;
        }

        .order-time {
          font-size: 24rpx;
          color: #909399;
        }
      }

      .order-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .status-badge {
          padding: 6rpx 12rpx;
          border-radius: 6rpx;
          font-size: 22rpx;
          font-weight: 500;
          margin-bottom: 8rpx;

          &.pending-payment {
            background: #fdf6ec;
            color: #e6a23c;
          }

          &.pending-ship {
            background: #ecf5ff;
            color: #409eff;
          }

          &.shipped {
            background: #f0f9eb;
            color: #67c23a;
          }

          &.completed {
            background: #f4f4f5;
            color: #909399;
          }

          &.cancelled {
            background: #fef0f0;
            color: #f56c6c;
          }

          &.refunding {
            background: #fef0f0;
            color: #f56c6c;
          }
        }

        .order-amount {
          font-size: 32rpx;
          color: #f56c6c;
          font-weight: bold;
        }
      }
    }

    .goods-section {
      margin-bottom: 20rpx;
      padding-bottom: 20rpx;
      border-bottom: 1px solid #f0f0f0;

      .goods-scroll {
        white-space: nowrap;

        .goods-item-scroll {
          display: inline-block;
          width: 120rpx;
          height: 120rpx;
          margin-right: 20rpx;

          .goods-image-small {
            width: 100%;
            height: 100%;
            border-radius: 8rpx;
          }
        }
      }

      .goods-single {
        display: flex;
        gap: 20rpx;

        .goods-image {
          width: 120rpx;
          height: 120rpx;
          border-radius: 8rpx;
          flex-shrink: 0;
        }

        .goods-info {
          flex: 1;

          .goods-name {
            display: block;
            font-size: 28rpx;
            color: #303133;
            margin-bottom: 8rpx;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .goods-spec {
            font-size: 24rpx;
            color: #909399;
            margin-bottom: 8rpx;
          }

          .goods-price {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .goods-quantity {
              font-size: 24rpx;
              color: #909399;
            }
          }
        }
      }

      .goods-count {
        text-align: right;
        font-size: 24rpx;
        color: #909399;
        margin-top: 10rpx;
      }
    }

    .order-details {
      margin-bottom: 20rpx;

      .detail-row {
        display: flex;
        margin-bottom: 10rpx;
        font-size: 24rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          color: #909399;
          width: 120rpx;
          flex-shrink: 0;
        }

        .detail-value {
          color: #303133;
          flex: 1;

          &.address,
          &.remark {
            word-break: break-all;
          }
        }
      }
    }

    .order-actions {
      display: flex;
      justify-content: flex-end;
      gap: 20rpx;

      button {
        padding: 8rpx 20rpx;
        border-radius: 8rpx;
        font-size: 24rpx;
        line-height: 1.5;

        &::after {
          border: none;
        }

        &.btn-view {
          background: #f5f7fa;
          color: #606266;
        }

        &.btn-ship {
          background: #409eff;
          color: #fff;
        }

        &.btn-confirm {
          background: #67c23a;
          color: #fff;
        }

        &.btn-cancel {
          background: #f56c6c;
          color: #fff;
        }

        &.btn-refund {
          background: #f56c6c;
          color: #fff;
        }

        &.btn-print {
          background: #909399;
          color: #fff;
        }
      }
    }
  }

  .loading-more {
    padding: 30rpx;
    text-align: center;
    color: #909399;
    font-size: 28rpx;

    .loading-spinner {
      width: 40rpx;
      height: 40rpx;
      border: 4rpx solid #e4e7ed;
      border-top-color: #409eff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20rpx;
    }
  }

  .no-more {
    padding: 30rpx;
    text-align: center;
    color: #c0c4cc;
    font-size: 24rpx;
  }
}

.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 20rpx 30rpx;
  border-top: 1px solid #f0f0f0;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);

  .order-stat {
    display: flex;
    flex-direction: column;
    gap: 8rpx;

    .total-amount {
      color: #f56c6c;
      font-weight: bold;
      font-size: 28rpx;
    }
  }

  .batch-actions {
    display: flex;
    gap: 20rpx;

    button {
      padding: 12rpx 20rpx;
      border-radius: 8rpx;
      font-size: 24rpx;
      line-height: 1.5;

      &[disabled] {
        opacity: 0.6;
      }

      &.btn-batch-ship {
        background: #409eff;
        color: #fff;
      }

      &.btn-batch-print {
        background: #909399;
        color: #fff;
      }

      &.btn-export {
        background: #67c23a;
        color: #fff;
      }
    }
  }
}

// 弹窗样式
.ship-popup {
  background: #fff;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #f0f0f0;

    .popup-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #303133;
    }

    .icon-close {
      font-size: 36rpx;
      color: #909399;
    }
  }

  .popup-content {
    padding: 30rpx;

    .form-group {
      margin-bottom: 30rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .form-label {
        display: block;
        font-size: 28rpx;
        color: #303133;
        margin-bottom: 20rpx;
        font-weight: 500;
      }

      .company-picker {
        .picker-trigger {
          padding: 20rpx;
          background: #f5f7fa;
          border-radius: 8rpx;
          font-size: 28rpx;
          color: #303133;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
      }

      .form-input,
      .form-textarea {
        width: 100%;
        padding: 20rpx;
        background: #f5f7fa;
        border-radius: 8rpx;
        font-size: 28rpx;
        color: #303133;
        box-sizing: border-box;
      }

      .form-textarea {
        height: 200rpx;
      }
    }
  }

  .popup-footer {
    display: flex;
    gap: 20rpx;
    padding: 20rpx 30rpx;
    border-top: 1px solid #f0f0f0;

    button {
      flex: 1;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 8rpx;
      font-size: 28rpx;

      &.btn-cancel {
        background: #f5f7fa;
        color: #606266;
      }

      &.btn-confirm {
        background: #409eff;
        color: #fff;

        &[disabled] {
          opacity: 0.6;
        }
      }
    }
  }
}

// 动画
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
