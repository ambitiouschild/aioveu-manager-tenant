import request from "@/utils/request";
import type { LoginRequest, LoginResponse, CaptchaInfo } from "@/types/api/auth";
import type { TenantItem  } from "@/types/api";
import {CLIENT_CONFIG, getClientId} from "@/utils/clientManager";


const AUTH_BASE_URL = "/aioveu-tenant-auth/api/v1/auth";
const AUTH_LOGIN_URL = "/aioveu-tenant-auth";

const AUTHMANAGERAPP_BASE_URL = "/aioveu-tenant-auth/app-api/v1/auth";

const AuthAPI = {
  /**
   * 登录接口
   *
   * @param username 用户名
   * @param password 密码
   * @returns 返回 token
   */
  login(data: LoginFormData): Promise<LoginResult> {
    console.log("登录接口data：{}", data);
    const payload: Record<string, any> = {
      username: data.username,
      password: data.password,
      captchaId: data.captchaId,
      captchaCode: data.captchaCode,
      grant_type: "password",  //获取授权类型grant_type
    };

    // tenantId is optional — include only when provided (multi-tenant feature)
    if (typeof data.tenantId !== "undefined") {
      payload.tenantId = data.tenantId;
    }

    console.log("打印payload：{}",payload);


    return request<LoginResult>({
      url: `${AUTH_LOGIN_URL}/oauth2/token`,
      method: "POST",
      data: payload,
      header: {
        "Content-Type": "multipart/form-data",
        Authorization: "Basic bWFsbC1hZG1pbjoxMjM0NTY=", // 客户端信息Base64明文：mall-admin:123456
      },
    }).then(response => {
      console.log("✅ 登录响应:", response);
      return response;
    }).catch(error => {
      console.error("❌ 登录错误:", error);
      throw error;
    });
  },

  /** 一次查询获取用户名在所有租户中的可访问租户  方案1：使用模板字符串（推荐）*/
  getAccessibleTenantsByUsername(username: String) {
    return request<TenantItem[]>({
      url: `${AUTH_BASE_URL}/tenants/${username}`,  // 使用模板字符串
      method: "GET",
      // 不需要params了，因为username已经在URL中了
    });
  },

  /**
   * 微信登录接口
   *
   * @param code 微信登录code
   * @returns 返回 token
   */
  wechatLogin(code: string): Promise<LoginResult> {
    return request<LoginResult>({
      url: "/api/v1/auth/wechat-login",
      method: "POST",
      data: { code },
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  /**
   * 登出接口
   */
  logout(): Promise<void> {
    return request({
      url: `${AUTH_BASE_URL}/logout`,
      method: "DELETE",
    });
  },

  /** 获取验证码接口*/
  getCaptcha() {
    return request<CaptchaInfo>({
      url: `${AUTH_BASE_URL}/captcha`,
      method: "GET",
    });
  },


  //----------------------------

  /** 获取用户的工作台菜单*/
  getWorkbenchCategoriesWithItems() {

    const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
    console.log("登录使用客户端ID:", clientId);

    return request({
      url: `${AUTHMANAGERAPP_BASE_URL}/manager-categories-with-items?clientId=${clientId}`,
      method: "GET",
    });
  },


  /** 获取管理端首页分类*/
  getManagerHomeCategories() {

    const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
    console.log("登录使用客户端ID:", clientId);

    return request({
      url: `${AUTHMANAGERAPP_BASE_URL}/manager-home-categories?clientId=${clientId}`,
      method: "GET",
    });
  },

  /** 获取管理端首页滚播栏*/
  getManagerMenuHomeBanners() {

    const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
    console.log("登录使用客户端ID:", clientId);

    return request({
      url: `${AUTHMANAGERAPP_BASE_URL}/manager-home-banner?clientId=${clientId}`,
      method: "GET",
    });
  },
};

export default AuthAPI;

/** 登录响应 */
export interface LoginResult {
  /** 访问token */
  accessToken: string;
  /** token 类型 */
  tokenType?: string;

  /** 访问令牌 */
  access_token: string;
  /** 刷新令牌 */
  refresh_token: string;

  /** 过期时间(单位:秒) */
  expiresIn: number;
}

export interface LoginFormData {
  username: string;
  password: string;

  /** 验证码缓存key */
  captchaId?: string;
  /** 验证码 */
  captchaCode?: string;
  /** 记住我 */
  rememberMe?: boolean;
  /** 租户ID */
  tenantId?: number;
}
