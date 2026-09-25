# Boarding Pass Studio · 登机牌生成器

[在线体验 / Live Demo](https://carey-bk.github.io/boarding-pass-generator/) · [Netlify 版本](https://boardingpassstudio.netlify.app/)

![Boarding Pass Studio preview](docs/preview.png)

## 中文介绍

一个纯前端的登机牌样机生成器。填写机场、航班、乘机人和座位信息后，可实时预览并下载登机牌 PNG，也可以生成深色 iPhone 截图样式的图片。

二维码数据遵循 IATA Resolution 792 单航段 BCBP 的 58 字符强制字段核心结构，并使用 QR Version 7 生成。应用不上传填写内容，所有图像均在浏览器本地生成。

### 功能

- 实时预览登机牌
- 用户自定义航程、航班、乘机人、座位和常客信息
- 生成符合 BCBP 核心字段结构的二维码
- 下载独立登机牌 PNG 或 iPhone 截图
- 适配桌面端和移动端
- 支持 Netlify 与 GitHub Pages 静态托管

### 本地运行

需要 Node.js 20+ 和 pnpm：

```bash
corepack enable
pnpm install
pnpm dev
```

检查和构建：

```bash
pnpm test
pnpm build
```

### 重要说明

本项目仅用于界面设计、样机制作与开发测试。生成内容不含航空公司数字签名，也不连接航空公司的值机或 DCS 系统，因此不是有效旅行凭证。本项目与航旅纵横及任何航空公司均无官方关联。

---

## English

A browser-only boarding pass mockup generator. Enter route, flight, passenger, and seat details to preview and download a boarding pass PNG, or export a dark-mode iPhone screenshot-style image.

The QR payload follows the 58-character mandatory core structure of a single-leg IATA Resolution 792 BCBP and is rendered as QR Version 7. Form data stays in the browser, and all images are generated locally.

### Features

- Live boarding pass preview
- Custom route, flight, passenger, seat, and frequent-flyer fields
- QR payload based on the mandatory BCBP core fields
- Boarding pass PNG and iPhone screenshot exports
- Responsive desktop and mobile UI
- Static deployment on Netlify or GitHub Pages

### Local development

Node.js 20+ and pnpm are required:

```bash
corepack enable
pnpm install
pnpm dev
```

Run checks and create a production build:

```bash
pnpm test
pnpm build
```

### Disclaimer

This project is intended only for UI design, mockups, and development testing. Generated images are not digitally signed by an airline, do not connect to any airline check-in or DCS system, and are not valid travel documents. This project is not officially affiliated with Umetrip or any airline.
