import Button, { ButtonSize } from "@/components/Button";
import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import Input from "@/components/form/Input";
import Label from "@/components/form/Label";
import Head from "next/head";
import { useState } from "react";
import { sendSignInLinkToEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Code from "@/components/Code";
export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Request Changes · Hawaiians in Technology",
    },
  };
}

export default function EditPage({ pageTitle }) {
  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backUrl="/" />
      <Heading>Welcome back, Hawaiian.</Heading>
      <Subheading centered>
        First, let's sign you in with the email you registered with.
      </Subheading>
      <RequestForm />
    </>
  );
}

function RequestForm() {
  const [email, setEmail] = useState<string>("");
  const [emailSent, setEmailSent] = useState<boolean>(false);

  const handleSignIn = () => {
    const actionCodeSettings = {
      url: "http://localhost:3000/edit/finish-login",
      handleCodeInApp: true,
    };
    sendSignInLinkToEmail(auth, email, actionCodeSettings)
      .then(() => {
        window.localStorage.setItem("emailForSignIn", email);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("error sending email:", errorCode, errorMessage);
      });
    setEmailSent(true);
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
      {emailSent ? (
        <div className="text-center mt-4">
          <h2 className="text-base">
            You should have <em>just</em> received a sign in email from us. If
            you didn't, you may need to add{" "}
            <Code>no-reply@hawaiiansintech.org</Code> to your address book.
          </h2>
        </div>
      ) : (
        <>
          <div className="mb-8 w-3/4">
            <div className="mb-2">
              <Label label={"Email:"} />
            </div>
            <Input
              name={"email"}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <Button onClick={handleSignIn}>Sign In</Button>
        </>
      )}
    </div>
  );
}
