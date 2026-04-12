import { defineStore } from "pinia";
import { store } from "@/store";
import AuthAPI, { type LoginFormData } from "@/api/auth";
import UserAPI, { type UserInfo } from "@/api/system/user";
import {
  setToken,
  getToken,
  getUserInfo,
  setUserInfo,
  clearAll ,
  setPermissions,
  getPermissions,

  setRefreshToken,
  getRefreshToken,
  getTokenExpiresAt,
  setTokenExpiresAt

} from "@/utils/cache";

import { AuthStorage } from "@/utils/auth.storage";

export const useUserStore = defineStore("user", () => {

  // 状态
  const token = ref(getToken() || '');
  const refreshToken = ref(getRefreshToken() || '');
  const tokenExpiresAt = ref(getTokenExpiresAt() || 0);

  const userInfo = ref<UserInfo | undefined>(getUserInfo());
  const permissions = ref<string[]>([]); // 新增权限列表字段
  const hasLogin = computed(() => !!token.value);

  const isRefreshing = ref(false); // 是否正在刷新令牌
  const refreshQueue: any[] = []; // 刷新队列


  // Getters
  const userId = computed(() => userInfo.value?.id || null);
  const nickName = computed(() => userInfo.value?.nickName || '');
  const userName = computed(() => userInfo.value?.username || userInfo.value?.nickName || '');
  const avatar = computed(() => userInfo.value?.avatar || '');

  // 记住我状态
  const rememberMe = ref(AuthStorage.getRememberMe());


  // 检查token是否即将过期（提前5分钟）
  const isTokenExpiring = computed(() => {
    if (!tokenExpiresAt.value) return true;
    const now = Date.now();
    return tokenExpiresAt.value - now < 5 * 60 * 1000; // 5分钟
  });

  // 检查token是否已过期
  const isTokenExpired = computed(() => {
    if (!tokenExpiresAt.value) return true;
    return Date.now() > tokenExpiresAt.value;
  });


  // 保存令牌到状态和缓存，保存过期时间
  const saveTokens = (data: any) => {


    const accessToken = data.access_token || data.accessToken;
    const refreshTokenValue = data.refresh_token || data.refreshToken;
    const expiresIn = data.expires_in || 86400; // 默认24小时


    if (!accessToken) {
      console.error("登录返回中没有找到access_token字段");
      return;
    }

    if (accessToken) {
      token.value = accessToken;  //将token添加到状态
      setToken(accessToken);  //将token添加到缓存

      if (refreshTokenValue) {
        refreshToken.value = refreshTokenValue;
        setRefreshToken(refreshTokenValue);
      }

      // 计算过期时间
      const expiresAt = Date.now() + expiresIn * 1000;
      tokenExpiresAt.value = expiresAt;
      setTokenExpiresAt(expiresAt.toString());
    }
  };


  // 刷新令牌
  const refreshAccessToken = async (): Promise<string> => {
    const currentRefreshToken = refreshToken.value;

    if (!currentRefreshToken) {
      console.error("没有刷新令牌，需要重新登录");
      throw new Error("NO_REFRESH_TOKEN");
    }

    // 如果已经在刷新中，加入队列等待
    if (isRefreshing.value) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
    }

    isRefreshing.value = true;

    try {
      console.log("开始刷新访问令牌...");
      const response = await AuthAPI.refreshToken(currentRefreshToken);

      // 保存新的令牌
      saveTokens(response);
      console.log("令牌刷新成功");

      // 处理等待队列中的请求
      refreshQueue.forEach(item => item.resolve(response.access_token || response.accessToken));
      refreshQueue.length = 0; // 清空队列

      return response.access_token || response.accessToken;
    } catch (error: any) {
      console.error("刷新令牌失败:", error);

      // 刷新失败，需要重新登录
      if (error.response?.status === 401 ||
        error.code === 'INVALID_REFRESH_TOKEN' ||
        error.message?.includes('invalid_token')) {
        console.log("刷新令牌无效，清除登录状态");
        logout();
      }

      // 处理等待队列中的请求
      refreshQueue.forEach(item => item.reject(error));
      refreshQueue.length = 0;

      throw error;
    } finally {
      isRefreshing.value = false;
    }
  };


  // 获取有效的访问令牌（会自动刷新）
  const getValidToken = async (): Promise<string> => {
    // 如果没有token，需要登录
    if (!token.value) {
      throw new Error("NOT_LOGGED_IN");
    }

    // 检查token是否即将过期
    if (isTokenExpiring.value && refreshToken.value) {
      console.log("访问令牌即将过期，自动刷新...");
      return await refreshAccessToken();
    }

    // 检查token是否已过期
    if (isTokenExpired.value) {
      console.log("访问令牌已过期，尝试刷新...");
      return await refreshAccessToken();
    }

    // token有效，直接返回
    return token.value;
  };




  // 登录
  const login = (loginRequest: LoginFormData) => {
    return new Promise((resolve, reject) => {
      AuthAPI.login(loginRequest)
        .then((data) => {


          console.log("登录返回数据:", data);

          // 保存令牌
          saveTokens(data);
          console.log("微信登录成功，保存令牌到状态和缓存，保存过期时间成功");

          // 保存记住我状态和token
          rememberMe.value = loginRequest.rememberMe ?? false;

          resolve(data);
        })
        .catch((error) => {
          console.error("登录失败", error);
          reject(error);
        });
    });
  };

  // 微信登录
  const loginByWechat = (code: string) => {
    return new Promise((resolve, reject) => {
      AuthAPI.wechatLogin(code)
        .then((data) => {
          console.log("微信登录返回数据:", data);

          // 保存令牌
          saveTokens(data);
          console.log("微信登录成功，保存令牌到状态和缓存，保存过期时间成功");

          resolve(data);
        })
        .catch((error) => {
          console.error("微信登录失败", error);
          reject(error);
        });
    });
  };

  // 获取用户信息
  const getInfo = () => {

    console.log("获取用户信息");

    return new Promise((resolve, reject) => {
      UserAPI.getUserInfo()
        .then((data) => {

          // // 新增权限数据处理
          // if (data.perms) {
          //   permissions.value = data.perms;
          // }
          console.log("获取用户信息成功:", data);


          // // 处理权限数据
          // if (data.perms || data.perms) {
          //   const perms = data.perms || data.perms || [];
          //   permissions.value = perms;
          //   setPermissions(perms);
          //   console.log("权限数据已保存:", perms);
          // }



          setUserInfo(data);
          userInfo.value = data;
          resolve(data);
        })
        .catch((error) => {
          console.error("获取用户信息失败", error);
          reject(error);
        });
    });
  };


  // 登出
  const logout = async () => {
    try {
      await AuthAPI.logout(); // 调用后台注销接口
    } catch (error) {
      console.error("登出失败", error);
    } finally {
      // 清除所有状态
      token.value = '';
      userInfo.value = undefined;
      permissions.value = [];


      clearAll(); // 清除本地的 token 和用户信息缓存
      userInfo.value = undefined; // 清空用户信息

      console.log("用户已退出登录");
    }
  };


  /**
   * 重置所有系统状态
   * 统一处理所有清理工作，包括用户凭证、路由、缓存等
   */
  function resetAllState() {
    // 1. 重置用户状态
    resetUserState();

    // 2. 重置其他模块状态
    // 重置路由
    // usePermissionStoreHook().resetRouter();
    // // 清除字典缓存
    // useDictStoreHook().clearDictCache();
    // // 清除标签视图
    // useTagsViewStore().delAllViews();
    //
    // // 3. 清理 WebSocket 连接
    // cleanupWebSocket();
    console.log("[UserStore] WebSocket connections cleaned up");

    return Promise.resolve();
  }

  /**
   * 重置用户状态
   * 仅处理用户模块内的状态
   */
  function resetUserState() {
    // 清除用户凭证
    AuthStorage.clearAuth();
    // 重置用户信息
    userInfo.value = {} as UserInfo;
  }


  // 判断用户信息是否完整
  const isUserInfoComplete = (): boolean => {
    if (!userInfo.value) return false;

    return !!(userInfo.value.nickName && userInfo.value.avatar);
  };

  // 检查权限
  const hasPermission = (perm: string): boolean => {
    return permissions.value.includes(perm);
  };

  // 获取所有权限
  const getPermissionsList = (): string[] => {
    return permissions.value;
  };

  // 更新用户信息
  const updateUserInfo = (info: Partial<UserInfo>) => {
    if (userInfo.value) {
      userInfo.value = { ...userInfo.value, ...info };
      setUserInfo(userInfo.value);
    }
  };


  return {

    // 状态
    token,
    userInfo,
    permissions,
    hasLogin,
    refreshToken,


    // Getters
    userId,
    nickName,
    userName,
    avatar,

    isTokenExpiring,
    refreshAccessToken,
    getValidToken,

    // permissions, // 导出权限列表
    rememberMe,
    login,
    loginByWechat,
    logout,
    resetAllState,
    getInfo,
    isUserInfoComplete,
    hasPermission, // 导出权限检查方法
    getPermissionsList,
    updateUserInfo,


  };
});

//分析问题：
// 1.指令v-has-perm的实现依赖于从store中获取的用户权限列表。
// 2.在user store中，目前并没有存储权限列表，也没有在获取用户信息的同时获取权限。
// 3. 因此，我们需要在user store中添加权限状态，并在获取用户信息时同时获取权限列表。
//解决方案：
// 1.修改user store，添加permissions状态和加载权限的方法。
// 2.在getInfo方法中，除了获取用户信息，还要获取权限列表（或者单独提供一个加载权限的方法，并在适当的时候调用）。
// 3.确保在指令中能够访问到permissions状态。
//由于用户已经调用了getInfo，但指令仍然无法识别，可能是因为权限数据没有正确存储或指令没有正确实现。
export function useUserStoreHook() {
  return useUserStore(store);
}
