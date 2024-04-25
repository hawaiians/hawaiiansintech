import { useEffect, useState } from "react";
import { useIsAdmin } from "@/lib/hooks";

import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Button, buttonVariants } from "@/components/ui/button";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import Logo from "@/components/Logo";
import Link from "next/link";
import { DISCORD_URL } from "./about";
import Code from "@/components/Code";

export default function UnsubscribePage() {
  const [unsubStatus, setUnsubStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [error, setError] = useState<string>(null);
  const [user] = useAuthState(auth);
  const router = useRouter();
  const { query } = router;

  const handleGenerate = async () => {
    try {
      if (query?.uid === undefined) {
        throw new Error("No uid in url query");
      }
      const response = await fetch(`/api/unsubscribe?uid=${query?.uid}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
      });
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Failed to unsubscribe:", error.message);
      // Handle failed unsubscribe
    }
  };

  const handleUnsubscribe = async () => {
    try {
      const { uid, unsub } = query;
      if (uid === undefined) {
        throw new Error("No uid in url query");
      }
      if (unsub === undefined) {
        throw new Error("No unsub token in url query");
      }

      const response = await fetch("/api/unsubscribe", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: uid,
          unsubKey: unsub,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to unsubscribe");
      }
      setUnsubStatus("success");
    } catch (error) {
      console.error("Failed to unsubscribe:", error.message);
      setUnsubStatus("error");
      setError(error.message);
    }
  };

  useEffect(() => {
    if (query.uid !== undefined || query.unsub !== undefined) {
      handleUnsubscribe();
    }
  }, [query]);

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
      {/* <Button onClick={handleGenerate}>Generate</Button> */}
      <div className="flex w-full flex-col gap-4 sm:rounded-lg sm:border sm:p-4">
        <div className="self-center">
          <Logo />
        </div>
        {unsubStatus === "loading" && (
          <div className="self-center py-12">
            <LoadingSpinner variant={LoadingSpinnerVariant.Invert} />
          </div>
        )}
        <h2 className="grow text-2xl">
          {unsubStatus === "success" ? (
            <>Hūlō!</>
          ) : unsubStatus === "error" ? (
            <>E kala mai</>
          ) : null}
        </h2>

        <div className="flex flex-col gap-2 text-base text-secondary-foreground">
          {error && (
            <p>
              Something went wrong here. The dang machine keeps buzzing{" "}
              <Code>{error}</Code>.
            </p>
          )}
          {unsubStatus === "success" && (
            <>
              <p>
                You’ve unsubscribed from our mailing list. You won’t receive any
                more newsletter updates from us.
              </p>
              <p>You can subscribe again at any time.</p>
            </>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {error ? (
            <Link className={buttonVariants()} href={DISCORD_URL}>
              Let us know on Discord
            </Link>
          ) : null}
          {unsubStatus !== "loading" && (
            <Link
              className={buttonVariants({ variant: "secondary" })}
              href={"/"}
            >
              Back to home
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
