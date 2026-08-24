import { CircleCheck, Eye, EyeOff, KeyRound, LoaderCircle, RefreshCw, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  return message ? <p className="mt-2 text-sm text-red-300" role="alert">{message}</p> : null;
}

export function ConfigPanel({
  apiKey, baseURL, fieldErrors, isModelsLoading, mode, model, models, modelsError,
  modelsStatus, showApiKey, onApiKeyChange, onBaseURLChange, onModeChange,
  onModelChange, onRefreshModels, onToggleApiKeyVisibility,
}: ConfigPanelProps) {
  const isCustomMode = mode === "custom";

  return (
    <div className="space-y-7 px-5 py-6 sm:px-8 sm:py-7">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <Label className="font-mono text-[10px] uppercase tracking-[.16em] text-white/48">使用方式</Label>
          <span className="font-mono text-[9px] uppercase tracking-[.14em] text-white/22">Connection / 01</span>
        </div>
        <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-black/20 p-1.5">
          <button
            type="button"
            onClick={() => onModeChange("system")}
            className={[
              "flex h-12 items-center justify-center gap-2 rounded-xl text-sm transition-all",
              mode === "system" ? "bg-white/10 text-white shadow-[inset_0_1px_rgba(255,255,255,.1)]" : "text-white/36 hover:text-white/65",
            ].join(" ")}
          >
            <Server className="size-4" /> 系统默认
          </button>
          <button
            type="button"
            onClick={() => onModeChange("custom")}
            className={[
              "flex h-12 items-center justify-center gap-2 rounded-xl text-sm transition-all",
              mode === "custom" ? "bg-white/10 text-white shadow-[inset_0_1px_rgba(255,255,255,.1)]" : "text-white/36 hover:text-white/65",
            ].join(" ")}
          >
            <KeyRound className="size-4" /> 自定义 API
          </button>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/32">
          {isCustomMode ? "使用你自己的 OpenAI 兼容接口，配置仅保存在当前浏览器。" : "直接使用服务端预设接口，只需选择一个可用模型。"}
        </p>
      </section>

      {isCustomMode ? (
        <section className="grid gap-4 rounded-2xl border border-white/8 bg-white/[.018] p-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="base-url" className="text-xs text-white/58">API 地址</Label>
            <Input
              id="base-url" type="url" placeholder="https://example.com/v1" value={baseURL}
              onChange={(event) => onBaseURLChange(event.target.value)}
              onInput={(event) => onBaseURLChange((event.target as HTMLInputElement).value)}
              aria-invalid={Boolean(fieldErrors.baseURL)} autoComplete="url" spellCheck={false}
            />
            <InlineError message={fieldErrors.baseURL} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-xs text-white/58">API Key</Label>
            <div className="relative">
              <Input
                id="api-key" type={showApiKey ? "text" : "password"} placeholder="sk-••••••••••••" value={apiKey}
                onChange={(event) => onApiKeyChange(event.target.value)}
                onInput={(event) => onApiKeyChange((event.target as HTMLInputElement).value)}
                aria-invalid={Boolean(fieldErrors.apiKey)} autoComplete="current-password" spellCheck={false} className="pr-12 font-mono"
              />
              <Button type="button" variant="ghost" size="icon" className="absolute right-0.5 top-0.5 size-11" onClick={onToggleApiKeyVisibility} aria-label={showApiKey ? "隐藏 API Key" : "显示 API Key"}>
                {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </Button>
            </div>
            <InlineError message={fieldErrors.apiKey} />
          </div>
        </section>
      ) : null}

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <Label htmlFor="model" className="font-mono text-[10px] uppercase tracking-[.16em] text-white/48">模型</Label>
          <span className="font-mono text-[9px] uppercase tracking-[.14em] text-white/22">Model / 02</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <Select value={model || undefined} onValueChange={onModelChange} disabled={isModelsLoading || models.length === 0}>
            <SelectTrigger id="model" aria-invalid={Boolean(fieldErrors.model)}>
              <SelectValue placeholder={isModelsLoading ? "正在检测模型..." : "请选择模型"} />
            </SelectTrigger>
            <SelectContent>
              {models.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" className="sm:w-[138px]" onClick={onRefreshModels} disabled={isModelsLoading}>
            {isModelsLoading ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            刷新模型
          </Button>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-white/8 bg-white/[.025] px-4 py-3">
          {models.length > 0 && !modelsError ? <CircleCheck className="mt-0.5 size-4 shrink-0 text-cyan-200" /> : <Server className="mt-0.5 size-4 shrink-0 text-white/30" />}
          <div>
            <p className="text-xs leading-5 text-white/46">{modelsStatus}</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[.13em] text-white/22">当前来源：{isCustomMode ? "自定义 API" : "系统默认配置"}</p>
          </div>
        </div>

        <InlineError message={fieldErrors.model || modelsError} />

        {models.length === 0 && !isModelsLoading && (Boolean(modelsError) || Boolean(model.trim())) ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/12 bg-black/15 p-4">
            <Label htmlFor="manual-model" className="text-xs text-white/58">手动填写模型名</Label>
            <Input
              id="manual-model" type="text" placeholder="例如 gpt-4.1" value={model}
              onChange={(event) => onModelChange(event.target.value)}
              onInput={(event) => onModelChange((event.target as HTMLInputElement).value)}
              autoComplete="off" spellCheck={false} className="mt-2 font-mono"
            />
            <p className="mt-2 text-xs leading-5 text-white/28">兼容接口未开放模型列表时，可直接填写模型名继续生成。</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
