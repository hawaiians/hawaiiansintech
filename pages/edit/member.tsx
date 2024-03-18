import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { DocumentData, MemberPublic } from "@/lib/api";
import { useStorage } from "@/lib/hooks";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MemberEdit } from "@/components/MemberEdit";
import {
  getAuth,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import Button from "@/components/Button";

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
      <Heading>Request Changes</Heading>
      {/* <Subheading centered>Welcome back, Hawaiian.</Subheading> */}
      <EditMember />
    </>
  );
}

function EditMember() {
  const router = useRouter();
  const memberId = router.query.memberId;

  const handleButton = () => {
    const auth = getAuth();
    const user = auth.currentUser;
  };

  return (
    <div
      className={`
        mx-auto
        mb-4
        mt-8
        flex
        max-w-3xl
        flex-col
        items-center
        px-4
      `}
    >
      <Button onClick={handleButton}>Submit</Button>
    </div>
  );
}
