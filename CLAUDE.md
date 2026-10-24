# 个人主页

- 一句话定位：以 oiloil.org 大字排版为视觉参考的静态个人主页，含角色首屏、Tab 作品区、独立案例页和联系入口。
- 怎么跑：在项目根目录执行 `python -m http.server 8000`，访问 `http://localhost:8000/`；内页使用根路径资源，不要用双击 HTML 代替完整验证。
- 技术栈：纯静态 HTML / CSS / JavaScript，无构建依赖。
- 目录约定：
  - `index.html`：首页结构
  - `about/`、`projects/`、`blog/`：独立介绍、项目集合、案例页与原创实践文章
  - `css/style.css`：样式与主题变量
  - `js/main.js`：交互
  - `assets/`：PNG 原图、WebP 展示图和项目截图
  - `robots.txt`、`sitemap.xml`、`site.webmanifest`、`404.html`、`baidu_verify_codeva-O70Xp4Tsme.html`：发布与索引文件
  - `scripts/deploy.sh`：发布脚本；交接与待办见 `docs/AGENT_HANDOFF.md`
- 当前实现：正式品牌为 `summer2077`，正式域名为 `https://summer2077.com/`。首页保留男角色、两只狗和坐在数字 7 上的 ABOUT 女角色构图；角色使用完整静态图并优先加载 WebP。现有页面为 `/`、`/about/`、`/projects/`、三个项目案例、`/blog/` 与两篇原创实践文章，并包含 404、canonical、Open Graph、JSON-LD、robots、sitemap 和 manifest；无 JavaScript 时主要正文保持可见。联系区保留 GitHub `@Edifier-Ai`、Email `summer0420@vip.qq.com`、抖音号 `Edifier_AI`（昵称 `Summer2077`，主页 `https://v.douyin.com/jvzVWXVX1Ic/`）与微信交流群二维码，微博和小红书已移除。
- 当前发布状态（2026-08-13）：SEO 博客与抓取优化已部署，百度主域验证标签提交为 `5c2411b`，生产 release 为 `20260813T063400Z-5c2411b`；`current` 已原子切换，旧 release `20260813T055917Z-948147d` 保留用于回滚。正式域名 9 个 canonical 页面、robots、sitemap、百度主域验证、首页抓取诊断、百度统计数据、定制 404、www→主域 301 与静态资源缓存均已验证。百度站点类型已设为自适应；资源提交仍受站点主体未关联、当日 sitemap 配额为 0 和 API 初始化未完成限制。
- 发布状态更新（2026-10-24）：`main` 已包含第 10 个 canonical URL `/blog/easy-resume-local-first-method/`，生产尚未发布。发布一律使用 `scripts/deploy.sh`，不要手动复制文件。
- Easy Resume：正式地址 `https://resume.esaylab.com/`，仓库 `https://github.com/Edifier-Ai/EasyResume`；产品、设计与开发由 summer2077 独立完成并持续运营。对外只使用可公开核验的正式站、源码、功能边界与验证方法，不发布缺少样本定义和计算过程的效果提升数字。
