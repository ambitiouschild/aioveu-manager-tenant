/**
 * 订单状态枚举
 * ⚠️ 必须与后端 OrderStatusEnum 完全一致
 */
export enum OrderStatusEnum {
  /** 待付款 */
  UNPAID = "UNPAID",
  /** 待发货 */
  PAID = "PAID",
  /** 已发货 */
  SHIPPED = "SHIPPED",
  /** 已完成 */
  COMPLETED = "COMPLETED",
  /** 已取消 */
  CANCELLED = "CANCELLED",
  /** 已关闭 */
  CLOSED = "CLOSED",
  /** 售后中 */
  SERVICING = "SERVICING",
}

/**
 * 订单状态数值 → 枚举值 映射
 * （后端详情接口返回的是数字，列表接口返回的是字符串，这里统一转换）
 */
export const OrderStatusNumberMap: Record<number, OrderStatusEnum> = {
  0: OrderStatusEnum.UNPAID,
  1: OrderStatusEnum.PAID,
  2: OrderStatusEnum.SHIPPED,
  3: OrderStatusEnum.COMPLETED,
  4: OrderStatusEnum.CANCELLED,
  5: OrderStatusEnum.CLOSED,
  6: OrderStatusEnum.SERVICING,
};


/**
 * 统一转换：无论后端返回数字还是字符串，都转成 OrderStatusEnum
 */
export const normalizeStatus = (raw: number | string | undefined | null): OrderStatusEnum => {
  if (raw == null) return OrderStatusEnum.UNPAID;

  // 已经是枚举字符串
  if (typeof raw === "string" && raw in OrderStatusEnum) {
    return raw as OrderStatusEnum;
  }

  // 数字 → 枚举
  if (typeof raw === "number" && raw in OrderStatusNumberMap) {
    return OrderStatusNumberMap[raw];
  }

  return OrderStatusEnum.UNPAID;
};

/**
 * 订单状态文案
 */
export const OrderStatusLabel: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: "待付款",
  [OrderStatusEnum.PAID]: "待发货",
  [OrderStatusEnum.SHIPPED]: "已发货",
  [OrderStatusEnum.COMPLETED]: "已完成",
  [OrderStatusEnum.CANCELLED]: "已取消",
  [OrderStatusEnum.CLOSED]: "已关闭",
  [OrderStatusEnum.SERVICING]: "售后中",
};

/**
 * 订单状态 → CSS 类名
 */
export const OrderStatusClass: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: "pending-payment",
  [OrderStatusEnum.PAID]: "pending-ship",
  [OrderStatusEnum.SHIPPED]: "shipped",
  [OrderStatusEnum.COMPLETED]: "completed",
  [OrderStatusEnum.CANCELLED]: "cancelled",
  [OrderStatusEnum.CLOSED]: "closed",
  [OrderStatusEnum.SERVICING]: "servicing",
};

export const OrderDetailStatusClass: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: "unpaid",
  [OrderStatusEnum.PAID]: "paid",
  [OrderStatusEnum.SHIPPED]: "shipped",
  [OrderStatusEnum.COMPLETED]: "completed",
  [OrderStatusEnum.CANCELLED]: "cancelled",
  [OrderStatusEnum.CLOSED]: "closed",
  [OrderStatusEnum.SERVICING]: "servicing",
};


/**
 * 订单状态 → 状态颜色映射
 */
export const OrderStatusColorMap: Record<OrderStatusEnum, string> = {
  [OrderStatusEnum.UNPAID]: "#fa436a", // 待付款 - 红色，突出显示
  [OrderStatusEnum.PAID]: "#e6a23c", // 待发货 - 橙色
  [OrderStatusEnum.SHIPPED]: "#409eff", // 已发货 - 蓝色
  [OrderStatusEnum.COMPLETED]: "#67c23a", // 已完成 - 绿色
  [OrderStatusEnum.CANCELLED]: "#909399", // 已取消 - 灰色
  [OrderStatusEnum.CLOSED]: "#909399", // 已关闭 - 灰色
  [OrderStatusEnum.SERVICING]: "#67c23a", // 已完成 - 绿色
};

// 状态颜色映射
const statusColorMap = {
  0: "#e6a23c", // 待发货 - 橙色
  1: "#fa436a", // 待付款 - 红色，突出显示
  2: "#e6a23c", // 待发货 - 橙色
  3: "#409eff", // 已发货 - 蓝色
  4: "#67c23a", // 已完成 - 绿色
  5: "#909399", // 已关闭 - 灰色
  6: "#909399", // 已取消 - 灰色
};

/**
 * 订单状态数值数组（uni-app 最安全用法）
 */
export const ORDER_STATUS_VALUES = [
  OrderStatusEnum.UNPAID,
  OrderStatusEnum.PAID,
  OrderStatusEnum.SHIPPED,
  OrderStatusEnum.COMPLETED,
  OrderStatusEnum.CANCELLED,
  OrderStatusEnum.CLOSED,
  OrderStatusEnum.SERVICING,
];

export const PENDING_STATUSES = [OrderStatusEnum.UNPAID, OrderStatusEnum.PAID, OrderStatusEnum.SERVICING];
