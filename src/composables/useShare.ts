// composables/useShare.js
import { ref, onMounted, onUnmounted } from 'vue'

// 类型定义
interface ShareAppMessageOptions {
  title: string
  path: string
  imageUrl?: string
  desc?: string
  success?: (res?: any) => void
  fail?: (err?: any) => void
  complete?: () => void
}

interface ShareTimelineOptions {
  title: string
  query?: string
  imageUrl?: string
  success?: (res?: any) => void
  fail?: (err?: any) => void
  complete?: () => void
}

// 扩展 uni 的类型定义
declare global {
  interface Uni {
    onShareAppMessage?: (callback: () => ShareAppMessageOptions) => void
    onShareTimeline?: (callback: () => ShareTimelineOptions) => void
  }
}

export function useShare(defaultConfig: Partial<ShareAppMessageOptions & ShareTimelineOptions> = {}) {
  // 默认分享配置
  const defaultShareConfig = {
    title: '可我不敌心软~',
    path: '/pages/index/index',
    imageUrl: 'https://cdn.aioveu.com/aioveu-server/avatar/avatar.png', // 使用您链接中的图片
    query: 'key=value'
  }

  // 合并配置
  const shareConfig = ref({
    ...defaultShareConfig,
    ...defaultConfig
  })

  // 分享成功回调
  const onShareSuccess = (res: any) => {
    console.log('分享成功', res)
  }

  // 分享失败回调
  const onShareFail = (err: any) => {
    console.log('分享失败', err)
  }

  // 朋友圈分享成功回调
  const onShareTimelineSuccess = (res: any) => {
    console.log('分享到朋友圈成功', res)
  }

  // 朋友圈分享失败回调
  const onShareTimelineFail = (err: any) => {
    console.log('分享到朋友圈失败', err)
  }

  // 设置分享的方法
  const setupShare = (customConfig: Partial<ShareAppMessageOptions & ShareTimelineOptions> = {}) => {
    // 更新配置
    if (Object.keys(customConfig).length > 0) {
      shareConfig.value = { ...shareConfig.value, ...customConfig }
    }

    // 使用类型断言绕过 TypeScript 检查
    const uniWithShare = uni as any

    // 设置分享给朋友
    if (uniWithShare.onShareAppMessage) {
      uniWithShare.onShareAppMessage(() => ({
        title: shareConfig.value.title,
        path: shareConfig.value.path + (shareConfig.value.query ? `?${shareConfig.value.query}` : ''),
        imageUrl: shareConfig.value.imageUrl,
        success: onShareSuccess,
        fail: onShareFail
      }))
    }

    // 设置分享到朋友圈
    if (uniWithShare.onShareTimeline) {
      uniWithShare.onShareTimeline(() => ({
        title: shareConfig.value.title,
        query: shareConfig.value.query,
        imageUrl: shareConfig.value.imageUrl,
        success: onShareTimelineSuccess,
        fail: onShareTimelineFail
      }))
    }

  }

  // 更新分享配置
  const updateShareConfig = (newConfig: Partial<ShareAppMessageOptions & ShareTimelineOptions>) => {
    shareConfig.value = { ...shareConfig.value, ...newConfig }
    setupShare()
  }

  return {
    shareConfig,
    setupShare,
    updateShareConfig,
    onShareSuccess,
    onShareFail,
    onShareTimelineSuccess,
    onShareTimelineFail
  }
}

// 使用示例
//
// <template>
// <view>
//   <button @click="handleShare">设置分享</button>
//   </view>
//   </template>
//
//
//   <script setup lang="ts">
// import { onLoad } from '@dcloudio/uni-app'
// import { useShare } from '@/composables/useShare'
//
// const { setupShare, updateShareConfig } = useShare({
//   title: '初始标题',
//   path: '/pages/index/index'
// })
//
// onLoad(() => {
//   // 初始化分享
//   setupShare()
// })
//
// // 动态更新分享配置
// function handleShare() {
//   updateShareConfig({
//     title: '更新后的标题',
//     query: 'id=123&name=test'
//   })
// }
// </script>
