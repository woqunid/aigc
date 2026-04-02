"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

const CORRECT_PASSWORD = "3424348553";

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

  function checkPassword() {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true);
      showMessage("验证成功！正在进入...", false);
      return;
    }

    showMessage("密码错误，请重试。");
    setPassword("");
    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
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

      {isAuthenticated ? (
        children
      ) : (
        <div
          className="flex min-h-screen items-center justify-center bg-white"
          style={{
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          }}
        >
          <div className="w-full max-w-sm px-6 text-center">
            <div className="mb-2 text-left text-sm font-medium text-gray-700">
              输入密码
            </div>

            <div className="flex gap-0">
              <input
                ref={inputRef}
                type="password"
                value={password}
                placeholder="请输入您的密码..."
                autoComplete="current-password"
                className="flex-1 rounded-l-md border border-gray-300 px-4 py-2 transition-all focus:outline-none focus:ring-1 focus:ring-gray-400"
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    checkPassword();
                  }
                }}
              />

              <button
                type="button"
                className="rounded-r-md border border-gray-300 border-l-0 bg-gray-300 px-6 py-2 font-medium text-black transition-colors hover:bg-gray-400"
                onClick={checkPassword}
              >
                进入
              </button>
            </div>
          </div>
        </div>
      )}

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
