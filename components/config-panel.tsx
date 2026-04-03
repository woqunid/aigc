import { Eye, EyeOff, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ConfigMode = "system" | "custom";

type FieldErrors = Partial<Record<"baseURL" | "apiKey" | "model" | "input", string>>;

type ConfigPanelProps = {
  apiKey: string;
  baseURL: string;
  fieldErrors: FieldErrors;
  isModelsLoading: boolean;
  mode: ConfigMode;
  model: string;
  models: string[];
  modelsError: string;
  modelsStatus: string;
  showApiKey: boolean;
  onApiKeyChange: (value: string) => void;
  onBaseURLChange: (value: string) => void;
  onModeChange: (value: ConfigMode) => void;
  onModelChange: (value: string) => void;
  onRefreshModels: () => void;
  onToggleApiKeyVisibility: () => void;
};

function InlineError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function ConfigPanel({
  apiKey,
  baseURL,
  fieldErrors,
  isModelsLoading,
  mode,
  model,
  models,
  modelsError,
  modelsStatus,
  showApiKey,
  onApiKeyChange,
  onBaseURLChange,
  onModeChange,
  onModelChange,
  onRefreshModels,
  onToggleApiKeyVisibility,
}: ConfigPanelProps) {
  const isCustomMode = mode === "custom";

  return (
    <div className="space-y-6 px-6 py-6 sm:px-7">
      <div className="space-y-2.5">
        <Label htmlFor="config-mode">使用方式</Label>
        <Select value={mode} onValueChange={(value) => onModeChange(value as ConfigMode)}>
          <SelectTrigger id="config-mode">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">系统默认</SelectItem>
            <SelectItem value="custom">自定义 API</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm leading-6 text-muted-foreground">
          {isCustomMode
            ? "当前为自定义 API 模式，请填写你自己的 API 地址与 API Key。"
            : "当前为系统默认模式，你只需要选择模型即可开始使用。"}
        </p>
      </div>

      {isCustomMode ? (
        <>
          <div className="space-y-2.5">
            <Label htmlFor="base-url">API 地址</Label>
            <Input
              id="base-url"
              type="url"
              placeholder="例如 https://example.com 或 https://example.com/v1"
              value={baseURL}
              onChange={(event) => onBaseURLChange(event.target.value)}
              onInput={(event) =>
                onBaseURLChange((event.target as HTMLInputElement).value)
              }
              aria-invalid={Boolean(fieldErrors.baseURL)}
              autoComplete="url"
              spellCheck={false}
            />
            <InlineError message={fieldErrors.baseURL} />
          </div>

          <div className="space-y-2.5">
            <Label htmlFor="api-key">API Key</Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                placeholder="请输入你自己的 API Key"
                value={apiKey}
                onChange={(event) => onApiKeyChange(event.target.value)}
                onInput={(event) =>
                  onApiKeyChange((event.target as HTMLInputElement).value)
                }
                aria-invalid={Boolean(fieldErrors.apiKey)}
                autoComplete="current-password"
                spellCheck={false}
                className="pr-14"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1 size-10 rounded-xl"
                onClick={onToggleApiKeyVisibility}
                aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}
              >
                {showApiKey ? (
                  <EyeOff className="size-4 text-muted-foreground" />
                ) : (
                  <Eye className="size-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <InlineError message={fieldErrors.apiKey} />
          </div>
        </>
      ) : null}

      <div className="space-y-2.5">
        <Label htmlFor="model">模型</Label>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Select
            value={model || undefined}
            onValueChange={onModelChange}
            disabled={isModelsLoading || models.length === 0}
          >
            <SelectTrigger id="model" aria-invalid={Boolean(fieldErrors.model)}>
              <SelectValue
                placeholder={isModelsLoading ? "正在检测模型..." : "请选择模型"}
              />
            </SelectTrigger>
            <SelectContent>
              {models.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            type="button"
            variant="outline"
            className="sm:w-[132px]"
            onClick={onRefreshModels}
            disabled={isModelsLoading}
          >
            {isModelsLoading ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            刷新模型
          </Button>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{modelsStatus}</p>
        <p className="text-xs leading-5 text-slate-500">
          当前来源：{isCustomMode ? "你的自定义 API" : "系统默认配置"}
        </p>
        <InlineError message={fieldErrors.model || modelsError} />
        {models.length === 0 && !isModelsLoading && (Boolean(modelsError) || Boolean(model.trim())) ? (
          <div className="space-y-2.5 rounded-2xl border border-dashed border-border bg-white/40 p-4">
            <Label htmlFor="manual-model">手动填写模型名</Label>
            <Input
              id="manual-model"
              type="text"
              placeholder="如果中转站不返回模型列表，可在这里手动填写模型名"
              value={model}
              onChange={(event) => onModelChange(event.target.value)}
              onInput={(event) =>
                onModelChange((event.target as HTMLInputElement).value)
              }
              autoComplete="off"
              spellCheck={false}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              某些兼容接口不会开放模型列表，这种情况下可以直接手动填写后继续生成。
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
