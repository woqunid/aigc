"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { WandSparkles } from "lucide-react";
import { ConfigPanel } from "@/components/config-panel";
import { InputPanel } from "@/components/input-panel";
import { OutputPanel } from "@/components/output-panel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STORAGE_KEYS = {
  apiKey: "paper-polish-ai.api-key",
  baseURL: "paper-polish-ai.base-url",
  model: "paper-polish-ai.model",
} as const;

type ConnectionConfig = {
  apiKey: string;
  baseURL: string;
  model: string;
};

type ConfigErrors = Partial<Record<keyof ConnectionConfig, string>>;

const EMPTY_CONNECTION: ConnectionConfig = {
  apiKey: "",
  baseURL: "",
  model: "",
};

async function readApiError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string };
    if (payload?.error) {
      return payload.error;
    }
  } catch {
    // 忽略解析失败，走通用错误文案。
  }

  return `请求失败（HTTP ${response.status}）`;
}

function isConnectionReady(config: ConnectionConfig) {
  return Boolean(
    config.baseURL.trim() && config.apiKey.trim() && config.model.trim(),
  );
}

export function RewriteStudio() {
  const [connection, setConnection] = useState<ConnectionConfig>(EMPTY_CONNECTION);
  const [draftConfig, setDraftConfig] = useState<ConnectionConfig>(EMPTY_CONNECTION);
  const [showApiKey, setShowApiKey] = useState(false);
  const [draftModels, setDraftModels] = useState<string[]>([]);
  const [configErrors, setConfigErrors] = useState<ConfigErrors>({});
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState("");
  const [output, setOutput] = useState("");
  const [modelsError, setModelsError] = useState("");
  const [generateError, setGenerateError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modelsStatus, setModelsStatus] = useState(
    "填写 Base URL 与 API Key 后会自动检测模型。",
  );
  const [streamStatus, setStreamStatus] = useState("等待生成");

  const copyTimerRef = useRef<number | null>(null);
  const modelsAbortRef = useRef<AbortController | null>(null);
  const generateAbortRef = useRef<AbortController | null>(null);
  const baseURLInputRef = useRef<HTMLInputElement | null>(null);
  const apiKeyInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedBaseURL = window.localStorage.getItem(STORAGE_KEYS.baseURL) ?? "";
    const savedApiKey = window.localStorage.getItem(STORAGE_KEYS.apiKey) ?? "";
    const savedModel = window.localStorage.getItem(STORAGE_KEYS.model) ?? "";
    const savedConnection = {
      baseURL: savedBaseURL,
      apiKey: savedApiKey,
      model: savedModel,
    };

    setConnection(savedConnection);
    setDraftConfig(savedConnection);
    setDraftModels(savedModel ? [savedModel] : []);
    setIsHydrated(true);

    return () => {
      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }

      modelsAbortRef.current?.abort();
      generateAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEYS.baseURL, connection.baseURL);
    window.localStorage.setItem(STORAGE_KEYS.apiKey, connection.apiKey);
    window.localStorage.setItem(STORAGE_KEYS.model, connection.model);
  }, [connection, isHydrated]);

  useEffect(() => {
    if (!isHydrated || !isConfigOpen) {
      return;
    }

    const syncAutofilledValues = () => {
      const nextBaseURL = baseURLInputRef.current?.value ?? "";
      const nextApiKey = apiKeyInputRef.current?.value ?? "";

      if (nextBaseURL && nextBaseURL !== draftConfig.baseURL) {
        setDraftConfig((current) => ({
          ...current,
          baseURL: nextBaseURL,
        }));
      }

      if (nextApiKey && nextApiKey !== draftConfig.apiKey) {
        setDraftConfig((current) => ({
          ...current,
          apiKey: nextApiKey,
        }));
      }
    };

    syncAutofilledValues();

    const timer = window.setTimeout(syncAutofilledValues, 300);
    const interval = window.setInterval(syncAutofilledValues, 1200);
    window.addEventListener("focus", syncAutofilledValues);
    document.addEventListener("visibilitychange", syncAutofilledValues);

    return () => {
      window.clearTimeout(timer);
      window.clearInterval(interval);
      window.removeEventListener("focus", syncAutofilledValues);
      document.removeEventListener("visibilitychange", syncAutofilledValues);
    };
  }, [draftConfig.apiKey, draftConfig.baseURL, isConfigOpen, isHydrated]);

  const fetchDraftModels = useCallback(async (isAuto = false) => {
    if (!draftConfig.baseURL.trim() || !draftConfig.apiKey.trim()) {
      setModelsError("请先填写 Base URL 和 API Key。");
      return;
    }

    modelsAbortRef.current?.abort();
    const controller = new AbortController();
    modelsAbortRef.current = controller;

    setIsModelsLoading(true);
    setModelsError("");
    setModelsStatus(isAuto ? "正在自动检测模型..." : "正在刷新模型列表...");

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseURL: draftConfig.baseURL,
          apiKey: draftConfig.apiKey,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = (await response.json()) as { models?: string[] };
      const nextModels = Array.isArray(data.models) ? data.models : [];

      if (nextModels.length === 0) {
        throw new Error("模型接口返回成功，但没有检测到可用模型。");
      }

      setDraftModels(nextModels);
      setModelsStatus(`已检测到 ${nextModels.length} 个模型，请确认后开始生成。`);
      setDraftConfig((current) => ({
        ...current,
        model:
          current.model && nextModels.includes(current.model)
            ? current.model
            : nextModels[0],
      }));
      setConfigErrors((current) => ({
        ...current,
        model: undefined,
      }));
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setDraftModels([]);
      setModelsError(
        error instanceof Error ? error.message : "模型列表获取失败，请稍后重试。",
      );
      setModelsStatus(
        "模型检测失败，请检查 Base URL、API Key 或中转站兼容性；也可以手动填写模型名后确认使用。",
      );
    } finally {
      if (modelsAbortRef.current === controller) {
        modelsAbortRef.current = null;
      }
      setIsModelsLoading(false);
    }
  }, [draftConfig.apiKey, draftConfig.baseURL]);

  useEffect(() => {
    if (!isHydrated || !isConfigOpen) {
      return;
    }

    if (!draftConfig.baseURL.trim() || !draftConfig.apiKey.trim()) {
      setDraftModels(draftConfig.model ? [draftConfig.model] : []);
      setModelsError("");
      setModelsStatus("填写 Base URL 与 API Key 后会自动检测模型。");
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchDraftModels(true);
    }, 550);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    draftConfig.apiKey,
    draftConfig.baseURL,
    draftConfig.model,
    fetchDraftModels,
    isConfigOpen,
    isHydrated,
  ]);

  function openConfigDialog() {
    setDraftConfig(connection);
    setDraftModels(connection.model ? [connection.model] : []);
    setConfigErrors({});
    setModelsError("");
    setModelsStatus("填写 Base URL 与 API Key 后会自动检测模型。");
    setShowApiKey(false);
    setIsConfigOpen(true);
  }

  function closeConfigDialog() {
    setIsConfigOpen(false);
    setDraftConfig(connection);
    setDraftModels(connection.model ? [connection.model] : []);
    setConfigErrors({});
    setModelsError("");
    setModelsStatus("填写 Base URL 与 API Key 后会自动检测模型。");
    setShowApiKey(false);
  }

  function validateDraftConfig() {
    const nextErrors: ConfigErrors = {};

    if (!draftConfig.baseURL.trim()) {
      nextErrors.baseURL = "请填写 Base URL。";
    }

    if (!draftConfig.apiKey.trim()) {
      nextErrors.apiKey = "请填写 API Key。";
    }

    if (!draftConfig.model.trim()) {
      nextErrors.model = "请先检测并选择模型，或手动填写模型名。";
    }

    setConfigErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleConfirmConnection() {
    if (!validateDraftConfig()) {
      return;
    }

    const confirmed = {
      baseURL: draftConfig.baseURL.trim(),
      apiKey: draftConfig.apiKey.trim(),
      model: draftConfig.model.trim(),
    };

    setConnection(confirmed);
    setDraftConfig(confirmed);
    setGenerateError("");
    setConfigErrors({});
    setIsConfigOpen(false);
  }

  async function handleGenerate() {
    if (!isConnectionReady(connection)) {
      setGenerateError("请先点击“模型配置”完成设置，然后再开始生成。");
      openConfigDialog();
      return;
    }

    const submittedInput = input.trim();

    if (!submittedInput) {
      setInputError("请输入需要改写的中文内容或一句话需求。");
      return;
    }

    setInputError("");
    setInput("");
    generateAbortRef.current?.abort();
    const controller = new AbortController();
    generateAbortRef.current = controller;

    setIsGenerating(true);
    setGenerateError("");
    setOutput("");
    setStreamStatus("正在建立流式连接...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          baseURL: connection.baseURL,
          apiKey: connection.apiKey,
          model: connection.model,
          input: submittedInput,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      if (!response.body) {
        throw new Error("服务端未返回流式内容。");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      setStreamStatus("正在生成 Markdown 内容...");

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });

        if (chunk) {
          setOutput((current) => current + chunk);
        }
      }

      const tail = decoder.decode();
      if (tail) {
        setOutput((current) => current + tail);
      }

      setStreamStatus("生成完成，可直接复制 Markdown 原文。");
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }

      setGenerateError(
        error instanceof Error ? error.message : "生成失败，请稍后重试。",
      );
      setStreamStatus("生成失败");
    } finally {
      if (generateAbortRef.current === controller) {
        generateAbortRef.current = null;
      }
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setCopyFeedback("已复制");

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = window.setTimeout(() => {
        setCopyFeedback("");
      }, 2200);
    } catch {
      setCopyFeedback("复制失败");

      if (copyTimerRef.current) {
        window.clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = window.setTimeout(() => {
        setCopyFeedback("");
      }, 2200);
    }
  }

  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_62%)]" />
      <div className="pointer-events-none absolute left-[-12rem] top-28 size-80 rounded-full bg-sky-200/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-16 size-72 rounded-full bg-blue-300/20 blur-3xl" />

      <main className="relative mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,470px)_minmax(0,1fr)]">
          <InputPanel
            currentModel={connection.model}
            input={input}
            inputError={inputError}
            isGenerating={isGenerating}
            isModelConfigured={isConnectionReady(connection)}
            onGenerate={() => {
              void handleGenerate();
            }}
            onInputChange={(value) => {
              setInput(value);
              setInputError("");
            }}
            onOpenConfig={openConfigDialog}
          />

          <OutputPanel
            copyFeedback={copyFeedback}
            error={generateError}
            isGenerating={isGenerating}
            output={output}
            statusText={streamStatus}
            onCopy={() => {
              void handleCopy();
            }}
          />
        </section>
      </main>

      <Dialog
        open={isConfigOpen}
        onOpenChange={(open) => {
          if (open) {
            openConfigDialog();
          } else {
            closeConfigDialog();
          }
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>连接配置</DialogTitle>
            <DialogDescription>
              在这里填写中转站地址、API Key 并选择模型。点击“确认并使用”后，后续生成都会使用这次确认的模型。
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(92vh-11rem)] overflow-y-auto">
            <ConfigPanel
              apiKey={draftConfig.apiKey}
              baseURL={draftConfig.baseURL}
              baseURLInputRef={baseURLInputRef}
              apiKeyInputRef={apiKeyInputRef}
              fieldErrors={configErrors}
              isModelsLoading={isModelsLoading}
              model={draftConfig.model}
              models={draftModels}
              modelsError={modelsError}
              modelsStatus={modelsStatus}
              showApiKey={showApiKey}
              onApiKeyChange={(value) => {
                setDraftConfig((current) => ({
                  ...current,
                  apiKey: value,
                }));
                setConfigErrors((current) => ({ ...current, apiKey: undefined }));
                setModelsError("");
              }}
              onBaseURLChange={(value) => {
                setDraftConfig((current) => ({
                  ...current,
                  baseURL: value,
                }));
                setConfigErrors((current) => ({ ...current, baseURL: undefined }));
                setModelsError("");
              }}
              onModelChange={(value) => {
                setDraftConfig((current) => ({
                  ...current,
                  model: value,
                }));
                setConfigErrors((current) => ({ ...current, model: undefined }));
              }}
              onRefreshModels={() => {
                void fetchDraftModels(false);
              }}
              onToggleApiKeyVisibility={() => {
                setShowApiKey((current) => !current);
              }}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={closeConfigDialog}>
              取消
            </Button>
            <Button
              type="button"
              onClick={handleConfirmConnection}
              disabled={isModelsLoading}
            >
              确认并使用该模型
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {copyFeedback ? (
        <div
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-border bg-white/92 px-4 py-2 text-sm font-medium text-foreground shadow-[0_18px_42px_-24px_rgba(15,23,42,0.35)]"
          aria-live="polite"
        >
          <span className="inline-flex items-center gap-2">
            <WandSparkles className="size-4 text-blue-600" />
            {copyFeedback === "已复制"
              ? "Markdown 原文已复制到剪贴板"
              : "复制失败，请稍后重试"}
          </span>
        </div>
      ) : null}
    </div>
  );
}
