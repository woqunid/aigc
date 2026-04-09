import ReactMarkdown from "react-markdown";
import { Check, Copy, LoaderCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OutputPanelProps = {
  copyFeedback: string;
  error: string;
  isGenerating: boolean;
  isThinking: boolean;
  output: string;
  statusText: string;
  onCopy: () => void;
};

function EmptyState({
  isGenerating,
  isThinking,
}: {
  isGenerating: boolean;
  isThinking: boolean;
}) {
  if (isGenerating) {
    return (
      <div className="space-y-3" aria-live="polite">
        <div className="h-4 w-1/3 rounded-full bg-slate-200/80" />
        <div className="h-4 w-full rounded-full bg-slate-200/70" />
        <div className="h-4 w-[92%] rounded-full bg-slate-200/70" />
        <div className="h-4 w-[80%] rounded-full bg-slate-200/70" />
        <div className="flex items-center gap-2 pt-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          {isThinking
            ? "模型正在思考中，思考过程不会展示，Markdown 正文生成后会自动显示。"
            : "正在接收流式内容，Markdown 会边生成边显示。"}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center gap-4 rounded-[32px] border border-dashed border-blue-200/60 bg-white/40 px-6 text-center shadow-[inset_0_2px_20px_rgba(59,130,246,0.04)] backdrop-blur-sm transition-all duration-500">
      <div className="rounded-full bg-blue-50 p-4 text-blue-500 shadow-sm">
        <Sparkles className="size-6" />
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-foreground">
          等待生成结果
        </h3>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          选择模型并点击“生成”后，这里会实时渲染 Markdown 内容，同时支持复制完整原文。
        </p>
      </div>
    </div>
  );
}

export function OutputPanel({
  copyFeedback,
  error,
  isGenerating,
  isThinking,
  output,
  statusText,
  onCopy,
}: OutputPanelProps) {
  const hasOutput = output.trim().length > 0;

  return (
    <Card className="xl:sticky xl:top-8">
      <CardHeader className="gap-4 border-b border-blue-100/40 pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">生成结果</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={isGenerating ? "accent" : "secondary"}>{statusText}</Badge>
            <Button
              type="button"
              variant="outline"
              onClick={onCopy}
              disabled={!hasOutput}
              aria-label="复制完整 Markdown 原文"
            >
              {copyFeedback ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copyFeedback || "复制 Markdown"}
            </Button>
          </div>
        </div>
        {error ? (
          <div
            className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm leading-6 text-red-700"
            role="alert"
          >
            {error}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="min-h-[560px] pt-6">
        {hasOutput ? (
          <div className="markdown-scroll-area max-h-[58vh] min-h-[420px] overflow-y-auto pr-2 sm:max-h-[62vh] xl:max-h-[70vh]">
            <article className="markdown-body">
              <ReactMarkdown>{output}</ReactMarkdown>
            </article>
          </div>
        ) : (
          <EmptyState isGenerating={isGenerating} isThinking={isThinking} />
        )}
      </CardContent>
    </Card>
  );
}
