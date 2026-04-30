/**
 * 格式化工具模块
 */

/**
 * 格式化金额
 * @param amount 金额（分）
 * @param decimals 小数位数
 * @returns 格式化后的金额字符串
 */
export const formatMoney = (amount: number | string | undefined, decimals: number = 2): string => {
  if (amount === undefined || amount === null || amount === "") {
    return "0.00";
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "0.00";
  }

  // 如果金额是分，转换为元
  const yuanAmount = numAmount / 100;

  return yuanAmount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

/**
 * 格式化日期
 * @param date 日期对象或日期字符串
 * @param format 格式，默认 'YYYY-MM-DD'
 * @returns 格式化后的日期字符串
 */
export const formatDate = (date: Date | string | number, format: string = "YYYY-MM-DD"): string => {
  if (!date) {
    return "";
  }

  const d = typeof date === "string" || typeof date === "number" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return "";
  }

  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");
  const seconds = d.getSeconds().toString().padStart(2, "0");

  return format
    .replace("YYYY", year.toString())
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

/**
 * 格式化日期时间
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (date: Date | string | number): string => {
  return formatDate(date, "YYYY-MM-DD HH:mm:ss");
};

/**
 * 格式化日期时间（短格式）
 * @param date 日期对象或日期字符串
 * @returns 格式化后的日期时间字符串
 */
export const formatShortDateTime = (date: Date | string | number): string => {
  return formatDate(date, "MM-DD HH:mm");
};

/**
 * 格式化数字（千分位）
 * @param num 数字
 * @returns 格式化后的数字字符串
 */
export const formatNumber = (num: number | string | undefined): string => {
  if (num === undefined || num === null || num === "") {
    return "0";
  }

  const n = typeof num === "string" ? parseFloat(num) : num;

  if (isNaN(n)) {
    return "0";
  }

  return n.toLocaleString("zh-CN");
};

/**
 * 格式化手机号
 * @param phone 手机号
 * @returns 格式化后的手机号
 */
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) {
    return phone || "";
  }

  return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1 **** $3");
};

/**
 * 格式化身份证号
 * @param idCard 身份证号
 * @returns 格式化后的身份证号
 */
export const formatIdCard = (idCard: string): string => {
  if (!idCard || idCard.length !== 18) {
    return idCard || "";
  }

  return idCard.replace(/(\d{6})(\d{8})(\d{4})/, "$1********$3");
};

/**
 * 格式化银行卡号
 * @param cardNo 银行卡号
 * @returns 格式化后的银行卡号
 */
export const formatBankCard = (cardNo: string): string => {
  if (!cardNo) {
    return "";
  }

  // 每4位加一个空格
  return cardNo
    .replace(/\s/g, "")
    .replace(/(\d{4})/g, "$1 ")
    .trim();
};

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @param decimals 小数位数
 * @returns 格式化后的文件大小
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * 格式化时长
 * @param seconds 秒数
 * @returns 格式化后的时长
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}秒`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}分${secs > 0 ? `${secs}秒` : ""}`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}小时${minutes > 0 ? `${minutes}分` : ""}`;
  }
};

/**
 * 格式化订单状态
 * @param status 状态码
 * @returns 状态文本
 */
export const formatOrderStatus = (status: number): string => {
  const statusMap: Record<number, string> = {
    0: "待付款",
    1: "待发货",
    2: "已发货",
    3: "已完成",
    4: "已取消",
    5: "退款中",
    6: "已退款",
  };

  return statusMap[status] || "未知状态";
};

/**
 * 格式化订单状态样式类
 * @param status 状态码
 * @returns 样式类名
 */
export const formatOrderStatusClass = (status: number): string => {
  const statusClassMap: Record<number, string> = {
    0: "status-pending-payment",
    1: "status-pending-ship",
    2: "status-shipped",
    3: "status-completed",
    4: "status-cancelled",
    5: "status-refunding",
    6: "status-refunded",
  };

  return statusClassMap[status] || "status-unknown";
};

/**
 * 获取相对时间
 * @param date 日期
 * @returns 相对时间字符串
 */
export const getRelativeTime = (date: Date | string | number): string => {
  const now = new Date();
  const target = typeof date === "string" || typeof date === "number" ? new Date(date) : date;

  if (isNaN(target.getTime())) {
    return "";
  }

  const diff = now.getTime() - target.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return "刚刚";
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return formatDate(target, "YYYY-MM-DD");
  }
};

/**
 * 防抖函数
 * @param func 函数
 * @param wait 等待时间
 * @returns 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * 节流函数
 * @param func 函数
 * @param wait 等待时间
 * @returns 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let previous = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      previous = now;
      func(...args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func(...args);
      }, remaining);
    }
  };
};

/**
 * 深拷贝
 * @param obj 要拷贝的对象
 * @returns 拷贝后的对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as T;
  }

  if (typeof obj === "object") {
    const clonedObj: Record<string, any> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = deepClone((obj as Record<string, any>)[key]);
      }
    }
    return clonedObj as T;
  }

  return obj;
};

/**
 * 生成随机字符串
 * @param length 长度
 * @returns 随机字符串
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
};

/**
 * 生成订单号
 * @returns 订单号
 */
export const generateOrderNo = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}${random}`;
};

export default {
  formatMoney,
  formatDate,
  formatDateTime,
  formatShortDateTime,
  formatNumber,
  formatPhone,
  formatIdCard,
  formatBankCard,
  formatFileSize,
  formatDuration,
  formatOrderStatus,
  formatOrderStatusClass,
  getRelativeTime,
  debounce,
  throttle,
  deepClone,
  generateRandomString,
  generateOrderNo,
};
