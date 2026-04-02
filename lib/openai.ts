import "server-only";

function asObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function readTextValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((part) => {
      if (typeof part === "string") {
        return part;
      }

      const record = asObject(part);
      if (!record) {
        return "";
      }

      if (typeof record.text === "string") {
        return record.text;
      }

      if (typeof record.content === "string") {
        return record.content;
      }

      return "";
    })
    .join("");
}

export function extractModelIds(payload: unknown) {
  const root = asObject(payload);
  const nestedModels = asObject(root?.models);
  const nestedResult = asObject(root?.result);
  const dataCandidates = [
    Array.isArray(payload) ? payload : null,
    Array.isArray(root?.data) ? root.data : null,
    Array.isArray(root?.models) ? root.models : null,
    Array.isArray(nestedModels?.data) ? nestedModels.data : null,
    Array.isArray(nestedResult?.data) ? nestedResult.data : null,
  ];
  const data = dataCandidates.find(Array.isArray) ?? [];

  const modelIds = data
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      const record = asObject(item);
      const nestedModel = asObject(record?.model);

      return (
        (typeof record?.id === "string" && record.id) ||
        (typeof record?.name === "string" && record.name) ||
        (typeof record?.model === "string" && record.model) ||
        (typeof nestedModel?.id === "string" && nestedModel.id) ||
        ""
      );
    })
    .filter(Boolean);

  return Array.from(new Set(modelIds));
}

export function extractCompletionText(payload: unknown) {
  const root = asObject(payload);
  const choices = Array.isArray(root?.choices) ? root.choices : [];
  const firstChoice = asObject(choices[0]);
  const message = asObject(firstChoice?.message);
  const delta = asObject(firstChoice?.delta);

  return (
    readTextValue(message?.content) ||
    readTextValue(delta?.content) ||
    readTextValue(firstChoice?.text) ||
    readTextValue(root?.output_text)
  );
}

export function extractStreamingText(payload: unknown) {
  const root = asObject(payload);
  const choices = Array.isArray(root?.choices) ? root.choices : [];
  const firstChoice = asObject(choices[0]);
  const delta = asObject(firstChoice?.delta);
  const message = asObject(firstChoice?.message);

  return (
    readTextValue(delta?.content) ||
    readTextValue(message?.content) ||
    readTextValue(firstChoice?.text) ||
    readTextValue(root?.output_text)
  );
}

export async function getUpstreamErrorMessage(
  response: Response,
  fallback: string,
) {
  const contentType = response.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      const root = asObject(payload);
      const error = asObject(root?.error);

      const message =
        (typeof error?.message === "string" && error.message) ||
        (typeof root?.message === "string" && root.message) ||
        (typeof root?.error === "string" && root.error) ||
        (typeof root?.detail === "string" && root.detail);

      if (message) {
        return `${fallback}：${message}`;
      }
    } else {
      const text = (await response.text()).trim();

      if (text) {
        return `${fallback}：${text.slice(0, 240)}`;
      }
    }
  } catch {
    // 忽略解析失败，回退到通用错误信息。
  }

  return `${fallback}（HTTP ${response.status}）`;
}

export function createMarkdownStreamFromSSE(
  upstream: ReadableStream<Uint8Array>,
) {
  const reader = upstream.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const flushEventBlock = (
    eventBlock: string,
    controller: ReadableStreamDefaultController<Uint8Array>,
  ) => {
    const payload = eventBlock
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.replace(/^data:\s?/, ""))
      .join("\n")
      .trim();

    if (!payload || payload === "[DONE]") {
      return;
    }

    try {
      const text = extractStreamingText(JSON.parse(payload));
      if (text) {
        controller.enqueue(encoder.encode(text));
      }
      return;
    } catch {
      controller.enqueue(encoder.encode(payload));
    }
  };

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split(/\r?\n\r?\n/);
          buffer = parts.pop() ?? "";

          for (const part of parts) {
            flushEventBlock(part, controller);
          }
        }

        buffer += decoder.decode();

        if (buffer.trim()) {
          flushEventBlock(buffer, controller);
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
    async cancel(reason) {
      await reader.cancel(reason).catch(() => undefined);
    },
  });
}
