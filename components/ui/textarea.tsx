import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[260px] w-full rounded-[18px] border border-slate-200 bg-slate-50/60 px-5 py-5 text-sm leading-7 text-slate-700 shadow-[inset_0_1px_3px_rgba(28,43,71,.03)] outline-none transition-all duration-300 placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus-visible:border-blue-400 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
