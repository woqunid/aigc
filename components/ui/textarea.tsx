import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[260px] w-full rounded-[32px] border border-white/50 bg-white/40 px-5 py-5 text-sm leading-7 text-foreground shadow-[inset_0_2px_12px_rgba(15,23,42,0.03)] outline-none backdrop-blur-sm transition-all duration-300 placeholder:text-muted-foreground hover:bg-white/50 hover:border-white/70 focus-visible:bg-white/60 focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
