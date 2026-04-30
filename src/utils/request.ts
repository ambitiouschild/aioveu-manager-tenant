import { getToken, clearAll } from "@/utils/cache";
import { ResultCodeEnum } from "@/enums/ResultCodeEnum";

export default function request<T>(options: UniApp.RequestOptions): Promise<T> {
  // H5 使用 VITE_APP_BASE_API 作为代理路径，其他平台使用 VITE_APP_API_URL 作为请求路径
  let baseApi = import.meta.env.VITE_APP_API_URL;
  // #ifdef H5
  baseApi = import.meta.env.VITE_APP_BASE_API;
  // #endif

  return new Promise((resolve, reject) => {

    // 构建请求头
    const headers = {
      ...options.header
    };

    // 特殊处理 OAuth2 登录接口
    if (options.url === '/oauth2/token' || options.url.includes('/oauth2/token')) {
      // OAuth2 token 接口需要 Basic 认证，不是 Bearer token
      // headers['Authorization'] = 'Basic ' + btoa('web:web_secret');  // 改成 Basic
      headers['Content-Type'] = 'application/x-www-form-urlencoded';  // 必须是这个

      // 删除 Bearer token（如果有的话）
      delete headers['Bearer'];
    } else {
      // 其他接口使用 Bearer token
      const token = getToken();
      // console.log('🔑 获取到的token:', token);

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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
      url: `${baseApi}${options.url}`,

      //你在 OAuth2 /token接口中使用了 Bearer token，但实际上 OAuth2 的 token 端点需要的是 Basic 认证。
      header: headers, // 使用新的 headers
      success: (response) => {
        console.log("success response", response);
        const resData = response.data as ResponseData<T>;

        // 业务状态码 00000 表示成功
        if (resData.code === ResultCodeEnum.SUCCESS) {
          resolve(resData.data); // ❌ 这里只返回了 data

          // resolve(resData);    // ❌ 这里只返回了 data
          // 如果想返回完整响应：必须改函数签名
          // 如果不想改签名：只能返回 resData.data
          // 如果 data 是 null：问题会更复杂
        }
        // 令牌失效或过期处理
        else if (resData.code === ResultCodeEnum.TOKEN_INVALID) {
          console.log("令牌失效或过期处理");
          // clearAll();
          // 跳转到登录页
          // 跳转到登录页 - 使用安全的跳转方法
          // 异步处理，不阻塞当前请求
          setTimeout(() => {
            handleTokenExpiredSync();
          }, 0);

          // 拒绝 Promise，防止后续代码执行
        } else {
          // 其他业务处理失败
          // uni.showToast({
          //   title: resData.msg || "业务处理失败",
          //   icon: "none",
          // });
          reject({
            message: resData.msg || "业务处理失败",
            code: resData.code,
          });
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
export function request2<T>(options: UniApp.RequestOptions): Promise<ResponseData<T>> {
  // H5 使用 VITE_APP_BASE_API 作为代理路径，其他平台使用 VITE_APP_API_URL 作为请求路径
  let baseApi = import.meta.env.VITE_APP_API_URL;
  // #ifdef H5
  baseApi = import.meta.env.VITE_APP_BASE_API;
  // #endif

  return new Promise((resolve, reject) => {

    // 构建请求头
    const headers = {
      ...options.header
    };

    // 特殊处理 OAuth2 登录接口
    if (options.url === '/oauth2/token' || options.url.includes('/oauth2/token')) {
      // OAuth2 token 接口需要 Basic 认证，不是 Bearer token
      // headers['Authorization'] = 'Basic ' + btoa('web:web_secret');  // 改成 Basic
      headers['Content-Type'] = 'application/x-www-form-urlencoded';  // 必须是这个

      // 删除 Bearer token（如果有的话）
      delete headers['Bearer'];
    } else {
      // 其他接口使用 Bearer token
      const token = getToken();
      // console.log('🔑 获取到的token:', token);

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
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
      url: `${baseApi}${options.url}`,

      //你在 OAuth2 /token接口中使用了 Bearer token，但实际上 OAuth2 的 token 端点需要的是 Basic 认证。
      header: headers,  // 使用新的 headers
      success: (response) => {
        console.log("success response", response);
        const resData = response.data as ResponseData<T>;

        // 业务状态码 00000 表示成功
        if (resData.code === ResultCodeEnum.SUCCESS) {
          // resolve(resData.data);    // ❌ 这里只返回了 data

          resolve(resData); // ❌ 这里只返回了 data
          // 如果想返回完整响应：必须改函数签名
          // 如果不想改签名：只能返回 resData.data
          // 如果 data 是 null：问题会更复杂
        }
        // 令牌失效或过期处理
        else if (resData.code === ResultCodeEnum.TOKEN_INVALID) {
          console.log("令牌失效或过期处理");


          setTimeout(() => {
            handleTokenExpiredSync();
          }, 0);


        } else {
          // 其他业务处理失败
          // uni.showToast({
          //   title: resData.msg || "业务处理失败",
          //   icon: "none",
          // });
          reject({
            message: resData.msg || "业务处理失败",
            code: resData.code,
          });
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



