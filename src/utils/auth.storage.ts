import { Storage } from "./storage";
import { STORAGE_KEYS, ROLE_ROOT } from "@/constants";
import { useUserStoreHook } from "@/store/modules/user";
// import router from "@/router";
import {} from "@/types/auto-imports";

// 负责本地凭证与偏好的读写
export const AuthStorage = {
  getAccessToken(): string {
    const isRememberMe = Storage.get<boolean>(STORAGE_KEYS.REMEMBER_ME, false);
    return isRememberMe
      ? Storage.get(STORAGE_KEYS.ACCESS_TOKEN, "")
      : Storage.sessionGet(STORAGE_KEYS.ACCESS_TOKEN, "");
  },

  getRefreshToken(): string {
    const isRememberMe = Storage.get<boolean>(STORAGE_KEYS.REMEMBER_ME, false);
    return isRememberMe
      ? Storage.get(STORAGE_KEYS.REFRESH_TOKEN, "")
      : Storage.sessionGet(STORAGE_KEYS.REFRESH_TOKEN, "");
  },

  setTokens(accessToken: string, refreshToken: string, rememberMe: boolean): void {
    Storage.set(STORAGE_KEYS.REMEMBER_ME, rememberMe);
    if (rememberMe) {
      Storage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      Storage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } else {
      Storage.sessionSet(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      Storage.sessionSet(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
      Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    }
  },

  clearAuth(): void {
    Storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    Storage.remove(STORAGE_KEYS.REFRESH_TOKEN);
    Storage.sessionRemove(STORAGE_KEYS.ACCESS_TOKEN);
    Storage.sessionRemove(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getRememberMe(): boolean {
    return Storage.get<boolean>(STORAGE_KEYS.REMEMBER_ME, false);
  },

// ... 其他方法保持不变 ...

  // 保存最后选择的租户
  setLastSelectedTenant(tenant: LastSelectedTenant): void{

    const data = {
      ...tenant,
      timestamp: Date.now()
    };

    Storage.set(STORAGE_KEYS.LAST_SELECTED_TENANT, data);
  },

  // 获取最后选择的租户
  getLastSelectedTenant(): LastSelectedTenant | null {

    const data = Storage.get(STORAGE_KEYS.LAST_SELECTED_TENANT, "");
    try {
      const tenant = JSON.parse(data) as LastSelectedTenant;

      if (!data)
        return null;

      // 可选：检查是否过期（比如7天）
      if (tenant.timestamp && Date.now() - tenant.timestamp > 7 * 24 * 60 * 60 * 1000) {
        this.removeLastSelectedTenant();
        return null;
      }
      return tenant;
    } catch {
      return null;
    }
  },

  // 删除最后选择的租户
  removeLastSelectedTenant(): void  {
    Storage.remove(STORAGE_KEYS.LAST_SELECTED_TENANT);
  },



};

/**
 * 权限判断
 */
// export function hasPerm(value: string | string[], type: "button" | "role" = "button"): boolean {
//   const { roles, perms } = useUserStoreHook().userInfo;
//
//   if (!roles || !perms) {
//     return false;
//   }
//
//   // 超级管理员拥有所有权限
//   if (type === "button" && roles.includes(ROLE_ROOT)) {
//     return true;
//   }
//
//   const auths = type === "button" ? perms : roles;
//   return typeof value === "string"
//     ? auths.includes(value)
//     : value.some((perm) => auths.includes(perm));
// }

/**
 * 重定向到登录页面
 */
export async function redirectToLogin(message: string = "请重新登录"): Promise<void> {
  // ElNotification({
  //   title: "提示",
  //   message,
  //   type: "warning",
  //   duration: 3000,
  // });

  await useUserStoreHook().resetAllState();

  try {
    // 跳转到登录页，保留当前路由用于登录后跳转
    const currentPath = useRoute.currentRoute.value.fullPath;
    await useRouter.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  } catch (error) {
    console.error("Redirect to login error:", error);
    // 强制跳转，即使路由重定向失败
    window.location.href = "/login";
  }
}
export interface LastSelectedTenant {
  username: string;
  tenantId: number;
  timestamp?: number;
}
