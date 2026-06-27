import { getToken, clearAll } from "@/utils/cache";
import { ResultCodeEnum } from "@/enums/ResultCodeEnum";
import { useUserStore } from "@/store/modules/user";

import { CLIENT_CONFIG, getClientId } from "@/utils/clientManager";


//统一「刷新锁」（替换你现在的）

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

function processQueue(error: any, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  failedQueue = [];
}

export default async function request<T>(options: UniApp.RequestOptions): Promise<T> {
  // H5 使用 VITE_APP_BASE_API 作为代理路径，其他平台使用 VITE_APP_API_URL 作为请求路径
  let baseApi = import.meta.env.VITE_APP_API_URL;
  // #ifdef H5
  baseApi = import.meta.env.VITE_APP_BASE_API;
  // #endif

  // 处理请求配置
  const processedConfig = { ...options };

  // 应用请求拦截器
  try {
    Object.assign(processedConfig, await requestInterceptor(processedConfig));
    console.log("应用请求拦截器完成:");
  } catch (error) {
    console.error("请求拦截器错误:", error);
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    // 构建请求头
    // const headers = {
    //   ...options.header,
    // };

    const headers = {
      ...processedConfig.header,
    };
    console.log("构建最终请求头:{}", headers);

    // 特殊处理 OAuth2 登录接口
    if (processedConfig.url?.includes("/oauth2/token")) {
      // OAuth2 token 接口需要 Basic 认证，不是 Bearer token
      // headers['Authorization'] = 'Basic ' + btoa('web:web_secret');  // 改成 Basic
      headers["Content-Type"] = "application/x-www-form-urlencoded"; // 必须是这个

      // 删除 Bearer token（如果有的话）
      delete headers["Bearer"];
    } else {
      // 其他接口使用 Bearer token
      const token = getToken();
      // console.log('🔑 获取到的token:', token);

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // console.log('发送请求配置:', {
    //   url: `${baseApi}${options.url}`,
    //   method: options.method,
    //   headers: headers,
    //   data: options.data
    // });

    uni.request({
      ...options,
      url: `${baseApi}${processedConfig.url}`,

      //你在 OAuth2 /token接口中使用了 Bearer token，但实际上 OAuth2 的 token 端点需要的是 Basic 认证。
      header: headers, // 使用新的 headers
      success: (response) => {
        console.log("success response", response);
        const resData = response.data as ResponseData<T>;

        const responseWithConfig = {
          ...response,
          config: processedConfig,
        };

        // 应用响应拦截器
        try {

          const interceptorResult = responseInterceptor(responseWithConfig);

          // 如果拦截器返回了Promise.reject，走失败流程
          if (interceptorResult && interceptorResult.then && interceptorResult.catch) {
            interceptorResult.then(resolve).catch(reject);
            return;
          }


          // 业务状态码 00000 表示成功
          if (resData.code === ResultCodeEnum.SUCCESS) {
            resolve(resData.data); // ❌ 这里只返回了 自定义包裹的data
            // 如果想返回完整响应：必须改函数签名
            // 如果不想改签名：只能返回 resData.data
            // 如果 data 是 null：问题会更复杂
            // 拒绝 Promise，防止后续代码执行
          } else {
            // 其他业务处理失败
            uni.showToast({
              title: resData.msg || "业务处理失败",
              icon: "none",
            });
            reject({
              message: resData.msg || "业务处理失败",
              code: resData.code,
            });
          }
        } catch (error) {
          console.error("响应拦截器错误:", error);
          reject(error);
        }

      },
      fail: (error) => {
        console.log("fail error", error);
        uni.showToast({
          title: "网络请求失败",
          icon: "none",
          duration: 2000,
        });
        reject({
          message: "网络请求失败",
          error,
        });
      },
    });
  });
}



// 令牌过期处理函数
let isTokenExpiredHandling = false; // 防止重复处理

function handleTokenExpiredSync() {
  if (isTokenExpiredHandling) {
    console.log("⚠️ 令牌过期处理正在进行中，跳过重复处理");
    return;
  }

  isTokenExpiredHandling = true;
  console.log("🔄 开始处理令牌过期");

  // 1. 清除所有缓存
  try {
    clearAll();
  } catch (e) {
    console.warn("清除缓存失败:", e);
  }

  // 2. 显示提示
  setTimeout(() => {
    uni.showToast({
      title: "登录已过期，请重新登录",
      icon: "none",
      duration: 2000,
    });
  }, 100);

  // 3. 延迟跳转，避免冲突
  setTimeout(() => {
    safeNavigateToLogin(() => {
      isTokenExpiredHandling = false; // 处理完成
    });
  }, 1500);
}

// 安全跳转到登录页
function safeNavigateToLogin(onComplete?: () => void) {
  // 获取当前页面栈
  const pages = getCurrentPages();
  const currentPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const currentRoute = currentPage ? currentPage.route : "";

  console.log("📍 当前页面路由:", currentRoute);
  console.log("📍 页面栈深度:", pages.length);

  // 检查是否已经在登录页
  if (
    currentRoute &&
    (currentRoute.includes("login") ||
      currentRoute.includes("Login") ||
      currentRoute === "packageA/pages/login/index")
  ) {
    console.log("✅ 已经在登录页，不重复跳转");
    if (onComplete) onComplete();
    return;
  }

  // 定义可能的登录页路径
  const loginPaths = [
    "/pages/login/index", // 常见路径1
    "/pages/user/login", // 常见路径2
    "/packageA/pages/login/index", // 您原来的路径
    "/pages/auth/login", // 常见路径3
    "/pages/mine/login", // 常见路径4
  ];

  // 尝试跳转
  const tryNavigate = (index = 0) => {
    if (index >= loginPaths.length) {
      console.error("❌ 所有登录页路径都尝试失败");
      // 显示提示让用户手动操作
      uni.showModal({
        title: "提示",
        content: "登录状态已过期，请手动返回登录页面",
        showCancel: false,
        confirmText: "知道了",
        success: () => {
          if (onComplete) onComplete();
        },
      });
      return;
    }

    const loginUrl = loginPaths[index];
    console.log(`🔄 尝试跳转路径 ${index + 1}:`, loginUrl);

    // 设置跳转超时
    const navigateTimeout = setTimeout(() => {
      console.warn(`⏰ 跳转超时，尝试下一个路径: ${loginUrl}`);
      tryNavigate(index + 1);
    }, 3000);

    // 先尝试 reLaunch
    uni.reLaunch({
      url: loginUrl,
      success: () => {
        console.log(`✅ 成功跳转到登录页: ${loginUrl}`);
        clearTimeout(navigateTimeout);
        if (onComplete) onComplete();
      },
      fail: (err) => {
        clearTimeout(navigateTimeout);
        console.warn(`⚠️ reLaunch 跳转失败: ${loginUrl}`, err);

        // 如果 reLaunch 失败，尝试 navigateTo
        uni.navigateTo({
          url: loginUrl,
          success: () => {
            console.log(`✅ navigateTo 成功: ${loginUrl}`);
            if (onComplete) onComplete();
          },
          fail: () => {
            console.warn(`⚠️ navigateTo 也失败: ${loginUrl}`);
            // 尝试下一个路径
            tryNavigate(index + 1);
          },
        });
      },
    });
  };

  // 开始尝试跳转
  tryNavigate();
}








//request2: 返回完整的 ResponseData（用于需要完整信息的场景）
export async function request2<T>(options: UniApp.RequestOptions): Promise<ResponseData<T>> {
  // H5 使用 VITE_APP_BASE_API 作为代理路径，其他平台使用 VITE_APP_API_URL 作为请求路径
  let baseApi = import.meta.env.VITE_APP_API_URL;
  // #ifdef H5
  baseApi = import.meta.env.VITE_APP_BASE_API;
  // #endif


  // 处理请求配置
  const processedConfig = { ...options };

  // 应用请求拦截器
  try {
    Object.assign(processedConfig, await requestInterceptor(processedConfig));
    console.log("应用请求拦截器完成:");
  } catch (error) {
    console.error("请求拦截器错误:", error);
    return Promise.reject(error);
  }

  return new Promise((resolve, reject) => {
    // 构建请求头
    const headers = {
      ...options.header,
    };

    // 特殊处理 OAuth2 登录接口
    if (processedConfig.url?.includes("/oauth2/token")) {
      // OAuth2 token 接口需要 Basic 认证，不是 Bearer token
      // headers['Authorization'] = 'Basic ' + btoa('web:web_secret');  // 改成 Basic
      headers["Content-Type"] = "application/x-www-form-urlencoded"; // 必须是这个

      // 删除 Bearer token（如果有的话）
      delete headers["Bearer"];
    } else {
      // 其他接口使用 Bearer token
      const token = getToken();
      // console.log('🔑 获取到的token:', token);

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // console.log('发送请求配置:', {
    //   url: `${baseApi}${options.url}`,
    //   method: options.method,
    //   headers: headers,
    //   data: options.data
    // });

    uni.request({
      ...options,
      url: `${baseApi}${processedConfig.url}`,

      //你在 OAuth2 /token接口中使用了 Bearer token，但实际上 OAuth2 的 token 端点需要的是 Basic 认证。
      header: headers, // 使用新的 headers
      success: (response) => {
        console.log("success response", response);
        const resData = response.data as ResponseData<T>; //response.data= 整个 JSON 对象

        const responseWithConfig = {
          ...response,
          config: processedConfig,
        };
        // 应用响应拦截器
        try {
          const interceptorResult = responseInterceptor(responseWithConfig);

          // 如果拦截器返回了Promise.reject，走失败流程
          if (interceptorResult && interceptorResult.then && interceptorResult.catch) {
            interceptorResult.then(resolve).catch(reject);
            return;
          }

          // 业务状态码 00000 表示成功
          if (resData.code === ResultCodeEnum.SUCCESS) {
            // resolve(resData.data);    // ❌ 这里只返回了 data

            resolve(resData); // ❌ 这里返回了 所有响应data
            // 如果想返回完整响应：必须改函数签名
            // 如果不想改签名：只能返回 resData.data
            // 如果 data 是 null：问题会更复杂
          } else {
            //其他业务处理失败
            uni.showToast({
              title: resData.msg || "业务处理失败",
              icon: "none",
            });
            reject({
              message: resData.msg || "业务处理失败",
              code: resData.code,
            });
          }
        } catch (error) {
          console.error("响应拦截器错误:", error);
          reject(error);
        }
      },
      fail: (error) => {
        console.log("fail error", error);
        uni.showToast({
          title: "网络请求失败",
          icon: "none",
          duration: 2000,
        });
        reject({
          message: "网络请求失败",
          error,
        });
      },
    });
  });
}

/**
 * 请求拦截器
 */
const requestInterceptor = async (config: any) => {
  // console.log("🔧 请求拦截器处理", config);

  // ✅公共接口：统一加 X-Client-Id（重点）
  const clientId = getClientId() || CLIENT_CONFIG.CLIENT_ID;
  console.log("request请求拦截器,登录使用的客户端ID:", clientId);

  if (clientId) {
    config.header = config.header || {};
    config.header["X-Client-Id"] = clientId;
  }

  // 判断请求是否需要认证
  if (config.header?.auth === true) {
    const token = getToken();
    if (token) {
      config.header.Authorization = `Bearer ${token}`;
    }
  }

  // 如果配置中指定跳过认证，则不添加token
  if (config.header?.skipAuth === true) {
    return config;
  }
  const userStore = useUserStore();

  try {
    // // 获取有效的token（会自动刷新）
    // const token = await userStore.getValidToken();  // ❌ 删掉
    //改成：只拿 token，不刷新
    const token = getToken();
    if (token && config.header) {
      config.header.Authorization = `Bearer ${token}`;
    }
  } catch (error: any) {
    // token刷新失败，需要重新登录
    if (error.message === "NOT_LOGGED_IN" || error.message === "NO_REFRESH_TOKEN") {
      // 跳转到登录页
      // uni.showModal({
      //   title: "提示",
      //   content: "登录已过期，请重新登录",
      //   showCancel: false,
      //   success: () => {
      //     uni.reLaunch({ url: "/pages/login/login" });
      //   },
      // });
    }
    return Promise.reject(error);
  }

  return config;
};

/**
 * 响应拦截器
 */
const responseInterceptor = (response: any) => {
  // console.log("🔧 响应拦截器处理", response);

  const resData = response.data;
  const config = response.config;

  // ✅ 公共接口直接放过
  if (config.url?.startsWith("/public/")) {
    return resData;
  }

  // OAuth2 token 接口失败，直接 reject
  if (config.url?.includes("/oauth2/token")) {
    return Promise.reject(resData);
  }

  // 401 或 token 失效
  if (
    response.statusCode === 401 ||
    resData.code === ResultCodeEnum.TOKEN_INVALID ||
    resData.code === "A0230"
  ) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });

      if (!isRefreshing) {
        isRefreshing = true;

        const userStore = useUserStore();
        userStore
          .refreshAccessToken()
          .then((newToken) => {
            processQueue(null, newToken);
          })
          .catch((err) => {
            processQueue(err, null);
            handleTokenExpiredSync(); // 只在这里跳转一次
          })
          .finally(() => {
            isRefreshing = false;
          });
      }
    });
  }

  return resData;
};

function baseRequest<T>(options: UniApp.RequestOptions, returnFullResponse = false): Promise<any> {
  return new Promise(async (resolve, reject) => {
    // 1️请求拦截器
    const processedConfig = { ...options };
    try {
      Object.assign(processedConfig, await requestInterceptor(processedConfig));
    } catch (err) {
      return reject(err);
    }

    // 2️请求头
    const headers = {
      ...processedConfig.header,
    };

    if (processedConfig.url?.includes("/oauth2/token")) {
      headers["Content-Type"] = "application/x-www-form-urlencoded";
      delete headers.Authorization;
    } else {
      const token = getToken();
      if (token && !headers.Authorization) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    // 3️发起请求
    uni.request({
      ...processedConfig,
      header: headers,
      success: (response) => {
        const responseWithConfig = {
          ...response,
          config: processedConfig,
        };

        try {
          const interceptorResult = responseInterceptor(responseWithConfig);

          if (interceptorResult?.then) {
            interceptorResult.then(resolve).catch(reject);
            return;
          }

          const resData = response.data as ResponseData<T>;

          if (resData.code === ResultCodeEnum.SUCCESS) {
            resolve(returnFullResponse ? resData : resData.data);
          } else {
            reject({
              code: resData.code,
              message: resData.msg,
            });
          }
        } catch (e) {
          reject(e);
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

// request（不新增参数 ✅）
export function request3<T>(
  options: UniApp.RequestOptions
): Promise<T> {
  return baseRequest<T>(options, false);
}

// request2（不新增参数 ✅）
export function request4<T>(
  options: UniApp.RequestOptions
): Promise<ResponseData<T>> {
  return baseRequest<T>(options, true);
}
