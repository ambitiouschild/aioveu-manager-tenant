/**
 * Order 对象的完整 TypeScript 定义
 */

import { OrderStatusEnum } from "@/packageD/enums/OrderStatusEnum";

/** OrderItemVO */
export interface OrderItemVO {
  orderId: number;
  skuId: number;
  skuSn: string;
  spuName: string;
  skuName: string;
  picUrl: string;
  price: number; // 单价（分）
  quantity: number; // 数量
  totalAmount: number; // 小计金额（分）
  [key: string]: any; // 允许其他扩展字段
}

/** OrderVO  */
export interface OrderVO {
  // 订单基本信息
  id: number;
  orderSn: string;
  totalAmount: number; // 订单总金额（分）
  paymentAmount: number; // 支付金额（分）
  paymentMethodLabel: string | null; // 支付方式标签

  // 订单状态
  status: OrderStatusEnum; // 状态值: 0-待付款, 1-待发货, 2-已发货, 3-已完成, 4-已取消
  statusLabel: string; // 状态标签: "待付款", "待发货" 等

  // 商品信息
  totalQuantity: number; // 商品总数
  spuName: string; // 商品名称（通常是第一个商品）
  picUrl: string; // 商品图片（通常是第一个商品）

  // 时间信息
  createTime: string; // 创建时间，格式: "2026/05/01 23:31:43"

  // 订单来源
  sourceLabel: string; // 订单来源标签: "APP", "PC" 等

  // 其他信息
  remark: string; // 订单备注
  // 收货人姓名
  receiverName: string;
  // 收货人电话
  receiverPhone: string;
  // 完整收货地址
  fullAddress: string;

  // 商品列表
  orderItems: OrderItemVO[]; // 订单商品项列表

  // 扩展字段（如果接口返回了这些字段）
  memberId?: number; // 会员ID
  userPhone?: string; // 用户手机号
  userNickname?: string; // 用户昵称

  [key: string]: any; // 允许其他扩展字段
}


