import * as React from "react";
import { cn } from "@/lib/utils";

// Development-only mock card components for testing

const DevMockCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-white shadow-sm", className)}
    {...props}
  />
));
DevMockCard.displayName = "DevMockCard";

const DevMockCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
DevMockCardHeader.displayName = "DevMockCardHeader";

const DevMockCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DevMockCardTitle.displayName = "DevMockCardTitle";

const DevMockCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DevMockCardDescription.displayName = "DevMockCardDescription";

const DevMockCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
DevMockCardContent.displayName = "DevMockCardContent";

const DevMockCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
DevMockCardFooter.displayName = "DevMockCardFooter";

export {
  DevMockCard,
  DevMockCardHeader,
  DevMockCardFooter,
  DevMockCardTitle,
  DevMockCardDescription,
  DevMockCardContent,
};
