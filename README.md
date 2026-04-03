# Paper Polish AI

一个可直接部署到 Vercel 的现代化 AI Web 应用，面向“论文/技术文档改写”单轮场景。服务端可预置兼容 OpenAI 的中转站 `Base URL` 与默认 `API Key`，用户进入页面后只需要选择模型即可开始使用；如果用户填写了自己的 `API Key`，应用会自动切换为该 key 对应的模型列表，并继续通过服务端 Route Handler 以流式方式生成 Markdown 结果。

## 技术栈

- Next.js 16（App Router）
- TypeScript
- Tailwind CSS 4
- shadcn/ui 风格组件
- react-markdown

## 功能特性

- 服务端通过环境变量预置默认 `Base URL` 与 `API Key`
- 用户留空时自动使用站点默认通道并获取模型列表
- 用户填写自己的 `API Key` 后，自动切换到该 key 对应的模型列表
- 自动请求 `${baseURL}/v1/models` 获取模型列表
- 健壮处理 Base URL，兼容尾斜杠、已包含 `/v1`、误填完整接口地址等情况
- 使用固定服务端 `system prompt` 进行单轮改写
- 调用 `/v1/chat/completions`，默认开启 `stream: true`
- 服务端解析并转发流式输出，前端实时渲染 Markdown
- 支持复制完整 Markdown 原文
- 用户自定义 `API Key` 与 `model` 自动保存在浏览器 `localStorage`
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

2. 配置环境变量：

```bash
cp .env.example .env.local
```

其中：

- `DEFAULT_OPENAI_BASE_URL`：你的中转站根地址，支持填写 `https://example.com` 或 `https://example.com/v1`
- `DEFAULT_OPENAI_API_KEY`：站点默认使用的 API Key，不会暴露到前端
- `DEFAULT_OPENAI_MODEL`：系统默认模式下优先预选的模型名，可选配置

3. 启动开发环境：

```bash
npm run dev
```

4. 打开浏览器访问：

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
4. 在 Vercel 项目环境变量中配置 `DEFAULT_OPENAI_BASE_URL`、`DEFAULT_OPENAI_API_KEY`，如有需要再配置 `DEFAULT_OPENAI_MODEL`。
5. 部署完成后即可使用。

说明：

- 站点默认 `API Key` 仅保存在服务端环境变量中，不会下发到浏览器。
- 本项目不会在服务端持久化保存用户自定义的 `API Key`。
- 用户自定义 `API Key` 仅保存在用户自己的浏览器 `localStorage`，刷新页面后仍可继续使用。
- 生成请求统一走 `/api/generate`，前端不会直接请求中转站。

## 质量检查

```bash
npm run lint
npm run build
```
