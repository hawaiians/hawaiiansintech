import { Heading, Subheading } from "@/components/Heading";
import * as Yup from "yup";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
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
import { Formik } from "formik";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Input } from "@/components/ui/input";
import { DISCORD_URL } from "../about";

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
  const [pageState, setPageState] = useState<PageState>(PageState.NotLoggedIn);
  const [errorReason, setErrorReason] = useState<string>("");
  const [errorBackup, setErrorBackup] = useState<string>("");

  const backToLogin = () => {
    setPageState(PageState.NotLoggedIn);
  };

  const handleSignIn = (email: string) => {
    // baseUrl is passed in from getServerSideProps
    // to ensure the correct URL is used in the email
    // verification link.
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
    const { memberId } = data;
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
    <section
      className={`
        mx-auto
        mb-4
        mt-8
        flex
        max-w-lg
        flex-col
        px-4
      `}
    >
      {pageState === PageState.NotLoggedIn ? (
        <>
          <Formik
            initialValues={{
              email: "",
            }}
            validateOnChange
            onSubmit={(values) => handleSignIn(values.email)}
            validationSchema={Yup.object().shape({
              email: Yup.string().email(
                "That email doesn't look right. Please try again.",
              ),
            })}
          >
            {(props) => {
              const {
                dirty,
                handleBlur,
                handleChange,
                handleSubmit,
                isValid,
                values,
              } = props;

              return (
                <form
                  className="flex w-full flex-col items-center gap-4 sm:rounded-lg sm:border sm:p-4"
                  onSubmit={handleSubmit}
                >
                  <header className="flex flex-col items-center gap-2">
                    <Logo />
                    <h2 className="text-2xl">Welcome back</h2>
                    <p className="text-secondary-foreground">
                      Sign in using your email address
                    </p>
                  </header>
                  <section className="flex w-full flex-col gap-2">
                    <Input
                      id="email"
                      name="email"
                      onBlur={handleBlur}
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                    />
                    <Button
                      className="w-full"
                      type="submit"
                      disabled={!isValid || !dirty}
                    >
                      Continue with email
                    </Button>
                  </section>
                </form>
              );
            }}
          </Formik>
          <p className="mt-4 text-center text-sm">
            New to Hawaiians in Tech?{" "}
            <Link href="/join/01-you" className="font-semibold">
              Join Us
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            Having issues?{" "}
            <Link href={DISCORD_URL} className="font-semibold">
              Let us know on Discord
            </Link>
          </p>
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
    </section>
  );
}
