---
name: wechat-publisher
description: 使用官方 npm 包 @yangodev/wechat-renderer 和 @yangodev/wechat-publisher，将 Markdown 渲染为微信公众号文章包，并创建微信公众号草稿箱草稿。
---

# WeChat Publisher

当用户希望基于 Markdown 文章准备微信公众号预览、检查发布包，或创建微信公众号草稿箱草稿时，使用这个 Skill。

这个 Skill 是轻量适配器，不包含渲染器或发布器实现。实际能力来自官方 npm 包：

- `@yangodev/wechat-renderer`：把 Markdown 渲染成 `article-package.json`、`preview.html` 和本地文章包。
- `@yangodev/wechat-publisher`：读取已渲染的文章包，上传素材，并创建微信公众号草稿箱草稿。

## 安全规则

- 不要要求用户在聊天里粘贴 AppSecret、中心 API key、access_token、Cookie 或 session。
- 不要打印 AppSecret、中心 API key、access_token、Cookie 或 session。
- 把 `wechat-publisher.config.json` 和 `.wechat-publisher.config.json` 当作本机私有文件。
- 不要公开发表或群发文章。CLI 的 `draft` 命令只创建微信草稿箱草稿。
- 不要把 Markdown、文章 HTML、图片文件、封面文件或本地路径发送给中心服务。中心模式只请求短期 token。

## 安装检查

优先使用项目内安装包；如果项目没有安装，再建议用户从官方 npm registry 安装：

```bash
npm install @yangodev/wechat-renderer @yangodev/wechat-publisher
```

如果用户需要全局命令：

```bash
npm install -g @yangodev/wechat-renderer @yangodev/wechat-publisher
```

使用前先检查版本：

```bash
npx wechat-renderer --version
npx wechat-publisher --version
```

也可以运行本 Skill 自带的 doctor 脚本：

```bash
node skills/wechat-publisher/scripts/doctor.mjs
```

## 首次配置

本地模式使用用户自己的微信公众号 AppID/AppSecret 和 IP 白名单：

```bash
npx wechat-publisher init \
  --mode local \
  --app-id wx_xxx \
  --app-secret xxx \
  --author "作者名称"
```

中心模式使用中心 token 服务：

```bash
npx wechat-publisher init \
  --mode center \
  --center-url https://api.yango.dev \
  --account acct_xxx \
  --center-api-key xxx \
  --author "作者名称"
```

配置会写入 `wechat-publisher.config.json`，该文件只保存在本机，不要提交到 Git 仓库。

## 正常流程

先渲染 Markdown：

```bash
npx wechat-renderer render article.md --out dist
```

检查发布包：

```bash
npx wechat-renderer check article.md
npx wechat-publisher doctor --package dist --config wechat-publisher.config.json
```

无阻塞错误后，创建微信草稿箱草稿：

```bash
npx wechat-publisher draft dist \
  --config wechat-publisher.config.json \
  --token-mode center \
  --submit-preview
```

如果只想验证，不创建真实草稿：

```bash
npx wechat-publisher draft dist \
  --config wechat-publisher.config.json \
  --token-mode center \
  --dry-run \
  --submit-preview
```

`dist` 可以是包含 `article-package.json` 的目录，也可以直接传入 `dist/article-package.json`。

## 产物检查

渲染阶段通常生成：

- `dist/article-package.json`
- `dist/preview.html`
- `dist/publish-report.json`
- `dist/assets/`

草稿箱阶段通常生成：

- `dist/wechat-submit.html`
- `dist/wechat-draft-payload.json`
- `dist/wechat-draft-report.json`

优先读取 `wechat-draft-report.json` 判断草稿创建结果。

## 常见诊断

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
- `center.rate_limited`：稍后重试。

## 输出标准

运行 CLI 后，向用户报告：

- 使用的命令族，不展示密钥；
- 输入文章路径；
- 输出文章包目录；
- `wechat-draft-report.json` 路径；
- 草稿状态；
- 创建成功时的 draft media id；
- 错误和警告数量；
- 任意诊断码对应的下一步；
- 仍需用户进入微信公众号后台人工预览、保存或发布。
