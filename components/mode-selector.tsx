"use client";

import { ArrowRight, Layers3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REWRITE_MODE_OPTIONS, type RewriteMode } from "@/lib/rewrite-mode";

type ModeSelectorProps = {
  onSelectMode: (mode: RewriteMode) => void;
};

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="relative isolate min-h-dvh w-full overflow-hidden">
      <main className="relative mx-auto flex min-h-dvh w-full max-w-5xl flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl space-y-12">
          <div className="glass-panel animate-fade-in-up mx-auto flex max-w-3xl items-center justify-center rounded-3xl p-6 text-center sm:p-8">
            <p className="text-lg font-medium leading-relaxed tracking-tight text-slate-700 sm:text-xl">
              推荐使用第二个会增加字数但是aigc可以为0(查重也会降)不会改变原意，第一个字数不咋变但是降得不多。<br className="hidden sm:block" />
              <span className="mt-2 block text-slate-500 text-sm">
                这个项目提供模型（模型配置里面选），用不了给我发消息。推荐使用自己的 API Key。
              </span>
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {REWRITE_MODE_OPTIONS.map((option, index) => {
              const Icon = index === 0 ? Sparkles : Layers3;

              return (
                <button
                  key={option.value}
                  type="button"
                  className="glass-panel group flex flex-col justify-between gap-8 rounded-[2rem] p-8 text-left transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_45px_100px_-20px_rgba(37,99,235,0.25)] hover:ring-2 hover:ring-blue-400/50"
                  style={{ animation: `fade-in-up 0.6s ease-out ${index * 0.15}s both` }}
                  onClick={() => {
                    onSelectMode(option.value);
                  }}
                >
                  <div className="flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 text-blue-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_4px_14px_-2px_rgba(37,99,235,0.15)] transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-8" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight text-slate-800 transition-colors group-hover:text-blue-700">
                      {option.title}
                    </h2>
                    <p className="max-w-sm text-base leading-relaxed text-slate-500 line-clamp-2">
                      {option.description}
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="pointer-events-none rounded-xl border-blue-200 bg-white/50 px-6 py-5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md transition-all group-hover:border-blue-400 group-hover:bg-blue-50 group-hover:text-blue-700"
                      tabIndex={-1}
                    >
                      进入该模式
                      <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                    </Button>
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
