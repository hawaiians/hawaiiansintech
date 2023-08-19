import LoadingSpinner from "@/components/LoadingSpinner";
import { signInWithLinkedInData } from "@/lib/firebase";
import { handlePreviousPage } from "helpers";
import { useRouter } from "next/router";

export async function getServerSideProps() {
  const LINKEDIN_REDIRECT = process.env.LINKEDIN_REDIRECT;
  const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  return {
    props: {
      LINKEDIN_REDIRECT,
      LINKEDIN_CLIENT_ID,
      LINKEDIN_CLIENT_SECRET,
    },
  };
}

const handleFetchAuth = async (code, id, secret, redirect, router) => {
  const resp = await fetch("/api/linkedin-data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: code,
      id: id,
      secret: secret,
      redirect: redirect,
    }),
  });
  const linkedInData = await resp.json();
  signInWithLinkedInData(linkedInData);
  handlePreviousPage(router);
};

export default function oauth(props) {
  const router = useRouter();
  const code = router.query.code;

  handleFetchAuth(
    code,
    props.LINKEDIN_CLIENT_ID,
    props.LINKEDIN_CLIENT_SECRET,
    props.LINKEDIN_REDIRECT,
    router
  );

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
        }}
      >
        <LoadingSpinner />
        <div style={{ marginTop: "1rem" }}>Logging you in...</div>
      </div>
    </>
  );
}
