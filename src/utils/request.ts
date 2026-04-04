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
      console.log('🔑 获取到的token:', token);

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    console.log('发送请求配置:', {
      url: `${baseApi}${options.url}`,
      method: options.method,
      headers: headers,
      data: options.data
    });


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
          resolve(resData.data);
        }
        // 令牌失效或过期处理
        else if (resData.code === ResultCodeEnum.TOKEN_INVALID) {
          console.log("令牌失效或过期处理");
          clearAll();
          // 跳转到登录页
          uni.reLaunch({
            url: "/packageA/pages/login/index",
          });
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
