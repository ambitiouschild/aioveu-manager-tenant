import request from "@/utils/request";
import { request2 } from "@/utils/request";  // named export
const OMSORDER_BASE_URL = "/aioveu-tenant-oms/app-api/v1/orders";

// 订单状态枚举
export const OrderStatus = {
  PENDING_PAYMENT: 0, // 待付款
  PENDING_SHIP: 1, // 待发货
  SHIPPED: 2, // 已发货
  COMPLETED: 3, // 已完成
  CANCELLED: 4, // 已取消
  REFUNDING: 5, // 退款中
  REFUNDED: 6, // 已退款
};

// 订单列表（分页）
export const listOrdersWithPage = (params: any) => {
  return request2({
    url: OMSORDER_BASE_URL,
    method: "POST",
    data: params,
    header: {
      auth: true, // 需要认证
    },
  });
};

// 订单列表（分页）
export const getOrderStatistics = (params: any) => {
  return request2({
    url: `${OMSORDER_BASE_URL}/statistics`,
    method: "POST",
    data: params,
    header: {
      auth: true, // 需要认证
    },
  });
};

// 订单确认
export const confirmOrder = (skuId : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/confirm`,
    method: "POST",
    data: { skuId },
    header: {
      auth: true,
    },
  });
};

// 订单提交
export const submitOrder = (data : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/submit`,
    method: "POST",
    data,
    header: {
      auth: true,
    },
  });
};

// 订单支付
export const payOrder = (data: any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/payment`,
    method: "POST",
    data,
    header: {
      auth: true,
    },
  });
};

// 取消订单
export const cancelOrder = (orderId : any, reason : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/cancel`,
    method: "PUT",
    data: {
      id: orderId,
      cancelReason: reason, // 添加取消原因字段
    },
    header: {
      auth: true,
    },
  });
};

// 删除订单
export const deleteOrder = (orderId : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/${orderId}`,
    method: "DELETE",
    header: {
      auth: true,
    },
  });
};

// 申请退款
export const applyRefund = (data : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/apply-refund`,
    method: "POST",
    data,
    header: {
      auth: true,
    },
  });
};

// 获取退款详情
export const getRefundDetail = (orderId : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/refund-detail/${orderId}`,
    method: "GET",
    header: {
      auth: true,
    },
  });
};

// 取消退款
export const cancelRefund = (refundId: any) => {
  return request({
    url: `/aioveu-oms/app-api/v1/orders/cancel-refund/${refundId}`,
    method: "POST",
    header: {
      auth: true,
    },
  });
};

// 发货 单订单发货（人工）
export const shipOrder = (
  orderSn: string,
  data: {
    logisticsCompany: string;
    trackingNo: string;
    remark?: string;
  }
) => {
  return request2({
    url: `${OMSORDER_BASE_URL}/${orderSn}/ship`,
    method: "POST",
    data,
    header: {
      auth: true,
    },
  });
};

// 批量发货
export const batchShipOrder = (data : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/batch-ship`,
    method: "POST",
    data,
    header: {
      auth: true,
    },
  });
};

// 确认收货（商家确认用户已收货）
export const confirmReceipt = (orderId : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/${orderId}/confirm-receipt`,
    method: "POST",
    header: {
      auth: true,
    },
  });
};

// 获取订单详情
export const getOrderDetail = (orderId: any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/${orderId}`,
    method: "GET",
    header: {
      auth: true,
    },
  });
};

const PayFlowAPI = {
  /** 获取支付流水分页数据 */

};

// 获取订单统计
export const getOrderStats = (params : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/stats`,
    method: "GET",
    data: params,
    header: {
      auth: true,
    },
  });
};

// 导出订单
export const exportOrders = (params : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/export`,
    method: "GET",
    data: params,
    responseType: "blob", // 如果需要处理文件下载
    header: {
      auth: true,
    },
  });
};

// 打印订单
export const printOrder = (orderId: any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/${orderId}/print`,
    method: "GET",
    header: {
      auth: true,
    },
  });
};

// 更新物流信息
export const updateLogistics = (data: any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/update-logistics`,
    method: "PUT",
    data,
    header: {
      auth: true,
    },
  });
};

// 获取物流追踪
export const getLogisticsTrace = (orderId: any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/${orderId}/logistics-trace`,
    method: "GET",
    header: {
      auth: true,
    },
  });
};

// 订单备注
export const updateOrderRemark = (orderId: any, remark: any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/${orderId}/remark`,
    method: "PUT",
    data: { remark },
    header: {
      auth: true,
    },
  });
};

// 根据日期范围获取订单
export const getOrdersByDateRange = (startDate : any, endDate : any, status : any) => {
  return request({
    url: OMSORDER_BASE_URL,
    method: "GET",
    data: {
      startDate,
      endDate,
      status,
      pageNum: 1,
      pageSize: 1000, // 大数字获取所有
    },
    header: {
      auth: true,
    },
  });
};

// 获取待处理订单数量
export const getPendingOrderCount = () => {
  return request({
    url: `${OMSORDER_BASE_URL}/pending-count`,
    method: "GET",
    header: {
      auth: true,
    },
  });
};

// 获取今日订单统计
export const getTodayOrderStats = () => {
  return request({
    url: `${OMSORDER_BASE_URL}/today-stats`,
    method: "GET",
    header: {
      auth: true,
    },
  });
};

// 修改收货地址
export const updateOrderAddress = (orderId: any, addressData: any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/${orderId}/address`,
    method: "PUT",
    data: addressData,
    header: {
      auth: true,
    },
  });
};

// 处理退款申请
export const processRefund = (refundId : any, action : any, reason : any) => {
  return request({
    url: `${OMSORDER_BASE_URL}/process-refund/${refundId}`,
    method: "POST",
    data: { action, reason }, // action: 'approve' 或 'reject'
    header: {
      auth: true,
    },
  });
};

export default {
  // 订单状态
  OrderStatus,

  // 订单列表
  listOrdersWithPage,
  getOrdersByDateRange,

  // 订单操作
  confirmOrder,
  submitOrder,
  payOrder,
  cancelOrder,
  deleteOrder,
  shipOrder,
  batchShipOrder,
  confirmReceipt,
  updateLogistics,
  updateOrderRemark,
  updateOrderAddress,

  // 订单详情
  getOrderDetail,
  getLogisticsTrace,

  // 退款相关
  applyRefund,
  getRefundDetail,
  cancelRefund,
  processRefund,

  // 统计相关
  getOrderStats,
  getTodayOrderStats,
  getPendingOrderCount,

  // 其他功能
  exportOrders,
  printOrder,
};
