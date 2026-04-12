<template>
  <view class="login-container">

    <!-- 隐私协议弹窗 -->
    <view v-if="showPrivacyAgreement" class="privacy-mask">
      <view class="privacy-content">
        <view class="privacy-header">
          <text class="title">用户协议与隐私政策</text>
        </view>

        <view class="privacy-body">
          <text class="desc">感谢您使用可我不敌可爱！我们高度重视您的个人信息和隐私保护。在您使用我们的服务前，请仔细阅读并同意以下协议：</text>

          <view class="agreement-links">
            <text class="link" @click="previewAgreement('user')">《用户服务协议》</text>
            <text>和</text>
            <text class="link" @click="previewAgreement('privacy')">《隐私政策》</text>
          </view>

          <view class="agreement-checkbox" @click="toggleAgree">
            <!-- 圆形选择按钮 -->
            <view class="circle-checkbox" :class="{ checked: hasAgreed }">
              <view v-if="hasAgreed" class="circle-checkbox-inner"></view>
            </view>
            <text class="checkbox-label">我已阅读并同意以上协议</text>
          </view>
        </view>

        <view class="privacy-footer">
          <button class="btn disagree" @click="handleDisagree">暂不同意</button>
          <button
            class="btn agree"
            :class="{ disabled: !hasAgreed }"
            :disabled="!hasAgreed"
            @click="handleAgree"
          >
            同意并继续
          </button>
        </view>
      </view>
    </view>






    <!-- 背景图 -->
<!--    <image src="/static/images/login-bg.svg" mode="aspectFill" class="login-bg" />-->
    <!-- 原有登录页面内容 -->
    <image v-if="!showPrivacyAgreement" src="/static/images/login-bg.svg" mode="aspectFill" class="login-bg" />

    <!-- Logo和标题区域 -->
    <view class="header">
      <image src="https://cdn.aioveu.com/aioveu/aioveu-server/avatar/avatar.png" class="logo" />
      <text class="title">可我不敌心软</text>
      <text class="subtitle">恰同学少年，风华正茂；书生意气，挥斥方遒</text>
      <text class="subtitle">可我不敌心软，商家管理端</text>
    </view>

    <!-- 登录表单区域 -->
    <view class="login-card">
      <view class="form-wrap">
        <!-- 使用 uni 原生表单组件替换 wd-form -->
        <view class="form-container">
          <!-- 用户名输入框 -->
          <view class="form-item">
            <uni-icons type="contact" size="22" color="#165DFF" class="input-icon" />
            <input
              v-model="loginFormData.username"
              class="form-input"
              placeholder="请输入用户名"
              @blur="handleUsernameBlur"
            />
            <uni-icons
              v-if="loginFormData.username"
              type="clear"
              size="18"
              color="#9ca3af"
              class="clear-icon"
              @click="clearUsername"
            />
          </view>
          <view class="divider"></view>


          <!-- 租户选择器 -->
          <view v-if="showTenantSelect" class="form-item">
            <uni-icons type="home" size="22" color="#165DFF" class="input-icon" />
            <picker
              v-if="tenantList.length > 0"
              :range="tenantList"
              range-key="name"
              :value="selectedTenantIndex"
              @change="handleTenantChange"
              class="form-input"
              style="height: 60rpx; line-height: 60rpx;"
            >
              <view class="picker-display">
                <text v-if="selectedTenantIndex >= 0" class="picker-text">
                  {{ tenantList[selectedTenantIndex]?.name || '请选择租户' }}
                </text>
                <text v-else class="picker-placeholder">请选择租户</text>
                <uni-icons type="arrowdown" size="16" color="#9ca3af" style="margin-left: auto;" />
              </view>
            </picker>

            <!-- 租户加载中 -->
            <view v-else-if="tenantLoading" class="tenant-loading">
              <uni-icons type="spinner-cycle" size="20" color="#165DFF" />
              <text class="loading-text">加载租户中...</text>
            </view>

            <!-- 无租户提示 -->
            <view v-else class="no-tenant">
              <text class="no-tenant-text">该用户暂无可用租户</text>
            </view>
          </view>
          <view v-if="showTenantSelect" class="divider"></view>

          <!-- 密码输入框 -->
          <view class="form-item">
            <uni-icons type="locked" size="22" color="#165DFF" class="input-icon" />

<!--            当 showPassword为 true时（密码可见）：-->
<!--            !showPassword= false-->
<!--            :password="false"→ 输入框显示明文-->
<!--            当 showPassword为 false时（密码隐藏）：-->
<!--            !showPassword= true-->
<!--            :password="true"→ 输入框显示星号-->
            <input
              v-model="loginFormData.password"
              class="form-input"
              :password="!showPassword"
              placeholder="请输入密码"
              placeholder-style="color: #9ca3af; font-weight: normal;"
            />
            <!-- 修正：使用正确的图标类型 -->
            <view class="eye-icon" @click="showPassword = !showPassword">
              <!--                工作逻辑：-->
              <!--                当 showPassword为 true时（密码可见），显示 睁眼图标 (eye)-->
              <!--                当 showPassword为 false时（密码隐藏），显示 闭眼图标 (eye-slash)-->
              <uni-icons
                :type="showPassword ? 'eye' : 'eye-slash'"
                size="18"
                color="#9ca3af"
              />
            </view>
          </view>
          <view class="divider"></view>

          <!-- 验证码输入框   验证码功能在多租户登录中很重要，可以防止暴力破解。-->
          <view class="form-item">
            <uni-icons type="shield" size="22" color="#165DFF" class="input-icon" />
            <input
              v-model="loginFormData.captchaCode"
              class="form-input captcha-input"
              placeholder="请输入验证码"
              placeholder-style="color: #9ca3af; font-weight: normal;"
              @keyup.enter="handleLoginSubmit"
            />
            <view class="captcha-image" @click="getCaptcha">
              <uni-icons
                v-if="codeLoading"
                type="spinner-cycle"
                size="20"
                color="#165DFF"
                class="loading-icon"
              />
              <image
                v-else-if="captchaBase64"
                :src="captchaBase64"
                mode="aspectFit"
                class="captcha-img"
                @error="handleCaptchaError"
              />
              <text v-else class="captcha-refresh">点击获取验证码</text>
            </view>
          </view>
          <view class="divider"></view>





          <!-- 登录按钮 -->
          <button
            class="login-btn"
            :disabled="loading || !hasAgreed || !canSubmit"
            :style="(loading || !hasAgreed) ? 'opacity: 0.7;' : ''"
            @click="handleLoginSubmit"
          >
            {{ getLoginButtonText() }}
          </button>
        </view>

        <!-- 微信登录 -->
        <view class="other-login">
          <view class="other-login-title">
            <view class="line"></view>
            <text class="text">其他登录方式</text>
            <view class="line"></view>
          </view>

          <view class="wechat-login" @click="handleWechatLogin">
            <view class="wechat-icon-wrapper">
              <image src="/static/icons/weixin.png" class="wechat-icon" />
            </view>
          </view>
        </view>

        <!-- 底部协议 - 添加圆形选择按钮 -->
        <view class="agreement">
          <view class="agreement-checkbox" @click="toggleAgree">
            <view class="circle-checkbox" :class="{ checked: hasAgreed }">
              <view v-if="hasAgreed" class="circle-checkbox-inner"></view>
            </view>
          </view>
          <text class="text">是否同意</text>
          <text class="link" @click="navigateToUserAgreement">《用户协议》</text>
          <text class="text">和</text>
          <text class="link" @click="navigateToPrivacy">《隐私政策》</text>
        </view>
      </view>
    </view>

    <!-- 使用 uni 的 toast 替换 wd-toast -->
  </view>
</template>

<script lang="ts" setup>
import { onLoad, onShow} from "@dcloudio/uni-app";  // 添加 onShow 导入
import { type LoginFormData } from "@/api/auth";
import type { LoginRequest , TenantItem  } from "@/types/api";

import AuthAPI from "@/api/auth/index";
import { useUserStore } from "@/store/modules/user";
import { ref , computed } from "vue";
import { AuthStorage } from "@/utils/auth.storage";

// 移除 wd-toast 引用
const loading = ref(false);
const codeLoading = ref(false);
const userStore = useUserStore();
const showPassword = ref(false);
// 用户是否同意协议的状态  // 统一使用一个 hasAgreed 变量
const hasAgreed = ref(true);

// 隐私协议相关状态
const showPrivacyAgreement = ref(false);
const captchaBase64 = ref("");

// 租户相关状态
const tenantList = ref<TenantItem[]>([]);
const tenantLoading = ref(false);
const showTenantSelect = ref(false);
const selectedTenantIndex = ref(-1);


// 登录表单数据
const loginFormData = ref<LoginFormData>({
  username: "",
  password: "",
  tenantId: undefined as number | undefined, // 新增租户ID字段
  captchaId: "",
  captchaCode: "",
});

// 获取重定向参数
const redirect = ref("");
onLoad((options) => {
  if (options) {
    redirect.value = options.redirect ? decodeURIComponent(options.redirect) : "/pages/index/index";
  } else {
    redirect.value = "/pages/index/index";
  }

  // 检查是否已经同意过协议
  checkAgreementStatus();

  // 页面加载时获取验证码
  getCaptcha();
});

// 计算是否可提交
const canSubmit = computed(() => {
  if (!loginFormData.value.username || !loginFormData.value.password) {
    console.log("计算是否可提交");
    return false;
  }
  // 如果有租户列表且长度>0，必须选择租户
  if (tenantList.value.length > 0 && loginFormData.value.tenantId == null) {
    console.log("计算是否可提交",loginFormData.value.tenantId);
    return false;
  }

  if (!loginFormData.value.captchaCode) {
    console.log("计算是否可提交，验证码:{}",loginFormData.value.captchaCode);
    return false;
  }

  if (!hasAgreed.value) {
    console.log("计算是否可提交，是否同意隐私:{}",hasAgreed.value);
    return false;
  }

  console.log("计算是否可提交:可以提交");

  return true;
});


// 获取登录按钮文本
const getLoginButtonText = () => {
  if (!hasAgreed.value) return '请先同意协议';
  if (!canSubmit.value) return '登录';
  if (tenantList.value.length > 0 && loginFormData.value.tenantId == null) return '请选择租户';
  if (!loginFormData.value.captchaCode) {
    return '请输入验证码';
  }
  return '登录';
};


// 检查隐私协议同意状态
const checkAgreementStatus = () => {
  const agreed = uni.getStorageSync('hasAgreedPrivacy');
  hasAgreed.value = agreed;
  showPrivacyAgreement.value = !agreed;

  // 如果已同意协议，加载上次选择的租户
  if (hasAgreed.value && loginFormData.value.username) {
    loadLastSelectedTenant();
  }
};

// 检查隐私协议同意状态
onShow(() => {
  checkAgreementStatus();
});


// 从本地存储加载上次选择的租户
const loadLastSelectedTenant = () => {
  const lastTenant = AuthStorage.getLastSelectedTenant();
  if (lastTenant && lastTenant.username === loginFormData.value.username) {
    // 这里需要等待租户列表加载完成后才能设置
    // 在实际加载租户列表后处理
  }
};


// 用户名输入框失去焦点
let usernameBlurTimer: any = null;
const handleUsernameBlur = () => {
  if (usernameBlurTimer) clearTimeout(usernameBlurTimer);

  usernameBlurTimer = setTimeout(() => {
    if (!loginFormData.value.username || loginFormData.value.username.length < 2) {
      tenantList.value = [];
      showTenantSelect.value = false;
      return;
    }

    showTenantSelect.value = true;
    loadTenants();
  }, 500);
};

// 清空用户名
const clearUsername = () => {
  loginFormData.value.username = "";
  tenantList.value = [];
  loginFormData.value.tenantId = undefined;
  selectedTenantIndex.value = -1;
  showTenantSelect.value = false;
};

// 加载租户列表
const loadTenants = async () => {
  if (!loginFormData.value.username) {
    tenantList.value = [];
    showTenantSelect.value = false;
    return;
  }

  tenantList.value = [];
  tenantLoading.value = true;

  try {
    // 这里需要调用你的API获取租户列表
    // 假设你的API路径是：GET /api/auth/tenants?username=xxx
    console.log("登录用户名:{}",loginFormData.value.username);
    const response  = await AuthAPI.getAccessibleTenantsByUsername(loginFormData.value.username);

    console.log("一次查询获取用户名在所有租户中的可访问租户:{}",response); //如果字段基本一致，可以安全断言
    tenantList.value = response as unknown as TenantItem[] || [];
    console.log("一次查询获取用户名在所有租户中的可访问租户tenantList:{}",tenantList.value);

    if (tenantList.value.length > 0) {
      showTenantSelect.value = true;

        // 如果只有一个租户，自动选择
        if (tenantList.value.length === 1) {
          selectedTenantIndex.value = 0;
          loginFormData.value.tenantId = tenantList.value[0].id;
          handleTenantChange({ detail: { value: 0 } });
        } else {
          // 多个租户，尝试使用上次的选择
          const lastTenant = AuthStorage.getLastSelectedTenant();
          if (lastTenant && lastTenant.username === loginFormData.value.username) {
            const index = tenantList.value.findIndex(t => t.id === lastTenant.tenantId);
            if (index >= 0) {
              selectedTenantIndex.value = index;
              loginFormData.value.tenantId = tenantList.value[index].id;
            }
          }
        }
      } else {
        loginFormData.value.tenantId = undefined;
        selectedTenantIndex.value = -1;
      }

  } catch (error) {
    console.error('加载租户列表失败:', error);
    uni.showToast({
      title: '加载租户列表失败',
      icon: 'none',
      duration: 2000
    });
    tenantList.value = [];
  } finally {
    tenantLoading.value = false;
  }
};

// 租户选择变化
const handleTenantChange = (e: any) => {
  const index = e.detail.value;
  selectedTenantIndex.value = index;
  if (index >= 0 && tenantList.value[index]) {
    loginFormData.value.tenantId = tenantList.value[index].id;

    // 保存到本地存储
    if (loginFormData.value.username) {
      AuthStorage.setLastSelectedTenant({
        username: loginFormData.value.username,
        tenantId: loginFormData.value.tenantId
      });
    }
  }
};


// 获取验证码
const getCaptcha = async () => {
  codeLoading.value = true;
  try {
    const data = await AuthAPI.getCaptcha();
    if (data) {
      loginFormData.value.captchaId = data.captchaId ;
      captchaBase64.value = data.captchaBase64 ;
    }
  } catch (error) {
    console.error('获取验证码失败:', error);
    uni.showToast({
      title: '获取验证码失败',
      icon: 'none',
      duration: 2000
    });
  } finally {
    codeLoading.value = false;
  }
};

// 验证码图片加载错误
const handleCaptchaError = () => {
  uni.showToast({
    title: '验证码加载失败',
    icon: 'none',
    duration: 2000
  });
  getCaptcha();
};

// 切换同意状态
const toggleAgree = () => {
  hasAgreed.value = !hasAgreed.value;

};

// 处理同意
const handleAgree = () => {
  if (!hasAgreed.value) return;

  uni.setStorageSync('hasAgreedPrivacy', true);
  uni.setStorageSync('privacyAgreeTime', Date.now());

  showPrivacyAgreement.value = false;
};

// 处理不同意
const handleDisagree = () => {
  uni.showModal({
    title: '提示',
    content: '您需要同意《用户服务协议》和《隐私政策》才能使用本小程序。',
    confirmText: '退出小程序',
    cancelText: '再次查看',
    success: (res) => {
      if (res.confirm) {
        uni.exitMiniProgram();
      }else {
        // 用户点击"再次查看"，不做任何操作，停留在当前弹窗
      }
    }
  });
};

// 预览协议
const previewAgreement = (type: string) => {
  const urls = {
    user: '/pages/mine/user-agreement/index',
    privacy: '/pages/mine/privacy/index'
  };

  uni.navigateTo({
    url: urls[type as keyof typeof urls]
  });
};


// 登录处理 - 使用 uni.showToast 替换 wd-toast
const handleLoginSubmit = async () => {
  if (!hasAgreed.value) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  if (!canSubmit.value) {
    if (tenantList.value.length > 0 && !loginFormData.value.tenantId) {
      uni.showToast({
        title: '请选择要登录的租户',
        icon: 'none',
        duration: 2000
      });
    }else if (!loginFormData.value.captchaCode) {
      uni.showToast({
        title: '请输入验证码',
        icon: 'none',
        duration: 2000
      });
    }
    return;
  }

  if (loading.value) return;
  loading.value = true;

  try {
    // 修改登录逻辑，传入租户ID
    await userStore.login({
      ...loginFormData.value,
      // 这里确保后端接口支持tenantId参数
    });

    await userStore.getInfo();
    console.log("获取用户信息...", userStore.getInfo());

    uni.showToast({
      title: '登录成功',
      icon: 'success',
      duration: 1000
    });

    // 登录成功，保存租户选择
    if (loginFormData.value.tenantId && loginFormData.value.username) {
      AuthStorage.setLastSelectedTenant({
        username: loginFormData.value.username,
        tenantId: loginFormData.value.tenantId
      });
    }

    // 跳转逻辑
    if (!userStore.isUserInfoComplete()) {
      setTimeout(() => {
        // uni.navigateTo({
        // url: `/pages/login/complete-profile?redirect=${encodeURIComponent(redirect.value)}`,
        // });
        uni.reLaunch({
          url: redirect.value,
        });
      }, 1000);
    } else {
      setTimeout(() => {
        uni.reLaunch({
          url: redirect.value,
        });
      }, 1000);
    }
  } catch (error: any) {
    uni.showToast({
      title: error?.message || "登录失败",
      icon: 'none',
      duration: 2000
    });
  } finally {
    loading.value = false;
  }
};

// 微信登录处理 - 使用 uni.showToast 替换 wd-toast
const handleWechatLogin = async () => {
  if (!hasAgreed.value) {
    uni.showToast({
      title: '请先同意用户协议和隐私政策',
      icon: 'none',
      duration: 2000
    });
    return;
  }

  if (loading.value) return;
  loading.value = true;

  try {
    // #ifdef MP-WEIXIN
    const { code } = await uni.login({
      provider: "weixin",
    });

    // 这里需要修改微信登录逻辑，支持多租户
    // 微信登录后需要让用户选择租户
    const result = await userStore.loginByWechat(code);

    if (result) {

      // 微信登录成功后，需要获取该微信账号绑定的租户列表
      // 然后让用户选择租户
      // 这里需要根据你的业务逻辑调整

      // 模拟获取租户列表

      const wechatTenants = await getTenantsByWechat(code);


      if (wechatTenants.length === 0) {
        uni.showToast({
          title: '该微信账号未绑定任何租户',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      if (wechatTenants.length === 1) {
        // 只有一个租户，自动登录
        loginFormData.value.tenantId = wechatTenants[0].id;
        await userStore.login({
          ...loginFormData.value,
          // isWechat: true
        });
      } else {
        // 多个租户，需要选择
        // 这里可以弹出一个选择器让用户选择租户
        uni.showActionSheet({
          itemList: wechatTenants.map(t => t.name),
          success: async (res) => {
            const index = res.tapIndex;
            loginFormData.value.tenantId = wechatTenants[index].id;
            await userStore.login({
              ...loginFormData.value,
              // isWechat: true
            });

            // 后续处理...
          }
        });
        return;
      }


      await userStore.getInfo();
      uni.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 1000
      });

      if (!userStore.isUserInfoComplete()) {
        setTimeout(() => {
          uni.navigateTo({
            url: `/pages/login/complete-profile?redirect=${encodeURIComponent(redirect.value)}`,
          });
        }, 1000);
      } else {
        setTimeout(() => {
          uni.reLaunch({
            url: redirect.value,
          });
        }, 1000);
      }
    }
    // #endif

    // #ifndef MP-WEIXIN
    uni.showToast({
      title: '当前环境不支持微信登录',
      icon: 'none',
      duration: 2000
    });
    // #endif
  } catch (error: any) {
    uni.showToast({
      title: error?.message || "微信登录失败",
      icon: 'none',
      duration: 2000
    });
  } finally {
    loading.value = false;
  }
};

// 模拟通过微信获取租户列表
const getTenantsByWechat = async (code: string): Promise<TenantItem[]> => {
  // 这里需要调用你的后端接口
  // 示例：根据微信登录获取用户绑定的租户列表
  return [
    { id: 1, name: '租户A' },
    { id: 2, name: '租户B' }
  ];
};

// 跳转到用户协议页面
const navigateToUserAgreement = () => {
  uni.navigateTo({
    url: "packageA/pages/mine/settings/agreements/index",
  });
};

// 跳转到隐私政策页面
const navigateToPrivacy = () => {
  uni.navigateTo({
    url: "packageA/pages/mine/settings/privacy/index",
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  overflow: hidden;
}


/* 隐私协议弹窗样式 */
.privacy-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 40rpx;
}

.privacy-content {
  width: 100%;
  max-width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.privacy-header {
  padding: 40rpx 40rpx 20rpx;
  text-align: center;

  .title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }
}

.privacy-body {
  padding: 20rpx 40rpx 40rpx;

  .desc {
    font-size: 28rpx;
    line-height: 1.6;
    color: #666;
    margin-bottom: 30rpx;
  }

  .agreement-links {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 40rpx;

    .link {
      color: #165DFF;
      margin: 0 10rpx;
    }
  }

  .agreement-checkbox {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx 0;

    .circle-checkbox {
      width: 40rpx;
      height: 40rpx;
      border: 2rpx solid #dcdfe6;
      border-radius: 50%;
      margin-right: 20rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;

      &.checked {
        background: #165DFF;
        border-color: #165DFF;
      }

      .circle-checkbox-inner {
        width: 16rpx;
        height: 16rpx;
        background: #fff;
        border-radius: 50%;
      }
    }

    .checkbox-label {
      font-size: 28rpx;
      color: #333;
    }
  }
}

.privacy-footer {
  display: flex;
  border-top: 1rpx solid #f0f0f0;

  .btn {
    flex: 1;
    height: 100rpx;
    line-height: 100rpx;
    font-size: 32rpx;
    border: none;
    border-radius: 0;
    background: none;

    &.disagree {
      color: #666;
      border-right: 1rpx solid #f0f0f0;
    }

    &.agree {
      color: #165DFF;
      background: #fff;

      &.disabled {
        color: #c0c4cc;
        background: #f5f7fa;
      }
    }

    &::after {
      border: none;
    }
  }
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.header {
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 120rpx;
}

.logo {
  width: 140rpx;
  height: 140rpx;
  margin-bottom: 20rpx;
}

.title {
  margin-bottom: 10rpx;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.subtitle {
  font-size: 28rpx;
  color: #ffffff;
  text-align: center;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.login-card {
  z-index: 2;
  display: flex;
  flex-direction: column;
  width: 90%;
  margin-top: 80rpx;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 24rpx;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.1);
}

.form-wrap {
  padding: 40rpx;
}

.form-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 24rpx 0;
}

.input-icon {
  margin-right: 20rpx;
}

.form-input {
  flex: 1;
  height: 60rpx;
  font-size: 28rpx;
  line-height: 60rpx;
  color: #333;
}

.captcha-input {
  flex: 1;
  margin-right: 20rpx;
}

.captcha-image {
  width: 200rpx;
  height: 60rpx;
  border-radius: 8rpx;
  border: 1rpx solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #f9f9f9;
}

.captcha-img {
  width: 100%;
  height: 100%;
}

.captcha-refresh {
  font-size: 24rpx;
  color: #909399;
  text-align: center;
  padding: 0 10rpx;
}


.clear-icon,
.eye-icon {
  padding: 10rpx;
}

.divider {
  height: 1px;
  margin: 0;
  background-color: rgba(0, 0, 0, 0.06);
}

.login-btn {
  width: 100%;
  height: 90rpx;
  margin-top: 60rpx;
  font-size: 32rpx;
  line-height: 90rpx;
  color: #fff;
  background: linear-gradient(90deg, #165dff, #4080ff);
  border: none;
  border-radius: 45rpx;
  box-shadow: 0 8rpx 20rpx rgba(22, 93, 255, 0.3);
  transition: all 0.3s;
}

.login-btn:active {
  box-shadow: 0 4rpx 10rpx rgba(22, 93, 255, 0.2);
  transform: translateY(2rpx);
}

.login-btn:disabled {
  background: linear-gradient(90deg, #c0c4cc, #d4d7de);
  box-shadow: 0 4rpx 10rpx rgba(192, 196, 204, 0.2);
}

.other-login {
  margin-top: 60rpx;
}

.other-login-title {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.line {
  flex: 1;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.08);
}

.text {
  padding: 0 30rpx;
  font-size: 26rpx;
  color: #9ca3af;
}

.wechat-login {
  display: flex;
  justify-content: center;
  margin-bottom: 30rpx;
}

.wechat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 90rpx;
  height: 90rpx;
  background-color: #fff;
  border-radius: 50%;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.wechat-icon {
  width: 60rpx;
  height: 60rpx;
}

/* 底部协议样式 */
.agreement {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
  font-size: 24rpx;
  padding: 20rpx 0;
}

.agreement-checkbox {
  display: flex;
  align-items: center;
  margin-right: 10rpx;
}

.circle-checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #dcdfe6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8rpx;
  transition: all 0.3s;

  &.checked {
    background: #165DFF;
    border-color: #165DFF;
  }
}

.circle-checkbox-inner {
  width: 16rpx;
  height: 16rpx;
  background: #fff;
  border-radius: 50%;
}

//--------------------------------
.agreement .text {
  padding: 0 4rpx;
  color: #9ca3af;
  font-size: 24rpx;
}

.agreement .link {
  color: #165dff;
  font-size: 24rpx;
}
</style>
