import { Heading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { DocumentData, MemberPublic } from "@/lib/firebase-helpers/api";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MemberEdit } from "@/components/MemberEdit";
import { StatusEnum } from "@/lib/enums";
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
      <Nav backUrl="/" />
      <Heading>Edit Profile</Heading>
      {/* <Subheading centered>Welcome back, Hawaiian.</Subheading> */}
      <EditMember />
    </>
  );
}

function EditMember() {
  const router = useRouter();
  const memberId = router.query.memberId;
  const [member, setMember] = useState<MemberPublic>(null);
  const [members, setMembers] = useState<MemberPublic[]>([]);
  const [regions, setRegions] = useState<DocumentData[]>([]);

  useEffect(() => {
    if (!memberId) return;
    if (!member && auth.currentUser) {
      auth.currentUser.getIdToken().then((token) => {
        fetch(`/api/members`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            setMember(data.members.find((m) => m.id === memberId));
            setMembers(data.members);
            setRegions(data.regions);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    }
  }, [memberId]);

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
        />
      )}
    </div>
  );
}
