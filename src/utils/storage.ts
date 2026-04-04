import { STORAGE_KEYS, APP_PREFIX } from "@/constants";


//你的 Storage类直接使用了 localStorage和 sessionStorage，这在微信小程序环境中是不可用的。
// 微信小程序使用的是自己的存储 API：wx.setStorageSync()和 wx.getStorageSync()。


/**
 * 存储工具类
 *
 * @description
 * 提供 localStorage 和 sessionStorage 的统一操作接口
 * 支持自动 JSON 序列化/反序列化
 *
 * @author 有来技术团队
 */
export class Storage {
  // ==================== 兼容 Web 和小程序的存储工具 操作 ====================


  /**
   * 获取存储值
   */
  static get<T>(key: string, defaultValue ?: T): T {
    // #ifdef MP-WEIXIN
    try {
      const value = uni.getStorageSync(key);
      if (value === undefined || value === null) return defaultValue as T;

      // 如果是JSON字符串，尝试解析
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value as unknown as T;
        }
      }
      return value;
    } catch (e) {
      console.error('getStorage error:', e);
      return defaultValue as T;
    }
    // #endif

    // #ifdef H5
    const value:any = localStorage.getItem(key);
    if (value === null) return defaultValue as T;

    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
    // #endif
  }


  /**
   * 设置存储值
   */
  static set(key:string, value:any): void {
    const val = typeof value === 'object' ? JSON.stringify(value) : value;

    // #ifdef MP-WEIXIN
    try {
      uni.setStorageSync(key, val);
    } catch (e) {
      console.error('setStorage error:', e);
    }
    // #endif

    // #ifdef H5
    try {
      localStorage.setItem(key, val);
    } catch (e) {
      console.error('setStorage error:', e);
    }
    // #endif
  }

  /**
   * 删除存储值
   */
  static remove(key:string): void {
    // #ifdef MP-WEIXIN
    try {
      uni.removeStorageSync(key);
    } catch (e) {
      console.error('removeStorage error:', e);
    }
    // #endif

    // #ifdef H5
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('removeStorage error:', e);
    }
    // #endif
  }

  // ==================== sessionStorage 操作 ====================

  /**
   * sessionStorage 获取（小程序用普通存储模拟）
   */
  static sessionGet<T>(key:string, defaultValue ?: T): T  {
    // #ifdef MP-WEIXIN
    // 小程序没有真正的sessionStorage，我们用带session前缀的key来模拟
    return this.get(`session_${key}`, defaultValue);
    // #endif

    // #ifdef H5
    const value:any = sessionStorage.getItem(key);
    if (value === null) return defaultValue as T;

    try {
      return JSON.parse(value);
    } catch {

      // 如果解析失败，返回原始字符串
      return value as unknown as T;
    }
    // #endif
  }

  /**
   * sessionStorage 设置
   */
  static sessionSet(key:string, value:any): void  {
    const val = typeof value === 'object' ? JSON.stringify(value) : value;

    // #ifdef MP-WEIXIN
    this.set(`session_${key}`, val);
    // #endif

    // #ifdef H5
    try {
      sessionStorage.setItem(key, val);
    } catch (e) {
      console.error('sessionSet error:', e);
    }
    // #endif
  }

  /**
   * sessionStorage 删除
   */
  static sessionRemove(key:string): void {
    // #ifdef MP-WEIXIN
    this.remove(`session_${key}`);
    // #endif

    // #ifdef H5
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.error('sessionRemove error:', e);
    }
    // #endif
  }

  // ==================== 批量清理操作 ====================

  /**
   * 清理指定键的存储（localStorage + sessionStorage）
   */
  /**
   * 清理指定键的存储
   */
  static clear(key:string): void {
    this.remove(key);
    this.sessionRemove(key);
  }

  /**
   * 批量清理存储
   */
  static clearMultiple(keys: string[]): void  {
    keys.forEach((key:any) => {
      this.remove(key);
      this.sessionRemove(key);
    });
  }

  /**
   * 清理指定前缀的存储
   *
   * @example
   * ```ts
   * // 清理所有认证相关的存储
   * Storage.clearByPrefix('vea:auth:');
   * ```
   */
  static clearByPrefix(prefix: string): void {
    // localStorage 清理
    const localKeys = Object.keys(localStorage).filter((key) => key.startsWith(prefix));
    localKeys.forEach((key) => localStorage.removeItem(key));

    // sessionStorage 清理
    const sessionKeys = Object.keys(sessionStorage).filter((key) => key.startsWith(prefix));
    sessionKeys.forEach((key) => sessionStorage.removeItem(key));
  }

  /**
   * 清理指定前缀的存储
   */
  static clearByPrefix2(prefix:any) {
    // 这个方法在H5中有效，在小程序中较难实现
    // 在小程序中，我们需要知道所有可能的key
    console.warn('clearByPrefix 在小程序中功能有限');
  }

  /**
   * 清理所有项目相关的存储
   */
  static clearAllProject() {
    const allKeys = Object.values(STORAGE_KEYS);
    this.clearMultiple(allKeys);
  }

  /**
   * 获取所有项目相关的存储键
   */
  static getAllProjectKeys(): string[] {
    return Object.values(STORAGE_KEYS);
  }
}
