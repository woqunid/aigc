import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border border-white/10 bg-white/[.045] px-4 text-sm text-white shadow-[inset_0_1px_rgba(255,255,255,.06)] outline-none transition-all placeholder:text-white/25 hover:border-white/16 hover:bg-white/[.06] focus-visible:border-cyan-200/35 focus-visible:bg-white/[.075] focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
