# summer2077 个人主页

`summer2077.com` 的零构建静态个人主页。首页保留具有辨识度的角色构图和 Tab 交互，同时提供可独立索引的个人介绍、项目列表与项目案例页面。

## 目录结构

```text
<project-root>/
├── index.html                         首页
├── about/index.html                   独立 About / ProfilePage
├── projects/index.html                项目集合页
├── projects/easy-resume/index.html    Easy Resume 案例页
├── projects/tabifun/index.html        TabiFun 旅行地图案例页
├── projects/ai-wardrobe/index.html    AI 衣橱案例页
├── blog/index.html                    实践笔记列表页
├── blog/*/index.html                  原创文章页
├── 404.html                           自定义 404（noindex）
├── robots.txt                         搜索与 AI crawler 规则
├── sitemap.xml                        可索引 URL 清单
├── site.webmanifest                   站点清单
├── baidu_verify_codeva-O70Xp4Tsme.html 百度文件验证（不进 sitemap）
├── deploy/                            生产 Nginx 配置副本（不发布到 Web 根目录）
├── scripts/deploy.sh                  可审计发布脚本
├── docs/AGENT_HANDOFF.md              交接说明与待办
├── css/style.css                      全站样式
├── js/main.js                         渐进增强、Tab、轮播和灯箱
└── assets/                            形象图、项目截图和 WebP 版本
```

## 品牌与正式 URL

- 正式品牌：`summer2077`
- 正式域名：`https://summer2077.com/`
- GitHub：`https://github.com/Edifier-Ai`
- Easy Resume：`https://resume.esaylab.com/`，源码 `https://github.com/Edifier-Ai/EasyResume`
- TabiFun：旅行地图项目，GitHub 地址待公布
- AI 衣橱：智能穿搭项目，GitHub 地址待公布
- Email：`summer0420@vip.qq.com`
- 抖音：抖音号 `Edifier_AI`，昵称 `Summer2077`，主页 `https://v.douyin.com/jvzVWXVX1Ic/`。
- 微信群二维码：`assets/wechat-vibecoding-group-qr.png`，展示在首页“交流”第一个板块。

所有 canonical、Open Graph、JSON-LD、robots 和 sitemap 均以 `https://summer2077.com/` 为唯一正式来源。切换域名时必须一起更新这些位置。

## 本地预览

内页使用根路径资源，必须通过本地 HTTP 服务预览，不要直接双击 HTML：

```powershell
python -m http.server 8000
```

访问：

- `http://localhost:8000/`
- `http://localhost:8000/about/`
- `http://localhost:8000/projects/`
- `http://localhost:8000/projects/easy-resume/`
- `http://localhost:8000/projects/tabifun/`
- `http://localhost:8000/projects/ai-wardrobe/`
- `http://localhost:8000/blog/`
- `http://localhost:8000/blog/vibe-coding-from-idea-to-product/`
- `http://localhost:8000/blog/ai-product-validation-checklist/`
- `http://localhost:8000/blog/easy-resume-local-first-method/`

## 内容发布规则

1. 每个真实项目使用一个独立目录和 URL，例如 `projects/project-name/index.html`。
2. 每页必须有独立 `title`、description、canonical、Open Graph 和匹配可见正文的 JSON-LD。
3. 不发布空项目卡、`href="#"`、虚构指标、虚构评分或未经确认的链接。
4. 新增或删除页面时同步更新 `sitemap.xml`。
5. `dateModified` 和 sitemap `lastmod` 只在内容确实发生变化时更新。
6. 项目案例优先补充：问题、目标用户、个人职责、产品取舍、技术方案、真实结果、演示地址和公开代码。
7. 博客文章必须有独立搜索意图、作者、发布日期、更新时间、正文、相关内链和匹配正文的 `BlogPosting` 数据；不设固定字数或发布数量。
8. 官网首发内容是长期资产；百度知道、文库、百家号等站外渠道只做真实分发，不做自问自答、批量铺量或洗稿。

## 图片策略

- HTML 优先加载体积较小的 WebP，并保留 PNG fallback。
- 首屏只有主要人物图片使用 `fetchpriority="high"`；隐藏形象和非关键图片降低优先级。
- 项目截图使用 `loading="lazy"`。
- 替换图片后同时生成对应 WebP，并保留准确的宽高和描述性 `alt`。
- Open Graph 暂时使用 PNG，兼容更多社交抓取器。

## SEO / GEO 基线

- `robots.txt` 允许普通搜索引擎与 `OAI-SearchBot` 抓取。
- 默认阻止 `GPTBot`，仅控制潜在训练使用，不影响 ChatGPT 搜索抓取；如品牌策略改变再调整。
- `sitemap.xml` 仅包含 canonical 且允许索引的页面。
- 首页声明 `WebSite`、`ProfilePage`、`Person`；项目集合使用 `CollectionPage` / `ItemList`；项目详情使用 `WebPage`、`SoftwareApplication` 和 `BreadcrumbList`。
- 结构化数据必须与页面可见内容一致。
- 上线后在 Google Search Console、Bing Webmaster Tools 和百度搜索资源平台验证域名并提交 sitemap。

## Nginx 与正式域名

目标生产结构为 Ubuntu Nginx。代码仓库不保留 GitHub Pages 专用 `CNAME`；部署时应把首页、内页目录、SEO 文件、CSS、JavaScript 和新增 WebP 一起同步到站点根目录。Nginx 需要使用 `try_files $uri $uri/ =404;`，并将 404 错误页指向 `/404.html`。

截至 2026-08-13，SEO 博客与抓取优化已部署，百度主域验证标签提交为 `5c2411b`，生产 release 为 `20260813T063400Z-5c2411b`；`/var/www/personal-site/current` 已原子切换，旧 release `20260813T055917Z-948147d` 保留用于回滚。2026-08-14 新增 Easy Resume 本地优先方法文章与第 10 个 canonical URL，代码已完成本地验证，生产发布状态以最新 release 为准。百度站点类型已设为自适应；资源提交仍受站点主体未关联、当日 sitemap 配额为 0 和 API 初始化未完成限制。

发布使用 `scripts/deploy.sh`：只打包 HEAD 中的白名单文件，新建 release 目录、校验 sha256 清单后原子切换 `current`，并自动检查线上状态。用法、流程和待办见 `docs/AGENT_HANDOFF.md`。截至 2026-10-24，生产仍落后 `main` 一个提交（Easy Resume 方法文章尚未上线）。

建议为带版本号或文件名稳定的静态资源配置长期缓存；HTML、`robots.txt` 和 `sitemap.xml` 使用较短缓存，确保内容更新能及时被抓取。
仓库中的 `deploy/nginx-static-cache.conf` 是当前生产缓存策略的可审计副本，不应复制到公开 Web 根目录。

部署后至少检查：

```text
https://summer2077.com/
https://summer2077.com/robots.txt
https://summer2077.com/sitemap.xml
https://summer2077.com/about/
https://summer2077.com/projects/easy-resume/
https://summer2077.com/projects/tabifun/
https://summer2077.com/projects/ai-wardrobe/
```

## 视觉与交互约定

- 首屏男角色为主体，两只狗在右侧。
- 女角色坐在 `7` 上，默认隐藏，通过悬停、键盘聚焦或触控交互出现并打开 About。
- 所有人物和小狗保持完整静态图，不做头部或眼睛跟随。
- 角色按图片真实可见脚底或爪底对齐。
- 主题色在 `css/style.css` 的 `--accent`，当前为 `#ff4d2e`。
