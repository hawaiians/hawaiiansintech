import Button, { ButtonVariant } from "@/components/Button";
import ErrorMessage from "@/components/form/ErrorMessage";
import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { LoginTypeImgEnum, SessionStorageEnum } from "@/lib/enums";
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
  const [loginError, setLoginError] = useState<string>("");
  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      if (
        sessionStorage.getItem(SessionStorageEnum.PREVIOUS_PAGE) ===
        "/join/01-you"
      )
        setShowJoinListPrompt(true);
      if (sessionStorage.getItem(SessionStorageEnum.USER_NAME) !== null)
        handlePreviousPage(router);
      if (
        sessionStorage.getItem(SessionStorageEnum.LOGIN_ERROR_MESSAGE) !== null
      )
        setLoginError(
          sessionStorage.getItem(SessionStorageEnum.LOGIN_ERROR_MESSAGE)
        );
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
              src={LoginTypeImgEnum.LINKEDIN}
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
              src={LoginTypeImgEnum.GOOGLE}
              alt="Google Logo"
              className="absolute left-3 h-full"
            />
            <div>
              <p>Login with Google</p>
            </div>
          </div>{" "}
        </Button>
        {loginError !== "" && (
          <ErrorMessage
            headline={"Kala mai, small kine issue with your login:"}
            body={loginError}
          />
        )}
      </section>
    </>
  );
}
