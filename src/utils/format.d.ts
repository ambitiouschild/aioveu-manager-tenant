// format.d.ts
declare module '@/utils/format' {
  export const formatMoney: (amount: number | string | undefined, decimals?: number) => string;
  export const formatDate: (date: Date | string | number, format?: string) => string;
  export const formatDateTime: (date: Date | string | number) => string;
  export const formatShortDateTime: (date: Date | string | number) => string;
  export const formatNumber: (num: number | string | undefined) => string;
  export const formatPhone: (phone: string) => string;
  export const formatIdCard: (idCard: string) => string;
  export const formatBankCard: (cardNo: string) => string;
  export const formatFileSize: (bytes: number, decimals?: number) => string;
  export const formatDuration: (seconds: number) => string;
  export const formatOrderStatus: (status: number) => string;
  export const formatOrderStatusClass: (status: number) => string;
  export const getRelativeTime: (date: Date | string | number) => string;
  export const debounce: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);
  export const throttle: <T extends (...args: any[]) => any>(func: T, wait: number) => ((...args: Parameters<T>) => void);
  export const deepClone: <T>(obj: T) => T;
  export const generateRandomString: (length?: number) => string;
  export const generateOrderNo: () => string;
}
