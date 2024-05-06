import * as Yup from "yup";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import Head from "next/head";
import { useEffect, useState } from "react";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Code from "@/components/Code";
import { useRouter } from "next/router";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import Link from "next/link";
import { Formik } from "formik";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DISCORD_URL } from "../about";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

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
      <section
        className={`
        mx-auto
        mb-4
        mt-8
        flex
        max-w-lg
        flex-col
        px-4
        sm:rounded-lg
        sm:border
        sm:px-4
        sm:py-8
      `}
      >
        <EditForm baseUrl={baseUrl} />
      </section>
    </>
  );
}

enum PageState {
  Loading = "LOADING",
  EmailSent = "EMAIL_SENT",
  NotLoggedIn = "NOT_LOGGED_IN",
  Error = "ERROR",
}

function EditForm({ baseUrl }) {
  const router = useRouter();
  const [pageState, setPageState] = useState<PageState>(PageState.Loading);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(null);

  const backToLogin = () => {
    setPageState(PageState.NotLoggedIn);
    setError(null);
  };

  const handleSignIn = (email: string) => {
    setLoading(true);
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

  const handleIdToken = async (token: string) => {
    try {
      const response = await fetch("/api/member-id", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      switch (response.status) {
        case 200:
          const { memberId } = await response.json();
          router.push({
            pathname: `/edit/member/`,
            query: { memberId },
          });
          break;
        case 404:
          throw Error(
            "The email you provided is not associated with a Hawaiians in Tech account.",
          );
        default:
          throw Error("Something went wrong");
      }
    } catch (error) {
      setPageState(PageState.Error);
      setError(error.message);
    }
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
          const { user } = result;
          if (user.email !== email) {
            setPageState(PageState.Error);
            setError("Something was wrong with the information you provided.");
          } else {
            window.localStorage.removeItem("emailForSignIn");
            user.getIdToken().then((idToken) => {
              handleIdToken(idToken);
            });
          }
        })
        .catch((error) => {
          if (error.code === "auth/invalid-action-code") {
            setError("The link is invalid or expired.");
          }
          setPageState(PageState.Error);
        });
    } else {
      setPageState(PageState.NotLoggedIn);
    }
  }, []);

  return (
    <>
      {error && (
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
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
                  className="flex flex-col items-center gap-6"
                  onSubmit={handleSubmit}
                >
                  <header className="space-y-2 text-center">
                    <h2 className="text-2xl">Log in with email</h2>
                    <p className="text-secondary-foreground">
                      Access your profile to update your information
                    </p>
                  </header>
                  <section className="flex flex-col gap-2 self-stretch">
                    <Input
                      id="email"
                      name="email"
                      onBlur={handleBlur}
                      value={values.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                      autoFocus
                    />
                    <Button
                      type="submit"
                      disabled={!isValid || !dirty || loading}
                      loading={loading}
                    >
                      Log in
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
        <header className="space-y-2 text-center">
          <h2 className="text-2xl">Please check your inbox</h2>
          <p>
            We&rsquo;ve sent you a magic link to{" "}
            <strong>{window.localStorage.getItem("emailForSignIn")}</strong>.
          </p>
          <p className="px-2 text-sm leading-normal text-secondary-foreground">
            If you didn&rsquo;t receive it, you may need to add{" "}
            <Code>no-reply@hawaiiansintech.org</Code> to your address book.
          </p>
        </header>
      ) : pageState === PageState.Loading ? (
        <div className="flex w-full justify-center">
          <LoadingSpinner variant={LoadingSpinnerVariant.Invert} />
        </div>
      ) : (
        <>
          <div className="mt-4">
            <div className="mb-8">
              <Button onClick={backToLogin}>Try Again</Button>
            </div>
            <p className="text-xs text-stone-500">
              If you keep having issues, please contact us on{" "}
              <Link href={DISCORD_URL} className="text-inherit underline">
                our Discord server
              </Link>
              .
            </p>
          </div>
        </>
      )}
    </>
  );
}
