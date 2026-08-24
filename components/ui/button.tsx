import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "border border-white/15 bg-[linear-gradient(110deg,#596cff,#745bff)] text-white shadow-[0_16px_44px_-16px_rgba(85,104,255,.9),inset_0_1px_rgba(255,255,255,.25)] hover:-translate-y-0.5 hover:border-cyan-200/30 hover:shadow-[0_20px_54px_-15px_rgba(85,104,255,.95)] hover:brightness-110 active:translate-y-0",
        secondary:
          "border border-white/10 bg-white/[.07] text-white shadow-[inset_0_1px_rgba(255,255,255,.08)] hover:border-white/20 hover:bg-white/[.11]",
        outline:
          "border border-white/12 bg-white/[.035] text-white/78 backdrop-blur-xl hover:border-cyan-200/30 hover:bg-white/[.075] hover:text-white",
        ghost: "text-white/58 hover:bg-white/[.06] hover:text-white",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-14 px-7 text-base",
        icon: "size-11 p-0",
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
