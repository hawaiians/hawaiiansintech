import ProgressBar from "@/components/form/ProgressBar";
import { Heading, Subheading } from "@/components/Heading";
import BasicInformationForm from "@/components/intake-form/BasicInformation";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { StorageEnum } from "@/lib/enums";
import { useStorage } from "@/lib/hooks";
import { clearAllStoredFields } from "@/lib/utils";
import { getAuth } from "firebase/auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Join · Hawaiians in Technology",
    },
  };
}

export const handleUser = (
  loading: boolean,
  user: any,
  router: any,
  page: string
) => {
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    router.push({ pathname: `/login` });
    sessionStorage.setItem(StorageEnum.PREVIOUS_PAGE, page);
  }
  return null;
};

export const getUserName = (user: any) => {
  if (!user) return "";
  return sessionStorage.getItem(StorageEnum.USER_NAME);
};

export default function JoinStep1({ pageTitle }) {
  const router = useRouter();
  const { getItem, setItem } = useStorage();
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [user, authLoading, authStateError] = useAuthState(getAuth());

  useEffect(() => {
    let storedName = getItem("jfName");
    let storedLocation = getItem("jfLocation");
    let storedWebsite = getItem("jfWebsite");
    if (name === "" && user)
      storedName ? setName(storedName) : setName(getUserName(user));
    if (storedLocation) setLocation(storedLocation);
    if (storedWebsite) setWebsite(storedWebsite);
    handleUser(authLoading, user, router, "/join/01-you");
  }, [authLoading, user, router]);

  const handleSubmit = (values) => {
    setItem("jfName", values.name);
    setItem("jfLocation", values.location);
    setItem("jfWebsite", values.website);
    router.push({ pathname: `02-work` });
  };

  const handleReset = () => {
    setName("");
    setLocation("");
    setWebsite("");
    clearAllStoredFields("jf");
  };

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backUrl="/" signInName={name} />
      <Heading>Welcome to our little hui.</Heading>
      <Subheading centered>
        To join the directory, we just ask that you are{" "}
        <strong className="font-semibold text-stone-700">
          Native Hawaiian
        </strong>{" "}
        and work in the{" "}
        <strong className="font-semibold text-stone-700">
          field / industry of technology
        </strong>
        .
      </Subheading>
      <BasicInformationForm
        initial={{ name: name, location: location, website: website }}
        onSubmit={handleSubmit}
        onReset={handleReset}
      />
      <div style={{ margin: "1rem 0 4rem" }}>
        <ProgressBar currentCount={1} totalCount={4} width="6.4rem" />
      </div>
    </>
  );
}
