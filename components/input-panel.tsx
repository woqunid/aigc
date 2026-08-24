import { ArrowUpRight, LoaderCircle, PenLine, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <section className="instrument-panel flex min-h-[680px] flex-col rounded-[28px]">
      <header className="border-b border-white/8 px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="eyebrow">Source material / input</p>
            <h2 className="mt-4 flex items-center gap-3 font-display text-3xl font-semibold tracking-[-.05em]">
              <PenLine className="size-5 text-cyan-200" strokeWidth={1.5} />
              原文输入
            </h2>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onOpenConfig}>
            <SlidersHorizontal className="size-4" />
            模型配置
          </Button>
        </div>
        <p className="mt-4 max-w-lg text-sm leading-6 text-white/38">{descriptionText}</p>
      </header>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[.025] px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.14em] text-white/36">
            <span className={isModelConfigured ? "status-dot" : "size-1.5 rounded-full bg-white/20"} />
            {isModelConfigured
              ? `${currentModel} / ${currentModelSource ?? "已配置"}`
              : "模型尚未配置"}
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[.14em] text-white/22">UTF-8 / Markdown</span>
        </div>

        <div className="relative flex flex-1 flex-col">
          <Textarea
            id="source-input"
            className="min-h-[360px] flex-1 resize-none rounded-[22px] p-5 text-[15px] leading-8 xl:min-h-[440px]"
            placeholder="在这里输入需要润色或改写的文字..."
            value={input}
            onChange={(event) => onInputChange(event.target.value)}
            aria-invalid={Boolean(inputError)}
          />
          <div className="pointer-events-none absolute bottom-4 right-4 rounded-full border border-white/8 bg-[#090d18]/75 px-3 py-1 font-mono text-[9px] tracking-[.12em] text-white/24 backdrop-blur-md">
            {input.length} 字符
          </div>
        </div>

        {inputError ? <p className="mt-3 text-sm text-red-300" role="alert">{inputError}</p> : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[9px] uppercase tracking-[.16em] text-white/24">
            输入内容仅用于本次生成请求
          </p>
          <Button type="button" size="lg" className="sm:min-w-[220px]" onClick={onGenerate} disabled={isGenerating}>
            {isGenerating ? <LoaderCircle className="size-5 animate-spin" /> : <ArrowUpRight className="size-5" />}
            {isGenerating ? "正在生成深度改写稿" : "一键开始改写"}
          </Button>
        </div>
      </div>
    </section>
  );
}
