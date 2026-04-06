"use client";

import { ArrowRight, Layers3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REWRITE_MODE_OPTIONS, type RewriteMode } from "@/lib/rewrite-mode";

type ModeSelectorProps = {
  onSelectMode: (mode: RewriteMode) => void;
};

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.14),transparent_62%)]" />
      <div className="pointer-events-none absolute left-[-8rem] top-28 size-72 rounded-full bg-sky-100/80 blur-3xl" />
      <div className="pointer-events-none absolute right-[-10rem] top-20 size-80 rounded-full bg-blue-100/70 blur-3xl" />

      <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-10">
          <div className="mx-auto flex max-w-3xl items-center justify-center rounded-full border border-slate-200/80 bg-white/75 px-6 py-5 text-center shadow-[0_16px_40px_-28px_rgba(15,23,42,0.28)] backdrop-blur-md sm:px-10">
            <p className="text-xl font-semibold tracking-[-0.03em] text-slate-700 sm:text-3xl">
              只降aigc用第一个，第二个的作用是降重降aigc，推荐使用第二个，不会改变原意还能降低aigc率。<br></br>本项目提供两个国内最新模型，尽量使用自己的apikey项目使用openai格式，模型推荐gemini and claude
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {REWRITE_MODE_OPTIONS.map((option, index) => {
              const Icon = index === 0 ? Sparkles : Layers3;

              return (
                <button
                  key={option.value}
                  type="button"
                  className="group rounded-[30px] border border-slate-200/80 bg-white/88 p-8 text-left shadow-[0_28px_60px_-34px_rgba(15,23,42,0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-[0_32px_72px_-30px_rgba(37,99,235,0.28)]"
                  onClick={() => {
                    onSelectMode(option.value);
                  }}
                >
                  <div className="flex h-full min-h-56 flex-col justify-between gap-8">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                      <Icon className="size-7" />
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-4xl font-semibold tracking-[-0.04em] text-slate-800">
                        {option.title}
                      </h2>
                      <p className="max-w-sm text-base leading-7 text-slate-500">
                        {option.description}
                      </p>
                    </div>

                    <div className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="pointer-events-none rounded-full px-5 text-sm text-slate-700 group-hover:border-blue-300 group-hover:text-blue-700"
                        tabIndex={-1}
                      >
                        进入该模式
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
