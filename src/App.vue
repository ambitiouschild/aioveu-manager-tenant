<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useThemeStore } from "@/store";

import { useUserStore } from "@/store/modules/user"; // 添加用户store

// 主题初始化
const themeStore = useThemeStore();
const userStore = useUserStore(); // 添加用户store实例

onLaunch(async() => {
  console.log("App Launch");
  // 初始化主题
  themeStore.initTheme();

  // 定时检查token（每30分钟检查一次）
  setInterval(checkTokenStatus, 30 * 60 * 1000);

  // 动态设置状态栏高度
  setStatusBarHeight();

  // // 2. 加载用户权限数据
  // try {
  //   // 加载用户信息（包含权限数据）
  //   await userStore.getInfo();
  //   console.log("用户信息和权限数据加载成功");
  // } catch (error) {
  //   console.error("加载用户信息失败", error);
  //   uni.showToast({
  //     title: "加载用户信息失败",
  //     icon: "none"
  //   });
  // }

});

const setStatusBarHeight = () => {
  // #ifdef APP-PLUS
  const statusBarHeight = plus.navigator.getStatusbarHeight();
  document.documentElement.style.setProperty('--status-bar-height', `${statusBarHeight}px`);
  // #endif

  // #ifdef MP-WEIXIN
  const systemInfo = uni.getSystemInfoSync();
  document.documentElement.style.setProperty('--status-bar-height', `${systemInfo.statusBarHeight}px`);
  // #endif
}


const checkTokenStatus = async () => {
  const userStore = useUserStore();

  // 如果有token但即将过期，尝试静默刷新
  if (userStore.token && userStore.isTokenExpiring && userStore.refreshToken) {
    try {
      await userStore.refreshAccessToken();
      console.log("令牌静默刷新成功");
    } catch (error) {
      console.log("令牌静默刷新失败，用户下次操作时会提示重新登录");
    }
  }
};

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">

/* 引入 uni.css */
@import '@/common/uni.css';

/* H5 环境样式变量设置 */
:root {
  --primary-color: #165dff;
  --primary-color-light: #94bfff;
  --primary-color-dark: #0e3c9b;
}

/* 小程序环境样式变量设置 */
page {
  --primary-color: #165dff;
  --primary-color-light: #94bfff;
  --primary-color-dark: #0e3c9b;
  background: #f8f8f8;
}

/* 动态加载小程序主题色的钩子 */
/* 用于通过小程序原生API获取主题色并应用 */
.theme-container {
  display: none;
}
</style>
