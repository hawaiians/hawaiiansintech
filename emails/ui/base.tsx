import { cn } from "@/lib/utils";
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Tailwind,
} from "@react-email/components";
const tailwindConfig = require("../../tailwind.config.js");

export default function Base({
  children,

  preview,
  title,
  align = "center",
}: {
  children: React.ReactNode;
  preview?: string;
  title?: string;
  align?: "left" | "center" | "right";
}) {
  return (
    <Html>
      {preview && <Preview>{preview}</Preview>}
      <Tailwind config={tailwindConfig}>
        {title && (
          <Head>
            <title>{title}</title>
          </Head>
        )}
        <Body
          className="font-sans text-stone-800"
          style={{
            fontFamily:
              '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
          }}
        >
          <Container className="m-4 mx-auto max-w-[540px] rounded-xl border border-solid border-stone-200 bg-white p-4 pt-8">
            <Img
              src="http://cdn.mcauto-images-production.sendgrid.net/c3cb94bafc1ef987/5ff60b90-4257-4ae9-babb-697d189b2df0/240x231.png"
              alt="Hawaiians in Tech"
              className={cn(
                `mb-8 w-16`,
                align === "center" && "mx-auto",
                align === "right" && "ml-auto",
              )}
            />
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
