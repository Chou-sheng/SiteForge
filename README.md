# 站点工坊 SiteForge

站点工坊 SiteForge 是一款 Windows 本地网站生成、可视化编辑与静态发布工具。程序提供页面工作台、页面管理、模板中心、可视化编辑器、AI 页面生成、AI 区块修改、响应式预览、HTML 导出和静态站点发布能力。

发行版本采用文件夹形式交付。完整的 `SiteForge/` 目录包含主程序、运行资源、用户说明、示例配置和第三方组件说明。

## 目录内容

```text
SiteForge/
  SiteForge.exe
  resources/
  README.md
  config.example.env
  VERSION.txt
  THIRD_PARTY_NOTICES.txt
```

- `SiteForge.exe`：桌面主程序。
- `resources/`：Electron 与本地 Next.js 服务运行资源。
- `README.md`：使用、配置、发布和数据位置说明。
- `config.example.env`：DeepSeek API 配置示例。
- `VERSION.txt`：版本、平台和目录信息。
- `THIRD_PARTY_NOTICES.txt`：第三方组件说明。

## 系统要求

- Windows 10 或 Windows 11，64 位。
- 建议至少 8 GB 内存。
- AI 页面生成和 AI 区块修改需要可访问 DeepSeek API 的网络环境。
- 模板、编辑、保存、预览、HTML 导出和静态发布可在未配置 API Key 的状态下使用。

## 启动

1. 解压完整的 `SiteForge/` 文件夹。
2. 双击 `SiteForge.exe`。
3. 首次启动会在本机用户数据目录创建页面、配置和日志目录。

程序只在本机 `127.0.0.1` 启动内部服务。关闭程序后，内部服务随程序退出。

## 首页入口

首页提供三个主要入口：

- 页面管理：查看草稿、发布状态和更新时间，继续编辑、复制、重命名或删除页面。
- 模板中心：搜索、筛选和预览整页模板，并从模板创建页面。
- AI 配置：填写 DeepSeek API Key 和模型名称，保存前会真实调用一次 DeepSeek 接口完成校验。

页面管理顶部提供“返回首页”按钮，可回到首页入口。

## DeepSeek API 配置

首页的“AI 配置”按钮会打开配置弹窗。弹窗包含：

- API Key 输入框。
- 模型名称输入框。
- “校验并保存”按钮。
- 校验中的等待提示。
- 校验成功或失败提示。

保存流程为：

1. 使用输入的 API Key 和模型名称请求 DeepSeek `chat/completions`。
2. DeepSeek 返回有效结果后写入本机配置。
3. 程序提示重新打开应用后生效。

配置文件位置：

```text
%APPDATA%/SiteForge/config/config.env
```

配置内容格式：

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

保存配置后，完全退出并重新启动程序。桌面版在启动内部服务时读取配置。

## 页面数据、配置和日志

默认用户数据目录：

```text
%APPDATA%/SiteForge/
  data/pages.json
  config/config.env
  logs/app.log
```

- `data/pages.json`：用户创建的页面、草稿和发布状态。
- `config/config.env`：用户的 DeepSeek API 配置。
- `logs/app.log`：桌面程序和内部服务日志。

这些数据存放在系统用户数据目录。更换或更新程序文件夹时，已创建的页面和配置仍保留在本机用户数据目录中。

## 主要功能

- 模板中心：提供企业官网、AI 产品官网、教育机构官网、文旅度假官网和建筑空间官网等模板。
- 页面管理：展示页面名称、行业、状态和更新时间，支持继续编辑、复制、重命名和删除。
- 可视化编辑器：添加、选择、组合和调整页面区块。
- 属性面板：编辑文字、图片、按钮、颜色、布局和显示状态。
- AI 页面生成：根据提示词生成完整页面草稿。
- AI 区块修改：根据指令修改当前区块，并保持页面整体风格一致。
- 响应式预览：查看桌面、平板和移动端页面效果。
- HTML 导出：生成可独立打开的单文件 HTML。
- 静态站点发布：生成包含 `index.html` 和 `assets/` 的静态站点目录。

## AI 生成质量规则

AI 页面生成会创建 `aiGeneratedSection` 页面级承载区块。生成区块属于当前页面，可继续编辑、保存、导出和发布。

页面生成和区块修改会注入设计质量规则，约束排版、留白、图片、响应式布局和行业视觉一致性。AI 返回内容需要通过结构校验和设计质量校验后才会写入页面。

## 静态站点发布

在编辑器中点击发布后，程序会在用户选择的位置生成静态站点目录。典型结构：

```text
selected-folder/
  page-name/
    index.html
    assets/
      renderer.js
      style.css
      image-xxxx.jpg
```

发布结果可直接打开 `index.html` 预览，也可上传到 Nginx、Apache、OSS、Vercel、Netlify 等静态托管环境。发布页面使用与程序预览相同的页面渲染器。

## HTML 导出

HTML 导出会生成单个 HTML 文件，适合快速发送、归档或本地查看。静态站点发布生成完整目录结构，更适合长期部署。

## 备份、恢复和迁移

页面、配置和日志位于 `%APPDATA%/SiteForge/`。备份该目录即可保留页面草稿、发布状态和 API 配置。

恢复时，将备份内容放回 `%APPDATA%/SiteForge/`，再启动程序。迁移到其他电脑时，程序文件夹 `SiteForge/` 和用户数据备份分别复制到新电脑对应位置。

## 常见问题

### 双击 exe 没有窗口

- 程序需要完整的 `SiteForge/` 文件夹结构。
- 日志位置为 `%APPDATA%/SiteForge/logs/app.log`。
- Windows SmartScreen 可能显示发布者提示，确认后可继续运行。

### 智能功能失败

- 首页“AI 配置”可校验 API Key 和模型名称。
- 配置文件位置为 `%APPDATA%/SiteForge/config/config.env`。
- 网络连接、账号额度、模型权限和 DeepSeek 服务状态都会影响智能功能。
- 配置变更在重新打开应用后生效。

### 发布页面样式或图片异常

- 发布目录包含 `index.html` 和 `assets/`。
- 图片资源会复制到 `assets/` 并使用相对路径引用。
- 部署到子路径时，保持发布目录内部结构即可。

## 最短使用流程

1. 解压完整 `SiteForge/` 文件夹。
2. 双击 `SiteForge.exe`。
3. 在首页进入模板中心或页面管理。
4. 使用智能功能时，在首页打开“AI 配置”，校验并保存 API Key 与模型名称。
5. 重新打开应用后使用 AI 页面生成或 AI 区块修改。
