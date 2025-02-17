import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { MenuIcon } from "lucide-react";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { NavAppearance, NavigationData, generateNavUrl } from "./Nav";

interface MobileNavProps {
  navigation: NavigationData;
}

export function MobileNav({ navigation }: MobileNavProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="rounded-md p-2 hover:bg-muted/20">
          <MenuIcon className="size-6" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-screen max-w-none border-none p-0 sm:w-[400px]"
        align="end"
      >
        <div className="flex h-[calc(100vh-4rem)] flex-col pb-6">
          <Accordion type="single" collapsible className="w-full">
            {navigation?.items?.map((section: any, i: number) => (
              <AccordionItem key={`section-${i}`} value={`section-${i}`}>
                <AccordionTrigger
                  className={cn(
                    "px-6 py-4",
                    section.variant === "accent" &&
                      "bg-gradient-to-br from-brown-600/5 to-brown-600/10 text-brown-600",
                  )}
                >
                  {section.label}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-2 p-4">
                    {section.items.map((item: any, j: number) => (
                      <Link
                        key={`item-${i}-${j}`}
                        href={
                          item.external
                            ? item.href
                            : generateNavUrl(item.href, NavAppearance.ToMin)
                        }
                        target={item.external ? "_blank" : undefined}
                        className={cn(
                          "flex items-start gap-3 rounded-md p-3 hover:bg-muted/20",
                          item.variant === "accent" &&
                            "border border-brown-600/20 hover:bg-brown-600/5",
                          item.featured &&
                            "bg-gradient-to-b from-muted/25 to-muted/50 hover:from-muted/60 hover:to-muted/60",
                        )}
                      >
                        {item.image && (
                          <div className="flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={item.image}
                              alt={item.title}
                              width={36}
                              height={36}
                            />
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="text-sm font-medium leading-none">
                            {item.title}
                            {item.external && (
                              <ArrowTopRightIcon className="relative -top-0.5 inline size-3.5 text-secondary-foreground opacity-50" />
                            )}
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </PopoverContent>
    </Popover>
  );
}
