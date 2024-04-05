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
export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Privacy Policy · Hawaiians in Technology",
    },
  };
}

export default function Login({ pageTitle }) {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
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
              Login
            </Button>
          </div>
        )}
        {user !== null && !loading && (
          <Button size="sm" variant="outline" onClick={signOutWithGoogle}>
            <span>Log out</span>
          </Button>
        )}
        {/* <Link
            className={buttonVariants({ variant: "secondary", size: "lg" })}
            href={`/join/00-aloha?nav=${NavAppearance.ToMin}`}
          >
            Login
          </Link> */}
        {/* <Link
            className={buttonVariants({ size: "lg" })}
            href={`/join/00-aloha?nav=${NavAppearance.ToMin}`}
          >
            Join us
          </Link> */}
      </section>
    </>
  );
}
