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
