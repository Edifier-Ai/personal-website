# 个人主页

- 一句话定位：以 oiloil.org 大字排版为视觉参考的静态个人主页，含角色首屏、Tab 作品区、独立案例页和联系入口。
- 怎么跑：在项目根目录执行 `python -m http.server 8000`，访问 `http://localhost:8000/`；内页使用根路径资源，不要用双击 HTML 代替完整验证。
- 技术栈：纯静态 HTML / CSS / JavaScript，无构建依赖。
- 目录约定：
  - `index.html`：首页结构
  - `about/`、`projects/`：独立介绍、项目集合与案例页
  - `css/style.css`：样式与主题变量
  - `js/main.js`：交互
  - `assets/`：PNG 原图、WebP 展示图和项目截图
  - `robots.txt`、`sitemap.xml`、`site.webmanifest`、`404.html`：发布与索引文件
- 当前实现：正式品牌为 `summer2077`，正式域名为 `https://summer2077.com/`。首页保留男角色、两只狗和坐在数字 7 上的 ABOUT 女角色构图；角色使用完整静态图并优先加载 WebP。现有页面为 `/`、`/about/`、`/projects/`、`/projects/easy-resume/`、`/projects/tabifun/`、`/projects/ai-wardrobe/`，并包含 404、canonical、Open Graph、JSON-LD、robots、sitemap 和 manifest；无 JavaScript 时主要正文保持可见。联系区保留 GitHub `@Edifier-Ai`、Email `summer0420@vip.qq.com`、抖音号 `Edifier_AI`（昵称 `Summer2077`，主页 `https://v.douyin.com/jvzVWXVX1Ic/`）与微信交流群二维码，微博和小红书已移除。
- 当前发布状态（2026-08-09）：站点改版已提交并推送为 `02dec82`，并部署到 Ubuntu Nginx release `20260809T084129Z`；`current` 已原子切换，正式域名六个页面、robots、sitemap 与关键图片已从外部验证，未知路径返回 404，旧 release `20260809T001` 保留用于回滚。当前未提交变更仅为 23 个无引用旧素材的清场删除和本条部署状态同步；下一步是提交、推送这些收尾变更，并在搜索平台验证域名和提交 sitemap。
- Easy Resume：公开地址 `https://resume.easylab.com/`，仓库 `https://github.com/Edifier-Ai/EasyResume`；产品、设计与开发由 summer2077 独立完成并持续运营，内测期间帮助用户的简历通过率提升 23%。案例页明确标注当前新版尚未更新上线。
