# Paper Polish AI

一个可直接部署到 Vercel 的现代化 AI Web 应用，面向“论文/技术文档改写”单轮场景。用户输入兼容 OpenAI 的 `Base URL`、`API Key` 和模型后，应用会自动检测模型列表，并通过服务端 Route Handler 以流式方式生成 Markdown 结果。

## 技术栈

- Next.js 16（App Router）
- TypeScript
- Tailwind CSS 4
- shadcn/ui 风格组件
- react-markdown

## 功能特性

- 输入 OpenAI-compatible `Base URL` 与 `API Key`
- 自动请求 `${baseURL}/v1/models` 获取模型列表
- 健壮处理 Base URL，兼容尾斜杠、已包含 `/v1`、误填完整接口地址等情况
- 使用固定服务端 `system prompt` 进行单轮改写
- 调用 `/v1/chat/completions`，默认开启 `stream: true`
- 服务端解析并转发流式输出，前端实时渲染 Markdown
- 支持复制完整 Markdown 原文
- `Base URL`、`API Key`、`model` 自动保存在浏览器 `localStorage`
- 明确的加载态、错误态、空状态与移动端适配

## 项目结构

```text
.
├── app
│   ├── api
│   │   ├── generate/route.ts
│   │   └── models/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── config-panel.tsx
│   ├── input-panel.tsx
│   ├── output-panel.tsx
│   ├── rewrite-studio.tsx
│   └── ui
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       └── textarea.tsx
├── lib
│   ├── openai.ts
│   ├── prompt.ts
│   ├── url.ts
│   └── utils.ts
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## 本地运行

1. 安装依赖：

```bash
npm install
```

2. 启动开发环境：

```bash
npm run dev
```

3. 打开浏览器访问：

```text
http://localhost:3000
```

## 生产构建

```bash
npm run build
npm run start
```

## 部署到 Vercel

1. 将项目推送到 Git 仓库。
2. 在 Vercel 导入该仓库。
3. Framework Preset 选择 `Next.js`。
4. 不需要额外数据库或服务端环境变量。
5. 部署完成后即可使用。

说明：

- 本项目不会在服务端持久化保存用户的 `API Key`。
- `API Key` 仅保存在用户自己的浏览器 `localStorage`，刷新页面后仍可继续使用。
- 生成请求统一走 `/api/generate`，前端不会直接请求中转站。

## 质量检查

```bash
npm run lint
npm run build
```
