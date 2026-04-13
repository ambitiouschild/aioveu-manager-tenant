//
// // 方案C：使用 definePageConfig 方式（Vue 3 推荐）
// //
// // 步骤1：创建快捷函数
//
//
// // utils/pageShare.js
// export function createShare(config = {}) {
//   const defaultConfig = {
//     title: "可我不敌心软~",
//     imageUrl: "https://cdn.aioveu.com/aioveu-server/avatar/avatar.png",
//     query: "from=share"
//   }
//
//   const shareConfig = { ...defaultConfig, ...config }
//
//   return {
//     onShareAppMessage() {
//       return {
//         title: shareConfig.title,
//         path: shareConfig.path + (shareConfig.query ? `?${shareConfig.query}` : ''),
//         imageUrl: shareConfig.imageUrl,
//         success(res:any) {
//           console.log("分享成功", res)
//         },
//         fail(err:any) {
//           console.log("分享失败", err)
//         }
//       }
//     },
//
//     onShareTimeline() {
//       return {
//         title: shareConfig.title,
//         query: shareConfig.query,
//         imageUrl: shareConfig.imageUrl,
//         success(res:any) {
//           console.log("分享到朋友圈成功", res)
//         },
//         fail(err:any) {
//           console.log("分享到朋友圈失败", err)
//         }
//       }
//     }
//   }
// }
//
// // <!-- 任何需要分享的页面 -->
// // <script setup>
// // import { createShare } from '@/utils/pageShare'
// //
// // definePageConfig({
// //   // 使用默认配置
// //   ...createShare()
// //
// //   // 或自定义配置
// //   // ...createShare({
// //   //   title: "自定义标题",
// //   //   path: "/pages/current/page"
// //   // })
// // })
// // </script>
