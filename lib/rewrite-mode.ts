export type RewriteMode =
  | "reduce-aigc"
  | "reduce-dup-and-aigc"
  | "reduce-dup";

export const DEFAULT_REWRITE_MODE: RewriteMode = "reduce-aigc";

export const REWRITE_MODE_OPTIONS = [
  {
    value: "reduce-aigc",
    title: "降 AIGC",
    description: "保持原意与段落结构，降低机器写作痕迹。",
  },
  {
    value: "reduce-dup-and-aigc",
    title: "降重降 AIGC",
    description: "同时重构表达与句法，兼顾重复率和 AIGC 痕迹。",
  },
  {
    value: "reduce-dup",
    title: "降重",
    description: "重组句式与常用表达，保留专业术语和核心观点。",
  },
] as const satisfies ReadonlyArray<{
  value: RewriteMode;
  title: string;
  description: string;
}>;

export function normalizeRewriteMode(mode?: string): RewriteMode {
  if (mode === "reduce-dup-and-aigc" || mode === "reduce-dup") {
    return mode;
  }

  return DEFAULT_REWRITE_MODE;
}

export function getRewriteModeMeta(mode: RewriteMode) {
  return (
    REWRITE_MODE_OPTIONS.find((option) => option.value === mode) ??
    REWRITE_MODE_OPTIONS[0]
  );
}
