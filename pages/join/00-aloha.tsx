import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

      <RadioGroup
        defaultValue="option-one"
        className="mx-auto mt-8 max-w-3xl px-8"
      >
        {[
          { copy: "Support us as an ally" },
          {
            copy: "Join the list as a Native Hawaiian working in technical fields and within the narrower Tech industry",
          },
        ].map((item, index) => {
          const { copy } = item;

          return (
            // <div className="flex items-center gap-2">
            //   <Checkbox id={`choice-${index}`} />
            //   <Label htmlFor={`choice-${index}`}>{copy}</Label>
            // </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value={`choice-${index}`}
                id={`choice-${index}`}
              />
              <Label htmlFor={`choice-${index}`}>{copy}</Label>
            </div>
          );
        })}
      </RadioGroup>
      <Link href={"01-you"}>next</Link>
    </>
  );
}
