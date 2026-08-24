import { Braces } from "lucide-react";

export function BrandSignature({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex items-center gap-3" aria-label="Paper Polish AI Editor">
      <span className="brand-glyph">
        <Braces className="size-4" />
      </span>
      <span className="leading-none">
        <span className="block font-display text-sm font-semibold tracking-[-0.02em] text-slate-900">
          PAPER POLISH
        </span>
        {!compact ? (
          <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.28em] text-slate-400">
            AI writing instrument
          </span>
        ) : null}
      </span>
    </div>
  );
}
