import Admin from "@/components/admin/Admin";
import Button, { ButtonVariant } from "@/components/Button";
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
import { StatusEnum } from "@/lib/enums";

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Admin Panel · Hawaiians in Technology",
    },
  };
}

interface EmailWithUnsub {
  id?: string;
  name?: string;
  email?: string;
  emailAbbr?: string;
  status?: StatusEnum;
  unsubscribed?: boolean;
  unsubLink: string;
}

export default function EmailsPage(props: { pageTitle }) {
  const auth = getAuth();
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, isAdminLoading] = useIsAdmin(user, loading);
  const [linkError, setLinkError] = useState<string>("");
  const [emailsWithUnsub, setEmailsWithUnsub] = useState<EmailWithUnsub[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) router.push(`/admin`);
  }, [isAdmin, isAdminLoading, router]);

  const sendEmails = async () => {
    if (emailsWithUnsub.length < 0) {
      console.error("No emails to send to");
      return;
    }
    emailsWithUnsub.map((email) => {
      console.log(
        `sending email to ${email.email} with unsublink ${email.unsubLink}`,
      );
    });
  };

  const getUnsub = async (uid) => {
    const unsubLink = await fetch(`/api/unsubscribe?uid=${uid}`, {
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
        return `${baseUrl}/edit/unsubscribe?uid=${uid}&unsubKey=${data.unsubKey}`;
      })
      .catch((error) => {
        console.log("error: ", error.message);
        setLinkError(error.message);
      });
    return unsubLink;
  };

  const getEmailList = async () => {
    const response = await fetch("/api/get-emails", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
    });
    const data = await response.json();
    if (data) {
      const oneEmail = data.emails.filter((email) => {
        return email?.email === "{test email here}";
      });
      Promise.all(
        // uncomment this to get all emails
        // data.emails.map(async (email) => {
        oneEmail.map(async (email) => {
          const unsubLink = await getUnsub(email.id);
          return {
            ...email,
            unsubLink: unsubLink,
          };
        }),
      ).then((emailsWithUnsubLink) => {
        setEmailsWithUnsub((prev) => [...prev, ...emailsWithUnsubLink]);
      });
    }
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
                {emailsWithUnsub.length > 0 ? (
                  <Button onClick={sendEmails}>Send emails</Button>
                ) : (
                  <Button
                    onClick={getEmailList}
                    variant={ButtonVariant.Secondary}
                  >
                    Get list of emails
                  </Button>
                )}
                {linkError && (
                  <div className="m-5">
                    <ErrorMessage
                      headline={"Error with API:"}
                      body={linkError}
                    />
                  </div>
                )}

                {emailsWithUnsub.length > 0 && (
                  <div className="m-5">
                    <h2 className="mb-5">Emails:</h2>
                    <ul>
                      {emailsWithUnsub.map((email, i) => (
                        <li key={i} className="flex flex-col">
                          {email?.email}
                          {email?.unsubscribed && (
                            <span className="pl-4 text-red-500">
                              unsubscribed
                            </span>
                          )}
                          <div className="pl-4">
                            <strong>link: </strong>
                            <a href={email.unsubLink} target="_blank">
                              {email.unsubLink}
                            </a>
                          </div>
                        </li>
                      ))}
                    </ul>
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
