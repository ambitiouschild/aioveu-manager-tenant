import request from "@/utils/request";
import type { LoginRequest, LoginResponse, CaptchaInfo } from "@/types/api/auth";
import type { TenantItem  } from "@/types/api";
import {
  CLIENT_CONFIG,
  setClientId,
  getClientId,
  clearClientId,
  detectClientId,

} from "@/utils/clientManager";

const TENANTRAPP_BASE_URL = "/aioveu/api/v8/app/tenant";

const TenantAPI = {
  //----------------------------

  /** 获取用户的工作台菜单*/
  getWorkbenchCategoriesWithItems() {
    return request({
      url: `${TENANTRAPP_BASE_URL}/manager-menu-category/categories-with-items`,
      method: "GET",
      header: {
        skipAuth: true,
      },
    });
  },

  /** 获取管理端首页分类*/
  getManagerHomeCategories() {
    return request({
      url: `${TENANTRAPP_BASE_URL}/manager-menu-home-category/page`,
      method: "GET",
      header: {
        skipAuth: true,
      },
    });
  },

  /** 获取管理端首页滚播栏*/
  getManagerMenuHomeBanners() {
    return request({
      url: `${TENANTRAPP_BASE_URL}/manager-menu-home-banner/page`,
      method: "GET",
      header: {
        skipAuth: true,
      },
    });
  },
};

export default TenantAPI;

