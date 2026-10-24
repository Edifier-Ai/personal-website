# summer2077.com 交接说明

> 更新：2026-10-24
> 范围：只涉及 summer2077.com 个人站本仓库。同机的其他站点不属于本仓库，发布时不要改动。

## 一、当前状态

- 仓库 `main` 最新内容提交为 `8f08a9c`（新增 `/blog/easy-resume-local-first-method/`，sitemap 共 10 个 canonical URL）。
- 截至 2026-10-24，生产仍是 `20260813T063400Z-5c2411b`，落后 `main`：上述文章线上 404，线上 sitemap 仍为 9 个 URL。
- 生产 Web 根目录有一个此前未入库的百度文件验证 `baidu_verify_codeva-O70Xp4Tsme.html`，现已加入仓库并纳入发布白名单，不进 sitemap。
- `.workbuddy/` 是本地工具日志，已从版本库移除并写入 `.gitignore`。

## 二、发布前检查（已在仓库内完成）

博客文章 `/blog/easy-resume-local-first-method/` 已核对：

- canonical、`og:url` 均为 `https://summer2077.com/blog/easy-resume-local-first-method/`。
- 已在 `sitemap.xml`，`lastmod` 为 `2026-08-14`。
- JSON-LD（`BlogPosting`、`WebPage`、`BreadcrumbList`）可解析，日期与页面一致。
- 站内入口：`/blog/` 列表页与 `/projects/easy-resume/` 案例页；文中所有站内链接与资源均指向仓库中存在的文件。
- 全站 11 个 HTML：sitemap 与 canonical 集合完全一致，无断开的站内链接，无 `href="#"`。

## 三、发布

使用 `scripts/deploy.sh`，仓库中不保存主机、用户或密钥：

```bash
# 1. 本地预演：只打包并列出文件清单，不连接服务器
scripts/deploy.sh --dry-run

# 2. 正式发布
DEPLOY_HOST=deploy@<服务器IP> DEPLOY_KEY=~/.ssh/summer2077_deploy scripts/deploy.sh

# 3. 任何时候只做线上检查
scripts/deploy.sh --check-only
```

脚本流程：

1. 拒绝在工作区有未提交改动时发布；只用 `git archive` 打包 HEAD 中的白名单路径（`index.html`、`404.html`、`robots.txt`、`sitemap.xml`、`site.webmanifest`、百度验证文件、`about/`、`projects/`、`blog/`、`css/`、`js/`、`assets/`）。`deploy/`、`docs/`、`scripts/`、各类 `.md` 与隐藏目录不会进入 Web 根目录。
2. 生成每个文件的 sha256 清单并打印，作为审计记录。
3. 上传到 `releases/.<id>.partial`，服务器端用清单校验内容与文件数，通过后改名为 `releases/<id>`；清单保存在 `releases/<id>.sha256`（Web 根目录之外）。
4. 用 `ln -sfn` + `mv -T` 原子切换 `current`，打印上一个 release 便于回滚。只切换软链，不需要 reload Nginx。
5. 线上检查：sitemap 中每个 URL 返回 200；robots、sitemap、manifest 返回 200；随机路径、`/deploy/…`、`/README.md` 返回 404；`www` 与 `http` 返回 301；线上百度验证文件与 sitemap 和 HEAD 一致。失败时打印回滚命令。
6. 默认不删除旧 release；设置 `KEEP_RELEASES=N` 才保留最近 N 个，且从不删除 `current` 指向的目录。

依赖 bash、git、ssh、tar、curl、sha256sum；Windows 请在 Git Bash 或 WSL 中运行。Nginx 配置变更不在脚本范围内，仍需手动 `nginx -t` 通过后再 reload。

## 四、待用户完成（Claude 没有服务器凭据，也无法登录百度后台）

1. **建立独立 deploy 用户**：在服务器上创建只用于发布的用户，只授予 `/var/www/personal-site` 及其 `releases/` 的写权限，使用单独的 SSH 密钥，不给 sudo；不再用 root 或个人账号发布。
2. **执行首次发布**（见上文命令），并确认检查全部通过。
3. **百度搜索资源平台**：完成站点主体关联；等待普通收录 API 初始化后重试（此前返回 `site init fail`）；sitemap 当日配额恢复后提交 `https://summer2077.com/sitemap.xml`；发布后提交 `/blog/` 与三篇文章 URL，并用抓取诊断确认正文完整。

## 五、约束

- 首屏角色图保持静态；禁用 JavaScript 时正文可见。
- 不虚构链接、指标或数据；TabiFun、AI 衣橱 GitHub 仍未公开。
- 不在仓库或聊天中保存任何凭据。
- 百度相关只做真实内容与正常提交，禁止铺量和自问自答（详见 `docs/baidu-seo-strategy.md`）。
