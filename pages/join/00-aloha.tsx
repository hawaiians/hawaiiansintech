import { Heading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Head from "next/head";
import Link from "next/link";

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Aloha · Hawaiians in Technology",
    },
  };
}

export default function Aloha({ pageTitle }) {
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

      <div className="mx-auto max-w-xl px-8 space-y-4">
        <RadioGroup defaultValue="option-one" className="space-y-2">
          {[
            {
              emoji: "✊🏽",
              title: "Join as a Native Hawaiian in Tech",
              bullets: [
                "Connect with kanaka who share your interests",
                "Grow your career through mentorship and advice",
                "Inspire the next generation to pursue tech",
              ],
            },
            {
              emoji: "🫂",
              title: "Support us as an ally",
              bullets: [
                "Support your kanaka friends and family",
                "Stay informed on our events and progress",
                "Share your skills to empower our community",
              ],
            },
          ].map((item, index) => {
            const { emoji, title, bullets } = item;

            return (
              <>
                <div className="border-2 border-primary/30 rounded-xl shadow-lg">
                  <Label
                    htmlFor={`choice-${index}`}
                    className="flex items-center gap-x-4 px-4 py-6 pb-6"
                  >
                    <RadioGroupItem
                      value={`choice-${index}`}
                      id={`choice-${index}`}
                      variant="outline"
                      size="lg"
                    />
                    <div className="w-20 bg-primary/20 h-20 rounded-lg flex items-center justify-center text-6xl">
                      {emoji}
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">{title}</h3>
                      <ul className="space-y-2">
                        {bullets.map((bullet, index) => (
                          <li>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  </Label>
                </div>
              </>
            );
          })}
        </RadioGroup>
        <div className="flex justify-between items-center">
          <p className="text-sm">
            Have an account?{" "}
            <Link href="/login" className="font-semibold">
              Login
            </Link>
          </p>
          <Button size="lg">Continue</Button>
        </div>
      </div>
    </>
  );
}
