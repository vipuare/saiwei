# SaiWei Sport B2B 体育用品站 — 完整项目规划

> 项目定位：B2B 体育用品 OEM/ODM 综合站，核心目标是 SEO/GEO 获客 + 在线询盘转化
> 技术栈：Astro 6 (SSG) + Cloudflare Pages (部署) + Cloudflare D1 (询盘存储) + Keystatic (可视化CMS)

---

## 一、整体架构

```
┌─────────────────────────────────────────────────┐
│                  用户浏览器                       │
└───────────────┬─────────────────┬───────────────┘
                │                 │
        静态页面(Astro)      表单提交(API)
                │                 │
                ▼                 ▼
      ┌─────────────┐    ┌──────────────┐
      │ Cloudflare   │    │ Cloudflare    │
      │ Pages (CDN)  │    │ Workers + D1  │
      └─────────────┘    └──────┬───────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
              D1 数据库                邮件通知
            (询盘记录)           (Resend/SMTP)
```

- **前端**：Astro 静态生成（SSG），零 JS 框架，极致加载速度
- **部署**：Cloudflare Pages，全球 CDN，自动 HTTPS
- **CMS**：Keystatic，直接在 Git 仓库中编辑 Markdown，提供可视化后台
- **询盘后端**：Cloudflare Workers（Serverless API）+ D1（SQLite 数据库）
- **邮件通知**：Cloudflare Workers 内调用 Resend API 发邮件

---

## 二、SEO 优化方案

### 2.1 技术 SEO 基础

#### 安装依赖

```bash
npm install @astrojs/sitemap astro-seo
```

#### astro.config.mjs 配置

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://saiweisport.com',  // 替换为实际域名
  integrations: [sitemap()],
});
```

#### robots.txt（放在 public/ 目录）

```
User-agent: *
Allow: /

Sitemap: https://saiweisport.com/sitemap-index.xml
```

### 2.2 每个页面的 SEO 元素

每个页面必须包含以下元素，全部在 Layout.astro 中统一管理：

```
┌──────────────────────────────────────┐
│  <title> 每页唯一，包含核心关键词      │
│  <meta name="description"> 每页唯一   │
│  <link rel="canonical"> 防止重复收录   │
│  Open Graph (og:title, og:image...)  │
│  hreflang (多语言时使用)              │
│  Schema.org JSON-LD 结构化数据        │
└──────────────────────────────────────┘
```

### 2.3 URL 结构设计

```
/                          → 首页
/products                  → 产品总览
/products/custom-footballs → 产品详情页（SEO友好URL）
/oem-odm                   → OEM/ODM 服务
/factory                   → 工厂实力
/about                     → 关于我们
/contact                   → 联系/询盘
/blog                      → 博客（后续SEO内容）
/blog/xxx                  → 博客文章
```

产品页用 slug 而不是 ID，对 SEO 更友好。

### 2.4 性能优化（直接影响排名）

| 优化项 | 做法说明 |
|--------|---------|
| 图片 | 使用 Astro `<Image>` 组件，自动 WebP/AVIF 转换 + 懒加载 |
| 字体 | 预加载 Inter 字体，或用 `font-display: swap` |
| CSS | 已全局单文件，Astro 自动内联关键 CSS |
| JS | 仅首页轮播有少量 JS，其余零 JS |
| LCP | 首屏视频/大图加 `preload`，优先加载首屏内容 |

### 2.5 内链策略

```
首页 ──→ 产品详情页（每个产品卡片链接到详情页）
  │
  ├──→ OEM/ODM 页（内链锚文本 "custom football manufacturer"）
  │
  ├──→ Factory 页（内链 "sports goods factory"）
  │
  └──→ Contact 页（每个页面的 CTA 按钮都指向这里）

产品详情页 ──→ 相关产品（交叉推荐）
    │
    └──→ 博客文章（"how to choose custom footballs" 等）
```

---

## 三、GEO 优化方案（生成式引擎优化）

GEO 的核心：让 AI 搜索引擎（ChatGPT、Perplexity、Google AI Overview）能提取到你的产品信息。

### 3.1 Schema.org 结构化数据

在每个页面注入 JSON-LD，这是 GEO 最关键的一步。

#### 全站通用 — Organization + WebSite

放在 Layout.astro 的 `<head>` 中：

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "SaiWei Sport",
  "url": "https://saiweisport.com",
  "logo": "https://saiweisport.com/logo.svg",
  "description": "Custom sports goods manufacturer for global B2B buyers",
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "sales@saiweisport.com",
    "contactType": "sales"
  },
  "sameAs": []
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "SaiWei Sport",
  "url": "https://saiweisport.com"
}
```

#### 产品页 — Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Custom Footballs",
  "description": "Training balls, match balls and promotional footballs...",
  "brand": { "@type": "Brand", "name": "SaiWei Sport" },
  "manufacturer": { "@type": "Organization", "name": "SaiWei Sport" },
  "category": "Sports Equipment",
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "eligibleCustomerType": "B2B"
  }
}
```

#### 首页 — LocalBusiness（工厂）

```json
{
  "@context": "https://schema.org",
  "@type": "Manufacturer",
  "name": "SaiWei Sport",
  "url": "https://saiweisport.com",
  "address": { "@type": "PostalAddress", "addressCountry": "CN" },
  "makesOffer": [
    { "@type": "Offer", "itemOffered": "Custom Footballs" },
    { "@type": "Offer", "itemOffered": "Football Uniforms" },
    { "@type": "Offer", "itemOffered": "Custom Basketballs" }
  ]
}
```

#### 博客文章 — Article + FAQPage

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the MOQ for custom footballs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "MOQ depends on product type..."
      }
    }
  ]
}
```

### 3.2 GEO 内容策略

AI 搜索引擎偏好**结构清晰、可直接引用**的内容。

| 内容类型 | 作用 | 示例 |
|---------|------|------|
| FAQ 页/区块 | AI 直接引用回答 | "What is MOQ for custom footballs?" |
| 对比表格 | AI 提取结构化数据 | 产品对比表（已有） |
| 定义型句子 | AI 引用为事实陈述 | "SaiWei Sport is a custom sports goods manufacturer based in China" |
| 数字/数据 | AI 偏好引用带数据的内容 | "5 product categories, 200+ B2B buyers served" |
| How-to 文章 | AI 搜索 how 类问题时引用 | "How to start a private label sports brand" |

### 3.3 FAQ 页面规划（新建页面）

创建 `/faq` 页面，包含 20-30 个高频 B2B 问题：

```
- What is the MOQ for custom footballs?
- Can I order mixed products in one shipment?
- Do you provide samples before bulk orders?
- What customization options are available?
- How long does production take?
- What packaging options do you offer?
- Can you print my brand logo on products?
- Do you ship to Europe / Amazon FBA?
- ...更多
```

FAQ 页面是 GEO 的核心武器：AI 搜索引擎遇到用户提问时，会直接引用你的 FAQ 内容。

---

## 四、CMS 方案 — 非技术人员添加产品

### 4.1 方案选型：Keystatic

选择 Keystatic 的原因：
- 基于 Git，数据存在 Markdown 文件中，不需要额外数据库
- 提供可视化 Web 界面，非技术人员会用 Word 就会用
- 与 Astro 原生集成，构建时读取内容
- 免费开源，无第三方服务依赖

### 4.2 安装配置

```bash
npm install @keystatic/core @keystatic/astro
```

#### 内容目录结构

```
src/
├── content/
│   ├── products/           ← 产品内容（Markdown）
│   │   ├── custom-footballs.md
│   │   ├── football-uniforms.md
│   │   ├── custom-basketballs.md
│   │   ├── basketball-uniforms.md
│   │   ├── shin-guards.md
│   │   └── mixed-orders.md
│   ├── blog/               ← 博客文章
│   │   └── how-to-choose-custom-footballs.md
│   └── faq/                ← FAQ 条目
│       ├── moq-for-footballs.md
│       └── shipping-to-europe.md
├── components/
│   ├── ProductCard.astro   ← 产品卡片组件
│   └── ProductDetail.astro ← 产品详情布局
└── pages/
    ├── products/
    │   ├── index.astro     ← 产品列表页
    │   └── [slug].astro    ← 产品详情动态路由
    ├── blog/
    │   ├── index.astro
    │   └── [slug].astro
    └── faq.astro
```

#### 产品 Markdown 模板示例

```markdown
---
# src/content/products/custom-footballs.md
title: "Custom Footballs - Training, Match & Promotional"
description: "Custom branded footballs with logo printing..."
icon: "⚽"
category: "football"
featured: true
order: 1
specifications:
  - "PU / PVC material options"
  - "Size 3, 4, 5 available"
  - "Custom panel colors"
moq: "500 pieces"
leadTime: "25-35 days"
images:
  - /images/products/football-1.jpg
  - /images/products/football-2.jpg
---

## Product Overview

Training balls, match balls and promotional footballs with
brand logo, panel colors and retail packaging.

## Customization Options

- Logo printing (screen print / heat transfer)
- Panel color customization
- Retail carton with brand design

## Ideal For

Wholesalers, Amazon sellers, sports brands and promotional buyers.
---
```

#### 非技术人员操作流程

```
1. 访问 https://saiweisport.com/keystatic
2. 用 GitHub 账号登录（OAuth）
3. 点击 "Products" → "Create New"
4. 填写表单（标题、描述、图片、参数等）
5. 点击 "Save" → 自动提交到 Git
6. Cloudflare Pages 自动重新构建部署
7. 新产品页面上线
```

整个过程像编辑 Word 文档一样简单，不需要碰代码。

---

## 五、询盘系统

### 5.1 架构设计

```
用户填写表单
      │
      ▼
Cloudflare Workers API (/api/inquiry)
      │
      ├─→ 存入 D1 数据库（永久保留）
      │
      ├─→ 发送邮件通知（Resend API → sales@saiweisport.com）
      │
      └─→ 返回成功/失败给用户
```

### 5.2 D1 数据库表设计

```sql
-- 询盘主表
CREATE TABLE inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,           -- 姓名/公司
  email      TEXT NOT NULL,           -- 邮箱
  buyer_type TEXT,                    -- 买家类型
  product    TEXT,                    -- 感兴趣的产品
  quantity   TEXT,                    -- 预估数量
  market     TEXT,                    -- 目标市场
  message    TEXT,                    -- 详细需求
  source     TEXT DEFAULT 'website',  -- 来源页面
  status     TEXT DEFAULT 'new',      -- new / read / replied / closed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 询盘跟进记录
CREATE TABLE inquiry_followups (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  inquiry_id   INTEGER REFERENCES inquiries(id),
  note         TEXT,
  replied_by   TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 5.3 API 端点（Cloudflare Workers）

```
POST /api/inquiry        → 提交新询盘
GET  /api/inquiries      → 查询询盘列表（需鉴权）
GET  /api/inquiry/:id    → 查询单条询盘详情
PATCH /api/inquiry/:id   → 更新询盘状态
```

### 5.4 询盘管理后台

创建一个简单的 `/admin` 页面（密码保护）：

```
┌─────────────────────────────────────────┐
│  SaiWei Sport - Inquiry Dashboard       │
├─────────────────────────────────────────┤
│  [New 12]  [Read 8]  [Replied 3]       │
├─────────────────────────────────────────┤
│  🟢 John Smith | Amazon Seller          │
│     Custom Footballs | 1000pcs          │
│     Target: Germany                     │
│     2026-06-12 10:30                    │
│     [View Detail] [Mark Read] [Reply]   │
├─────────────────────────────────────────┤
│  🟢 Maria Garcia | Wholesaler           │
│     Mixed Products | 5000pcs            │
│     Target: Spain                       │
│     2026-06-12 09:15                    │
│     [View Detail] [Mark Read] [Reply]   │
├─────────────────────────────────────────┤
│  ...更多询盘 ...                         │
└─────────────────────────────────────────┘
```

### 5.5 邮件通知模板

收到新询盘时自动发送到 sales@saiweisport.com：

```
Subject: [New Inquiry] {product} - {buyer_type} from {market}

New inquiry received from SaiWei Sport website:

Name: {name}
Email: {email}
Buyer Type: {buyer_type}
Product: {product}
Quantity: {quantity}
Market: {market}

Message:
{message}

---
View in dashboard: https://saiweisport.com/admin/inquiry/{id}
```

---

## 六、实施路线图

### Phase 1：SEO 基础（优先级最高）

| 任务 | 说明 |
|------|------|
| 配置 sitemap | 安装 @astrojs/sitemap，配置 site URL |
| 创建 robots.txt | 放在 public/ 目录 |
| 完善 meta 标签 | 每页独立的 title、description、canonical |
| Open Graph 标签 | 社交分享时显示正确的标题和图片 |
| Schema.org JSON-LD | Organization、Product、FAQPage 等 |
| 图片优化 | 使用 Astro Image 组件，添加 alt 属性 |
| 性能优化 | 字体预加载、关键 CSS 内联 |

### Phase 2：CMS + 产品系统

| 任务 | 说明 |
|------|------|
| 配置 Keystatic | 可视化内容管理后台 |
| 建立 Content Collections | 产品、博客、FAQ 的内容模型 |
| 产品详情页 | 动态路由 `[slug].astro` |
| 产品列表页 | 自动从 Content Collections 生成 |
| 图片管理 | 产品图片上传和管理 |

### Phase 3：询盘系统

| 任务 | 说明 |
|------|------|
| Cloudflare D1 数据库 | 创建库和表 |
| Workers API | 询盘提交和查询接口 |
| 表单对接 | 改造 contact 页面的 form |
| 邮件通知 | 接入 Resend 发送通知邮件 |
| Admin 后台 | 询盘管理页面 |

### Phase 4：GEO + 内容营销

| 任务 | 说明 |
|------|------|
| FAQ 页面 | 20-30 个高频 B2B 问题 |
| 博客系统 | 行业知识文章 |
| How-to 文章 | AI 容易引用的教程内容 |
| 内链优化 | 产品间、文章间交叉链接 |
| 外链建设 | 行业目录、B2B 平台链接 |

### Phase 5：高级功能

| 任务 | 说明 |
|------|------|
| 多语言 (i18n) | 英语为主，后续加西班牙语/德语 |
| Google Analytics | 流量分析和转化追踪 |
| WhatsApp 按钮 | 浮动在线咨询按钮 |
| 产品 PDF 目录 | 可下载的产品目录生成 |

---

## 七、文件结构总览（完成后）

```
saiwei-sport/
├── astro.config.mjs          ← Astro + Sitemap + Keystatic 配置
├── package.json
├── wrangler.toml              ← Cloudflare Workers/D1 配置
├── public/
│   ├── robots.txt
│   ├── favicon.svg
│   └── images/                ← 产品图片、工厂照片
│       ├── products/
│       └── factory/
├── src/
│   ├── styles/
│   │   └── global.css
│   ├── layouts/
│   │   └── Layout.astro       ← 含 SEO meta、Schema.org
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── ProductCard.astro
│   │   ├── SchemaOrg.astro    ← JSON-LD 结构化数据组件
│   │   ├── InquiryForm.astro  ← 询盘表单组件
│   │   └── FaqItem.astro
│   ├── content/
│   │   ├── products/          ← 产品 Markdown
│   │   ├── blog/              ← 博客 Markdown
│   │   └── faq/               ← FAQ Markdown
│   ├── pages/
│   │   ├── index.astro
│   │   ├── about.astro
│   │   ├── factory.astro
│   │   ├── oem-odm.astro
│   │   ├── contact.astro
│   │   ├── faq.astro
│   │   ├── products/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── admin.astro        ← 询盘管理后台
│   └── lib/
│       └── schema.ts          ← Schema.org 类型定义
├── functions/                 ← Cloudflare Workers (API)
│   └── api/
│       ├── inquiry.ts         ← POST 提交询盘
│       └── inquiries.ts       ← GET 查询询盘
├── deploy.bat                 ← 部署脚本（不提交到仓库）
└── .gitignore
```

---

## 八、成本估算

| 服务 | 费用 |
|------|------|
| Cloudflare Pages（托管） | 免费（500次构建/月） |
| Cloudflare D1（数据库） | 免费（5GB 内） |
| Cloudflare Workers（API） | 免费（10万次请求/天） |
| Keystatic（CMS） | 免费开源 |
| Resend（邮件通知） | 免费（100封/天） |
| 域名 | 约 $10-15/年 |
| **总计** | **约 $10-15/年（仅域名费用）** |

除了域名，所有基础设施都是免费的。
