import Button, { ButtonVariant } from "@/components/Button";
import { Heading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { signInWithGoogle } from "@/lib/firebase";
import { LINKEDIN_URL } from "@/lib/linkedin";
import Head from "next/head";
import { useRouter } from "next/router";

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
  const googleSignIn = async () => {
    signInWithGoogle();
    if (typeof sessionStorage === "undefined") {
      console.log("Session storage is not supported by this browser.");
      router.push("/");
    }
    if (sessionStorage.getItem("previousPage") === null) {
      console.error("Looks like the previous page wasn't set");
      router.push("/");
    } else {
      router.push(sessionStorage.getItem("previousPage"));
    }
  };

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backUrl="/" />
      <section className="mx-auto max-w-2xl space-y-4 px-4">
        <Heading>E Komo Mai!</Heading>
        <Button
          fullWidth
          heightLarge
          onClick={() => router.push(linkedInUrl)}
          variant={ButtonVariant.Tertiary}
        >
          <div className="relative">
            <img
              src="/images/linkedInLogo.png"
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
          onClick={() => signInWithGoogle()}
          variant={ButtonVariant.Tertiary}
        >
          <div className="relative h-7">
            <img
              src="/images/googleLogo.png"
              alt="Google Logo"
              className="absolute left-3 h-full"
            />
            <div>
              <p>Login with Google</p>
            </div>
          </div>{" "}
        </Button>
      </section>
    </>
  );
}
