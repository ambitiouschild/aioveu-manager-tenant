<template>

  <view style="width: 100%; height: var(--status-bar-height)" />
  <view class="home">
    <!-- 轮播图 -->
<!--    轮播图组件-->
<!--    wd-swiper→ swiper+ swiper-item-->
<!--    添加了原生小程序轮播图组件-->
    <swiper
      :current="current"
      :autoplay="true"
      circular
      indicator-dots
      @change="onChange"
      class="swiper-container"
    >
      <swiper-item v-for="(item, index) in swiperList" :key="index" @click="handleClick(item, index)">
        <image :src="item.imageUrl" mode="aspectFill" class="swiper-image" />
      </swiper-item>
    </swiper>

    <!-- 自定义swiper指示器 -->
<!--    <view class="swiper-dots">-->
<!--      <text class="num">{{ swiperCurrent + 1 }}</text>-->
<!--      <text class="sign">/</text>-->
<!--      <text class="num">{{ swiperLength }}</text>-->
<!--    </view>-->

    <!-- 快捷导航 -->
<!--    网格布局：-->
<!--    wd-grid→ uni-grid-->
<!--    wd-grid-item→ uni-grid-item-->
<!--    使用自定义样式实现导航布局-->
    <view class="nav-grid mt-2">
      <uni-grid :column="4" :highlight="false" :square="false">
      <uni-grid-item v-for="(item, index) in navList" :key="index">
        <view class="nav-item" @click="navigateTo(item.jumpPath)">
          <image class="nav-icon" :src="item.homeIcon" mode="aspectFit" />
          <text class="nav-text">{{ item.homeName }}</text>
        </view>
      </uni-grid-item>
      </uni-grid>
    </view>

    <!-- 通知公告 -->
<!--    通知公告：-->
<!--    wd-notice-bar→ uni-notice-bar-->
<!--    wd-tag→ uni-tag-->
    <view class="notice-bar">
      <uni-notice-bar
        :text="noticeText"
        background-color="#f0f9ff"
        color="#34D19D"
        :scrollable="true"
      >
        <template v-slot:left>
          <uni-tag text="通知公告" type="primary" size="small" custom-style="margin-right: 10rpx; background-color: #FAA21E; color: white;" />
        </template>
      </uni-notice-bar>
    </view>

<!--    <view>-->
<!--      <button @click="handleShare">设置分享</button>-->
<!--    </view>-->

    <!-- 数据统计 -->
<!--    数据统计区域：-->
<!--    移除了 wd-grid，使用 uni-grid重新布局-->
<!--    wd-button→ 原生 button元素-->
    <view class="stats-grid">
      <uni-grid :column="2" :highlight="false">
        <uni-grid-item>
          <view class="stats-item">
            <!-- 扫描按钮 -->
<!--            <view class="scan-btn-container" v-if="hasScanPermission">-->
<!--              <button-->
<!--                class="scan-btn"-->
<!--                @click="startQRCodeScan"-->
<!--              >-->
<!--                <image class="scan-icon" src="/static/icons/scan.png" />-->
<!--                扫描-->
<!--              </button>-->
<!--            </view>-->

            <view class="stats-content">
              <image class="stats-icon" src="/static/icons/visitor.png" />
              <view class="stats-info">
                <text class="stats-title">访客数</text>
                <text class="stats-value">{{ visitStatsData.todayUvCount }}</text>
              </view>
            </view>
          </view>
        </uni-grid-item>

        <uni-grid-item>
          <view class="stats-item">
            <view class="stats-content">
              <image class="stats-icon" src="/static/icons/browser.png" />
              <view class="stats-info">
                <text class="stats-title">浏览量</text>
                <text class="stats-value">{{ visitStatsData.todayPvCount }}</text>
              </view>
            </view>
          </view>
        </uni-grid-item>
      </uni-grid>
    </view>

    <!-- 访问趋势卡片 -->
<!--    访问趋势卡片：-->
<!--    wd-card→ 自定义卡片视图-->
<!--    wd-radio-group→ 原生 radio组件-->
    <view class="trend-card">
      <view class="card-header">
        <text class="card-title">访问趋势</text>
        <view class="radio-group">
          <label class="radio-label" v-for="option in dateOptions" :key="option.value">
            <radio
              :value="option.value"
              :checked="recentDaysRange === option.value"
              @click="handleDataRangeChange(option.value)"
              color="#007AFF"
            />
            <text class="radio-text">{{ option.label }}</text>
          </label>
        </view>
      </view>

      <view class="charts-box">
        <!-- 图表区域保持不变 -->
        <!-- <qiun-data-charts type="area" :chartData="chartData" :opts="chartOpts" /> -->
      </view>
    </view>
  </view>

  <!-- 扫描组件 -->
  <BarcodeScanner
    v-if="showScanner"
    @decode="handleDecode"
    @close="closeScanner"
    @cancel="handleCancel"
    class="barcode-scanner-container"
    :key="scannerKey"
  />

</template>

<script setup lang="ts">

//可以直接赋值
// 这是 JavaScript，不是 TypeScript
// 注意：这里没有 "lang='ts'"
//onst carouselList = ref([]);
//carouselList.value = response;  // 在 JS 中是允许的
//TypeScript 和 JavaScript 的类型检查差异
//你的 <script setup>标签没有 lang="ts"属性，所以 Vue 3 默认当作 JavaScript 处理。

//如果你想获得更好的类型安全性和开发体验，建议迁移到 TypeScript 并正确注解类型。

import * as dayjs from 'wot-design-uni/dayjs';
import LogAPI, { VisitStatsVO } from "@/api/system/log";
import { ref, onMounted, reactive, nextTick } from 'vue';
import AioveuLaundryGarmentIdentityAPI, { QRCodeScanRequest } from '@/api/aioveuLaundryGarmentIdentity/aioveu-laundry-garment-identity';
import BarcodeScanner from '@/components/BarcodeScanner/BarcodeScanner.vue';
import { getAdvertList } from "@/api/sms/advert";
import { bennerItem } from "@/types/sms/advert";
import { listSeckillingSpus } from "@/api/pms/goods";
import SmsHomeAdvertAPI, { SmsHomeAdvertPageVO } from "@/api/sms/sms-home-advert";
import AuthAPI from "@/api/auth";


import {
  onShareAppMessage,
  onShareTimeline,
  onNavigationBarSearchInputClicked,
  onNavigationBarButtonTap,
} from "@dcloudio/uni-app";

//-----------------------------------------------------
// import { onLoad , onShow } from '@dcloudio/uni-app'
// import { useShare } from '@/composables/useShare'
//
//
// const { setupShare, updateShareConfig } = useShare({
//   title: '初始标题',
//   path: '/pages/index/index'
// })
//
// onLoad(() => {
//   // 初始化分享
//   console.log('页面加载，设置分享')
//   setupShare()
// })
//
// onShow(() => {
//   console.log('页面显示，重新设置分享')
//   setupShare()
// })
//
//
// // 动态更新分享配置
// const handleShare= () => {
//   updateShareConfig({
//     title: '更新后的标题',
//     query: 'id=123&name=test'
//   })
// }

//-----------------------------------------------------

const current = ref<number>(0);
const noticeText = ref("可我不敌可爱 恰同学少年，风华正茂；书生意气，挥斥方遒。指点江山，激扬文字，粪土当年万户侯。");
const loading = ref(false);

const visitStatsData = ref<VisitStatsVO>({
  todayUvCount: 0,
  uvGrowthRate: 0,
  totalUvCount: 0,
  todayPvCount: 0,
  pvGrowthRate: 0,
  totalPvCount: 0,
});

const swiperCurrent = ref(0);
const swiperLength = ref(0);
const categories = ref();
const navList = ref();

// 权限检查函数 - 替换自定义指令
const hasScanPermission = computed(() => {
  // 这里实现您的权限检查逻辑
  // 示例：检查用户是否有扫描权限
  const userPermissions = ['aioveuQRCode:aioveu-QRCode:scan']; // 这里应该是从用户信息中获取的实际权限
  return userPermissions.includes('aioveuQRCode:aioveu-QRCode:scan');
});

// 日期选项
const dateOptions = [
  { label: '近7天', value: 7 },
  { label: '近15天', value: 15 }
];

// 扫描相关状态
const showScanner = ref(false);
const scannerKey = ref(0);


//分享功能
onShareAppMessage(() => ({
  title: "可我不敌心软~",
  path: "/pages/index/index",
  imageUrl: "********************",
  success: (res?:any) => {
    console.log("分享成功", res);
  },
  fail: (err?:any) => {
    console.log("分享失败", err);
  },
}));

onShareTimeline(() => ({
  title: "可我不敌心软~",
  query: "key=value",
  imageUrl: "https://cdn.aioveu.com/aioveu-server/avatar/avatar.png",
  success: (res?:any) => {
    console.log("分享到朋友圈成功", res);
  },
  fail: (err?:any) => {
    console.log("分享到朋友圈失败", err);
  },
}));

// 标题栏搜索点击
onNavigationBarSearchInputClicked(async () => {
  uni.$emit("showToast", { title: "点击了搜索框" });
});

// 标题栏按钮点击
onNavigationBarButtonTap((e) => {
  const index = e.index;
  if (index === 0) {
    uni.$emit("showToast", { title: "点击了扫描" });
  } else if (index === 1) {
    // #ifdef APP-PLUS
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    // 添加类型断言和安全判断
    if (page && (page as any).$getAppWebview) {
      const currentWebview = (page as any).$getAppWebview();
      if (currentWebview && currentWebview.hideTitleNViewButtonRedDot) {
        currentWebview.hideTitleNViewButtonRedDot({ index });
      }
    }
    // #endif
    uni.navigateTo({ url: "/pages/notice/notice" });
  }
});

// 开始扫描
const startQRCodeScan = async () => {
  console.log('[父组件] 扫描按钮被点击');

  // #ifdef H5
  console.log('[父组件] H5环境，显示扫描组件');
  showScanner.value = true;
  scannerKey.value += 1;

  nextTick(() => {
    console.log('nextTick后 showScanner状态:', showScanner.value);
  });
  // #endif
};

// 处理扫描结果
const handleDecode = (result: string) => {
  console.log('扫描结果:', result);
  sendScanRequest(result);
};

// 处理取消事件
const handleCancel = () => {
  console.log('[父组件] 收到取消事件');
  showScanner.value = false;
};

// 关闭扫描器
const closeScanner = () => {
  showScanner.value = false;
  console.log('[父组件] 关闭扫描器');
};

// 发送扫描请求
const sendScanRequest = async (qrContent: string) => {
  const requestData: QRCodeScanRequest = {
    qrContent: qrContent,
    scannerId: 1,
    deviceInfo: uni.getSystemInfoSync().model,
  };

  try {
    uni.showLoading({
      title: '处理中...',
      mask: true
    });

    const response = await AioveuLaundryGarmentIdentityAPI.scanQRCode(requestData);
    console.log('扫描二维码API响应response', response);

    uni.setStorageSync('currentGarmentInfo', response);
    console.log('本地存储信息 currentGarmentInfo:', response);

    uni.navigateTo({
      url: `/packageG/pages/aioveu_laundry/laundry_garment_info/index`,
      success: () => {
        console.log('跳转成功');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        uni.showToast({
          title: '页面跳转失败',
          icon: 'error'
        });
      }
    });
  } catch (error) {
    console.error('扫描失败:', error);
    uni.showToast({
      title: '扫描失败: ',
      icon: 'error',
      duration: 3000
    });
  } finally {
    uni.hideLoading();
  }
};

// 图表数据
const chartData = ref({});
const chartOpts = ref({
  padding: [20, 0, 20, 0],
  xAxis: {
    fontSize: 10,
    rotateLabel: true,
    rotateAngle: 30,
  },
  yAxis: {
    disabled: true,
  },
  extra: {
    area: {
      type: "curve",
      opacity: 0.2,
      addLine: true,
      width: 2,
      gradient: true,
      activeType: "hollow",
    },
  },
});

// 日期范围
const recentDaysRange = ref(7);

const swiperList = ref<bennerItem[]>([]);

// 生命周期
// 页面显示时触发
onMounted(() => {
  console.log("首页页面加载");
  loadData();
});



// 数据加载
const loadData = async (isRefresh = false) => {
  try {
    loading.value = true;

    await Promise.all([
      loadCarouselData(),
      loadCategoriesData(),
      // loadAdvertsData(),
      // loadGoodsData(),
    ]);
  } catch (error) {
    console.error("加载首页数据失败:", error);
    uni.showToast({
      title: "加载失败",
      icon: "none",
    });
  } finally {
    loading.value = false;
    if (isRefresh) {
      uni.stopPullDownRefresh();
    }
  }
};

//获取轮播图广告列表
const loadCarouselData = async () => {
  try {
    const response = await getAdvertList();
    console.log("获取轮播图广告列表:", response);

    if (response && Array.isArray(response)) {
      swiperList.value = response;
      swiperLength.value = response.length;
    }
  } catch (error) {
    console.error("加载轮播图数据失败:", error);
    swiperList.value = getDefaultCarouselData();
  }
};

// 默认数据
const getDefaultCarouselData = () => [
  { imageUrl: "/static/temp/b1.jpg", title: "广告1" },
  { imageUrl: "/static/temp/b2.jpg", title: "广告2" },
  { imageUrl: "/static/temp/b3.jpg", title: "广告3" },
];

const loadCategoriesData = async () => {
  try {
    const response = await AuthAPI.getManagerHomeCategories();
    console.log("获取分类列表:", response);

    if (response) {
      navList.value = response ;
      console.log("====navList.value============",navList.value);
    } else {
      navList.value = [];
    }
  } catch (error) {
    console.error("加载分类数据失败:", error);
    categories.value = [];
  }
};



// 快捷导航列表
// const navList = reactive([
//   {
//     icon: "/static/icons/weixin.png",
//     title: "员工管理",
//     url: "/packageC/pages/aioveu_department/employee/index",
//   },
//   {
//     icon: "/static/icons/browser.png",
//     title: "物资管理",
//     url: "/packageD/pages/aioveu_material/material/index",
//   },
//   {
//     icon: "/static/icons/visitor.png",
//     title: "客户管理",
//     url: "/packageE/pages/aioveu_customer/customer/index",
//   },
//   {
//     icon: "/static/icons/user.png",
//     title: "用户管理",
//     url: "/packageB/pages/work/user/index",
//     prem: "sys:user:query",
//   },
//   {
//     icon: "/static/icons/role.png",
//     title: "角色管理",
//     url: "/packageB/pages/work/role/index",
//     prem: "sys:role:query",
//   },
//   {
//     icon: "/static/icons/notice.png",
//     title: "通知公告",
//     url: "/packageB/pages/work/notice/index",
//     prem: "sys:notice:query",
//   },
//   {
//     icon: "/static/icons/setting.png",
//     title: "系统配置",
//     url: "/packageB/pages/work/config/index",
//     prem: "sys:config:query",
//   },
// ]);

// 导航跳转
const navigateTo = (url: string) => {
  uni.navigateTo({
    url: url
  });
};

function handleClick(item: any, index: number) {

  swiperCurrent.value = index;
  console.log('点击轮播图:', item, index);
}

function onChange(e: any) {
  console.log('轮播图切换:', e);
  current.value = e.detail.current;
}

// 数据范围变化
const handleDataRangeChange = (value: number) => {
  console.log("handleDataRangeChange", value);
  recentDaysRange.value = value;
  loadVisitTrendData();
};

// 加载访问统计数据
const loadVisitStatsData = async () => {
  LogAPI.getVisitStats().then((data) => {
    visitStatsData.value = data;
  });
};

// 加载访问趋势数据
const loadVisitTrendData = () => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - recentDaysRange.value + 1);

  const visitTrendQuery = {
    startDate: dayjs(startDate).format("YYYY-MM-DD"),
    endDate: dayjs(endDate).format("YYYY-MM-DD"),
  };

  LogAPI.getVisitTrend(visitTrendQuery).then((data) => {
    const res = {
      categories: data.dates,
      series: [
        {
          name: "访客数(UV)",
          data: data.ipList,
        },
        {
          name: "浏览量(PV)",
          data: data.pvList,
        },
      ],
    };
    chartData.value = JSON.parse(JSON.stringify(res));
  });
};

onReady(() => {
  loadVisitStatsData();
  loadVisitTrendData();
});
</script>

<style lang="scss">


/* 确保 uni.css 被正确引入 */
/* 通常在 App.vue 或页面中引入 */
@import "@/common/uni.css";

.status-bar {
  height: var(--status-bar-height);
  width: 100%;
  background-color: transparent;
}



.home {
  padding: 20rpx;
}

.swiper-container {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.swiper-image {
  width: 100%;
  height: 100%;
}

.nav-grid {
  background: white;
  border-radius: 16rpx;
  padding: 20rpx 0;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
}

.nav-icon {
  width: 72rpx;
  height: 72rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
}

.nav-text {
  font-size: 24rpx;
  color: #333;
}

.notice-bar {
  margin: 20rpx 0;
  border-radius: 16rpx;
  overflow: hidden;
}

.stats-grid {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx 0;
  margin: 20rpx 0;
}

.stats-item {
  display: flex;
  align-items: center;
  padding: 0 40rpx;
  height: 120rpx;
}

.scan-btn-container {
  margin-right: 24rpx;
}

.scan-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #007AFF;
  color: white;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  font-size: 24rpx;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
}

.scan-icon {
  width: 24rpx;
  height: 24rpx;
  margin-right: 8rpx;
}

.stats-content {
  display: flex;
  align-items: center;
}

.stats-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.stats-info {
  display: flex;
  flex-direction: column;
}

.stats-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.stats-value {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: bold;
}

.trend-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 20rpx 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.radio-group {
  display: flex;
  align-items: center;
}

.radio-label {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
}

.radio-text {
  font-size: 24rpx;
  color: #333;
  margin-left: 8rpx;
}

.charts-box {
  width: 100%;
  height: 400rpx;
}

.barcode-scanner-container {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100% !important;
  height: 100% !important;
  z-index: 10000 !important;
  background-color: black !important;
}

.mt-2 {
  margin-top: 20rpx;
}
</style>
