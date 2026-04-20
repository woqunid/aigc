"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

type MessageState = {
  text: string;
  isError: boolean;
};

type PasswordGateProps = {
  children: ReactNode;
};

export function PasswordGate({ children }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageState | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  function showMessage(text: string, isError = true) {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setMessage({ text, isError });

    timerRef.current = window.setTimeout(() => {
      setMessage(null);
      timerRef.current = null;
    }, 3000);
  }

  async function checkPassword() {
    if (!password) {
      showMessage("请输入密码。");
      window.requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (response.ok) {
        setIsAuthenticated(true);
        showMessage("验证成功！正在进入...", false);
        return;
      }

      showMessage(payload?.error ?? "验证失败，请稍后重试。");
    } catch {
      showMessage("验证失败，请检查网络后重试。");
    } finally {
      setIsSubmitting(false);
    }

    setPassword("");
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  if (isAuthenticated) {
    return (
      <>
        {message ? (
          <div
            aria-live="polite"
            className={[
              "password-message-box fixed left-1/2 top-5 z-[1000] block -translate-x-1/2 rounded-lg border px-6 py-3 shadow-lg",
              message.isError
                ? "border-red-200 bg-red-100 text-red-700"
                : "border-green-200 bg-green-100 text-green-700",
            ].join(" ")}
          >
            {message.text}
          </div>
        ) : null}
        {children}
        <style jsx>{`
          .password-message-box {
            animation: passwordFadeIn 0.3s ease-out;
          }

          @keyframes passwordFadeIn {
            from {
              opacity: 0;
              transform: translate(-50%, -10px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      {message ? (
        <div
          aria-live="polite"
          className={[
            "password-message-box fixed left-1/2 top-5 z-[1000] block -translate-x-1/2 rounded-lg border px-6 py-3 shadow-lg",
            message.isError
              ? "border-red-200 bg-red-100 text-red-700"
              : "border-green-200 bg-green-100 text-green-700",
          ].join(" ")}
        >
          {message.text}
        </div>
      ) : null}

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass-panel w-full max-w-md animate-fade-in-up rounded-2xl p-8 text-center shadow-2xl transition-all duration-300 hover:shadow-[0_45px_100px_-20px_rgba(15,23,42,0.15)]">
          <div className="mb-8 space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              欢迎回来
            </h1>
            <p className="text-sm text-slate-500">
              为保护您的资源，请输入通行密码
            </p>
          </div>

          <div className="group relative flex gap-0 rounded-xl bg-white/50 p-1 shadow-sm ring-1 ring-slate-900/5 transition-all focus-within:bg-white/80 focus-within:ring-2 focus-within:ring-primary/30">
            <input
              ref={inputRef}
              type="password"
              value={password}
              placeholder="请输入您的密码..."
              autoComplete="current-password"
              disabled={isSubmitting}
              className="flex-1 bg-transparent px-4 py-3 text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              onChange={(event) => {
                setPassword(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !isSubmitting) {
                  void checkPassword();
                }
              }}
            />

            <button
              type="button"
              disabled={isSubmitting}
              className="relative overflow-hidden rounded-lg bg-slate-900 px-6 py-3 font-medium text-white transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                void checkPassword();
              }}
            >
              <span className="relative z-10">
                {isSubmitting ? "验证中..." : "进入系统"}
              </span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .password-message-box {
          animation: passwordFadeIn 0.3s ease-out;
        }

        @keyframes passwordFadeIn {
          from {
            opacity: 0;
            transform: translate(-50%, -10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </>
  );
}
