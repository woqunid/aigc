import {
  ArrowRight,
  LoaderCircle,
  PenLine,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type InputPanelProps = {
  descriptionText: string;
  currentModel?: string;
  currentModelSource?: string;
  input: string;
  inputError?: string;
  isGenerating: boolean;
  isModelConfigured: boolean;
  onGenerate: () => void;
  onInputChange: (value: string) => void;
  onOpenConfig: () => void;
};

export function InputPanel({
  descriptionText,
  currentModel,
  currentModelSource,
  input,
  inputError,
  isGenerating,
  isModelConfigured,
  onGenerate,
  onInputChange,
  onOpenConfig,
}: InputPanelProps) {
  return (
    <Card className="glass-panel flex flex-col overflow-hidden border-white/50 bg-white/30 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] xl:min-h-[720px]">
      <CardHeader className="border-b border-blue-100/30 pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-800">
              <PenLine className="size-6 text-blue-600" />
              论文改写
            </CardTitle>
            <CardDescription className="text-sm font-medium text-slate-500">{descriptionText}</CardDescription>
            <p className="pt-2 text-xs font-semibold text-blue-600/70">
              {isModelConfigured
                ? `当前模型：${currentModel}${currentModelSource ? ` · ${currentModelSource}` : ""}`
                : "尚未选择模型，请点击右侧按钮配置。"}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="flex h-16 w-24 shrink-0 flex-col gap-1.5 rounded-2xl border-white/60 bg-white/50 px-2 py-2 text-slate-600 shadow-sm backdrop-blur hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 transition-all hover:-translate-y-0.5"
            onClick={onOpenConfig}
          >
            <SlidersHorizontal className="size-4" />
            <span className="text-xs font-semibold tracking-wide">模型配置</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-6 pt-6">
        <div className="group relative flex flex-1 flex-col space-y-2">
          <Textarea
            id="source-input"
            className="flex flex-1 min-h-[300px] resize-none rounded-2xl border-white/60 bg-white/40 p-5 text-base leading-relaxed text-slate-700 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-blue-100 xl:min-h-[460px]"
            placeholder="在这里输入需要润色或改写的文字..."
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            aria-invalid={Boolean(inputError)}
          />
          {inputError ? (
            <p className="text-sm text-red-500 absolute -bottom-6 left-2" role="alert">
              {inputError}
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          size="lg"
          className="w-full sm:w-auto h-14 rounded-2xl px-8 text-base shadow-lg shadow-blue-500/20"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <ArrowRight className="size-5" />
          )}
          <span className="font-semibold">
            {isGenerating ? "正在生成深度改写稿..." : "一键开始改写"}
          </span>
        </Button>
      </CardContent>
    </Card>
  );
}
