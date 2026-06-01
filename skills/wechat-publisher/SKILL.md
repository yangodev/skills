---
name: wechat-publisher
description: 使用 WeChat Publisher CLI 渲染 Markdown 文章、预览微信公众号 HTML、校验素材，并通过本地模式或中心 token 模式创建微信公众号草稿。
---

# WeChat Publisher

当用户希望 Codex 基于 Markdown 文章准备、预览、校验或创建微信公众号草稿时，使用这个 Skill。

这个 Skill 是 CLI 适配器，不包含发布器实现。CLI 需要通过 npm 或本地发布包单独安装。

## 安全规则

- 不要要求用户在聊天里粘贴 AppSecret、中心 API key、access_token、Cookie 或 session。
- 不要打印 AppSecret、中心 API key、access_token、Cookie 或 session。
- 把 `wechat-publisher.config.json` 和 `.wechat-publisher.config.json` 当作本机私有文件。
- 不要公开发表文章。CLI 的 `draft` 命令只创建微信草稿。
- 不要把 Markdown、文章 HTML、图片文件、封面文件或本地路径发送给中心服务。中心模式只请求短期 token。

## CLI 检查

使用前先检查 CLI：

```bash
wechat-publisher --help
```

如果 `--help` 中已经包含 `doctor` 命令，发布前优先运行：

```bash
wechat-publisher doctor --article article.md
```

如果没有安装，请让用户安装 CLI 包：

```bash
npm install -g @yangodev/wechat-publisher
```

也可以运行本 Skill 自带的 doctor 脚本：

```bash
node skills/wechat-publisher/scripts/doctor.mjs
```

## 首次配置

本地模式使用用户自己的微信公众号 AppID/AppSecret 和 IP 白名单：

```bash
wechat-publisher init \
  --mode local \
  --app-id wx_xxx \
  --app-secret xxx \
  --author "作者名称"
```

中心模式使用中心 token 账号：

```bash
wechat-publisher init \
  --mode center \
  --center-url https://api.yango.dev \
  --account acct_xxx \
  --center-api-key xxx \
  --author "作者名称"
```

该命令会写入 `wechat-publisher.config.json`，并只打印脱敏摘要。

## 正常流程

文章或素材变化后，先创建本地预览：

```bash
wechat-publisher doctor --article article.md --config wechat-publisher.config.json
wechat-publisher draft article.md --out dist --dry-run --submit-preview
```

如果当前安装的 CLI 还不支持 `doctor`，则用 `wechat-publisher check article.md` 和 `draft --dry-run --submit-preview` 代替。

检查生成文件：

- `dist/preview.html`
- `dist/wechat-submit.html`
- `dist/wechat-draft-payload.json`
- `dist/wechat-draft-report.json`

如果没有阻塞错误，再创建微信草稿：

```bash
wechat-publisher draft article.md --out dist --submit-preview
```

对已有文章包：

```bash
wechat-publisher draft dist/article-package.json --out dist --submit-preview
```

## 诊断

命令失败时，优先读取 `wechat-draft-report.json`。常见诊断码：

- `wechat.ip_allowlist`：把当前公网 IP 或中心服务 IP 加入微信白名单。
- `wechat.invalid_app_id`：检查 AppID 是否属于目标公众号。
- `wechat.invalid_app_secret`：更新本地配置或中心账号中的 AppSecret。
- `wechat.invalid_credential`：先重试，再检查 AppID/AppSecret 或中心 token 生成。
- `wechat.api_unauthorized`：确认公众号拥有所需 API 权限。
- `center.account_expired`：检查中心账号状态，或切换到本地模式。
- `center.account_disabled`：联系中心服务方，或切换到本地模式。
- `center.unauthorized`：检查中心 API key。
- `center.forbidden`：检查 API key 是否属于配置的账号。
- `center.not_found`：检查 `center.url`。
- `center.unavailable`：稍后重试，或检查中心服务状态。
- `center.rate_limited`：稍后重试；这是频率或风控限制。

## 输出标准

运行 CLI 后，向用户报告：

- 使用的命令；
- 生成的输出目录；
- 草稿状态；
- 创建成功时的 draft media id；
- 错误和警告数量；
- 任意诊断码对应的下一步。
