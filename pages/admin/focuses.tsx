import Admin from "@/components/admin/Admin";
import ErrorMessage, {
  ErrorMessageProps,
} from "@/components/form/ErrorMessage";
import LoadingSpinner, {
  LoadingSpinnerVariant,
} from "@/components/LoadingSpinner";
import MetaTags from "@/components/Metatags";
import Plausible from "@/components/Plausible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteDocument,
  deleteReferences,
  getAllMemberReferencesToDelete,
} from "@/lib/firebase-helpers/public/directory";
import { DocumentData, Filter, MemberPublic, getFilters } from "@/lib/api";
import { FirebaseTablesEnum, StatusEnum } from "@/lib/enums";
import { useIsAdmin } from "@/lib/hooks";
import { getAuth, User } from "firebase/auth";
import { cn } from "@/lib/utils";
import Head from "next/head";
import { useRouter } from "next/router";
import { FC, ReactNode, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithGoogle, signOutWithGoogle } from "../../lib/firebase";
import AdminList from "@/components/admin/AdminList";
import Tag, { TagVariant } from "@/components/Tag";
import { convertStringSnake } from "@/helpers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Focuses · Hawaiians in Technology",
    },
    revalidate: 60,
  };
}

export default function FocusesPage(props) {
  const { pageTitle } = props;
  const auth = getAuth();
  const [focuses, setFocuses] = useState<Filter[]>([]);
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, isAdminLoading] = useIsAdmin(user, loading);
  const router = useRouter();

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) router.push(`/admin`);
  }, [isAdmin, isAdminLoading, router]);

  const fetchFocuses = async () => {
    const data = await getFilters({
      type: FirebaseTablesEnum.FOCUSES,
    });
    if (data) {
      setFocuses(data);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchFocuses();
    }
  }, [isAdmin]);

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
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
              <Directory focuses={focuses} user={user} />
            </div>
          )}
        </Admin.Body>
      </Admin>
    </>
  );
}

interface FocusDirectoryProps {
  focuses?: Filter[];
  user?: User;
}

type FocusDirectoryType = FC<FocusDirectoryProps> & {
  Card: FC<CardProps>;
};

const Directory: FocusDirectoryType = ({ focuses, user }) => {
  const [error, setError] = useState<ErrorMessageProps>(null);

  return (
    <>
      <AdminList>
        <AdminList.Heading label="Focuses" controls={<></>} />

        {error && (
          <div className="mx-auto my-2 w-full max-w-5xl">
            <ErrorMessage
              headline={error.headline}
              body={error.body}
              onClose={() => {
                setError(null);
              }}
            />
          </div>
        )}

        {focuses && focuses.length > 0 ? (
          <>
            {focuses.map((f) => (
              <Directory.Card
                focus={f}
                key={`focus-card-${f.id}`}
                user={user}
                className="rounded-2xl border-2"
              />
            ))}
          </>
        ) : (
          <div className="flex w-full justify-center p-4">
            <LoadingSpinner variant={LoadingSpinnerVariant.Invert} />
          </div>
        )}
      </AdminList>
    </>
  );
};

interface CardProps {
  className?: string;
  focus: Filter;
  user?: User;
}

Directory.Card = Card;

function Card({ className, focus, user }: CardProps) {
  const [showModal, setShowModal] = useState<ReactNode | false>(false);

  const handleDelete = async () => {
    alert("NOT ACTUALLY DELETING!!! RETURNING EARLY");
    return;
    const references = await getAllMemberReferencesToDelete(focus.id);
    const memberRef = references.memberRef;
    // CONFIRM THAT THIS CHECKS IF OTHER MEMBERS USE THE SAME FOCUSES
    console.log("removing focuses references");
    await deleteReferences(memberRef, references.focuses);
    // CONFIRM THAT THIS CHECKS IF OTHER MEMBERS USE THE SAME INDUSTRY
    console.log("removing industries references");
    await deleteReferences(memberRef, references.industries);
    // CONFIRM THAT THIS CHECKS IF OTHER MEMBERS USE THE SAME REGION
    console.log("removing regions references");
    await deleteReferences(memberRef, references.regions);
    console.log("removing secureMemberData document");
    await deleteDocument(references.secureMemberData);
    console.log("removing member document");
    await deleteDocument(references.memberRef);
  };

  if (focus === undefined) return null;

  const mapTabsTriggerToVariant = (
    status: StatusEnum,
  ): "alert" | "success" | "nearSuccess" | "warn" => {
    switch (status) {
      case StatusEnum.APPROVED:
        return "success";
      case StatusEnum.IN_PROGRESS:
        return "nearSuccess";
      case StatusEnum.PENDING:
        return "warn";
      case StatusEnum.DECLINED:
        return "alert";
      default:
        return;
    }
  };

  return (
    <>
      <Dialog>
        <DialogTrigger
          className={cn(
            "group shadow-md text-left rounded-2xl border-2",
            focus.status === StatusEnum.APPROVED
              ? "border-tan-300/50 hover:border-tan-300 hover:bg-tan-600/5 active:bg-tan-600/10"
              : focus.status === StatusEnum.IN_PROGRESS
              ? "border-violet-500/30 shadow-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 active:bg-violet-500/20"
              : focus.status === StatusEnum.PENDING
              ? "border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 active:bg-amber-500/20"
              : "border-red-500/30 bg-red-500/5 hover:bg-red-500/10 active:bg-red-500/20",
            className,
          )}
        >
          <div className="flex flex-col p-4">
            <div className="self-start">
              {focus.status && (
                <Tag
                  variant={
                    focus.status === StatusEnum.APPROVED
                      ? TagVariant.Success
                      : focus.status === StatusEnum.IN_PROGRESS
                      ? TagVariant.NearSuccess
                      : focus.status === StatusEnum.PENDING
                      ? TagVariant.Warn
                      : TagVariant.Alert
                  }
                >
                  {convertStringSnake(focus.status)}
                </Tag>
              )}
              <h3 className="text-xl font-semibold">{focus.name}</h3>
            </div>

            <span
              className="text-sm text-secondary-foreground"
              title={`${focus.count}`}
            >
              {focus.count} members
            </span>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{focus.name}</DialogTitle>
            <DialogDescription>{focus.count} members</DialogDescription>
          </DialogHeader>
          <Tabs
            defaultValue={focus.status}
            // onValueChange={(value) => {
            //   setStatus(value as StatusEnum);
            // }}
            // value={tabVisible}
            className="col-span-2"
          >
            <TabsList loop className="w-full">
              {Object.values(StatusEnum).map((status, i) => (
                <TabsTrigger
                  value={status}
                  key={`directory-status-${i}`}
                  variant={mapTabsTriggerToVariant(status)}
                >
                  {convertStringSnake(status)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="col-span-2 flex flex-col items-start gap-1">
            <h2 className={`text-sm font-semibold`}>Name</h2>
            <Input
              name={"name"}
              value={focus.name}
              // className={name !== member.name && "text-brown-600"}
              // onChange={(e) => {
              //   setName(e.target.value);
              // }}
            />
          </div>
          <div className="col-span-2 flex justify-end">
            <Button size="sm">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
