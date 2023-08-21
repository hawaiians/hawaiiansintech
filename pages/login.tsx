import Button, { ButtonVariant } from "@/components/Button";
import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { SessionStorageEnum, SignInTypeImgEnum } from "@/lib/enums";
import { signInWithGoogle } from "@/lib/firebase";
import { LINKEDIN_URL } from "@/lib/linkedin";
import { handlePreviousPage } from "helpers";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Login · Hawaiians in Technology",
      linkedInUrl: LINKEDIN_URL,
    },
  };
}

export default function Login({ pageTitle, linkedInUrl }) {
  const router = useRouter();
  const [showJoinListPrompt, setShowJoinListPrompt] = useState<boolean>(false);
  useEffect(() => {
    if (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(SessionStorageEnum.PREVIOUS_PAGE) ===
        "/join/01-you"
    ) {
      setShowJoinListPrompt(true);
    }
    if (
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(SessionStorageEnum.USER_NAME) !== null
    ) {
      handlePreviousPage(router);
    }
  });
  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backUrl="/"></Nav>
      <Heading>E Komo Mai!</Heading>
      {showJoinListPrompt && (
        <Subheading centered>
          Before we get you on the list, let's get you signed in
        </Subheading>
      )}
      <section className="mx-auto max-w-2xl space-y-4 px-4 pt-4">
        <Button
          fullWidth
          heightLarge
          onClick={() => router.push(linkedInUrl)}
          variant={ButtonVariant.Tertiary}
        >
          <div className="relative">
            <img
              src={SignInTypeImgEnum.LINKEDIN}
              alt="LinkedIn Logo"
              className="absolute left-3 h-full"
            />
            <div>
              <p>Login with LinkedIn</p>
              <p className="text-xs text-red-500">*recommended</p>
            </div>
          </div>
        </Button>
        <Button
          fullWidth
          onClick={signInWithGoogle}
          variant={ButtonVariant.Tertiary}
        >
          <div className="relative h-7">
            <img
              src={SignInTypeImgEnum.GOOGLE}
              alt="Google Logo"
              className="absolute left-3 h-full"
            />
            <div>
              <p>Login with Google</p>
            </div>
          </div>{" "}
        </Button>
      </section>
    </>
  );
}
