const KNOWN_OPENAI_SUFFIXES = ["/chat/completions", "/completions", "/models"];

type NormalizeBaseURLOptions = {
  appendV1?: boolean;
};

export function normalizeBaseURL(
  rawBaseURL: string,
  options: NormalizeBaseURLOptions = {},
) {
  const { appendV1 = true } = options;
  const value = rawBaseURL.trim();

  if (!value) {
    throw new Error("请先填写 Base URL。");
  }

  const normalizedProtocol = /^https?:\/\//i.test(value)
    ? value
    : `https://${value}`;

  let url: URL;

  try {
    url = new URL(normalizedProtocol);
  } catch {
    throw new Error("Base URL 格式无效，请输入完整域名或带协议的地址。");
  }

  url.hash = "";
  url.search = "";

  let pathname = url.pathname.replace(/\/+$/, "");

  for (const suffix of KNOWN_OPENAI_SUFFIXES) {
    if (pathname.endsWith(suffix)) {
      pathname = pathname.slice(0, -suffix.length);
      break;
    }
  }

  if (pathname === "/" || pathname === "") {
    pathname = "";
  }

  if (appendV1 && !pathname.endsWith("/v1")) {
    pathname = `${pathname}/v1`;
  }

  url.pathname = pathname;

  return url.toString().replace(/\/$/, "");
}

export function uniqueUrls(urls: string[]) {
  return Array.from(new Set(urls.map((item) => item.trim()).filter(Boolean)));
}

export function resolveOpenAIEndpoints(baseURL: string) {
  const apiRoot = normalizeBaseURL(baseURL);
  const rawRoot = normalizeBaseURL(baseURL, { appendV1: false });

  return {
    apiRoot,
    rawRoot,
    modelsUrl: `${apiRoot}/models`,
    chatCompletionsUrl: `${apiRoot}/chat/completions`,
  };
}
