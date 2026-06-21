# 站点工坊 SiteForge

站点工坊 SiteForge 是一款在 Windows 本机运行的网站生成、可视化编辑与静态发布工具。程序提供模板中心、模块编辑、智能页面生成、智能区块修改、预览、单文件 HTML 导出，以及可离线部署的静态站点发布功能。

本发布版本是“文件夹版”：不需要安装程序，也不要求用户另外安装 Node.js。请完整解压并保留整个 `SiteForge/` 文件夹后运行，不要只复制 exe，也不要直接在 ZIP 压缩包里运行。

## 命名约定

- 中文产品名：站点工坊
- 英文产品名：SiteForge
- 完整展示名：站点工坊 SiteForge
- 程序名：`SiteForge.exe`
- 发布目录：`SiteForge/`
- 用户数据目录：`%APPDATA%/SiteForge/`

## 系统要求

- Windows 10 或 Windows 11，64 位。
- 建议至少 8 GB 内存。
- 智能生成功能需要可访问 DeepSeek API 的网络环境。
- 模板、编辑、保存、预览、HTML 导出和静态站点发布可以在没有 API Key 的情况下使用。

## 发布文件夹内容

正式交付目录应保持如下结构：

```text
SiteForge/
  SiteForge.exe
  resources/
  README.md
  config.example.env
  VERSION.txt
  THIRD_PARTY_NOTICES.txt
```

- `SiteForge.exe`：主程序。
- `resources/`：程序运行资源，不能删除或单独移动。
- `README.md`：使用、配置、发布和排错说明。
- `config.example.env`：不包含真实密钥的 API 配置示例。
- `VERSION.txt`：版本、平台和目录信息。
- `THIRD_PARTY_NOTICES.txt`：第三方组件说明。

分发给别人时，请压缩整个 `SiteForge/` 文件夹。接收者应先完整解压，再双击 `SiteForge.exe`。

## 主要功能

- 模板中心：从企业、智能科技、教育、文旅、建筑等模板创建页面。
- 可视化编辑：添加、删除、组合和调整页面区块。
- 属性面板：修改文字、图片、按钮、颜色、布局、显示状态等内容。
- 智能页面生成：根据用户输入生成完整页面草稿。
- 智能区块修改：对当前区块进行文案、结构或风格调整。
- 响应式预览：查看桌面、平板和移动端页面效果。
- 页面管理：保存草稿、复制页面、重命名页面、删除用户创建页面。
- 单文件 HTML 导出：生成一个可独立打开的 HTML 文件。
- 静态站点发布：生成完整站点文件夹，适合离线查看、打包发送或部署到服务器。

## 首次启动

1. 完整解压 `SiteForge/` 文件夹。
2. 双击 `SiteForge.exe`。
3. Windows SmartScreen 可能提示“未知发布者”。这是因为文件夹版没有代码签名证书。确认文件来源可信后，可选择“更多信息”，再选择“仍要运行”。
4. 程序首次启动会自动创建用户数据、配置和日志目录。

程序只在本机 `127.0.0.1` 启动内部服务，不向局域网开放。关闭程序后内部服务会停止。

## DeepSeek API 配置

### 获取 API Key

登录 DeepSeek 开放平台并创建 API Key：

<https://platform.deepseek.com/api_keys>

API Key 属于私密凭据。不要通过聊天、截图、邮件、公开仓库或发布站点目录分享真实配置文件。

### 配置文件位置

首次启动后，编辑：

```text
%APPDATA%/SiteForge/config/config.env
```

可以参考发布目录中的 `config.example.env`：

```dotenv
DEEPSEEK_API_KEY=replace-with-your-key
DEEPSEEK_MODEL=deepseek-v4-flash
DEEPSEEK_TIMEOUT_MS=120000
DEEPSEEK_MAX_TOKENS=8192
```

字段说明：

- `DEEPSEEK_API_KEY`：DeepSeek API Key。把示例占位内容替换为自己的 Key。
- `DEEPSEEK_MODEL`：模型名称。如果账号不支持示例模型，请填写 DeepSeek 控制台当前可用的模型名。
- `DEEPSEEK_TIMEOUT_MS`：单次请求超时时间，单位毫秒。
- `DEEPSEEK_MAX_TOKENS`：单次生成允许的最大输出 Token 数。

保存配置后，需要完全退出并重新启动程序。配置只在启动时读取。

### 未配置或调用失败时

- 没有 API Key 时，程序仍可启动，非智能功能不受影响。
- 页面生成和区块修改可能使用本地回退结果，或显示失败提示。
- API Key 无效、余额不足、网络超时或模型名称无效时，请检查配置和日志。

## 页面数据、配置和日志

默认用户数据目录：

```text
%APPDATA%/SiteForge/
  data/pages.json
  config/config.env
  logs/app.log
```

- `data/pages.json`：用户创建的页面、草稿和发布状态。
- `config/config.env`：用户 API 配置。
- `logs/app.log`：桌面程序和内部服务日志。

这些数据不存放在 exe 旁边。因此替换或重新分发 `SiteForge/` 程序文件夹，不会自动删除用户本机已经创建的页面。

## 静态站点发布

在程序里点击“发布”后，程序会在你选择的父目录下生成一个独立静态站点文件夹。目录名会根据页面标题或 slug 自动生成，并做 Windows 文件名安全处理。

典型结构：

```text
your-selected-folder/
  page-name/
    index.html
    assets/
      renderer.js
      style.css
      image-xxxx.jpg
```

发布结果可以：

- 直接双击 `index.html` 查看。
- 打包发给别人。
- 上传到任意静态服务器。
- 放进宝塔、Nginx、Apache、OSS、Vercel、Netlify 等环境。

静态发布会把本地图片和可下载的网络图片复制到 `assets/`，并使用相对路径引用。发布页面使用与程序预览相同的页面渲染器，因此发布效果应与预览保持一致。

## 单文件 HTML 导出

“导出 HTML”会生成一个单独的 HTML 文件。它适合快速发送、归档或本地查看。

与“发布”的区别：

- HTML 导出偏向单文件携带。
- 静态发布偏向真实网站目录结构，更适合上传服务器和长期部署。

## 备份、恢复和迁移

### 备份

1. 完全退出程序。
2. 复制整个 `%APPDATA%/SiteForge/` 目录到安全位置。
3. 不要公开分享包含真实 API Key 的备份。

### 恢复

1. 完全退出程序。
2. 备份当前 `%APPDATA%/SiteForge/` 目录。
3. 将备份内容复制回 `%APPDATA%/SiteForge/`。
4. 重新启动程序并检查页面列表。

### 迁移到其他电脑

把发布程序文件夹 `SiteForge/` 和用户数据备份分别复制到新电脑。程序文件夹可直接解压使用；页面数据需要恢复到新电脑对应的 `%APPDATA%/SiteForge/`。

## 更新程序

1. 完全退出旧版本程序。
2. 备份 `%APPDATA%/SiteForge/`。
3. 解压新版本 `SiteForge/` 文件夹。
4. 用新版本文件夹替换旧版本程序文件夹，或放到新的位置运行。
5. 启动后检查页面、API 配置和发布功能。

## 卸载

文件夹版没有系统安装器。

1. 完全退出程序。
2. 删除程序文件夹 `SiteForge/`。
3. 如果还要删除页面、配置和日志，再删除 `%APPDATA%/SiteForge/`。

删除用户数据目录会永久删除本机页面草稿和 API 配置。删除前请确认已经备份。

## 常见问题

### 双击 exe 没反应

- 确认已经完整解压整个 `SiteForge/` 文件夹。
- 不要只复制 `SiteForge.exe`。
- 检查 `%APPDATA%/SiteForge/logs/app.log`。
- 确认安全软件没有隔离 `SiteForge.exe` 或 `resources/`。

### 智能功能失败

- 检查 `%APPDATA%/SiteForge/config/config.env` 是否存在。
- 检查 `DEEPSEEK_API_KEY` 是否填入真实 Key。
- 检查模型名、网络连接、账户余额和 API 权限。
- 修改配置后完全退出并重新启动程序。

### 发布后的页面打不开或样式不对

- 确认发布目录中存在 `index.html` 和 `assets/`。
- 不要只复制 `index.html`，要复制整个站点文件夹。
- 如果上传服务器，保持目录结构不变。
- 如果图片来自网络且下载失败，请在程序中改用本地图片后重新发布。

### 预览正常但服务器部署异常

- 静态站点不需要 Node.js、数据库或后端服务。
- 服务器只需要按静态文件托管 `index.html` 和 `assets/`。
- 如果部署在子路径下，请保持相对路径结构，不要拆分 `assets/`。

## 安全说明

- 不要把 `%APPDATA%/SiteForge/config/config.env` 发给别人。
- 不要把真实 API Key 写入 README、截图、公开仓库或发布站点。
- 发布站点目录只应包含静态网页文件，不应包含用户配置文件。
- 分发程序时建议只发送 `SiteForge/` 发布目录，不要发送源码、缓存、构建过程目录或个人数据目录。

## 给接收者的最短使用说明

1. 解压整个 `SiteForge/` 文件夹。
2. 双击 `SiteForge.exe`。
3. 如果只使用模板、编辑、预览和发布，不需要配置 API。
4. 如果要使用智能生成功能，按本 README 的 DeepSeek API 配置步骤填写 Key。
