import { NextResponse } from "next/server";
import { extractModelIds, getUpstreamErrorMessage } from "@/lib/openai";
import { UpstreamConfigError, resolveUpstreamConfig } from "@/lib/server/openai-config";
import { resolveOpenAIEndpoints, uniqueUrls } from "@/lib/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ModelsRequest = {
  baseURL?: string;
  apiKey?: string;
};

export async function POST(request: Request) {
  let body: ModelsRequest;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求体必须是合法的 JSON。" }, { status: 400 });
  }

  try {
    const {
      apiKey,
      baseURL,
      usingDefaultApiKey,
      usingDefaultBaseURL,
    } = resolveUpstreamConfig(body);
    const preferredModel =
      usingDefaultApiKey && usingDefaultBaseURL
        ? process.env.DEFAULT_OPENAI_MODEL?.trim() ?? ""
        : "";
    const { apiRoot, modelsUrl, rawRoot } = resolveOpenAIEndpoints(baseURL);
    const modelCandidates = uniqueUrls([
      modelsUrl,
      `${rawRoot}/models`,
      `${apiRoot.replace(/\/v1$/, "")}/models`,
    ]);

    let lastError = "模型列表获取失败";

    for (const candidate of modelCandidates) {
      try {
        const upstream = await fetch(candidate, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!upstream.ok) {
          lastError = await getUpstreamErrorMessage(
            upstream,
            `模型列表获取失败（尝试地址：${candidate}）`,
          );
          continue;
        }

        const payload = await upstream.json();
        const models = extractModelIds(payload);

        if (models.length > 0) {
          return NextResponse.json({
            models,
            preferredModel: preferredModel || undefined,
          });
        }

        lastError = `接口请求成功，但没有从 ${candidate} 解析出可选模型。`;
      } catch (error) {
        lastError =
          error instanceof Error
            ? `模型列表获取失败（尝试地址：${candidate}）：${error.message}`
            : `模型列表获取失败（尝试地址：${candidate}）。`;
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
            : "模型列表获取失败，请检查中转站地址是否正确。",
      },
      { status: 500 },
    );
  }
}
