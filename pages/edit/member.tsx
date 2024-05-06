import { Heading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { DocumentData, MemberPublic } from "@/lib/firebase-helpers/interfaces";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MemberEdit } from "@/components/MemberEdit";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Request Changes · Hawaiians in Technology",
    },
  };
}

export default function EditMemberPage({ pageTitle }) {
  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav variant="minimized" backLinkTo="/" />
      <Heading>Edit Profile</Heading>
      <EditMember />
    </>
  );
}

function EditMember() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const memberId = router.query.memberId as string;
  const [member, setMember] = useState<MemberPublic>(null);
  // const [members, setMembers] = useState<MemberPublic[]>([]); {/* this isn't used anywhere */}
  const [regions, setRegions] = useState<DocumentData[]>([]);

  const getUser = async () => {
    try {
      user.getIdToken().then(async (token) => {
        await fetch(`/api/members`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setMember(data.members.find((m) => m.id === memberId));
            // setMembers(data.members);  {/* this isn't used anywhere */}
            setRegions(data.regions);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  return (
    <div
      className={`
        mx-auto
        mb-8
        mt-8
        flex
        max-w-3xl
        flex-col
        items-center
        px-4
      `}
    >
      {member && regions && auth.currentUser && (
        <MemberEdit
          member={member}
          regions={regions}
          user={auth.currentUser}
          adminView={false}
          onSave={() => router.push("/")}
        />
      )}
    </div>
  );
}
