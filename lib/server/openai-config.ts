export class UpstreamConfigError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "UpstreamConfigError";
    this.status = status;
  }
}

type UpstreamConfigInput = {
  apiKey?: string;
  baseURL?: string;
};

export function resolveUpstreamConfig(input: UpstreamConfigInput) {
  const providedBaseURL = input.baseURL?.trim() ?? "";
  const providedApiKey = input.apiKey?.trim() ?? "";
  const defaultBaseURL = process.env.DEFAULT_OPENAI_BASE_URL?.trim() ?? "";
  const defaultApiKey = process.env.DEFAULT_OPENAI_API_KEY?.trim() ?? "";

  const baseURL = providedBaseURL || defaultBaseURL;
  const apiKey = providedApiKey || defaultApiKey;

  if (!baseURL) {
    throw new UpstreamConfigError(
      "服务端未配置 DEFAULT_OPENAI_BASE_URL，暂时无法使用默认中转站。",
      500,
    );
  }

  if (!apiKey) {
    throw new UpstreamConfigError(
      "服务端未配置默认 API Key，请先填写你自己的 API Key。",
    );
  }

  return {
    apiKey,
    baseURL,
    usingDefaultApiKey: !providedApiKey,
    usingDefaultBaseURL: !providedBaseURL,
  };
}
