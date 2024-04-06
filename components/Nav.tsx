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
import { signInWithGoogle, signOutWithGoogle } from "../lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
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
        <div className="flex items-center grow gap-4">{children}</div>
      ) : null}
      {variant === "primary" && (
        <>
          {user === null && !loading && (
            <div className="flex items-center gap-2">
              <Link
                className={cn(
                  buttonVariants({ size: "lg", variant: "secondary" }),
                )}
                href={`/login?nav=${NavAppearance.ToMin}`}
              >
                Login
              </Link>
              <Link
                className={cn(buttonVariants({ size: "lg" }))}
                href={`/join/00-aloha?nav=${NavAppearance.ToMin}`}
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
                <Pencil className="w-4 h-4" />
                <span>Edit Profile</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button className="bg-gradient-to-br from-violet-700 to-cyan-600 w-12 h-12 rounded-full flex items-center justify-center text-white text-lg">
                    {user.displayName[0]}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="bottom" align="end">
                  <DropdownMenuLabel className="w-48">
                    <h4>{user.displayName}</h4>
                    <h4 className="w-full font-normal text-sm text-secondary-foreground">
                      [Software Engineer]
                    </h4>
                  </DropdownMenuLabel>
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
