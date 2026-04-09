import "server-only";

const REASONING_TAG_NAMES = ["think", "thinking", "reasoning"] as const;
const STREAM_TAIL_RESERVE_LENGTH = 32;

function asObject(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function readTextValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  const record = asObject(value);

  if (record) {
    return (
      readTextValue(record.text) ||
      readTextValue(record.delta) ||
      readTextValue(record.content) ||
      readTextValue(record.value) ||
      readTextValue(record.output_text) ||
      readTextValue(record.output) ||
      readTextValue(record.response)
    );
  }

  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .map((part) => readTextValue(part))
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

  return (
    readTextValue(firstChoice?.message) ||
    readTextValue(firstChoice?.delta) ||
    readTextValue(firstChoice?.text) ||
    readTextValue(root?.output_text) ||
    readTextValue(root?.text) ||
    readTextValue(root?.delta) ||
    readTextValue(root?.content) ||
    readTextValue(root?.output) ||
    readTextValue(root?.response)
  );
}

export function extractStreamingText(payload: unknown) {
  const root = asObject(payload);
  const choices = Array.isArray(root?.choices) ? root.choices : [];
  const firstChoice = asObject(choices[0]);

  return (
    readTextValue(firstChoice?.delta) ||
    readTextValue(firstChoice?.message) ||
    readTextValue(firstChoice?.text) ||
    readTextValue(root?.output_text) ||
    readTextValue(root?.text) ||
    readTextValue(root?.delta) ||
    readTextValue(root?.content) ||
    readTextValue(root?.output) ||
    readTextValue(root?.response)
  );
}

function removeReasoningBlocks(text: string) {
  return REASONING_TAG_NAMES.reduce((current, tagName) => {
    const pattern = new RegExp(
      `<\\s*${tagName}\\b[^>]*>[\\s\\S]*?<\\s*\\/\\s*${tagName}\\s*>`,
      "gi",
    );

    return current.replace(pattern, "");
  }, text);
}

function createReasoningStripper() {
  let buffer = "";
  let activeTagName: (typeof REASONING_TAG_NAMES)[number] | null = null;

  function findOpeningTag(source: string) {
    let earliestMatch:
      | {
          index: number;
          fullMatch: string;
          tagName: (typeof REASONING_TAG_NAMES)[number];
        }
      | null = null;

    for (const tagName of REASONING_TAG_NAMES) {
      const match = new RegExp(`<\\s*${tagName}\\b[^>]*>`, "i").exec(source);

      if (!match || match.index === undefined) {
        continue;
      }

      if (!earliestMatch || match.index < earliestMatch.index) {
        earliestMatch = {
          index: match.index,
          fullMatch: match[0],
          tagName,
        };
      }
    }

    return earliestMatch;
  }

  function splitVisibleText(source: string) {
    const lastTagStart = source.lastIndexOf("<");

    if (lastTagStart === -1) {
      return {
        visibleText: source,
        reservedTail: "",
      };
    }

    const tail = source.slice(lastTagStart);
    const normalizedTail = tail.toLowerCase().replace(/\s+/g, "");
    const couldBeReasoningPrefix = REASONING_TAG_NAMES.some((tagName) => {
      const openTagPrefix = `<${tagName}`;
      return (
        openTagPrefix.startsWith(normalizedTail) ||
        normalizedTail.startsWith(openTagPrefix)
      );
    });

    if (couldBeReasoningPrefix && tail.length <= STREAM_TAIL_RESERVE_LENGTH) {
      return {
        visibleText: source.slice(0, lastTagStart),
        reservedTail: tail,
      };
    }

    return {
      visibleText: source,
      reservedTail: "",
    };
  }

  function feed(chunk: string, isFinal = false) {
    let output = "";
    buffer += chunk;

    while (buffer) {
      if (activeTagName) {
        const closingMatch = new RegExp(
          `<\\s*\\/\\s*${activeTagName}\\s*>`,
          "i",
        ).exec(buffer);

        if (!closingMatch || closingMatch.index === undefined) {
          if (isFinal) {
            buffer = "";
            activeTagName = null;
          } else if (buffer.length > STREAM_TAIL_RESERVE_LENGTH) {
            buffer = buffer.slice(-STREAM_TAIL_RESERVE_LENGTH);
          }
          break;
        }

        buffer = buffer.slice(closingMatch.index + closingMatch[0].length);
        activeTagName = null;
        continue;
      }

      const openingMatch = findOpeningTag(buffer);

      if (!openingMatch) {
        if (isFinal) {
          output += buffer;
          buffer = "";
        } else {
          const { visibleText, reservedTail } = splitVisibleText(buffer);
          output += visibleText;
          buffer = reservedTail;
        }
        break;
      }

      output += buffer.slice(0, openingMatch.index);
      buffer = buffer.slice(openingMatch.index + openingMatch.fullMatch.length);
      activeTagName = openingMatch.tagName;
    }

    return output;
  }

  return { feed };
}

export function sanitizeModelOutput(text: string) {
  return removeReasoningBlocks(text);
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
  const reasoningStripper = createReasoningStripper();
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
        const sanitizedText = reasoningStripper.feed(text);

        if (sanitizedText) {
          controller.enqueue(encoder.encode(sanitizedText));
        }
      }
      return;
    } catch {
      const sanitizedPayload = reasoningStripper.feed(payload);

      if (sanitizedPayload) {
        controller.enqueue(encoder.encode(sanitizedPayload));
      }
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

        const tail = reasoningStripper.feed("", true);

        if (tail) {
          controller.enqueue(encoder.encode(tail));
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
