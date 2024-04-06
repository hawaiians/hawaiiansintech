import Head from "next/head";
import Plausible from "@/components/Plausible";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Logo, { LogoSize } from "@/components/Logo";
import Code from "@/components/Code";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import Link from "next/link";
import { DISCORD_URL } from "./about";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useIsAdmin } from "@/lib/hooks";
import { getAuth } from "firebase/auth";

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Verify · Hawaiians in Technology",
    },
  };
}

export default function Verify({ pageTitle }) {
  const auth = getAuth();
  const router = useRouter();
  const { email } = router.query;
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

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backLinkTo="/" variant="minimized" />
      {email === undefined && (
        <section className="w-full text-center">
          <LoadingSpinner variant={LoadingSpinnerVariant.Invert} />
        </section>
      )}
      {email !== undefined && (
        <>
          <section className="flex items-center gap-4 flex-col max-w-lg border px-4 py-6 rounded-lg mx-auto">
            <header className="flex flex-col items-center gap-4 text-center">
              <Logo size={LogoSize.Small} />
              <h2 className="text-2xl">An email is on the way</h2>
              <p>
                We just sent a temporary login link to <strong>{email}</strong>.
                Follow the link in your email to finish signing in.
              </p>
              <p className="text-sm px-2 leading-normal text-secondary-foreground">
                If you didn't, you may need to add{" "}
                <Code>no-reply@hawaiiansintech.org</Code> to your address book.
              </p>
            </header>
            <Button size="lg" variant="secondary" onClick={signInWithGoogle}>
              Tester: (Imagine this was the email verify step)
            </Button>
          </section>
          <p className="text-sm text-center mt-4">
            Having issues?{" "}
            <Link href={DISCORD_URL} className="font-semibold">
              Let us know on Discord
            </Link>
          </p>
        </>
      )}
    </>
  );
}
