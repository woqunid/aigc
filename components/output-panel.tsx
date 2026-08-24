import ReactMarkdown from "react-markdown";
import { Check, Copy, LoaderCircle, ScanText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type OutputPanelProps = {
  copyFeedback: string;
  error: string;
  isGenerating: boolean;
  isThinking: boolean;
  output: string;
  statusText: string;
  onCopy: () => void;
};

function EmptyState({ isGenerating, isThinking }: { isGenerating: boolean; isThinking: boolean }) {
  if (isGenerating) {
    return (
      <div className="flex min-h-[470px] flex-col justify-between" aria-live="polite">
        <div className="space-y-5 pt-4">
          {["38%", "88%", "74%", "91%", "62%"].map((width, index) => (
            <div key={width} className="h-3 overflow-hidden rounded-full bg-slate-100" style={{ width }}>
              <span
                className="block h-full animate-pulse rounded-full bg-gradient-to-r from-blue-200 via-indigo-100 to-transparent"
                style={{ animationDelay: `${index * 120}ms` }}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4 text-sm text-slate-500">
          <LoaderCircle className="size-4 animate-spin text-blue-600" />
          {isThinking
            ? "模型正在思考，正文生成后将在这里自动呈现。"
            : "正在接收流式内容，Markdown 将边生成边显示。"}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[470px] flex-col items-center justify-center overflow-hidden rounded-[18px] border border-dashed border-slate-200 bg-slate-50/55 px-6 text-center">
      <div className="absolute left-1/2 top-1/2 size-52 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/70 blur-3xl" />
      <span className="relative flex size-16 items-center justify-center rounded-[20px] border border-blue-100 bg-white text-blue-600 shadow-[0_20px_50px_-28px_rgba(49,87,213,.5)]">
        <Sparkles className="size-6" strokeWidth={1.4} />
      </span>
      <h3 className="relative mt-7 font-display text-2xl font-semibold tracking-[-.045em]">等待生成结果</h3>
      <p className="relative mt-3 max-w-sm text-sm leading-7 text-slate-500">生成内容将在这里实时呈现，并自动渲染为适合阅读的 Markdown 排版。</p>
      <div className="relative mt-9 flex items-center gap-5 font-mono text-[9px] uppercase tracking-[.16em] text-slate-400">
        <span>Stream ready</span><span className="h-px w-8 bg-slate-200" /><span>Markdown output</span>
      </div>
    </div>
  );
}

export function OutputPanel({ copyFeedback, error, isGenerating, isThinking, output, statusText, onCopy }: OutputPanelProps) {
  const hasOutput = output.trim().length > 0;

  return (
    <section className="instrument-panel flex min-h-[660px] flex-col rounded-[24px] xl:sticky xl:top-6">
      <header className="border-b border-slate-100 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">Generated manuscript / output</p>
            <h2 className="mt-4 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-.05em]">
              <ScanText className="size-5 text-blue-600" strokeWidth={1.5} />
              生成结果
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={isGenerating ? "accent" : "secondary"}>
              <span className={isGenerating ? "status-dot animate-pulse" : "size-1.5 rounded-full bg-slate-300"} />
              {statusText}
            </Badge>
            <Button type="button" variant="outline" size="sm" onClick={onCopy} disabled={!hasOutput} aria-label="复制完整 Markdown 原文">
              {copyFeedback ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copyFeedback || "复制 Markdown"}
            </Button>
          </div>
        </div>
        {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700" role="alert">{error}</div> : null}
      </header>

      <div className="flex-1 p-4 sm:p-6">
        {hasOutput ? (
          <div className="markdown-scroll-area max-h-[66vh] min-h-[480px] overflow-y-auto pr-3">
            <article className="markdown-body"><ReactMarkdown>{output}</ReactMarkdown></article>
          </div>
        ) : (
          <EmptyState isGenerating={isGenerating} isThinking={isThinking} />
        )}
      </div>
    </section>
  );
}
