export type RewriteMode = "reduce-aigc" | "reduce-dup-and-aigc";

export const DEFAULT_REWRITE_MODE: RewriteMode = "reduce-aigc";

export const REWRITE_MODE_OPTIONS = [
  {
    value: "reduce-aigc",
    title: "降aigc",
    description: "",
  },
  {
    value: "reduce-dup-and-aigc",
    title: "降重降aigc",
    description: "",
  },
] as const satisfies ReadonlyArray<{
  value: RewriteMode;
  title: string;
  description: string;
}>;

export function normalizeRewriteMode(mode?: string): RewriteMode {
  return mode === "reduce-dup-and-aigc" ? mode : DEFAULT_REWRITE_MODE;
}

export function getRewriteModeMeta(mode: RewriteMode) {
  return (
    REWRITE_MODE_OPTIONS.find((option) => option.value === mode) ??
    REWRITE_MODE_OPTIONS[0]
  );
}
