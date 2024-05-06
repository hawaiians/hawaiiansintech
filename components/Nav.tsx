import { Icon, IconAsset, IconColor } from "@/components/icon/icon";
import Logo from "@/components/Logo";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button, buttonVariants } from "./ui/button";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signOutWithGoogle } from "../lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export enum NavAppearance {
  ToShow = "to-show",
  ToMin = "to-min",
  ToFade = "to-fade",
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
  const [user, loading, error] = useAuthState(auth);
  const router = useRouter();
  const { nav } = router.query;

  const navLogoVariants = {
    floatLeft: { x: -40 },
    default: { x: 0 },
    fadeDefault: { x: 0, opacity: 0 },
  };

  let logo = <Logo />;

  if (user !== null && !loading) {
    // const { displayName, email, emailVerified, metadata } = user;
    console.log(user);
  }

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
          animate={
            nav === NavAppearance.ToFade
              ? navLogoVariants.fadeDefault
              : navLogoVariants.default
          }
          initial={
            nav === NavAppearance.ToMin || nav === NavAppearance.ToFade
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
        {variant === "primary" && (
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
        )}
      </nav>
      {children ? (
        <div className="flex grow items-center gap-4">{children}</div>
      ) : null}
      {variant === "primary" && (
        <>
          {user === null && !loading && (
            <div className="flex items-center gap-6">
              <Link
                className="text-base font-medium text-stone-700"
                href={`/login?nav=${NavAppearance.ToFade}`}
              >
                Log In
              </Link>
              <Link
                className={cn(buttonVariants({ size: "sm" }), "px-4")}
                href={`/join/01-you?nav=${NavAppearance.ToMin}`}
              >
                Join Us
              </Link>
            </div>
          )}

          {user !== null && !loading && (
            <div className="flex items-center gap-4">
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1.5"
              >
                <Pencil className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-700 to-cyan-600 text-lg text-white">
                    {user?.displayName ? user?.displayName.charAt(0) : "🤙🏽"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuLabel className="w-48">
                    <h4 className="text-xs font-normal tracking-wide text-secondary-foreground">
                      {user?.email}
                    </h4>
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => router.push("/privacy-policy")}
                    className="flex-col items-start gap-0.5 border border-violet-700/20 bg-gradient-to-br from-violet-700/10 to-cyan-600/10 hover:border-cyan-600/20 hover:bg-cyan-600/20"
                  >
                    <h4 className="w-full text-xs font-medium text-secondary-foreground">
                      You are currently active on the directory.
                    </h4>
                    <span className="text-xs font-semibold tracking-wide text-violet-700">
                      Edit your Profile
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/privacy-policy")}
                  >
                    Privacy Policy
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOutWithGoogle}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </>
      )}
    </header>
  );
}
