import { Icon, IconAsset, IconColor } from "@/components/icon/icon";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";

export enum NavAppearance {
  NavShown = "show",
  NavMinimized = "min",
}

const navLogoVariants = {
  floatLeft: { x: -40 },
  default: { x: 0 },
};

interface NavProps {
  backUrl?: string;
  children?: React.ReactNode;
  primaryNav?: {
    show?: boolean;
  };
}

export default function Nav({ backUrl, children, primaryNav }: NavProps) {
  const router = useRouter();
  const { prev } = router.query;

  let logo = <Logo />;
  if (backUrl) {
    logo = (
      <motion.a
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={navLogoVariants.default}
        initial={
          prev === NavAppearance.NavShown
            ? navLogoVariants.floatLeft
            : navLogoVariants.default
        }
        href="/"
        variants={navLogoVariants}
      >
        {logo}
      </motion.a>
    );
  }
  return (
    <header className="flex w-full items-center justify-between gap-8 p-4 sm:pl-8">
      <nav
        className={cn("flex items-center gap-4", primaryNav?.show && "gap-8")}
      >
        {backUrl ? (
          <Link href={backUrl} shallow={true}>
            <div className="transition-transform hover:scale-105 active:scale-95">
              <Icon asset={IconAsset.CaretLeft} color={IconColor.Inherit} />
            </div>
          </Link>
        ) : null}
        {logo}
        {primaryNav?.show ? (
          <>
            <Link
              className="text-base font-medium text-stone-700"
              href={`/about?prev=${NavAppearance.NavShown}`}
            >
              About
            </Link>
            <Link
              href={`/hackathon?prev=${NavAppearance.NavShown}`}
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
      {primaryNav?.show && (
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
          href={`/join/00-aloha?prev=${NavAppearance.NavShown}`}
        >
          Join us
        </Link>
      )}
    </header>
  );
}
