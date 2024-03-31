import Button, { ButtonSize } from "@/components/Button";
import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import { getEmails } from "@/lib/firebase-helpers/private/emails";
export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Request Changes · Hawaiians in Technology",
    },
  };
}

export default function EditPage({ pageTitle }) {
  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backUrl="/" />
      {/* <Heading>Welcome back, Hawaiian.</Heading>
      <Subheading centered>
        First, let's sign you in with the email you registered with.
      </Subheading> */}
      <RequestForm />
    </>
  );
}

function RequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [errorReason, setErrorReason] = useState<string>("");
  const [errorBackup, setErrorBackup] = useState<string>("");

  const backToLogin = () => {
    router.push({ pathname: `/edit/login` });
  };

  const fetchMemberMapping = async (token: string) => {
    const response = await fetch("/api/member-id", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        setErrorReason("we don't have this email with any current members.");
        setErrorBackup("Can't remember which email you used?");
      }
      setLoading(false);
    }
    const data = await response.json();
    const memberId = data.memberId;
    router.push({
      pathname: `/edit/member/`,
      query: { memberId },
    });
  };

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        // User opened the link on a different device. To prevent session fixation
        // attacks, ask the user to provide the associated email again:
        email = window.prompt(
          "Looks like you've opened the sign-in link in a different " +
            "window or device. For security reasons, please enter your " +
            "email again for confirmation.",
        );
        window.localStorage.setItem("emailForSignIn", email);
      }
      signInWithEmailLink(auth, email, window.location.href)
        .then((result) => {
          if (result.user.email !== email) {
            backToLogin();
          }
          window.localStorage.removeItem("emailForSignIn");
          result.user.getIdToken().then((idToken) => {
            fetchMemberMapping(idToken);
          });
        })
        .catch((error) => {
          if (error.code === "auth/invalid-action-code") {
            setErrorReason("the link is invalid or expired.");
          }
          setLoading(false);
        });
    }
  }, []);

  return (
    <div
      className={`
        mx-auto
        mb-4
        mt-8
        flex
        max-w-3xl
        flex-col
        items-center
        px-4
      `}
    >
      {loading ? (
        <>
          <Subheading centered> Logging in...</Subheading>
          <div className="flex w-full justify-center p-4">
            <LoadingSpinner
              className="w-16 h-16"
              variant={LoadingSpinnerVariant.Invert}
            />
          </div>
        </>
      ) : (
        <>
          <div className="text-center mt-4">
            <p className="text-2xl mb-8">
              Gonfunnit, looks like{" "}
              {errorReason ? errorReason : "something went wrong"}
            </p>
            <div className="mb-8">
              <Button onClick={backToLogin}>
                {errorReason === "the link is invalid or expired."
                  ? "Try logging in again"
                  : "Try another email"}
              </Button>
            </div>
            <p>
              {errorBackup
                ? errorBackup
                : "If you still having trouble, no worries"}
              <br />
              Contact{" "}
              <Link href="mailto:kekai@hawaiiansintech.org" target="_blank">
                kekai
              </Link>{" "}
              or{" "}
              <Link href="mailto:kamakani@hawaiiansintech.org" target="_blank">
                kamakani
              </Link>{" "}
              and we&rsquo;ll get you sorted out.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
