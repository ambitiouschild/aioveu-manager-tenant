<template>
  <view class="order-detail-container">
    <!-- 头部状态 -->
    <view class="order-status-header" :class="statusClass">
      <view class="status-content">
        <text class="status-text">{{ getStatusText(order.status) }}</text>
        <text v-if="order.status === 1" class="status-tip">请尽快处理订单</text>
        <text v-if="order.status === 2" class="status-tip">已发货，等待用户确认收货</text>
      </view>
    </view>

    <!-- 收货信息 -->
    <view class="info-card address-card">
      <view class="card-header">
        <text class="card-title">收货信息</text>
        <text v-if="order.status === 1" class="edit-btn" @click="editAddress">修改</text>
      </view>
      <view class="address-info">
        <view class="receiver">
          <text class="name">{{ order.receiver.name }}</text>
          <text class="phone">{{ order.receiver.phone }}</text>
        </view>
        <view class="address-detail">{{ order.receiver.address }}</view>
      </view>
    </view>

    <!-- 物流信息 -->
    <view v-if="order.logisticsInfo" class="info-card logistics-card">
      <view class="card-header">
        <text class="card-title">物流信息</text>
        <text v-if="order.status === 1" class="edit-btn" @click="editLogistics">修改</text>
      </view>
      <view class="logistics-info">
        <view class="logistics-company">
          <text>物流公司: {{ order.logisticsInfo.company }}</text>
          <text>运单号: {{ order.logisticsInfo.trackingNo }}</text>
        </view>
        <view v-if="order.logisticsInfo.traces" class="logistics-traces">
          <view
            v-for="(trace, index) in order.logisticsInfo.traces"
            :key="index"
            class="trace-item"
            :class="{ current: index === 0 }"
          >
            <view class="trace-dot"></view>
            <view class="trace-content">
              <text class="trace-desc">{{ trace.desc }}</text>
              <text class="trace-time">{{ trace.time }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="info-card order-card">
      <view class="card-header">
        <text class="card-title">订单信息</text>
        <text class="order-no">订单号: {{ order.orderNo }}</text>
      </view>

      <!-- 商品列表 -->
      <view class="goods-list">
        <view v-for="item in order.items" :key="item.id" class="goods-item">
          <image :src="item.image" class="goods-image" mode="aspectFill" />
          <view class="goods-info">
            <view class="goods-name">{{ item.name }}</view>
            <view class="goods-spec">{{ item.spec || "默认规格" }}</view>
            <view class="goods-price">
              <text>¥{{ formatMoney(item.price) }}</text>
              <text class="quantity">×{{ item.quantity }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单费用 -->
      <view class="order-summary">
        <view class="summary-row">
          <text>商品金额</text>
          <text>¥{{ formatMoney(order.goodsAmount) }}</text>
        </view>
        <view class="summary-row">
          <text>运费</text>
          <text>¥{{ formatMoney(order.shippingFee) }}</text>
        </view>
        <view class="summary-row" v-if="order.discountAmount > 0">
          <text>优惠金额</text>
          <text class="discount">-¥{{ formatMoney(order.discountAmount) }}</text>
        </view>
        <view class="summary-row total">
          <text>实付金额</text>
          <text class="total-amount">¥{{ formatMoney(order.actualAmount) }}</text>
        </view>
      </view>
    </view>

    <!-- 订单时间 -->
    <view class="info-card time-card">
      <view class="time-item">
        <text>下单时间</text>
        <text>{{ formatDateTime(order.createTime) }}</text>
      </view>
      <view v-if="order.payTime" class="time-item">
        <text>付款时间</text>
        <text>{{ formatDateTime(order.payTime) }}</text>
      </view>
      <view v-if="order.shipTime" class="time-item">
        <text>发货时间</text>
        <text>{{ formatDateTime(order.shipTime) }}</text>
      </view>
      <view v-if="order.finishTime" class="time-item">
        <text>完成时间</text>
        <text>{{ formatDateTime(order.finishTime) }}</text>
      </view>
    </view>

    <!-- 买家留言 -->
    <view v-if="order.remark" class="info-card remark-card">
      <view class="card-header">
        <text class="card-title">买家留言</text>
      </view>
      <view class="remark-content">{{ order.remark }}</view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button v-if="order.status === 1" class="btn-primary" @click="handleShip">立即发货</button>
      <button v-if="order.status === 2" class="btn-primary" @click="handleConfirm">确认收货</button>
      <button v-if="[0, 1].includes(order.status)" class="btn-cancel" @click="handleCancel">
        取消订单
      </button>
      <button v-if="[5, 6].includes(order.status)" class="btn-refund" @click="handleRefund">
        处理退款
      </button>
      <button class="btn-secondary" @click="handlePrint">打印订单</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { OrderStatus } from "@/packageD/api/oms/order"; // 假设您的API文件已导出OrderStatus
import { formatMoney } from "@/utils/format"; // 导入格式化函数

// 订单数据类型定义
interface Receiver {
  name: string;
  phone: string;
  address: string;
}

interface GoodsItem {
  id: string;
  image: string;
  name: string;
  spec?: string;
  price: number;
  quantity: number;
}

interface LogisticsInfo {
  company: string;
  trackingNo: string;
  traces?: Array<{
    desc: string;
    time: string;
  }>;
}

interface Order {
  id: string;
  orderNo: string;
  status: number;
  receiver: Receiver;
  logisticsInfo?: LogisticsInfo;
  items: GoodsItem[];
  goodsAmount: number;
  shippingFee: number;
  discountAmount: number;
  actualAmount: number;
  createTime: string;
  payTime?: string;
  shipTime?: string;
  finishTime?: string;
  remark?: string;
}

// 响应式数据
const order = ref<Order>({
  id: "",
  orderNo: "",
  status: 0,
  receiver: {
    name: "",
    phone: "",
    address: "",
  },
  items: [],
  goodsAmount: 0,
  shippingFee: 0,
  discountAmount: 0,
  actualAmount: 0,
  createTime: "",
});

// 计算属性：状态样式类
const statusClass = computed(() => {
  switch (order.value.status) {
    case OrderStatus.PENDING_PAYMENT:
      return "pending-payment";
    case OrderStatus.PENDING_SHIP:
      return "pending-ship";
    case OrderStatus.SHIPPED:
      return "shipped";
    case OrderStatus.COMPLETED:
      return "completed";
    case OrderStatus.CANCELLED:
      return "cancelled";
    case OrderStatus.REFUNDING:
      return "refunding";
    case OrderStatus.REFUNDED:
      return "refunded";
    default:
      return "";
  }
});

// 获取状态文本
const getStatusText = (status: number): string => {
  switch (status) {
    case OrderStatus.PENDING_PAYMENT:
      return "待付款";
    case OrderStatus.PENDING_SHIP:
      return "待发货";
    case OrderStatus.SHIPPED:
      return "已发货";
    case OrderStatus.COMPLETED:
      return "已完成";
    case OrderStatus.CANCELLED:
      return "已取消";
    case OrderStatus.REFUNDING:
      return "退款中";
    case OrderStatus.REFUNDED:
      return "已退款";
    default:
      return "未知状态";
  }
};

// 格式化日期时间
const formatDateTime = (dateTime: string): string => {
  if (!dateTime) return "";
  const date = new Date(dateTime);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 编辑地址
const editAddress = () => {
  uni.showToast({
    title: "编辑地址功能开发中",
    icon: "none",
  });
};

// 编辑物流
const editLogistics = () => {
  uni.showToast({
    title: "编辑物流功能开发中",
    icon: "none",
  });
};

// 立即发货
const handleShip = () => {
  uni.showModal({
    title: "确认发货",
    content: "确定要立即发货吗？",
    success: (res) => {
      if (res.confirm) {
        // 调用发货API
        uni.showToast({
          title: "发货成功",
          icon: "success",
        });
        // 刷新订单数据
        loadOrderDetail();
      }
    },
  });
};

// 确认收货
const handleConfirm = () => {
  uni.showModal({
    title: "确认收货",
    content: "确定要确认收货吗？",
    success: (res) => {
      if (res.confirm) {
        // 调用确认收货API
        uni.showToast({
          title: "确认收货成功",
          icon: "success",
        });
        // 刷新订单数据
        loadOrderDetail();
      }
    },
  });
};

// 取消订单
const handleCancel = () => {
  uni.showModal({
    title: "取消订单",
    content: "确定要取消订单吗？",
    success: (res) => {
      if (res.confirm) {
        // 调用取消订单API
        uni.showToast({
          title: "订单已取消",
          icon: "success",
        });
        // 刷新订单数据
        loadOrderDetail();
      }
    },
  });
};

// 处理退款
const handleRefund = () => {
  uni.showToast({
    title: "处理退款功能开发中",
    icon: "none",
  });
};

// 打印订单
const handlePrint = () => {
  uni.showToast({
    title: "打印功能开发中",
    icon: "none",
  });
};

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    // 从路由参数获取订单ID
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const orderId = currentPage.$page.options.id; // 或者通过 onLoad 获取

    if (!orderId) {
      uni.showToast({
        title: "订单ID不能为空",
        icon: "none",
      });
      return;
    }

    // 调用API获取订单详情
    // const res = await getOrderDetail({ id: orderId });
    // order.value = res.data;

    // 模拟数据
    order.value = {
      id: "123456789",
      orderNo: "ORD202504300001",
      status: 1,
      receiver: {
        name: "张三",
        phone: "13800138000",
        address: "北京市朝阳区某某街道某某小区1号楼1单元101室",
      },
      logisticsInfo: {
        company: "顺丰速运",
        trackingNo: "SF1234567890123",
        traces: [
          {
            desc: "已揽收",
            time: "2025-04-30 10:30:00",
          },
          {
            desc: "运输中",
            time: "2025-04-30 14:20:00",
          },
        ],
      },
      items: [
        {
          id: "1",
          image:
            "https://cdn.aioveu.com/aioveu/1001/image/20260407/bc34e9bad08940ef8d9dc58e666f088b.png",
          name: "红墙2_760x500",
          spec: "默认规格",
          price: 29900,
          quantity: 2,
        },
      ],
      goodsAmount: 59800,
      shippingFee: 1000,
      discountAmount: 1000,
      actualAmount: 59800,
      createTime: "2025-04-30 09:15:30",
      payTime: "2025-04-30 09:20:15",
      shipTime: "2025-04-30 10:30:00",
      remark: "请尽快发货，谢谢！",
    };
  } catch (error) {
    console.error("加载订单详情失败:", error);
    uni.showToast({
      title: "加载订单详情失败",
      icon: "none",
    });
  }
};

// 页面加载时获取订单详情
onLoad((options) => {
  if (options.id) {
    loadOrderDetail();
  }
});

onMounted(() => {
  console.log("订单详情页面挂载");
});
</script>

<style lang="scss">
.order-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120upx;
}

/* 状态头部 */
.order-status-header {
  padding: 40upx 30upx;
  color: #fff;
  text-align: center;

  &.pending-payment {
    background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  }

  &.pending-ship {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
  }

  &.shipped {
    background: linear-gradient(135deg, #45b7d1, #3498db);
  }

  &.completed {
    background: linear-gradient(135deg, #96ceb4, #85c1a3);
  }

  &.cancelled {
    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  }

  &.refunding {
    background: linear-gradient(135deg, #f39c12, #e67e22);
  }

  &.refunded {
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
  }

  .status-content {
    .status-text {
      font-size: 36upx;
      font-weight: bold;
      display: block;
      margin-bottom: 10upx;
    }

    .status-tip {
      font-size: 28upx;
      opacity: 0.9;
    }
  }
}

/* 信息卡片 */
.info-card {
  background: #fff;
  margin: 20upx;
  border-radius: 16upx;
  padding: 30upx;
  box-shadow: 0 2upx 10upx rgba(0, 0, 0, 0.05);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20upx;
    padding-bottom: 20upx;
    border-bottom: 1upx solid #f5f5f5;

    .card-title {
      font-size: 32upx;
      font-weight: bold;
      color: #333;
    }

    .edit-btn {
      font-size: 28upx;
      color: #007aff;
    }

    .order-no {
      font-size: 28upx;
      color: #666;
    }
  }
}

/* 收货信息 */
.address-card {
  .address-info {
    .receiver {
      display: flex;
      align-items: center;
      margin-bottom: 10upx;

      .name {
        font-size: 32upx;
        font-weight: bold;
        color: #333;
        margin-right: 20upx;
      }

      .phone {
        font-size: 28upx;
        color: #666;
      }
    }

    .address-detail {
      font-size: 28upx;
      color: #666;
      line-height: 1.5;
    }
  }
}

/* 物流信息 */
.logistics-card {
  .logistics-info {
    .logistics-company {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20upx;
      font-size: 28upx;
      color: #666;
    }

    .logistics-traces {
      .trace-item {
        display: flex;
        margin-bottom: 20upx;

        &:last-child {
          margin-bottom: 0;
        }

        &.current {
          .trace-dot {
            background-color: #007aff;
            border-color: #007aff;
          }

          .trace-content {
            .trace-desc {
              color: #007aff;
              font-weight: bold;
            }
          }
        }

        .trace-dot {
          width: 16upx;
          height: 16upx;
          border-radius: 50%;
          border: 2upx solid #ddd;
          background-color: #fff;
          margin-right: 20upx;
          margin-top: 6upx;
          flex-shrink: 0;
        }

        .trace-content {
          flex: 1;

          .trace-desc {
            font-size: 28upx;
            color: #333;
            display: block;
            margin-bottom: 5upx;
          }

          .trace-time {
            font-size: 24upx;
            color: #999;
          }
        }
      }
    }
  }
}

/* 订单信息 */
.order-card {
  .goods-list {
    margin-bottom: 30upx;

    .goods-item {
      display: flex;
      padding: 20upx 0;
      border-bottom: 1upx solid #f5f5f5;

      &:last-child {
        border-bottom: none;
      }

      .goods-image {
        width: 120upx;
        height: 120upx;
        border-radius: 8upx;
        margin-right: 20upx;
      }

      .goods-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .goods-name {
          font-size: 30upx;
          color: #333;
          line-height: 1.4;
          margin-bottom: 10upx;
        }

        .goods-spec {
          font-size: 26upx;
          color: #999;
          margin-bottom: 10upx;
        }

        .goods-price {
          display: flex;
          justify-content: space-between;
          align-items: center;

          text {
            font-size: 30upx;
            color: #e74c3c;
            font-weight: bold;
          }

          .quantity {
            font-size: 28upx;
            color: #666;
          }
        }
      }
    }
  }

  .order-summary {
    border-top: 1upx solid #f5f5f5;
    padding-top: 20upx;

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 15upx;
      font-size: 28upx;
      color: #666;

      &.total {
        margin-top: 20upx;
        padding-top: 20upx;
        border-top: 1upx solid #f5f5f5;
        font-weight: bold;

        text {
          color: #333;
        }

        .total-amount {
          color: #e74c3c;
          font-size: 32upx;
        }
      }

      .discount {
        color: #e74c3c;
      }
    }
  }
}

/* 订单时间 */
.time-card {
  .time-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20upx;
    font-size: 28upx;
    color: #666;

    &:last-child {
      margin-bottom: 0;
    }

    text:first-child {
      color: #333;
    }
  }
}

/* 买家留言 */
.remark-card {
  .remark-content {
    font-size: 28upx;
    color: #666;
    line-height: 1.5;
  }
}

/* 操作按钮 */
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  padding: 20upx 30upx;
  box-shadow: 0 -2upx 10upx rgba(0, 0, 0, 0.05);
  display: flex;
  gap: 20upx;
  align-items: center;

  button {
    flex: 1;
    height: 80upx;
    line-height: 80upx;
    border-radius: 40upx;
    font-size: 28upx;
    border: none;

    &.btn-primary {
      background: linear-gradient(135deg, #007aff, #0056b3);
      color: #fff;
    }

    &.btn-cancel {
      background: #fff;
      color: #e74c3c;
      border: 1upx solid #e74c3c;
    }

    &.btn-refund {
      background: #fff;
      color: #f39c12;
      border: 1upx solid #f39c12;
    }

    &.btn-secondary {
      background: #fff;
      color: #666;
      border: 1upx solid #ddd;
    }
  }
}
</style>
