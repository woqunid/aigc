import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[260px] w-full rounded-[22px] border border-white/10 bg-black/15 px-5 py-5 text-sm leading-7 text-white/82 shadow-[inset_0_2px_18px_rgba(0,0,0,.18)] outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-white/22 hover:border-white/16 hover:bg-white/[.025] focus-visible:border-cyan-200/35 focus-visible:bg-white/[.035] focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
