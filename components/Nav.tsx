import { Icon, IconAsset, IconColor } from "@/components/icon/icon";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";

export enum NavAppearance {
  ToShow = "to-show",
  ToMin = "to-min",
}

interface NavProps {
  backLinkTo?: string;
  children?: React.ReactNode;
  variant?: "primary" | "minimized";
}

export default function Nav({
  backLinkTo,
  children,
  variant = "primary",
}: NavProps) {
  const router = useRouter();
  const { nav } = router.query;

  const navLogoVariants = {
    floatLeft: { x: -40 },
    default: { x: 0 },
  };

  let logo = <Logo />;
  if (backLinkTo) {
    logo = (
      <>
        <Link href={backLinkTo} shallow={true}>
          <div className="transition-transform hover:scale-105 active:scale-95">
            <Icon asset={IconAsset.CaretLeft} color={IconColor.Inherit} />
          </div>
        </Link>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={navLogoVariants.default}
          initial={
            variant === "minimized" && nav === NavAppearance.ToMin
              ? navLogoVariants.floatLeft
              : navLogoVariants.default
          }
          href="/"
        >
          {logo}
        </motion.a>
      </>
    );
  }
  return (
    <header className="flex w-full items-center justify-between gap-8 p-4 sm:pl-8">
      <nav
        className={cn(
          "flex items-center gap-4",
          variant === "primary" && "gap-8",
        )}
      >
        {logo}
        {variant === "primary" ? (
          <>
            <Link
              className="text-base font-medium text-stone-700"
              href={`/about?nav=${NavAppearance.ToMin}`}
            >
              About
            </Link>
            <Link
              href={`/hackathon?nav=${NavAppearance.ToMin}`}
              className="font-script text-2xl"
            >
              Hackathon
            </Link>
          </>
        ) : null}
      </nav>
      {children ? (
        <div className="flex items-center grow gap-4">{children}</div>
      ) : null}
      {variant === "primary" && (
        <Link
          className={`
          rounded-lg
          border-4
          border-tan-300
          bg-tan-300
          px-2
          py-0.5
          text-base
          font-medium
          text-stone-700
          transition-all
          hover:scale-105
          hover:border-brown-700/80
          hover:bg-brown-600
          hover:text-white
          active:scale-95
          sm:px-4
          sm:py-2
        `}
          href={`/join/00-aloha?nav=${NavAppearance.ToMin}`}
        >
          Join us
        </Link>
      )}
    </header>
  );
}
