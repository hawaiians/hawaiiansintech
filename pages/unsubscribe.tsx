import { useEffect, useState } from "react";
import { useIsAdmin } from "@/lib/hooks";

import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";

export default function UnsubscribePage() {
  const [unsubStatus, setUnsubStatus] = useState<"loading" | "success">(
    "loading",
  );
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
      setError(error.message);
    }
  };

  useEffect(() => {
    if (query.uid !== undefined || query.unsub !== undefined) {
      handleUnsubscribe();
    }
  }, [query]);

  return (
    <>
      {!error && unsubStatus === "loading" && (
        <div className="flex w-full justify-center p-4">
          <LoadingSpinner variant={LoadingSpinnerVariant.Invert} />
        </div>
      )}
      {unsubStatus === "success" && <p>Successfully unsubscribed</p>}
      {error && <p>Did not unsubscribe {error}</p>}
      <Button onClick={handleGenerate}>Generate</Button>
      <Button onClick={handleUnsubscribe}>Unsubscribe</Button>
    </>
  );
}
