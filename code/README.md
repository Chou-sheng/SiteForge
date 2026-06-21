# SiteForge

SiteForge 是一个本地运行的网站生成、可视化编辑和静态发布工具。当前仓库只包含源码目录 `code/`，不包含已经打包好的桌面程序或发布产物。

项目基于 Next.js、React、Tailwind CSS 和 Electron。Web 开发模式可以直接在浏览器里运行；桌面打包后会启动本机 Next.js 服务，并通过 Electron 窗口加载编辑器。

## 主要功能

- 页面管理：新建、重命名、复制、删除页面，并查看草稿或发布状态。
- 模板中心：从内置模板创建页面，支持模板搜索、分类筛选和预览。
- 可视化编辑：添加模块、选择区块、修改属性、撤销和重做。
- 响应式预览：在独立预览页查看最终页面效果。
- AI 页面生成：根据提示词生成完整页面，优先使用 DeepSeek API。
- AI 区块修改：根据指令修改当前选中的区块。
- 本地兜底生成：没有 API Key 或 AI 请求失败时，使用本地模板逻辑生成内容。
- HTML 导出：在浏览器中导出单个 HTML 文件。
- 桌面静态发布：在 Electron 桌面版中选择目录，生成可部署的静态站点文件夹。

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- Zod
- Electron
- Vitest
- ESLint

## 目录结构

```text
code/
  data/                  # Web 开发模式下的页面数据
  desktop/               # Electron 主进程、预加载脚本和本地服务启动逻辑
  public/                # 模板图片和静态运行时资源
  scripts/               # 静态运行时构建、桌面打包准备和发布目录整理脚本
  src/
    app/                 # Next.js App Router 页面和 API
    components/          # 通用组件、编辑器组件和页面渲染组件
    lib/                 # AI、数据存储、导出、发布、模板和校验逻辑
    modules/             # 页面区块模块和区块注册表
    store/               # 编辑器状态
    types/               # 页面和区块类型
  tests/                 # Vitest 测试
```

## 环境要求

- Node.js 20 或更高版本
- pnpm
- Windows 系统用于桌面版打包和运行

如果本机没有 pnpm，可以先启用 Corepack：

```powershell
corepack enable
```

## 安装依赖

在仓库根目录进入 `code/`：

```powershell
cd code
pnpm install
```

## 配置 AI 功能

AI 功能读取 DeepSeek 相关环境变量。Web 开发模式可以在 `code/.env.local` 中配置；桌面打包版本首次运行时会把 `config.example.env` 复制到用户数据目录。

Web 开发模式示例：

```powershell
Copy-Item config.example.env .env.local
```

然后编辑 `.env.local`：

```dotenv
DEEPSEEK_API_KEY=replace-with-your-key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_TIMEOUT_MS=120000
DEEPSEEK_MAX_TOKENS=8192
```

说明：

- `DEEPSEEK_API_KEY`：DeepSeek API Key。不要提交真实 Key。
- `DEEPSEEK_MODEL`：请求使用的模型名。
- `DEEPSEEK_TIMEOUT_MS`：单次请求超时时间，单位毫秒。
- `DEEPSEEK_MAX_TOKENS`：单次请求允许的最大输出 token 数。

没有配置 API Key 时，程序仍可运行，AI 页面生成和区块修改会使用本地兜底逻辑。

## 运行 Web 开发模式

```powershell
cd code
pnpm dev
```

启动后打开：

```text
http://localhost:3000
```

常用入口：

- `/`：首页入口
- `/dashboard`：页面管理
- `/templates`：模板中心
- `/editor/[pageId]`：页面编辑器
- `/preview/[pageId]`：页面预览

Web 开发模式下，页面数据默认保存到：

```text
code/data/pages.json
```

## 生产 Web 运行

先构建：

```powershell
cd code
pnpm build
```

再启动生产服务：

```powershell
pnpm start
```

默认同样通过浏览器访问本地服务。

## 桌面版打包

桌面版打包命令：

```powershell
cd code
pnpm desktop:package
```

这个命令会依次执行：

- 构建静态站点运行时资源
- 构建 Next.js standalone 服务
- 编译 Electron 主进程
- 准备 `desktop-build/`
- 使用 electron-builder 生成 Windows 文件夹版应用
- 整理最终输出目录

打包完成后的输出目录：

```text
code/release/SiteForge/
```

运行桌面版：

```powershell
code/release/SiteForge/SiteForge.exe
```

桌面版运行时会在本机用户数据目录保存页面、配置和日志：

```text
%APPDATA%/SiteForge/
  data/pages.json
  config/config.env
  logs/app.log
```

桌面版的“发布”功能会让用户选择一个父目录，然后生成包含 `index.html` 和 `assets/` 的静态站点文件夹。Web 开发模式没有 Electron 的文件选择能力，因此静态发布按钮只在桌面版中可用。

## 导出 HTML

编辑器中的 HTML 导出功能会生成一个单文件 HTML，适合本地查看、发送或归档。该功能不依赖桌面版。

## 测试和检查

运行测试：

```powershell
cd code
pnpm test
```

监听模式运行测试：

```powershell
pnpm test:watch
```

运行 ESLint：

```powershell
pnpm lint
```

## 常用脚本

```text
pnpm dev                 # 开发模式运行 Next.js
pnpm build               # 构建生产版本
pnpm start               # 启动生产 Next.js 服务
pnpm test                # 运行测试
pnpm test:watch          # 监听模式运行测试
pnpm lint                # 运行 ESLint
pnpm desktop:compile     # 编译 Electron 主进程
pnpm desktop:package     # 打包 Windows 桌面文件夹版应用
pnpm static-runtime:build # 构建静态站点运行时资源
```

## 注意事项

- 不要提交 `.env.local`、真实 API Key、`node_modules/`、`.next/`、`desktop-build/` 或 `release/`。
- 当前仓库只需要上传 `code/` 源码，不需要上传 `demo/`、打包后的 exe 或 release 产物。
- 如果修改了页面渲染或静态发布逻辑，建议同时运行 `pnpm test` 和 `pnpm build`。
