# SiteForge

> 本地运行的网站生成、可视化编辑与静态发布工具。

SiteForge 是一个面向个人开发者、设计师和内容创作者的网站构建工具。它将模板中心、模块化页面编辑、AI 页面生成、AI 区块修改、HTML 导出和桌面端静态发布整合到一个本地应用中，让你可以快速创建、调整并发布可部署的静态网站。

当前仓库主要包含 `code/` 源码目录，暂不包含已经打包好的桌面程序或发布产物。

## 功能特性

- **页面管理**：新建、重命名、复制、删除页面，并区分草稿与发布状态。
- **模板中心**：从内置模板快速创建页面，支持搜索、分类筛选和预览。
- **可视化编辑器**：通过模块面板添加区块，选择区块后修改内容、样式和属性。
- **模块化页面系统**：内置导航、首屏、信任背书、内容方案、转化获客、商业信息、企业介绍、页脚等模块分类。
- **响应式预览**：在独立预览页查看页面最终效果。
- **AI 页面生成**：根据提示词生成完整页面结构与内容，生成结果会经过结构校验和设计质量校验。
- **AI 区块修改**：基于自然语言指令修改当前选中的区块。
- **HTML 导出**：在浏览器中导出单个 HTML 文件，适合本地查看、归档或快速发送。
- **桌面静态发布**：桌面版可选择本地目录，生成包含 `index.html` 和 `assets/` 的静态站点文件夹。

## 技术栈

- [Next.js](https://nextjs.org/) 15
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Zod](https://zod.dev/)
- [Electron](https://www.electronjs.org/)
- [Vitest](https://vitest.dev/)
- [ESLint](https://eslint.org/)

## 目录结构

```text
code/
  data/                  # Web 开发模式下的页面数据
  desktop/               # Electron 主进程、预加载脚本和本地服务启动逻辑
  public/                # 模板图片和静态运行时资源
  scripts/               # 静态运行时构建、桌面构建准备和发布目录整理脚本
  src/
    app/                 # Next.js App Router 页面和 API
    components/          # 通用组件、编辑器组件和页面渲染组件
    lib/                 # AI、数据存储、导出、发布、模板和校验逻辑
    modules/             # 页面区块模块和区块注册表
    static-site/         # 静态站点运行时相关代码
    store/               # 编辑器状态
    types/               # 页面和区块类型
  tests/                 # Vitest 测试
```

## 环境要求

- Node.js 20 或更高版本
- pnpm
- Windows 环境：用于桌面版打包和运行

如果本机还没有启用 pnpm，可以先执行：

```bash
corepack enable
```

## 快速开始

```bash
git clone https://github.com/Chou-sheng/SiteForge.git
cd SiteForge/code
pnpm install
pnpm dev
```

启动后访问：

```text
http://localhost:3000
```

常用入口：

| 路径 | 说明 |
| --- | --- |
| `/` | 首页入口，包含页面管理、模板中心和 AI 配置入口 |
| `/dashboard` | 页面管理 |
| `/templates` | 模板中心 |
| `/editor/[pageId]` | 页面编辑器 |
| `/preview/[pageId]` | 页面预览 |

Web 开发模式下，页面数据默认保存到：

```text
code/data/pages.json
```

## AI 配置

SiteForge 的 AI 能力默认使用 DeepSeek API。未配置 API Key 时，程序仍可运行，但 AI 页面生成和 AI 区块修改会失败并提示，不会使用本地兜底生成。

开发模式下可以复制示例配置：

```bash
cd code
cp config.example.env .env.local
```

Windows PowerShell：

```powershell
cd code
Copy-Item config.example.env .env.local
```

然后编辑 `code/.env.local`：

```dotenv
DEEPSEEK_API_KEY=replace-with-your-key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_TIMEOUT_MS=120000
DEEPSEEK_MAX_TOKENS=8192
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `DEEPSEEK_API_KEY` | DeepSeek API Key，请不要提交真实 Key |
| `DEEPSEEK_MODEL` | 请求使用的模型名称 |
| `DEEPSEEK_TIMEOUT_MS` | 单次请求超时时间，单位毫秒 |
| `DEEPSEEK_MAX_TOKENS` | 单次生成允许的最大输出 Token 数 |

桌面版运行时会使用用户数据目录中的配置文件：

```text
%APPDATA%/SiteForge/config/config.env
```

## AI 生成机制

AI 页面生成不会简单地从现有模块库里拼装页面，而是创建 `aiGeneratedSection` 页面级承载区块，并将生成出的结构、文案、布局、指标、按钮和风格信息保存到该区块的 `props` 中。

这些 AI 生成区块只属于当前页面：可以继续编辑、保存、导出和发布，但不会写入公共模块库，也不会出现在左侧模块面板中。这样可以避免旧模板、固定模块和新生成内容混用后造成风格割裂。

AI 请求会注入一组设计质量规则，用于约束页面结构、文案、图片、留白、响应式表现和整体视觉一致性。生成结果如果未通过结构校验或设计质量校验，会直接失败，不写入页面。

## 开发命令

```bash
cd code
pnpm dev
```

生产构建：

```bash
pnpm build
```

启动生产服务：

```bash
pnpm start
```

## 桌面版打包

```powershell
cd code
pnpm desktop:package
```

该命令会依次执行：

1. 构建静态站点运行时资源
2. 构建 Next.js standalone 服务
3. 编译 Electron 主进程
4. 准备 `desktop-build/`
5. 使用 electron-builder 生成 Windows 文件夹版应用
6. 整理最终输出目录

打包完成后的输出目录：

```text
code/release/SiteForge/
```

运行桌面版：

```text
code/release/SiteForge/SiteForge.exe
```

桌面版运行时会在本机用户数据目录保存页面、配置和日志：

```text
%APPDATA%/SiteForge/
  data/pages.json
  config/config.env
  logs/app.log
```

## 静态发布与 HTML 导出

- **HTML 导出**：在编辑器中生成单文件 HTML，不依赖桌面版。
- **静态发布**：桌面版中选择一个父目录，生成包含 `index.html` 和 `assets/` 的静态站点目录，适合部署到静态托管服务。

Web 开发模式没有 Electron 的系统文件选择能力，因此静态发布能力主要用于桌面版。

## 测试与代码检查

运行测试：

```bash
cd code
pnpm test
```

监听模式运行测试：

```bash
pnpm test:watch
```

运行 ESLint：

```bash
pnpm lint
```

建议在修改页面渲染、导出、发布或 AI 生成逻辑后执行：

```bash
pnpm lint
pnpm test
pnpm build
```

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发模式运行 Next.js |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产 Next.js 服务 |
| `pnpm test` | 运行 Vitest 测试 |
| `pnpm test:watch` | 监听模式运行测试 |
| `pnpm lint` | 运行 ESLint |
| `pnpm desktop:compile` | 编译 Electron 主进程 |
| `pnpm desktop:package` | 打包 Windows 桌面文件夹版应用 |
| `pnpm static-runtime:build` | 构建静态站点运行时资源 |

## 提交注意事项

请不要提交以下内容：

- `.env.local`
- 真实 API Key
- `node_modules/`
- `.next/`
- `desktop-build/`
- `release/`
- 本地生成的 exe 或发布产物

当前仓库建议只提交源码、配置示例、测试和必要的文档。

## License

当前仓库暂未声明开源许可证。正式公开分发前，建议补充 `LICENSE` 文件并在本节说明授权方式。
