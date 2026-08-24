import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[.12em]",
  {
    variants: {
      variant: {
        default: "border-white/15 bg-primary text-white",
        secondary: "border-white/10 bg-white/[.055] text-white/55",
        accent: "border-cyan-200/20 bg-cyan-300/10 text-cyan-200",
        outline: "border-white/10 bg-transparent text-white/42",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
