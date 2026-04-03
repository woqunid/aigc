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
  baseURL: "paper-polish-ai.custom-base-url",
  apiKey: "paper-polish-ai.custom-api-key",
  mode: "paper-polish-ai.config-mode",
  model: "paper-polish-ai.model",
} as const;

type ConfigMode = "system" | "custom";

type ConnectionConfig = {
  apiKey: string;
  baseURL: string;
  mode: ConfigMode;
  model: string;
};

type ConfigErrors = Partial<Record<keyof ConnectionConfig, string>>;

const EMPTY_CONNECTION: ConnectionConfig = {
  apiKey: "",
  baseURL: "",
  mode: "system",
  model: "",
};

const DEFAULT_MODELS_STATUS =
  "系统默认模式下会自动使用服务端预设的中转站与 API Key，并检测可用模型。";

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
  return Boolean(config.model.trim());
}

function getModelSourceLabel(mode: ConfigMode) {
  return mode === "custom" ? "自定义 API" : "系统默认";
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
  const [modelsStatus, setModelsStatus] = useState(DEFAULT_MODELS_STATUS);
  const [streamStatus, setStreamStatus] = useState("等待生成");

  const copyTimerRef = useRef<number | null>(null);
  const modelsAbortRef = useRef<AbortController | null>(null);
  const generateAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const savedMode = window.localStorage.getItem(STORAGE_KEYS.mode);
    const normalizedMode: ConfigMode = savedMode === "custom" ? "custom" : "system";
    const savedBaseURL = window.localStorage.getItem(STORAGE_KEYS.baseURL) ?? "";
    const savedApiKey = window.localStorage.getItem(STORAGE_KEYS.apiKey) ?? "";
    const savedModel = window.localStorage.getItem(STORAGE_KEYS.model) ?? "";
    const savedConnection = {
      baseURL: savedBaseURL,
      apiKey: savedApiKey,
      mode: normalizedMode,
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

    window.localStorage.setItem(STORAGE_KEYS.mode, connection.mode);

    if (connection.baseURL) {
      window.localStorage.setItem(STORAGE_KEYS.baseURL, connection.baseURL);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.baseURL);
    }

    if (connection.apiKey) {
      window.localStorage.setItem(STORAGE_KEYS.apiKey, connection.apiKey);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.apiKey);
    }

    if (connection.model) {
      window.localStorage.setItem(STORAGE_KEYS.model, connection.model);
    } else {
      window.localStorage.removeItem(STORAGE_KEYS.model);
    }
  }, [connection, isHydrated]);

  const fetchDraftModels = useCallback(async (isAuto = false) => {
    const isCustomMode = draftConfig.mode === "custom";
    const apiKey = isCustomMode ? draftConfig.apiKey.trim() : "";
    const baseURL = isCustomMode ? draftConfig.baseURL.trim() : "";

    if (isCustomMode && (!baseURL || !apiKey)) {
      setDraftModels([]);
      setModelsError("请先填写 API 地址和 API Key。");
      setModelsStatus("自定义模式下需要先填写 API 地址和 API Key，才能检测模型。");
      return;
    }

    modelsAbortRef.current?.abort();
    const controller = new AbortController();
    modelsAbortRef.current = controller;

    setIsModelsLoading(true);
    setModelsError("");
    setModelsStatus(
      isAuto
        ? isCustomMode
          ? "正在检测自定义 API 的可用模型..."
          : "正在加载系统默认模型..."
        : "正在刷新模型列表...",
    );

    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          baseURL,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await readApiError(response));
      }

      const data = (await response.json()) as {
        models?: string[];
        preferredModel?: string;
      };
      const nextModels = Array.isArray(data.models) ? data.models : [];

      if (nextModels.length === 0) {
        throw new Error("模型接口返回成功，但没有检测到可用模型。");
      }

      const sourceLabel = getModelSourceLabel(draftConfig.mode);
      const preferredModel =
        draftConfig.mode === "system" && typeof data.preferredModel === "string"
          ? data.preferredModel
          : "";

      setDraftModels(nextModels);
      setModelsStatus(`已检测到 ${nextModels.length} 个模型，当前来源：${sourceLabel}。`);
      setDraftConfig((current) => ({
        ...current,
        model:
          current.model && nextModels.includes(current.model)
            ? current.model
            : preferredModel && nextModels.includes(preferredModel)
              ? preferredModel
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
        isCustomMode
          ? "自定义 API 的模型检测失败，请检查 API 地址、API Key 或接口兼容性。"
          : "默认模型检测失败，请联系管理员检查服务端默认配置，或切换到自定义 API 后重试。",
      );
    } finally {
      if (modelsAbortRef.current === controller) {
        modelsAbortRef.current = null;
      }
      setIsModelsLoading(false);
    }
  }, [draftConfig.apiKey, draftConfig.baseURL, draftConfig.mode]);

  useEffect(() => {
    if (!isHydrated || !isConfigOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchDraftModels(true);
    }, draftConfig.mode === "custom" ? 550 : 200);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    draftConfig.apiKey,
    draftConfig.mode,
    fetchDraftModels,
    isConfigOpen,
    isHydrated,
  ]);

  function openConfigDialog() {
    setDraftConfig(connection);
    setDraftModels(connection.model ? [connection.model] : []);
    setConfigErrors({});
    setModelsError("");
    setModelsStatus(
      connection.mode === "custom"
        ? "自定义模式下请确认 API 地址和 API Key，再检测模型。"
        : DEFAULT_MODELS_STATUS,
    );
    setShowApiKey(false);
    setIsConfigOpen(true);
  }

  function closeConfigDialog() {
    setIsConfigOpen(false);
    setDraftConfig(connection);
    setDraftModels(connection.model ? [connection.model] : []);
    setConfigErrors({});
    setModelsError("");
    setModelsStatus(
      connection.mode === "custom"
        ? "自定义模式下请确认 API 地址和 API Key，再检测模型。"
        : DEFAULT_MODELS_STATUS,
    );
    setShowApiKey(false);
  }

  function validateDraftConfig() {
    const nextErrors: ConfigErrors = {};

    if (draftConfig.mode === "custom" && !draftConfig.baseURL.trim()) {
      nextErrors.baseURL = "请输入 API 地址。";
    }

    if (draftConfig.mode === "custom" && !draftConfig.apiKey.trim()) {
      nextErrors.apiKey = "请输入 API Key。";
    }

    if (!draftConfig.model.trim()) {
      nextErrors.model = "请先选择模型，或在列表为空时手动填写模型名。";
    }

    setConfigErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleConfirmConnection() {
    if (!validateDraftConfig()) {
      return;
    }

    const confirmed = {
      apiKey: draftConfig.apiKey.trim(),
      baseURL: draftConfig.baseURL.trim(),
      mode: draftConfig.mode,
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
      setGenerateError("请先点击“模型配置”选择模型，然后再开始生成。");
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
          apiKey: connection.mode === "custom" ? connection.apiKey : "",
          baseURL: connection.mode === "custom" ? connection.baseURL : "",
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
            currentModelSource={getModelSourceLabel(connection.mode)}
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
            <DialogTitle>
              {draftConfig.mode === "custom" ? "自定义接口配置" : "选择系统默认模型"}
            </DialogTitle>
            <DialogDescription>
              {draftConfig.mode === "custom"
                ? "填写你自己的 API 地址和 API Key，检测可用模型后再确认使用。"
                : "系统默认模式会直接使用服务端预设接口。请选择一个模型，然后点击确认使用。"}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[calc(92vh-11rem)] overflow-y-auto">
            <ConfigPanel
              apiKey={draftConfig.apiKey}
              baseURL={draftConfig.baseURL}
              fieldErrors={configErrors}
              isModelsLoading={isModelsLoading}
              mode={draftConfig.mode}
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
                setDraftModels([]);
              }}
              onBaseURLChange={(value) => {
                setDraftConfig((current) => ({
                  ...current,
                  baseURL: value,
                }));
                setConfigErrors((current) => ({ ...current, baseURL: undefined }));
                setModelsError("");
                setDraftModels([]);
              }}
              onModeChange={(value) => {
                setDraftConfig((current) => ({
                  ...current,
                  mode: value,
                }));
                setConfigErrors({});
                setModelsError("");
                setDraftModels(draftConfig.model ? [draftConfig.model] : []);
                setModelsStatus(
                  value === "custom"
                    ? "切换到自定义模式后，请填写 API 地址和 API Key，再检测模型。"
                    : DEFAULT_MODELS_STATUS,
                );
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
