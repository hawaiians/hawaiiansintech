import { Button } from "../components/ui/button";
import * as Yup from "yup";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import Head from "next/head";
import Plausible from "@/components/Plausible";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useIsAdmin } from "@/lib/hooks";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import Logo, { LogoSize } from "@/components/Logo";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Formik } from "formik";
import { DISCORD_URL } from "./about";

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Login · Hawaiians in Technology",
    },
  };
}

export default function Login({ pageTitle }) {
  const auth = getAuth();
  const router = useRouter();
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, isAdminLoading] = useIsAdmin(user, loading);

  useEffect(() => {
    if (user === null || loading) return;
    if (isAdmin) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }, [isAdmin]);

  const handleSubmit = (values) => {
    router.push({ pathname: "/verify", query: { email: values.email } });
  };

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backLinkTo="/" variant="minimized" />
      <section className="mx-auto max-w-4xl px-4 py-6">
        {user === null && !loading && (
          <>
            <Formik
              initialValues={{
                email: "",
              }}
              validateOnChange
              onSubmit={handleSubmit}
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
                    className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-lg border p-4"
                    onSubmit={handleSubmit}
                  >
                    <header className="flex flex-col items-center gap-2">
                      <Logo size={LogoSize.Small} />
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
                        size="lg"
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
              <Link href="/join/00-aloha" className="font-semibold">
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
        )}
        {user !== null && !loading && (
          <LoadingSpinner
            variant={LoadingSpinnerVariant.Invert}
            className="mx-auto"
          />
        )}
      </section>
    </>
  );
}
