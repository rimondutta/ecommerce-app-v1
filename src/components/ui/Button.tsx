import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "btn-playshelf inline-flex items-center justify-center font-bold transition-all",
          {
            "btn-primary": variant === "primary",
            "bg-paper text-ink border-2 border-line hover:bg-sun hover:border-sun": variant === "secondary",
            "bg-transparent text-ink border-2 border-line hover:bg-paper/50": variant === "outline",
            "bg-transparent text-ink hover:bg-paper/50": variant === "ghost",
            "h-10 px-4 text-sm": size === "sm",
            "h-12 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
            "h-16 px-10 text-xl": size === "xl",
            "h-12 w-12 p-0": size === "icon",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;
