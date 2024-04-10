import Button from "@/components/Button";
import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import Input from "@/components/form/Input";
import Label from "@/components/form/Label";
import Head from "next/head";
import { useEffect, useState } from "react";
import {
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import Code from "@/components/Code";
import { useRouter } from "next/router";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import Link from "next/link";

export async function getServerSideProps(context) {
  const { req } = context;
  const protocol = req.headers["x-forwarded-proto"] || "http";
  const baseUrl = req ? `${protocol}://${req.headers.host}` : "";

  return {
    props: {
      baseUrl: baseUrl,
      pageTitle: "Request Changes · Hawaiians in Technology",
    },
  };
}

export default function EditPage({ baseUrl, pageTitle }) {
  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backLinkTo="/" variant="minimized" />
      <Heading>Welcome back, Hawaiian.</Heading>
      <RequestForm baseUrl={baseUrl} />
    </>
  );
}

enum PageState {
  Loading = "LOADING",
  EmailSent = "EMAIL_SENT",
  NotLoggedIn = "NOT_LOGGED_IN",
  Error = "ERROR",
}

function RequestForm({ baseUrl }) {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [pageState, setPageState] = useState<PageState>(PageState.NotLoggedIn);
  const [errorReason, setErrorReason] = useState<string>("");
  const [errorBackup, setErrorBackup] = useState<string>("");

  const backToLogin = () => {
    setPageState(PageState.NotLoggedIn);
  };

  const handleSignIn = () => {
    const fullUrl = `${baseUrl}/edit`;
    fetch("/api/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email, url: fullUrl }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        window.localStorage.setItem("emailForSignIn", email);
        setPageState(PageState.EmailSent);
      })
      .catch((error) => {
        // Handle the error here
        console.error("An error occurred:", error);
      });
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
      setPageState(PageState.Error);
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
      setPageState(PageState.Loading);
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
            setErrorReason("the email you signed in with doesn't match.");
            setPageState(PageState.Error);
          } else {
            window.localStorage.removeItem("emailForSignIn");
            result.user.getIdToken().then((idToken) => {
              fetchMemberMapping(idToken);
            });
          }
        })
        .catch((error) => {
          if (error.code === "auth/invalid-action-code") {
            setErrorReason("the link is invalid or expired.");
          }
          setPageState(PageState.Error);
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
      {pageState === PageState.NotLoggedIn ? (
        <>
          <Subheading centered>
            First, let's sign you in with the email you registered with.
          </Subheading>
          <div className="mb-8 w-3/4">
            <div className="mb-2">
              <Label label={"Email:"} />
            </div>
            <Input
              name={"email"}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <Button onClick={handleSignIn}>Sign In</Button>
        </>
      ) : pageState === PageState.EmailSent ? (
        <div className="mt-4 text-center">
          <h2 className="text-base">
            You should receive a sign in email from us real soon. If you didn't,
            you may need to add <Code>no-reply@hawaiiansintech.org</Code> to
            your address book.
          </h2>
        </div>
      ) : pageState === PageState.Loading ? (
        <>
          <Subheading centered> Logging in...</Subheading>
          <div className="flex w-full justify-center p-4">
            <LoadingSpinner
              className="h-16 w-16"
              variant={LoadingSpinnerVariant.Invert}
            />
          </div>
        </>
      ) : (
        <>
          <div className="mt-4 text-center">
            <p className="mb-8 text-2xl">
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
