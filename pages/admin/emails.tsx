import Admin from "@/components/admin/Admin";
import Button, { ButtonSize, ButtonVariant } from "@/components/Button";
import ErrorMessage, {
  ErrorMessageProps,
} from "@/components/form/ErrorMessage";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import MetaTags from "@/components/Metatags";
import Plausible from "@/components/Plausible";
import Tag, { TagVariant } from "@/components/Tag";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberEmail } from "@/lib/api";
import { StatusEnum } from "@/lib/enums";
import { useIsAdmin } from "@/lib/hooks";
import { CheckIcon, PlusIcon } from "@radix-ui/react-icons";
import { getAuth } from "firebase/auth";
import { convertStringSnake } from "helpers";
import { cn } from "@/lib/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithGoogle, signOutWithGoogle } from "../../lib/firebase";
import AdminList from "@/components/admin/AdminList";
import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const router = useRouter();
  const [emails, setEmails] = useState<MemberEmail[]>([]);

  const fetchEmails = async () => {
    const response = await fetch("/api/get-emails", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await user.getIdToken()}`,
      },
    });
    const data = await response.json();
    if (data) {
      setEmails(data.emails);
    }
  };

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) router.push(`/admin`);
  }, [isAdmin, isAdminLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchEmails();
    }
  }, [isAdmin]);

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
              {emails ? (
                <EmailList emails={emails} />
              ) : (
                <strong>Authorized, but emails did not load.</strong>
              )}
            </div>
          )}
        </Admin.Body>
      </Admin>
    </>
  );
}

enum EmailDirectoryFilter {
  Newsletter = "Newsletter",
  All = "All",
}

enum EmailDirectoryObscure {
  Show = "Show Emails",
  Obscure = "Don't Show Emails",
}

const EmailList: FC<{ emails: MemberEmail[] }> = ({ emails }) => {
  const [error, setError] = useState<ErrorMessageProps>(null);
  const [showCopiedNotification, setShowCopiedNotification] =
    useState<boolean>(false);
  const [tabVisible, setTabVisible] = useState<EmailDirectoryFilter>(
    EmailDirectoryFilter.Newsletter,
  );
  const [showUnsubscribed, setShowUnsubscribed] = useState<boolean>(false);
  const [emailObscure, setEmailObscure] = useState<EmailDirectoryObscure>(
    EmailDirectoryObscure.Obscure,
  );
  const [includeName, setIncludeName] = useState<boolean>(true);
  const [emailsShown, setEmailsShown] = useState<MemberEmail[]>(emails);
  const [selectedEmails, setSelectedEmails] = useState<MemberEmail[]>([]);

  useEffect(() => {
    setEmailsShown(
      emails
        .filter((email) => {
          if (email?.name === undefined || email?.email === undefined)
            return false;
          switch (tabVisible) {
            case EmailDirectoryFilter.All:
              return true;
            case EmailDirectoryFilter.Newsletter:
              return !email?.unsubscribed;
            default:
              return false;
          }
        })
        .sort((a, b) => {
          if (a?.unsubscribed && !b?.unsubscribed) return -1;
          if (!a?.unsubscribed && b?.unsubscribed) return 1;
          return 0;
        }),
    );
  }, [emails, tabVisible]);

  const handleEmailSelection = (em: MemberEmail) => {
    if (selectedEmails.find((selectedEm) => em?.id === selectedEm?.id)) {
      setSelectedEmails(
        selectedEmails.filter((selectedEm) => em?.id !== selectedEm?.id),
      );
    } else {
      const nameSanitized = em?.name.replace(/[,()]/g, "");
      setSelectedEmails([
        ...selectedEmails,
        {
          id: em?.id,
          name: nameSanitized,
          email: em?.email,
          emailAbbr: em?.emailAbbr,
          status: em?.status,
          unsubscribed: em?.unsubscribed,
        },
      ]);
    }
  };

  const handleCopyToClipboard = (emailList: MemberEmail[]) => {
    setError(null);
    const emailListText = emailList
      .map((em) => {
        if (includeName) {
          return `${em?.name} <${em?.email}>`;
        }
        return `${em?.email}`;
      })
      .join("\n");

    navigator.clipboard
      .writeText(emailListText)
      .then(() => {
        setShowCopiedNotification(true);

        const timeout = setTimeout(() => {
          setShowCopiedNotification(false);
          clearTimeout(timeout);
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        setError({
          headline: "Error",
          body: "Failed to copy text to clipboard. Please try again.",
        });
      });
  };

  return (
    <AdminList>
      <AdminList.Heading
        label="Emails"
        controls={
          <>
            <Tabs
              defaultValue={Object.values(EmailDirectoryFilter)[0]}
              onValueChange={(value) =>
                setTabVisible(value as EmailDirectoryFilter)
              }
              value={tabVisible}
            >
              <TabsList loop>
                {Object.values(EmailDirectoryFilter).map((filter, i) => (
                  <TabsTrigger
                    value={filter}
                    key={`email-directory-filter-${i}`}
                  >
                    {filter}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div>
              <Select
                onValueChange={(option: EmailDirectoryObscure) =>
                  setEmailObscure(option)
                }
                defaultValue={emailObscure}
              >
                <SelectTrigger className="h-8 gap-x-1">
                  <SelectValue placeholder={emailObscure} />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(EmailDirectoryObscure).map(
                    (option: EmailDirectoryObscure) => (
                      <SelectItem value={option} key={`email-vis-${option}`}>
                        {option}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedEmails.length > 0 ? (
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Secondary}
                onClick={() => {
                  if (selectedEmails.length >= 5) {
                    const confirmDelete = window.confirm(
                      `Are you sure you want to deselect all ${selectedEmails.length} members?`,
                    );
                    if (confirmDelete) {
                      setSelectedEmails([]);
                    }
                  } else {
                    setSelectedEmails([]);
                  }
                }}
              >
                Deselect All
              </Button>
            ) : (
              <Button
                size={ButtonSize.Small}
                variant={ButtonVariant.Secondary}
                onClick={() => {
                  setSelectedEmails([...emails]);
                }}
              >
                Select All
              </Button>
            )}
            <Button
              onClick={() => {
                if (selectedEmails.length > 0) {
                  handleCopyToClipboard(selectedEmails);
                } else if (emailsShown) {
                  handleCopyToClipboard(emailsShown);
                }
              }}
              size={ButtonSize.Small}
              variant={ButtonVariant.Invert}
            >
              {showCopiedNotification
                ? "Copied! ✔️"
                : selectedEmails.length > 0
                ? `Copy Selected (${selectedEmails.length})`
                : `Copy All (${emailsShown.length})`}
            </Button>
          </>
        }
      />

      <div className="mx-auto flex w-full flex-col">
        <div className="w-full border-b border-tan-400 bg-tan-100">
          <div className="mx-auto flex max-w-5xl justify-between gap-4 p-2">
            {tabVisible === EmailDirectoryFilter.All ? (
              <p className="flex flex-wrap gap-x-1 text-xs text-stone-500">
                This list includes all email addresses, including unsubscribed
                members. Do not send marketing or newsletter emails.
              </p>
            ) : (
              <p className="text-xs text-stone-500">
                This list includes all email addresses that will receive our
                newsletter.{" "}
                <span className="text-stone-400">
                  (Excludes unsubscribed members)
                </span>
              </p>
            )}
            <div className="flex shrink-0 gap-4">
              <div className="flex gap-x-2">
                <Checkbox
                  checked={includeName}
                  onCheckedChange={() => {
                    setIncludeName(!includeName);
                  }}
                  id="include-name"
                />
                <label
                  htmlFor="include-name"
                  className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Prepend Name
                </label>
              </div>
            </div>
          </div>
        </div>
        {error && (
          <ErrorMessage
            headline={error.headline}
            body={error.body}
            onClose={() => {
              setError(null);
            }}
          />
        )}
        {emailsShown.length === 0 ? (
          <div className="flex w-full justify-center p-4">
            <LoadingSpinner variant={LoadingSpinnerVariant.Invert} />
          </div>
        ) : (
          emailsShown.map((em) => {
            const selected = selectedEmails.find(
              (selectedEm) => em?.id === selectedEm?.id,
            );

            return (
              <button
                key={`email-${em?.email}-${em?.id}`}
                className={cn(
                  `
                  group
                  w-full
                  border-b
                  border-tan-300
                  hover:border-tan-600/40
                  hover:bg-tan-600/5
                  active:bg-brown-600/10
                `,
                  selected &&
                    "border-brown-600/40 bg-brown-600/10 text-stone-800 hover:bg-brown-600/20 active:bg-brown-600/10",
                  em?.unsubscribed &&
                    `border-red-400/50 bg-red-400/5 text-red-600 hover:border-red-400 hover:bg-red-400/20  active:bg-red-400/30`,
                  em?.unsubscribed &&
                    selected &&
                    `border-red-400 bg-red-400/20 text-red-600 hover:bg-red-400/30  active:bg-red-400/20`,
                )}
                onClick={() => {
                  handleEmailSelection({
                    id: em?.id,
                    name: em?.name,
                    email: em?.email,
                    emailAbbr: em?.emailAbbr,
                    status: em?.status,
                    unsubscribed: em?.unsubscribed,
                  });
                }}
              >
                <div
                  className={cn(`
                  mx-auto
                  flex
                  w-full
                  max-w-5xl
                  items-center
                  gap-2
                `)}
                >
                  <div
                    className={cn(
                      `mx-auto
                    flex
                    w-full
                    flex-col
                    gap-0.5
                    p-2
                    text-left`,
                    )}
                  >
                    <div className="flex grow flex-col items-start gap-1">
                      {em?.status && (
                        <Tag
                          variant={
                            em?.status === StatusEnum.APPROVED
                              ? TagVariant.Success
                              : em?.status === StatusEnum.IN_PROGRESS
                              ? TagVariant.NearSuccess
                              : em?.status === StatusEnum.PENDING
                              ? TagVariant.Warn
                              : TagVariant.Alert
                          }
                        >
                          {convertStringSnake(em?.status)}
                        </Tag>
                      )}
                      <h3 className="text-xl font-semibold">{em?.name}</h3>
                    </div>
                    <h5
                      className={cn(
                        "inline-flex items-center gap-1 rounded bg-tan-500/10 px-2 py-1 text-xs",
                        em?.unsubscribed && "bg-red-400/10 text-red-600",
                      )}
                    >
                      {em?.unsubscribed && (
                        <span className="font-medium">UNSUBSCRIBER</span>
                      )}
                      {includeName && (
                        <span
                          className={cn(
                            `inline-flex shrink-0 cursor-text select-text text-stone-500`,
                            selected && "text-stone-600",
                            em?.unsubscribed && `text-red-600/60`,
                          )}
                        >
                          {em?.name}
                        </span>
                      )}
                      <span
                        className={cn(
                          `flex-grow cursor-text select-text overflow-hidden overflow-ellipsis whitespace-nowrap text-stone-500`,
                          selected && "text-stone-600",
                          em?.unsubscribed && `text-red-600/60`,
                        )}
                      >
                        {includeName && `<`}
                        {emailObscure === EmailDirectoryObscure.Show
                          ? em?.email
                          : em?.emailAbbr}
                        {includeName && `>`}
                      </span>{" "}
                      {em?.unsubscribed && (
                        <span
                          className={cn("shrink-0 text-xs text-red-600/60")}
                        >
                          Transactional / urgent emails only
                        </span>
                      )}
                    </h5>
                  </div>
                  <div
                    className={cn(
                      `pr-4 text-stone-500 opacity-50 group-hover:opacity-100`,
                      selected && `text-brown-600 opacity-100`,
                      em?.unsubscribed && `text-red-600`,
                    )}
                  >
                    {selected ? (
                      <CheckIcon width={20} height={20} />
                    ) : (
                      <PlusIcon width={20} height={20} />
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </AdminList>
  );
};
