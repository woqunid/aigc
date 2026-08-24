"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowRight, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { BrandSignature } from "@/components/brand-signature";

type MessageState = { text: string; isError: boolean };
type PasswordGateProps = { children: ReactNode };

function AccessMessage({ message }: { message: MessageState | null }) {
  if (!message) return null;
  return (
    <div
      aria-live="polite"
      className={[
        "fixed left-1/2 top-5 z-[1000] -translate-x-1/2 rounded-full border px-5 py-2.5 text-sm shadow-xl backdrop-blur-xl animate-fade-in-up",
        message.isError ? "border-red-200 bg-red-50/95 text-red-700" : "border-emerald-200 bg-emerald-50/95 text-emerald-700",
      ].join(" ")}
    >
      {message.text}
    </div>
  );
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
  }, []);

  function showMessage(text: string, isError = true) {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    setMessage({ text, isError });
    timerRef.current = window.setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, 3000);
  }

  async function checkPassword() {
    if (!password) {
      showMessage("请输入密码。");
      window.requestAnimationFrame(() => inputRef.current?.focus());
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (response.ok) {
        setIsAuthenticated(true);
        showMessage("验证成功，正在进入。", false);
        return;
      }
      showMessage(payload?.error ?? "验证失败，请稍后重试。");
    } catch {
      showMessage("验证失败，请检查网络后重试。");
    } finally {
      setIsSubmitting(false);
    }

    setPassword("");
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  if (isAuthenticated) {
    return <><AccessMessage message={message} />{children}</>;
  }

  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <AccessMessage message={message} />
      <div className="editorial-grid absolute inset-0 -z-10" />
      <div className="aurora-orb -right-28 top-[-9rem] -z-10 size-[30rem]" />

      <header className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <BrandSignature />
        <div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[.18em] text-slate-400 sm:flex">
          <span className="status-dot" /> Secure access
        </div>
      </header>

      <main className="mx-auto grid min-h-[calc(100dvh-90px)] w-full max-w-[1400px] items-center gap-12 px-5 pb-12 sm:px-8 lg:grid-cols-[1.1fr_.7fr] lg:px-12">
        <section className="animate-fade-in-up">
          <p className="eyebrow mb-6">Academic writing workspace</p>
          <h1 className="max-w-3xl font-display text-[clamp(3.3rem,7vw,7.4rem)] font-semibold leading-[.9] tracking-[-.065em] text-slate-900">
            让表达更像
            <br />
            <span className="display-gradient">真实的写作</span>
          </h1>
          <p className="mt-7 max-w-lg text-base leading-8 text-slate-500">
            面向论文与技术文本的智能改写工作台。保留事实、术语和核心观点，重新整理句式与表达方式。
          </p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
            {[["01", "降 AIGC"], ["02", "降重降 AIGC"], ["03", "学术降重"]].map(([number, label]) => (
              <div key={number} className="rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur">
                <span className="font-mono text-[9px] text-blue-500">/{number}</span>
                <p className="mt-3 text-xs font-medium text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="instrument-panel animate-fade-in-up rounded-[24px] p-6 sm:p-8" style={{ animationDelay: "100ms" }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Private workspace</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-.045em] text-slate-900">欢迎回来</h2>
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              <KeyRound className="size-5" />
            </span>
          </div>
          <p className="mb-6 mt-3 text-sm leading-6 text-slate-500">为保护模型资源，请输入通行密码。</p>

          <div className="group relative">
            <input
              ref={inputRef}
              type="password"
              value={password}
              placeholder="请输入您的密码..."
              autoComplete="current-password"
              disabled={isSubmitting}
              className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-slate-800 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isSubmitting) void checkPassword();
              }}
            />
            <ShieldCheck className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" />
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            className="mt-4 flex h-14 w-full items-center justify-between rounded-xl bg-[#3157d5] px-5 text-sm font-semibold text-white shadow-[0_15px_30px_-15px_rgba(49,87,213,.6)] transition hover:-translate-y-0.5 hover:bg-[#294cbd] disabled:opacity-50"
            onClick={() => void checkPassword()}
          >
            <span>{isSubmitting ? "正在验证访问权限" : "进入系统"}</span>
            {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : <ArrowRight className="size-5" />}
          </button>
        </section>
      </main>
    </div>
  );
}
