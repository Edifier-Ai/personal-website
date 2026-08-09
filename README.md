# 个人主页

版面参照 oiloil.org：首屏大号三行标题、形象站在标题末行基线上；主体是带 tab 面板的作品区；尾部大字标 + 联系列表。静态多文件，无构建依赖，双击 index.html 即可预览。

## 目录结构

```
<project-root>/
├── index.html        页面结构
├── css/style.css     全部样式，主题色在顶部 :root
├── js/main.js        阅读进度、tab 切换、自定义光标、彩蛋、滚动显现
├── assets/           透明底 PNG 形象图与项目截图
└── README.md
```

## 需要替换的占位内容

1. 昵称：当前全局统一为「summer2077」。
2. 顶部右侧：当前已连接 `github.com/Edifier-Ai`。
3. 项目：每个 `<article class="pmodule">` 是一张卡片，改编号、标题、标签、描述和两个链接（访问项目 / GitHub）。加项目就复制一整个 article。左侧舞台是轮播容器，目前每张 `.slide` 是文字占位（`截图 1 · 占位`），替换为 `<div class="slide"><img src="assets/cover-1.png" alt="项目截图"></div>` 即可；增删 slide 后圆点数量自动跟上。点击舞台放大，放大浮层里可用左右箭头或键盘方向键翻页、Esc 关闭。
4. 关于我：tab「关于我」面板里的两段介绍和标签 chips。
5. 交流：tab「交流」面板，把 `.qr-slot` 整块换成 `<img src="assets/qrcode.png" alt="微信群二维码">`，Discord 链接在第二个卡片。
6. 联系列表：当前为 GitHub `@Edifier-Ai`、Email `summer0420@vip.qq.com` 和抖音 `Summer2077`；抖音暂用账号搜索入口，拿到个人主页直链后可替换 href。

## 图片说明

当前首屏所有人物和小狗都使用完整静态 PNG，不再做头部或眼睛跟随。男生提供桌面靠字姿态 `hero-me-lean-v2.png` 与移动端举手扶字姿态 `hero-me-hang-v2.png`。黑泰迪使用圆脸、低额头的 `dog-poodle-v3.png`，两只狗按透明边界紧邻排列。男生、两只狗与隐藏女生按图片真实可见脚底/爪底对齐，而不是按 PNG 外框对齐。女生与男生按真实人物高度等比例显示，位于白狗右侧；默认隐藏，仅在对应热区悬停/聚焦时显示浅蓝色全身长裙版本 `wife-look-v3.png`。

- 透明底 PNG 直接替换同名文件。
- 如果新图是白底不透明的，给 `.scene-item img` 加 `mix-blend-mode: multiply;`，白底在白色页面上就隐形了。

首屏最右的隐藏女生是 ABOUT 菜单：鼠标悬停或键盘聚焦会显示转头形象，点击会打开「关于我」面板；提示语文案在 js/main.js 的 `lines` 数组里改。

## 本地预览

直接双击 index.html，或者：

```
python -m http.server 8000
# 访问 http://localhost:8000
```

## 部署到 GitHub Pages

1. 在 GitHub 新建仓库，比如 `homepage`。
2. 把本目录内容推上去：

```
git init
git add .
git commit -m "init homepage"
git branch -M main
git remote add origin https://github.com/你的用户名/homepage.git
git push -u origin main
```

3. 仓库 Settings → Pages → Source 选 `Deploy from a branch`，分支 `main`、目录 `/ (root)`，保存。
4. 一两分钟后访问 `https://你的用户名.github.io/homepage/`。

Vercel / Netlify 也可以，把目录拖进去即可，无需配置。

## 改主题色

css/style.css 顶部 `:root` 里的 `--accent`，目前是橙红 `#ff4d2e`。

## 宽屏适配

所有内容收在 1200px 居中容器里，超宽显示器上左右不会拉得过开。想调内容宽度，改 `:root` 里 `--gutter` 的 `1200px`。
