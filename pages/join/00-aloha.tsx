import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
      <Heading>Welcome to our little hui.</Heading>
      <Subheading centered>What brought you here?</Subheading>
      <div className="flex items-center gap-2">
        <Checkbox id="fas" />
        <Label htmlFor="fas">fdsa</Label>
      </div>
      <Link href={"01-you"}>next</Link>
    </>
  );
}
