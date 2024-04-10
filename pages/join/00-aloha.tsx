import { Heading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

enum OnboardingSelection {
  HawaiianInTech = "hwn",
  Ally = "ally",
  None = "none",
}

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Aloha · Hawaiians in Technology",
    },
  };
}

const ONBOARDING_OPTIONS: {
  type: OnboardingSelection;
  emoji: string;
  title: string;
  bullets: string[];
}[] = [
  {
    type: OnboardingSelection.HawaiianInTech,
    emoji: "✊🏽",
    title: "Join as a Native Hawaiian in Tech",
    bullets: [
      "Connect with kanaka who share your interests",
      "Grow your career through mentorship and advice",
      "Inspire the next generation to pursue beyond",
    ],
  },
  {
    type: OnboardingSelection.Ally,
    emoji: "🫂",
    title: "Support this community as an ally",
    bullets: [
      "Support your kanaka friends and family",
      "Stay informed on our events and progress",
      "Share your skills to empower our community",
    ],
  },
];

export default function Aloha({ pageTitle }) {
  const router = useRouter();
  const [selected, setSelected] = useState<OnboardingSelection>(
    OnboardingSelection.None,
  );

  const handleSubmit = () => {
    switch (selected) {
      case OnboardingSelection.Ally:
        console.log("yeah");
        alert("Not built yet");
        break;
      case OnboardingSelection.HawaiianInTech:
        router.push("01-you");
        break;

      case OnboardingSelection.None:
      default:
        // TODO: Throw one of those new slick errors
        console.log("yeeeeeeeeeeeeeeeah, this wasn't supposed to happen");
        break;
    }
  };

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backLinkTo="/" variant="minimized" />
      <Heading>
        Welcome to Hawaiians in Tech. What brings ya to our community?
      </Heading>

      <div className="mx-auto max-w-2xl space-y-4 px-8">
        <RadioGroup
          defaultValue={selected}
          onValueChange={(type: OnboardingSelection) => setSelected(type)}
          className="space-y-2"
        >
          {ONBOARDING_OPTIONS.map((item, index) => {
            const { type, emoji, title, bullets } = item;

            return (
              <>
                <div
                  className={cn(
                    "select-none rounded-xl border-2 bg-secondary/20 transition-all hover:border-input hover:bg-secondary/30",
                    type === selected &&
                      type === OnboardingSelection.HawaiianInTech &&
                      "border-primary/20 bg-gradient-to-br from-primary/10 to-rose-600/10 shadow-lg hover:border-rose-600/10",
                    type === selected &&
                      type === OnboardingSelection.Ally &&
                      "border-sky-600/20 bg-gradient-to-br from-sky-600/10 to-fuchsia-600/10 shadow-lg hover:border-fuchsia-600/10",
                  )}
                  key={`option-container-${index}-${emoji}`}
                >
                  <Label
                    htmlFor={type}
                    className="flex cursor-pointer items-center gap-x-4 px-4 py-6 pb-6"
                  >
                    <RadioGroupItem
                      value={type}
                      id={type}
                      variant="outline"
                      size="lg"
                    />
                    <div
                      className={cn(
                        "flex h-20 w-20 items-center justify-center rounded-lg bg-secondary text-6xl",
                        type === selected &&
                          type === OnboardingSelection.HawaiianInTech &&
                          "bg-gradient-to-br from-primary/20 to-rose-600/20 shadow-lg hover:border-rose-600/20",
                        type === selected &&
                          type === OnboardingSelection.Ally &&
                          "bg-gradient-to-br from-sky-600/20 to-fuchsia-600/20 shadow-lg hover:border-fuchsia-600/20",
                      )}
                    >
                      {emoji}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <ul className="list-inside list-['·__'] space-y-0.5 pl-2 leading-snug">
                        {bullets.map((bullet, index) => (
                          <li key={`bullet-${bullet}-${index}`}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </Label>
                </div>
              </>
            );
          })}
        </RadioGroup>
        <div className="flex items-center justify-between">
          <p className="text-sm">
            Have an account?{" "}
            <Link href="/login" className="font-semibold">
              Login
            </Link>
          </p>
          <Button
            onClick={handleSubmit}
            disabled={selected === OnboardingSelection.None}
            size="lg"
          >
            Continue
          </Button>
        </div>
      </div>
    </>
  );
}
