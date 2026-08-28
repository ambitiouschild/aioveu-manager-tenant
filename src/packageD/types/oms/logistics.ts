/**
 * 快递公司编码（与后端 DeliveryCompanyCodeEnum 一一对应）
 */

/**
 * 物流类型枚举（对应后端 LogisticsTypeEnum）
 */
export enum LogisticsType {
  PHYSICAL       = 1,  // 物流配送
  VIRTUAL        = 2,  // 无需物流（虚拟商品）
  SELF_PICKUP    = 3,  // 到店自提
  LOCAL_DELIVERY = 4,  // 同城配送
  UNKNOWN        = 8,  // 未知
}

export type FilterMode = "single" | "pending" | "all";

/**
 * 物流类型展示映射
 */
export const LOGISTICS_TYPE_LABEL: Record<LogisticsType, string> = {
  [LogisticsType.PHYSICAL]:       '物流配送',
  [LogisticsType.VIRTUAL]:        '无需物流',
  [LogisticsType.SELF_PICKUP]:   '到店自提',
  [LogisticsType.LOCAL_DELIVERY]: '同城配送',
  [LogisticsType.UNKNOWN]:       '未知',
};


/**
 * 快递公司（对应后端 DeliveryCompanyCodeEnum）
 */
export interface LogisticsCompany {
  /** 后端 code（int 对应的序号，0=自提 1=顺丰 ...） */
  code: number;
  /** 后端 value（微信发货用的编码字符串） */
  value: string;
  /** 展示名称 */
  label: string;
  /** 微信发货 logistics_type 映射 */
  logisticsType: number;
}

/**
 * 物流公司字典
 * ⚠️ 顺序和值与后端 LogisticsCompanyCodeEnum 保持一致
 */
export const LOGISTICS_COMPANIES: LogisticsCompany[] = [
  { code: 0, value: "SELF_PICKUP", label: "买家自提", logisticsType: LogisticsType.SELF_PICKUP },
  { code: 1, value: "SF", label: "顺丰速运", logisticsType: LogisticsType.PHYSICAL },
  { code: 2, value: "ZTO", label: "中通快递", logisticsType: LogisticsType.PHYSICAL },
  { code: 3, value: "YTO", label: "圆通速递", logisticsType: LogisticsType.PHYSICAL },
  { code: 4, value: "YD", label: "韵达快递", logisticsType: LogisticsType.PHYSICAL },
  { code: 5, value: "STO", label: "申通快递", logisticsType: LogisticsType.PHYSICAL },
  { code: 6, value: "JD", label: "京东物流", logisticsType: LogisticsType.PHYSICAL },
  { code: 7, value: "EMS", label: "邮政EMS", logisticsType: LogisticsType.PHYSICAL },
  { code: 8, value: "JTSD", label: "极兔速递", logisticsType: LogisticsType.PHYSICAL },
  { code: 9, value: "DBLK", label: "德邦快递", logisticsType: LogisticsType.PHYSICAL },
  { code: 10, value: "UNKNOWN", label: "未知快递", logisticsType: LogisticsType.UNKNOWN },
];

// ============ 工具方法（跟后端 fromCode / fromValue 对齐） ============

/** 根据 code(int) 查找 → 对应后端 fromCode() */
export const getLogisticsCompanyByCode = (code: number | null | undefined): LogisticsCompany | null => {
  if (code == null) return null;
  return LOGISTICS_COMPANIES.find((c) => c.code === code) ?? null;
};

/** 根据 value(string) 查找 → 对应后端 fromValue() */
export const getLogisticsCompanyByValue = (value: string | null | undefined): LogisticsCompany => {
  if (!value) return LOGISTICS_COMPANIES[10]; // UNKNOWN
  return LOGISTICS_COMPANIES.find((c) => c.value === value) ?? LOGISTICS_COMPANIES[10];
};

/** 根据 value 获取微信 logistics_type */
export const getLogisticsTypeByValue = (value: string | null | undefined): number => {
  return getLogisticsCompanyByValue(value).logisticsType;
};

/** 获取所有实体物流公司（排除自提和未知，用于 picker） */
export const getPhysicalCompanies = (): LogisticsCompany[] => {
  return LOGISTICS_COMPANIES.filter(c => c.logisticsType === LogisticsType.PHYSICAL);
};

/** 获取物流类型文案 */
export const getLogisticsTypeLabel = (type: LogisticsType | null | undefined): string => {
  if (type == null) return '未知';
  return LOGISTICS_TYPE_LABEL[type] ?? '未知';
};


/**
 * 发货请求参数（对应后端 ShipOrderReqDTO）
 */
export interface ShipOrderRequest {
  /** 物流公司名称（对应后端 logisticsCompany） */
  logisticsCompany?: string; // "顺丰速运"

  /** 物流公司编码（对应后端 expressCompanyCode，传 string 值如 "SF"） */
  logisticsCompanyCode?: string; // "SF"

  /** 运单号 */
  trackingNo?: string;

  /** 物流类型（对应后端 logisticsType，传 number 如 3） */
  logisticsType: number; // 1/2/3/4

  /** 发货备注 */
  remark?: string;
}
