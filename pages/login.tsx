import Button, { ButtonVariant } from "@/components/Button";
import ErrorMessage from "@/components/form/ErrorMessage";
import { Heading, Subheading } from "@/components/Heading";
import LoadingSpinner from "@/components/LoadingSpinner";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { LoginTypeImgEnum, StorageEnum } from "@/lib/enums";
import { signInWithGoogle } from "@/lib/firebase";
import { LINKEDIN_URL } from "@/lib/linkedin";
import { getAuth } from "firebase/auth";
import { handlePreviousPage } from "helpers";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

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
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  useEffect(() => {
    if (typeof sessionStorage !== "undefined") {
      if (sessionStorage.getItem(StorageEnum.PREVIOUS_PAGE) === "/join/01-you")
        setShowJoinListPrompt(true);
      if (user) handlePreviousPage(router);
      if (sessionStorage.getItem(StorageEnum.LOGIN_ERROR_MESSAGE) !== null)
        setLoginError(sessionStorage.getItem(StorageEnum.LOGIN_ERROR_MESSAGE));
    }
  });

  if (loading) {
    return (
      <>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
          }}
        >
          <LoadingSpinner />
          <div style={{ marginTop: "1rem" }}>Logging you in...</div>
        </div>
      </>
    );
  }
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
