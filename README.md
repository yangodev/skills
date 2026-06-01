# YanGo Skills

这里存放 YanGo 维护的开源 Agent Skill 适配器。

本仓库只包含轻量说明、参考资料、模板和辅助脚本，用来让编码 Agent 稳定调用本地工具。Skill 不内嵌完整产品实现，也不包含 `node_modules`。

## 当前 Skill

- `wechat-publisher`：调用 `@yangodev/wechat-renderer` 和 `@yangodev/wechat-publisher`，完成 Markdown 渲染、微信公众号 HTML 预览、素材校验和微信公众号草稿箱创建。

## 目录结构

```txt
skills/
├── registry.json
└── skills/
    └── wechat-publisher/
        ├── SKILL.md
        └── scripts/
```

## 安装 Skill

把某个 Skill 复制到项目本地 Codex Skill 目录：

```bash
mkdir -p .codex/skills
cp -R skills/wechat-publisher .codex/skills/
```

`wechat-publisher` Skill 需要单独安装官方 npm 包：

```bash
npm install -g @yangodev/wechat-renderer @yangodev/wechat-publisher
wechat-renderer --help
wechat-publisher --help
```

## 许可证

本仓库使用 MIT License，见 `LICENSE`。

YanGo、`yangodev` 名称及相关品牌资产不在 MIT License 授权范围内，见 `TRADEMARKS.md`。
