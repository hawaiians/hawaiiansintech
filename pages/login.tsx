import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button, buttonVariants } from "../components/ui/button";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithGoogle, signOutWithGoogle } from "../lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import Head from "next/head";
import Plausible from "@/components/Plausible";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import { Heading } from "@/components/Heading";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useIsAdmin } from "@/lib/hooks";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Privacy Policy · Hawaiians in Technology",
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

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backLinkTo="/" variant="minimized" />
      <section className="mx-auto max-w-4xl px-4">
        <Heading>Login</Heading>
        {user === null && !loading && (
          <div className="flex items-center gap-2">
            <Button size="lg" variant="secondary" onClick={signInWithGoogle}>
              (Imagine this was the email verify step)
            </Button>
          </div>
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
