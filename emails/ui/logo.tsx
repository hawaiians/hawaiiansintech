import { cn } from "@/lib/utils";
import { Img } from "@react-email/components";

export default function Logo({
  align = "center",
}: {
  align?: "left" | "center" | "right";
}) {
  return (
    <Img
      src="http://cdn.mcauto-images-production.sendgrid.net/c3cb94bafc1ef987/5ff60b90-4257-4ae9-babb-697d189b2df0/240x231.png"
      alt="Hawaiians in Tech"
      className={cn(
        `mb-8 w-16`,
        align === "center" && "mx-auto",
        align === "right" && "ml-auto",
      )}
    />
  );
}
