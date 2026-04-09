import { NextResponse } from "next/server";
import {
  createMarkdownStreamFromSSE,
  extractCompletionText,
  getUpstreamErrorMessage,
  sanitizeModelOutput,
} from "@/lib/openai";
import {
  buildRewriteUserPrompt,
  EXECUTION_GUARD_PROMPT,
  getSystemPromptByMode,
} from "@/lib/prompt";
import { normalizeRewriteMode, type RewriteMode } from "@/lib/rewrite-mode";
import { UpstreamConfigError, resolveUpstreamConfig } from "@/lib/server/openai-config";
import { resolveOpenAIEndpoints, uniqueUrls } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GenerateRequest = {
  baseURL?: string;
  apiKey?: string;
  model?: string;
  input?: string;
  mode?: string;
};

const STREAM_HEADERS = {
  "Cache-Control": "no-cache, no-transform",
  Connection: "keep-alive",
  "Content-Type": "text/plain; charset=utf-8",
  "X-Accel-Buffering": "no",
};

function buildChatCompletionPayload(model: string, input: string, mode: RewriteMode) {
  const systemPrompt = getSystemPromptByMode(mode);

  return {
    model,
    stream: true,
    temperature: 0.2,
    top_p: 0.9,
    messages: [
      {
        role: "system" as const,
        content: `${systemPrompt}\n\n${EXECUTION_GUARD_PROMPT}`,
      },
      {
        role: "user" as const,
        content: buildRewriteUserPrompt(input),
      },
    ],
  };
}

export async function POST(request: Request) {  
  let body: GenerateRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体必须是合法的 JSON。" }, { status: 400 });
  }

  const model = body.model?.trim() ?? "";
  const input = body.input?.trim() ?? "";
  const mode = normalizeRewriteMode(body.mode);

  if (!model || !input) {
    return NextResponse.json(
      { error: "请完整填写模型和输入内容。" },
      { status: 400 },
    );
  }

  try {
    const { apiKey, baseURL } = resolveUpstreamConfig(body);
    const { apiRoot, chatCompletionsUrl, rawRoot } = resolveOpenAIEndpoints(baseURL);
    const completionCandidates = uniqueUrls([
      chatCompletionsUrl,
      `${rawRoot}/chat/completions`,
      `${apiRoot.replace(/\/v1$/, "")}/chat/completions`,
    ]);

    let lastError = "生成失败";

    for (const candidate of completionCandidates) {
      try {
        const upstream = await fetch(candidate, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "text/event-stream, application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildChatCompletionPayload(model, input, mode)),
          cache: "no-store",
        });

        if (!upstream.ok) {
          lastError = await getUpstreamErrorMessage(
            upstream,
            `生成失败（尝试地址：${candidate}）`,
          );
          continue;
        }

        const contentType = upstream.headers.get("content-type") ?? "";

        if (contentType.includes("application/json")) {
          const payload = await upstream.json();
          const text = sanitizeModelOutput(extractCompletionText(payload));

          if (!text) {
            lastError = `上游从 ${candidate} 返回成功，但没有生成任何 Markdown 内容。`;
            continue;
          }

          return new Response(text, {
            headers: STREAM_HEADERS,
          });
        }

        if (!upstream.body) {
          lastError = `上游从 ${candidate} 返回成功，但未提供可读取的流式响应。`;
          continue;
        }

        return new Response(createMarkdownStreamFromSSE(upstream.body), {
          headers: STREAM_HEADERS,
        });
      } catch (error) {
        lastError =
          error instanceof Error
            ? `生成失败（尝试地址：${candidate}）：${error.message}`
            : `生成失败（尝试地址：${candidate}）。`;
      }
    }

    return NextResponse.json({ error: lastError }, { status: 502 });
  } catch (error) {
    if (error instanceof UpstreamConfigError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "生成失败，请检查模型、接口兼容性或稍后重试。",
      },
      { status: 500 },
    );
  }
}
