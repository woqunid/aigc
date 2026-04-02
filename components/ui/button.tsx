import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_12px_36px_-12px_rgba(59,130,246,0.8)] hover:-translate-y-0.5 hover:shadow-[0_18px_45px_-12px_rgba(79,70,229,0.9)] hover:brightness-110 active:translate-y-0 transition-all duration-300",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[0_16px_36px_-26px_rgba(15,23,42,0.3)] hover:bg-white hover:shadow-md transition-all duration-300",
        outline:
          "border border-blue-500/20 bg-white/40 text-blue-900 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8)] backdrop-blur-md hover:bg-white/80 hover:border-blue-500/40 hover:shadow-lg transition-all duration-300",
        ghost: "text-foreground hover:bg-white/60",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-xl px-3 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
