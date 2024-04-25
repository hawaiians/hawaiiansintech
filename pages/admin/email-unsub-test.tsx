import Admin from "@/components/admin/Admin";
import Button from "@/components/Button";
import ErrorMessage from "@/components/form/ErrorMessage";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import MetaTags from "@/components/Metatags";
import Plausible from "@/components/Plausible";
import { useIsAdmin } from "@/lib/hooks";
import { getAuth } from "firebase/auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithGoogle, signOutWithGoogle } from "../../lib/firebase";
import { Input } from "@/components/ui/input";

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Admin Panel · Hawaiians in Technology",
    },
  };
}

export default function EmailsPage(props: { pageTitle }) {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, isAdminLoading] = useIsAdmin(user, loading);
  const [unsubEmailLink, setUnsubEmailLink] = useState<string>("");
  const [linkError, setLinkError] = useState<string>("");
  const [uid, setUid] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) router.push(`/admin`);
  }, [isAdmin, isAdminLoading, router]);

  const getUnsub = async () => {
    if (!uid) {
      setLinkError("Please enter a user ID");
      return;
    }
    await fetch(`/api/unsubscribe?uid=${uid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        const baseUrl = window.location.origin;
        setUnsubEmailLink(
          `${baseUrl}/edit/unsubscribe?uid=${uid}&unsubKey=${data.unsubKey}`,
        );
      })
      .catch((error) => {
        console.log("error: ", error.message);
        setLinkError(error.message);
      });
  };

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={props.pageTitle} />
        <title>{props.pageTitle}</title>
      </Head>
      <Admin>
        <Admin.Nav
          handleLogOut={signOutWithGoogle}
          handleLogIn={signInWithGoogle}
          isLoggedIn={!!user}
          isAdmin={isAdmin}
          displayName={user?.displayName}
        />
        <Admin.Body>
          {isAdminLoading && (
            <div className="flex w-full justify-center p-4">
              <LoadingSpinner variant={LoadingSpinnerVariant.Invert} />
            </div>
          )}

          {isAdmin && (
            <div className="mx-auto">
              <div className="m-4">
                <p>Enter a user ID:</p>
                <Input
                  name={"usernamef"}
                  value={uid}
                  className={"mb-4 w-1/2"}
                  onChange={(e) => {
                    setUid(e.target.value);
                  }}
                />
                <Button onClick={getUnsub}>get unsub link</Button>
                {linkError && (
                  <div className="m-5">
                    <ErrorMessage
                      headline={"Error with API:"}
                      body={linkError}
                    />
                  </div>
                )}
                {unsubEmailLink && (
                  <div className="m-5">
                    <strong>Unsubscribe link:</strong>
                    <div>
                      <a href={unsubEmailLink} target="_blank">
                        {unsubEmailLink}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </Admin.Body>
      </Admin>
    </>
  );
}
