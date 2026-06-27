# SiteForge 开发说明

`code/` 是站点工坊 SiteForge 的源代码目录。项目基于 Next.js、React、Tailwind CSS、Zustand、Zod、Vitest 和 Electron，提供本地网站生成、可视化编辑、AI 页面生成、AI 区块修改、HTML 导出和桌面静态发布能力。

## 目录结构

```text
code/
  data/                  # Web 开发模式下的页面数据
  desktop/               # Electron 主进程、预加载脚本和本地服务启动逻辑
  public/                # 模板图片和静态站点运行时资源
  scripts/               # 静态运行时构建、桌面构建准备和发布整理脚本
  src/
    app/                 # Next.js App Router 页面和 API
    components/          # 通用组件、编辑器组件和页面渲染组件
    lib/                 # AI、数据存储、导出、发布、模板和校验逻辑
    modules/             # 页面区块模块和区块注册表
    store/               # 编辑器状态
    types/               # 页面和区块类型
```

## 主要入口

- `/`：页面工作台首页，包含页面管理、模板中心和 AI 配置入口。
- `/dashboard`：页面管理，包含返回首页、模板中心、新建页面和智能创建页面入口。
- `/templates`：模板中心。
- `/editor/[pageId]`：页面编辑器。
- `/preview/[pageId]`：页面预览。

## 环境要求

- Node.js 20 或更高版本。
- pnpm。
- Windows 环境用于桌面版打包和运行。

## 安装依赖

```powershell
cd code
pnpm install
```

## Web 开发模式

```powershell
cd code
pnpm dev
```

启动后访问：

```text
http://localhost:3000
```

Web 开发模式下页面数据位于：

```text
code/data/pages.json
```

## AI 配置

首页“AI 配置”按钮会打开配置弹窗。用户填写 DeepSeek API Key 和模型名称后，程序会真实调用一次 DeepSeek `chat/completions` 接口完成校验，校验成功后写入配置。

开发模式配置文件：

```text
code/.env.local
```

桌面版用户配置文件：

```text
%APPDATA%/SiteForge/config/config.env
```

配置格式：

```dotenv
DEEPSEEK_API_KEY=replace-with-your-key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_TIMEOUT_MS=120000
DEEPSEEK_MAX_TOKENS=8192
```

字段说明：

- `DEEPSEEK_API_KEY`：DeepSeek API Key。
- `DEEPSEEK_MODEL`：请求使用的模型名称。
- `DEEPSEEK_TIMEOUT_MS`：单次请求超时时间，单位毫秒。
- `DEEPSEEK_MAX_TOKENS`：单次生成允许的最大输出 Token 数。

开发模式保存配置后，重启 `pnpm dev` 生效。桌面版保存配置后，重新打开应用生效。

## AI 服务实现

- `src/lib/ai/deepseekClient.ts`：统一发起 DeepSeek Chat Completions 请求。
- `src/lib/ai/configStore.ts`：读取、写入和定位 DeepSeek 配置文件。
- `src/app/api/ai/config/route.ts`：提供配置状态读取、真实校验和保存接口。
- `src/lib/ai/generatePage.ts`：AI 页面生成。
- `src/lib/ai/editBlock.ts`：AI 区块修改。

AI 页面生成会创建 `aiGeneratedSection` 页面级承载区块。生成区块属于当前页面，可继续编辑、保存、导出和发布。生成流程会先归一化模型输出；当模型返回内容不能直接映射到渲染协议时，程序会再次调用 DeepSeek 完成协议修正。最终写入页面的区块使用通用页面结构，图片地址会规范为可直接加载的公开 HTTPS URL。

## 常用脚本

```text
pnpm dev                  # 开发模式运行 Next.js
pnpm build                # 构建生产版本
pnpm start                # 启动生产 Next.js 服务
pnpm test                 # 运行 Vitest 测试
pnpm test:watch           # 监听模式运行测试
pnpm lint                 # 运行 ESLint
pnpm desktop:compile      # 编译 Electron 主进程
pnpm desktop:package      # 打包 Windows 文件夹版应用
pnpm static-runtime:build # 构建静态站点运行时资源
```

## 桌面版打包

```powershell
cd code
pnpm desktop:package
```

打包流程包含：

- 构建静态站点运行时资源。
- 构建 Next.js standalone 服务。
- 编译 Electron 主进程。
- 准备 `desktop-build/`。
- 使用 electron-builder 生成 Windows 文件夹版应用。
- 整理输出目录。

输出目录：

```text
code/release/SiteForge/
```

桌面版运行时用户数据目录：

```text
%APPDATA%/SiteForge/
  data/pages.json
  config/config.env
  logs/app.log
```

## 静态发布和 HTML 导出

静态发布会生成包含 `index.html` 和 `assets/` 的站点目录，适合部署到静态托管环境。HTML 导出会生成单个 HTML 文件，适合本地查看、归档或快速发送。

## 验证

常规验证命令：

```powershell
cd code
pnpm lint
pnpm test
pnpm build
```
