"use client";

import { ArrowUpRight, FilePenLine, Layers3, Sparkles } from "lucide-react";
import { BrandSignature } from "@/components/brand-signature";
import { REWRITE_MODE_OPTIONS, type RewriteMode } from "@/lib/rewrite-mode";

type ModeSelectorProps = { onSelectMode: (mode: RewriteMode) => void };

const modeDetails: Record<RewriteMode, { number: string; meta: string; featured?: boolean }> = {
  "reduce-aigc": { number: "01", meta: "AI TRACE REDUCTION" },
  "reduce-dup-and-aigc": { number: "02", meta: "DUAL REWRITE ENGINE", featured: true },
  "reduce-dup": { number: "03", meta: "ACADEMIC REPHRASE" },
};

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  function getModeIcon(mode: RewriteMode) {
    if (mode === "reduce-dup-and-aigc") return Layers3;
    if (mode === "reduce-dup") return FilePenLine;
    return Sparkles;
  }

  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <div className="editorial-grid absolute inset-0 -z-10" />
      <div className="aurora-orb -right-24 top-[-9rem] -z-10 size-[26rem] opacity-80" />

      <header className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <BrandSignature />
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/70 px-4 py-2 font-mono text-[9px] uppercase tracking-[.18em] text-slate-400">
          <span className="status-dot" />
          Engine online
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1500px] px-5 pb-12 pt-10 sm:px-8 lg:px-12 lg:pb-16 lg:pt-16">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div className="animate-fade-in-up">
            <p className="eyebrow mb-6">Rewrite protocol / choose one</p>
            <h1 className="max-w-5xl font-display text-[clamp(3.5rem,7.3vw,8.2rem)] font-semibold leading-[.86] tracking-[-.07em]">
              选择你的
              <br />
              <span className="display-gradient">改写策略</span>
            </h1>
          </div>
          <div className="animate-fade-in-up border-l border-slate-200 pl-6" style={{ animationDelay: "110ms" }}>
            <p className="text-sm leading-7 text-slate-500">
              每种模式都连接独立的学术改写规则。第二种模式会增加少量字数，但更适合同时处理重复率与 AIGC 痕迹。
            </p>
            <p className="mt-5 font-mono text-[9px] uppercase tracking-[.18em] text-blue-500">
              推荐优先使用自有 API Key
            </p>
          </div>
        </section>

        <section className="mt-14 grid gap-4 lg:mt-20 lg:grid-cols-[.86fr_1.18fr_.86fr] lg:items-end">
          {REWRITE_MODE_OPTIONS.map((option, index) => {
            const Icon = getModeIcon(option.value);
            const details = modeDetails[option.value];

            return (
              <button
                key={option.value}
                type="button"
                className={[
                  "instrument-panel group relative flex min-h-[350px] flex-col justify-between rounded-[24px] p-6 text-left transition-all duration-500 hover:-translate-y-2 hover:border-blue-200 hover:shadow-[0_34px_80px_-38px_rgba(49,87,213,.38)] sm:p-8",
                  details.featured ? "lg:min-h-[430px] lg:-translate-y-4 hover:lg:-translate-y-6" : "lg:min-h-[375px]",
                ].join(" ")}
                style={{ animation: `fade-in-up .75s cubic-bezier(.16,1,.3,1) ${160 + index * 100}ms both` }}
                onClick={() => onSelectMode(option.value)}
              >
                {details.featured ? (
                  <span className="absolute right-6 top-6 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-[9px] uppercase tracking-[.16em] text-blue-600">
                    推荐
                  </span>
                ) : null}

                <div className="flex items-start justify-between">
                  <span className="font-mono text-[11px] tracking-[.18em] text-slate-400">/{details.number}</span>
                  {!details.featured ? <span className="status-dot opacity-60" /> : null}
                </div>

                <div>
                  <span className="mb-7 flex size-14 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600 transition-all duration-500 group-hover:rotate-3 group-hover:scale-110 group-hover:border-blue-200 group-hover:bg-blue-100/70">
                    <Icon className="size-6" strokeWidth={1.5} />
                  </span>
                  <p className="eyebrow mb-4">{details.meta}</p>
                  <h2 className="font-display text-[clamp(2.1rem,3vw,3.5rem)] font-semibold leading-none tracking-[-.055em] text-slate-900">
                    {option.title}
                  </h2>
                  <p className="mt-5 max-w-sm text-sm leading-7 text-slate-500">{option.description}</p>
                </div>

                <div className="mt-9 flex items-center justify-between border-t border-slate-100 pt-5">
                  <span className="text-sm font-medium text-slate-600 transition-colors group-hover:text-blue-700">进入该模式</span>
                  <span className="flex size-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-all duration-300 group-hover:rotate-45 group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-600">
                    <ArrowUpRight className="size-4" />
                  </span>
                </div>
              </button>
            );
          })}
        </section>

        <footer className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-5 font-mono text-[9px] uppercase tracking-[.18em] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <span>Paper polish / academic rewrite instrument</span>
          <span>Select mode to initialize workspace</span>
        </footer>
      </main>
    </div>
  );
}
