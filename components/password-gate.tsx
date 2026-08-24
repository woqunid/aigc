"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { ArrowUpRight, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { ArtCanvas } from "@/components/art-canvas";
import { BrandSignature } from "@/components/brand-signature";

type MessageState = { text: string; isError: boolean };
type PasswordGateProps = { children: ReactNode };

function AccessMessage({ message }: { message: MessageState | null }) {
  if (!message) return null;

  return (
    <div
      aria-live="polite"
      className={[
        "fixed left-1/2 top-5 z-[1000] -translate-x-1/2 rounded-full border px-5 py-2.5 text-sm shadow-2xl backdrop-blur-2xl animate-fade-in-up",
        message.isError
          ? "border-red-300/20 bg-red-950/80 text-red-100"
          : "border-cyan-200/20 bg-cyan-950/70 text-cyan-100",
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
    return (
      <>
        <AccessMessage message={message} />
        {children}
      </>
    );
  }

  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <ArtCanvas />
      <AccessMessage message={message} />
      <div className="editorial-grid absolute inset-0 -z-10" />
      <div className="aurora-orb right-[-5rem] top-[8%] -z-10 size-[23rem] animate-float sm:right-[7%] lg:size-[31rem]" />
      <div className="absolute left-[46%] top-0 -z-10 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

      <header className="absolute inset-x-0 top-0 z-10 mx-auto flex max-w-[1500px] items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <BrandSignature />
        <div className="hidden items-center gap-3 font-mono text-[10px] uppercase tracking-[.2em] text-white/35 sm:flex">
          <span className="status-dot" />
          Secure access / 01
        </div>
      </header>

      <main className="mx-auto grid min-h-dvh w-full max-w-[1500px] items-end gap-12 px-5 pb-8 pt-32 sm:px-8 sm:pb-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,.65fr)] lg:items-center lg:px-12 lg:py-32">
        <section className="relative max-w-4xl animate-fade-in-up">
          <p className="eyebrow mb-7">Academic text / re-engineered</p>
          <h1 className="font-display text-[clamp(3.8rem,8.5vw,9.5rem)] font-semibold leading-[.82] tracking-[-.075em]">
            写作，
            <br />
            <span className="display-gradient">不应留下</span>
            <br />
            <span className="relative inline-block pl-[12%]">
              机器的痕迹
              <span className="absolute -right-9 top-1 hidden font-mono text-[10px] font-normal tracking-[.15em] text-cyan-200/45 xl:block">
                V.01
              </span>
            </span>
          </h1>
          <p className="mt-8 max-w-lg text-sm leading-7 text-white/42 sm:text-base">
            面向论文与技术文本的智能改写仪器。保留事实、术语与表达意图，只重塑语言留下的形态。
          </p>
        </section>

        <section className="instrument-panel relative animate-fade-in-up rounded-[30px] p-5 sm:p-7 lg:self-end" style={{ animationDelay: "140ms" }}>
          <div className="mb-10 flex items-start justify-between">
            <div>
              <p className="eyebrow">Private instrument</p>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-[-.045em]">欢迎回来</h2>
            </div>
            <span className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[.045] text-cyan-200">
              <KeyRound className="size-5" />
            </span>
          </div>

          <p className="mb-6 max-w-sm text-sm leading-6 text-white/38">为保护您的模型资源，请输入通行密码。</p>

          <div className="group relative">
            <input
              ref={inputRef}
              type="password"
              value={password}
              placeholder="请输入您的密码..."
              autoComplete="current-password"
              disabled={isSubmitting}
              className="h-16 w-full rounded-2xl border border-white/10 bg-black/20 px-5 pr-16 text-base text-white outline-none transition-all placeholder:text-white/20 hover:border-white/18 focus:border-cyan-200/35 focus:bg-white/[.035] focus:ring-2 focus:ring-cyan-300/10 disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isSubmitting) void checkPassword();
              }}
            />
            <ShieldCheck className="absolute right-5 top-1/2 size-5 -translate-y-1/2 text-white/22 transition-colors group-focus-within:text-cyan-200" />
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            className="mt-4 flex h-16 w-full items-center justify-between rounded-2xl border border-white/15 bg-[linear-gradient(110deg,#596cff,#735bff)] px-5 text-sm font-semibold text-white shadow-[0_18px_45px_-18px_rgba(82,103,255,.9),inset_0_1px_rgba(255,255,255,.28)] transition-all hover:-translate-y-0.5 hover:border-cyan-100/30 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void checkPassword()}
          >
            <span>{isSubmitting ? "正在验证访问权限" : "进入系统"}</span>
            {isSubmitting ? <LoaderCircle className="size-5 animate-spin" /> : <ArrowUpRight className="size-5" />}
          </button>

          <div className="mt-7 flex items-center justify-between border-t border-white/8 pt-5 font-mono text-[9px] uppercase tracking-[.16em] text-white/24">
            <span>Encrypted route</span>
            <span>Press enter to continue</span>
          </div>
        </section>
      </main>
    </div>
  );
}
