## 项目介绍

基于 uni-app + Vue 3 + TypeScript 移动端跨平台开发模板，集成了 ESLint、Prettier、Stylelint、Husky 和 Commitlint 等工具，确保代码规范与质量。

## 项目截图

![](https://www.youlai.tech/storage/blog/2025/04/30/app.jpg)

## 项目文档

[从0到1构建 UniApp + Vue3 + TypeScript 移动端跨平台开源脚手架](https://juejin.cn/post/7448963032993038376)

## 项目启动

安装依赖

```bash
pnpm install
```

h5启动

```bash
pnpm run dev:h5
```

访问 [http://localhost:4096](http://localhost:4096)


H5 部署
执行 pnpm run build:h5 命令来完成项目的打包：

```bash
pnpm run build:h5
```

打包后生成的静态文件位于 dist/build/h5 目录下。将该目录下的文件复制到服务器的 /usr/share/nginx/html/vue-uniapp-template 目录。


这样配置完成后，就可以通过 nginx 服务器来访问你的项目了。


❌ 误区1：vendor.js 是 node_modules 的压缩版
正确理解：vendor.js 是经过 Tree Shaking、代码分割、压缩优化后的生产代码。

❌ 误区2：删除 node_modules 会影响已构建的项目
正确理解：已构建的项目（dist 目录）不依赖 node_modules。

❌ 误区3：必须保留 node_modules 才能运行构建后的代码
正确理解：构建后的代码是自包含的，所有依赖都已打包。

为什么我的uniapp运行微信小程序生成的mp-weixin里面还有node-modules文件夹，而且很大，可以删掉吗

无论哪种情况，mp-weixin目录下的node_modules都是可以删除的，因为小程序运行时不依赖这个目录，它依赖的是已经打包到js文件中的代码。
原因：
小程序运行时依赖的是打包后的 vendor.js，不是 node_modules
mp-weixin中的 node_modules是冗余的
删除后可以显著减小包体积
不会影响小程序功能
