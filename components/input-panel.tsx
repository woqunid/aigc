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
  currentModel?: string;
  input: string;
  inputError?: string;
  isGenerating: boolean;
  isModelConfigured: boolean;
  onGenerate: () => void;
  onInputChange: (value: string) => void;
  onOpenConfig: () => void;
};

export function InputPanel({
  currentModel,
  input,
  inputError,
  isGenerating,
  isModelConfigured,
  onGenerate,
  onInputChange,
  onOpenConfig,
}: InputPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <PenLine className="size-6 text-blue-600" />
              论文改写
            </CardTitle>
            <CardDescription className="text-sm">
              粘贴段落以降低 AIGC 痕迹，建议每次&nbsp;1000&nbsp;字以内。
            </CardDescription>
            <p className="pt-1 text-xs text-slate-500">
              {isModelConfigured
                ? `当前模型：${currentModel}`
                : "尚未确认模型，请点击右侧按钮配置。"}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="flex-col gap-1.5 rounded-2xl h-16 w-24 shrink-0 px-2 py-2"
            onClick={onOpenConfig}
          >
            <SlidersHorizontal className="size-4" />
            <span className="text-xs">模型配置</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2 relative group">
          <Textarea
            id="source-input"
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
