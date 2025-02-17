import * as React from "react";
import Image from "next/image";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Icon, IconAsset, IconColor } from "@/components/icon/icon";
import Logo from "@/components/Logo";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";

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
  const [lastUpdatedChangelog, setLastUpdatedChangelog] = useState<string>("");

  useEffect(() => {
    fetch("/changelog.json")
      .then((res) => res.json())
      .then((data) => {
        const lastUpdated = data[0].date;
        const formattedLastUpdated = new Date(lastUpdated).toLocaleDateString(
          "en-US",
          {
            month: "long",
            day: "numeric",
            year: "numeric",
          },
        );
        setLastUpdatedChangelog(formattedLastUpdated);
      })
      .catch((err) => {
        console.warn("Didn't set last updated", err);
      });

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

    const navigationItems = (
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>About</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-1.5 p-3 md:w-[400px]">
              <ListItem
                href={generateNavUrl(`/about`, NavAppearance.ToMin)}
                title="About Us"
              >
                A directory and community of Native Hawaiians in the technology
                industry
              </ListItem>
              <ListItem
                href={generateNavUrl(`/changelog`, NavAppearance.ToMin)}
                title="Changelog"
              >
                What we&rsquo;ve been up to{" "}
                {lastUpdatedChangelog && (
                  <span className="">· updated {lastUpdatedChangelog}</span>
                )}
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Events</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-1.5 p-3 md:w-[400px]">
              <ListItem
                href="https://lu.ma/jcb5e4y2"
                target="_blank"
                title="Pasifika at the Park"
                image={
                  <Image
                    src="/images/pasifika-at-the-park-10.jpg"
                    alt="Pasifika at the Park"
                    width={36}
                    height={36}
                  />
                }
              >
                Bay Area · March 8, 2025
              </ListItem>
              <ListItem
                href="https://lu.ma/ofzvwvaj"
                target="_blank"
                title="Pasifika in Tech: Bay Area Happy Hour"
                image={
                  <Image
                    src="/images/pasifika-in-tech.png"
                    alt="Pasifika at the Park"
                    width={36}
                    height={36}
                  />
                }
              >
                Bay Area · May 29, 2024
              </ListItem>
              <ListItem
                href={generateNavUrl(`/hackathon`, NavAppearance.ToMin)}
                title="Hawaiians in Tech & Purple Maiʻa Hackathon"
                image={
                  <Image
                    src="/images/hackathon-03.png"
                    alt="Hawaiians in Tech & Purple Maiʻa Hackathon"
                    width={36}
                    height={36}
                  />
                }
              >
                Hawai&lsquo;i · July 29 – 31, 2022
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger variant="accent">
            Community
          </NavigationMenuTrigger>
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
      </NavigationMenuList>
    );

    return (
      <div className="flex grow items-center justify-end sm:justify-start">
        {/* Desktop Navigation */}
        <div className="hidden sm:block">
          <NavigationMenu>{navigationItems}</NavigationMenu>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="rounded-md p-2 hover:bg-muted/20">
                <MenuIcon className="size-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="mt-6 flex flex-col space-y-4">
                <NavigationMenu orientation="vertical">
                  {navigationItems}
                </NavigationMenu>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between gap-4 bg-background/80 p-4 backdrop-blur-sm sm:gap-8 sm:pl-8">
      <nav
        className={cn(
          "flex w-full items-center gap-4",
          variant === "primary" && "md:gap-8",
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
  React.ComponentPropsWithoutRef<"a"> & {
    variant?: "default" | "accent";
    image?: React.ReactNode;
  }
>(({ className, title, variant, children, image, ...props }, ref) => {
  const isExternal = React.useMemo(
    () => props.target === "_blank",
    [props.target],
  );
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "group flex select-none items-start gap-3 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-muted/20 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            variant === "accent" &&
              "border border-brown-600/20 hover:bg-brown-600/5",
            "max-w-[calc(100vw-2rem)] sm:max-w-none",
            className,
          )}
          {...props}
        >
          {image && (
            <div className="flex-shrink-0 overflow-hidden rounded">{image}</div>
          )}
          <div className="space-y-1">
            <div className="text-sm font-medium leading-none">
              {title}{" "}
              {isExternal && (
                <ArrowTopRightIcon className="relative -top-0.5 inline size-3.5 text-secondary-foreground opacity-50 transition-opacity group-hover:opacity-100" />
              )}
            </div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
