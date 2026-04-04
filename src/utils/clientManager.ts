const CLIENT_KEY = "app-clientId";

// import {
//  CLIENT_CONFIG,
//   setClientId,
//   getClientId,
//   clearClientId,
//   detectClientId,
// } from "@/utils/clientManager";


/**
 * 方案1：创建配置常量（推荐）
 * 客户端配置常量
 */
export const CLIENT_CONFIG = {
  // 管理端ID mall-admin
  CLIENT_ID: 'mall-admin',

  //        Authorization: "Basic bWFsbC1hZG1pbjoxMjM0NTY=", // 客户端信息Base64明文：mall-admin:123456

  // 管理端密钥
  CLIENT_SECRET: '123456',

  // Base64编码的Authorization头
  getBASIC_AUTH() {
    const authString = `${this.CLIENT_ID}:${this.CLIENT_SECRET}`;

    console.log("原始认证字符串:", authString);

    try{

      // 1. 尝试浏览器 btoa
      if (typeof btoa !== 'undefined') {

        const basicAuth =  'Basic ' + btoa(authString);
        console.log("尝试浏览器 btoa ,动态生成的认证头:", basicAuth);
        return basicAuth;
      }

      // 2. 尝试 uni.base64 (通过 any 类型绕过检查)
      const uniAny = uni as any;
      if (uniAny && uniAny.base64 && typeof uniAny.base64.encode === 'function') {

        const basicAuth =  'Basic ' + uniAny.base64.encode(authString);
        console.log("尝试 uni.base64,动态生成的认证头:", basicAuth);
        return basicAuth;
      }

      // 3. 尝试微信小程序
      // #ifdef MP-WEIXIN
      // if (wx && (wx as any).base64 && typeof (wx as any).base64.encode === 'function') {
      //   return 'Basic ' + (wx as any).base64.encode(authString);
      // }
      // #endif

    }catch(e){
      console.warn('base64 编码失败，使用手动实现', e);
    }

    // 4. 手动实现  // 直接返回计算好的值
    // 直接使用计算好的值
    // 计算过程：
    // 1. 字符串: "mall-app:123456"
    // 2. Base64: "bWFsbC1hcHA6MTIzNDU2"
    // 3. 加 Basic: "Basic bWFsbC1hcHA6MTIzNDU2"
    const basicAuth = 'Basic bWFsbC1hZG1pbjoxMjM0NTY=';

    console.log("使用预计算的 basicAuth:", basicAuth);

    // 验证格式
    if (!basicAuth.startsWith('Basic ')) {
      console.error("BASIC_AUTH 格式错误!");
      return 'Basic bWFsbC1hcHA6MTIzNDU2'; // 硬编码保底
    }

    return basicAuth;
    // return 'Basic ' + btoa(authString);   // ❌ 错误：小程序没有 btoa
    //这是一个在小程序环境中遇到的错误。错误信息显示 btoa is not defined，这是因为 btoa是浏览器环境中的 API，但在小程序环境中不可用。
  }




};

/**
 * 客户端ID管理器
 * 用于管理不同租户的客户端ID
 */
// 设置客户端ID
export function setClientId(clientId: string) {
  // 存储到本地存储
  uni.setStorageSync(CLIENT_KEY, clientId);
}

// 获取客户端ID
export function getClientId(): string {
  // 从本地存储获取
  return uni.getStorageSync(CLIENT_KEY) || "";
}

// 清除 客户端ID
export function clearClientId() {
  uni.removeStorageSync(CLIENT_KEY);
}

// 自动检测客户端ID
export function detectClientId() {
  // 根据当前环境自动设置
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    if (hostname.includes('mall.')) {
      return 'mall-app';
    } else if (hostname.includes('admin.')) {
      return 'aioveu-admin';
    } else if (hostname.includes('test.')) {
      return 'test-app';
    }
  }

  // 默认客户端ID
  return 'default-app';
}

// 从URL参数获取clientId
export function getClientIdFromUrl(): any {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('clientId');
  }
  return null;
}

// 初始化客户端ID
export function init() {
  // 1. 尝试从URL参数获取
  const urlClientId = getClientIdFromUrl();
  if (urlClientId) {
    setClientId(urlClientId);
    return;
  }

  // 2. 获取已有的或默认的
  getClientId();
}





