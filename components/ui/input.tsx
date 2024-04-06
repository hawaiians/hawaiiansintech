import { cn } from "@/lib/utils";
import * as React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const { error } = props;
    return (
      <>
        <input
          type={type}
          className={cn(
            `flex
          h-10
          w-full
          rounded-sm
          border
          border-input
          bg-muted
          px-2
          py-2
          text-sm
          ring-offset-background
          file:border-0
          file:bg-transparent
          file:text-sm
          file:font-medium
          placeholder:text-muted-foreground
          focus:bg-white/50
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
          focus-visible:ring-offset-2
          disabled:cursor-not-allowed
          disabled:opacity-50`,
            error && "border-red-500 border-2 focus-visible:ring-red-500/50",
            className,
          )}
          ref={ref}
          {...props}
        />
      </>
    );
  },
);
Input.displayName = "Input";

export { Input };
