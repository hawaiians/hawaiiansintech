import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Icon, IconAsset, IconColor } from "@/components/icon/icon";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

export enum NavAppearance {
  ToShow = "to-show",
  ToMin = "to-min",
  ToFade = "to-fade",
}

export const generateNavUrl = (path, navAppearance: NavAppearance) =>
  `${path}?nav=${navAppearance}`;

const navLogoVariants = {
  floatLeft: { x: -40 },
  default: { x: 0 },
  fadeDefault: { x: 0, opacity: 0 },
};

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

  useEffect(() => {
    // Clear query param after page load
    if (typeof window !== "undefined" && nav) {
      window?.history?.replaceState(null, "", location.href.split("?")[0]);
    }
  }, []);

  const renderLogo = () => {
    let logo = <Logo />;
    if (!backLinkTo) return logo;

    return (
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
  };

  const renderNavItems = () => {
    if (variant !== "primary") return null;

    return (
      <NavigationMenu>
        <NavigationMenuList>
          <Link
            href={generateNavUrl(`/about`, NavAppearance.ToMin)}
            legacyBehavior
            passHref
          >
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), "text-foreground")}
            >
              About
            </NavigationMenuLink>
          </Link>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Community</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-1.5 p-3 md:w-[400px] lg:w-[720px] lg:grid-cols-[.75fr_1fr_1fr]">
                <li className="row-span-2">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/25 to-muted/50 p-3 no-underline outline-none hover:from-muted/60 hover:to-muted/60 focus:shadow-md"
                      href={generateNavUrl(`/join/01-you`, NavAppearance.ToMin)}
                    >
                      <h6 className="mb-1 font-medium">Join Directory</h6>
                      <p className="text-sm leading-tight text-muted-foreground">
                        We simply ask that you are{" "}
                        <strong className="font-medium text-secondary-foreground">
                          Native Hawaiian
                        </strong>{" "}
                        and work in the{" "}
                        <strong className="font-medium text-secondary-foreground">
                          field / industry of technology
                        </strong>{" "}
                        to join the list.
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem
                  href={generateNavUrl(`/edit`, NavAppearance.ToMin)}
                  title="Update Profile"
                  variant="accent"
                >
                  Manage your profile on the directory
                </ListItem>
                <ListItem href="/discord" title="Discord" target="_blank">
                  Our community mostly congregates on our Discord server
                </ListItem>
                <ListItem
                  href="https://github.com/hawaiians/hawaiiansintech"
                  title="Github"
                  target="_blank"
                >
                  Contributions are welcome on our projects, including this
                  website
                </ListItem>
                <ListItem
                  href="https://www.linkedin.com/company/hawaiians-in-technology/"
                  title="LinkedIn"
                  target="_blank"
                >
                  Join our community on the professional network
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Events</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-1.5 p-3 md:w-[320px]">
                <ListItem
                  href={generateNavUrl(`/hackathon`, NavAppearance.ToMin)}
                  title="Hackathon 2022"
                >
                  An event co-hosted with Purple Maiʻa
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  return (
    <header className="flex w-full items-center justify-between gap-8 p-4 sm:pl-8">
      <nav
        className={cn(
          "flex items-center gap-4",
          variant === "primary" && "gap-8",
        )}
      >
        {renderLogo()}
        {renderNavItems()}
      </nav>
      {children && (
        <div className="flex grow items-center gap-4">{children}</div>
      )}
    </header>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { variant?: "default" | "accent" }
>(({ className, title, variant, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-muted/20 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            variant === "accent" &&
              "border border-brown-600/20 hover:bg-brown-600/5",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
