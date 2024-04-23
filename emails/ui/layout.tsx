import { cn } from "@/lib/utils";
import { Container } from "@react-email/components";

export default function Layout({
  children,
  border = true,
  className,
  accentColor = "none",
}: {
  children: React.ReactNode;
  border?: boolean;
  className?: string;
  accentColor?: "none" | "violet";
}) {
  return (
    <Container
      className={cn(
        "mx-auto max-w-[540px] rounded-xl p-4",
        border && "border border-solid border-stone-200",
        accentColor === "violet" && "border-violet-200",
        className,
      )}
    >
      {children}
    </Container>
  );
}
