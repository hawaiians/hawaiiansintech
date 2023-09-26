import Button from "@/components/Button";
import ErrorMessage, {
  ErrorMessageProps,
} from "@/components/form/ErrorMessage";
import Input from "@/components/form/Input";
import Label from "@/components/form/Label";
import ProgressBar from "@/components/form/ProgressBar";
import { Heading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import Plausible from "@/components/Plausible";
import { LoginTypeNameEnum, StorageEnum } from "@/lib/enums";
import { signOut } from "@/lib/firebase";
import { useStorage } from "@/lib/hooks";
import { clearAllStoredFields, useInvalid } from "@/lib/utils";
import { getAuth } from "firebase/auth";
import { Field, Formik } from "formik";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import * as Yup from "yup";
import { getUserName, handleUser } from "./01-you";

export async function getStaticProps() {
  return {
    props: {
      pageTitle: "Join · Hawaiians in Technology",
    },
  };
}

export default function JoinStep4({ pageTitle }) {
  const router = useRouter();
  const { getItem, setItem, removeItem } = useStorage();
  const [email, setEmail] = useState<string>("");

  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [website, setWebsite] = useState<string>("");
  const [focusesSelected, setFocusesSelected] = useState<string[]>([]);
  const [focusSuggested, setFocusSuggested] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [industriesSelected, setIndustriesSelected] = useState<string[]>([]);
  const [industrySuggested, setIndustrySuggested] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [yearsExperience, setYearsExperience] = useState<string>();
  const [subscribed, setSubscribed] = useState<boolean>(true);

  const [validateAfterSubmit, setValidateAfterSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorMessageProps>(undefined);

  const [linkedInPicture, setLinkedInPicture] = useState<string>("");
  const [savePicture, setSavePicture] = useState<boolean>(true);
  const [user, authLoading, authStateError] = useAuthState(getAuth());
  const [loginType, setLoginType] = useState<LoginTypeNameEnum>();

  const createMember = async () => {
    const token = await user.getIdToken();
    return new Promise((resolve, reject) => {
      fetch("/api/create-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          location,
          website,
          focusesSelected,
          focusSuggested,
          title,
          yearsExperience,
          industriesSelected,
          industrySuggested,
          companySize,
          email,
          unsubscribed: !subscribed,
          linkedInPicture:
            savePicture && linkedInPicture ? linkedInPicture : "",
          authType: loginType,
          token: token,
        }),
      }).then(
        (response: Response) => {
          resolve(response);
        },
        (error: Response) => {
          reject(error);
        }
      );
    });
  };

  // check invalid situation via previous required entries
  useInvalid({ currentPage: "04-contact" });

  // check localStorage and set pre-defined fields
  useEffect(() => {
    let storedName = getItem("jfName");
    let storedLocation = getItem("jfLocation");
    let storedWebsite = getItem("jfWebsite");
    let storedFocuses = getItem("jfFocuses");
    let storedFocusSuggested = getItem("jfFocusSuggested");
    let storedTitle = getItem("jfTitle");
    let storedYearsExperience = getItem("jfYearsExperience");
    let storedIndustries = getItem("jfIndustries");
    let storedIndustrySuggested = getItem("jfIndustrySuggested");
    let storedCompanySize = getItem("jfCompanySize");
    let storedEmail = sessionStorage.getItem(StorageEnum.USER_EMAIL);
    let storedLoginType = sessionStorage.getItem(StorageEnum.LOGIN_TYPE_NAME);
    let storedLinkedInPicture = sessionStorage.getItem(
      StorageEnum.PROFILE_PICTURE
    );

    if (storedName) setName(storedName);
    if (storedLocation) setLocation(storedLocation);
    if (storedWebsite) setWebsite(storedWebsite);
    if (storedFocuses) setFocusesSelected(JSON.parse(storedFocuses));
    if (storedFocusSuggested) setFocusSuggested(storedFocusSuggested);
    if (storedTitle) setTitle(storedTitle);
    if (storedYearsExperience) setYearsExperience(storedYearsExperience);
    if (storedIndustries) setIndustriesSelected(JSON.parse(storedIndustries));
    if (storedIndustrySuggested) setIndustrySuggested(storedIndustrySuggested);
    if (storedCompanySize) setCompanySize(storedCompanySize);
    if (storedEmail) setEmail(storedEmail);
    if (storedLoginType) setLoginType(storedLoginType as LoginTypeNameEnum);
    if (storedLinkedInPicture) setLinkedInPicture(storedLinkedInPicture);
    handleUser(authLoading, user, router, "/join/04-contact");
  }, [authLoading, user, router]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(undefined);
    const res: Response | any = await createMember();
    const resJSON = await res.json();
    if (res.ok) {
      clearAllStoredFields("jf");
      router.push({ pathname: "thank-you" });
    } else if (res.status === 401) {
      setLoading(false);
      setError({
        headline: "Ah, looks like you got some auth issues: " + resJSON.error,
        body: "We'll get you back to the login page in 5 seconds or so",
      });
      sessionStorage.setItem(StorageEnum.PREVIOUS_PAGE, "/join/04-contact");
      setTimeout(() => {
        signOut(false);
        router.push({ pathname: `/login` });
      }, 5000);
    } else if (res.status === 422) {
      setLoading(false);
      setError({
        headline: resJSON.error,
        body: resJSON.body,
      });
    } else {
      setLoading(false);
      setError({
        headline: "Gonfunnit, looks like something went wrong!",
        body: "Please try again later.",
      });
    }
  };

  return (
    <>
      <Head>
        <Plausible />
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav
        backUrl="/"
        signInName={typeof window !== "undefined" ? getUserName(user) : ""}
      />

      <Heading>Welcome to our little hui.</Heading>

      <section className="mx-auto mb-4 max-w-3xl px-8">
        {error && (
          <div style={{ marginBottom: "1rem" }}>
            <ErrorMessage headline={error.headline} body={error.body} />
          </div>
        )}
        <Formik
          enableReinitialize
          initialValues={{ email: email, ageGate: false }}
          validateOnBlur={validateAfterSubmit}
          validateOnChange={validateAfterSubmit}
          validate={() => setValidateAfterSubmit(true)}
          onSubmit={(values) => {
            handleSubmit(values);
          }}
          validationSchema={Yup.object().shape({
            email: Yup.string()
              .email(
                "Aiyah, looks like we had some issues with the email on your account. Please try again later."
              )
              .required(
                "Aiyah, looks like we had some issues with the email on your account. Please try again later."
              ),
            ageGate: Yup.boolean()
              .oneOf([true], "You must check this box to continue.")
              .required("You must check this box to continue."),
          })}
        >
          {(props) => {
            return (
              <form
                onSubmit={props.handleSubmit}
                className="flex flex-col gap-4"
              >
                <div className="flex gap-4 rounded-lg bg-tan-300 p-4">
                  <span className="text-3xl">🤫</span>
                  <p>
                    <strong>
                      We treat your email address as private information
                    </strong>
                    . We wonʻt share it without your explicit consent. Only
                    trusted members of our administrative hui will have access
                    to this contact information.{" "}
                    <Link
                      href="/privacy-policy#joining-the-directory"
                      target="_blank"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
                <Label
                  label={`Lastly, we'll use the email on your ${loginType} account`}
                />{" "}
                <Input
                  name="email"
                  onBlur={props.handleBlur}
                  placeholder="Email Address"
                  disabled
                  value={email}
                  error={props.touched.email && props.errors.email}
                />
                <label className="inline-block">
                  <input
                    type="checkbox"
                    name="send-me-emails"
                    checked={subscribed}
                    onChange={() => setSubscribed(!subscribed)}
                    className={`
                    accent-ring
                    focus:ring-6
                    mr-2
                    h-5
                    w-5
                    rounded
                    accent-brown-600
                    focus:ring-opacity-50
                  `}
                  />
                  Please let me know about{" "}
                  <strong className="font-semibold">
                    features and community updates
                  </strong>{" "}
                  <span className="text-stone-500">(~once a month)</span>.
                </label>
                <label>
                  <Field
                    type="checkbox"
                    name="ageGate"
                    className={`
                  accent-ring
                  focus:ring-6
                  mr-2
                  h-5
                  w-5
                  accent-brown-600
                  focus:ring-opacity-50
                  `}
                  />
                  I am{" "}
                  <strong className="font-semibold">
                    13 years of age or older
                  </strong>{" "}
                  and agree to the{" "}
                  <Link href="/privacy-policy">Privacy Policy</Link>.
                  {props.touched.ageGate && props.errors.ageGate && (
                    <p className="mt-1 text-xs text-red-600">
                      {props.errors.ageGate}
                    </p>
                  )}
                </label>
                {loginType === LoginTypeNameEnum.LINKEDIN && (
                  <>
                    <label className="inline-block">
                      <input
                        type="checkbox"
                        name="save-my-picture"
                        checked={savePicture}
                        onChange={() => setSavePicture(!savePicture)}
                        className={`
                    accent-ring
                    focus:ring-6
                    mr-2
                    h-5
                    w-5
                    rounded
                    accent-brown-600
                    focus:ring-opacity-50
                  `}
                      />
                      Please save my LinkedIn profile picture to use on my
                      member entry:
                    </label>
                    <div className="mx-auto">
                      <img
                        src={linkedInPicture}
                        alt="profile picture"
                        className="ml-1 mr-1 h-40"
                      />
                    </div>
                  </>
                )}
                <div className="mx-auto w-full max-w-md px-4">
                  <Button fullWidth loading={loading} type="submit">
                    Submit
                  </Button>
                </div>
              </form>
            );
          }}
        </Formik>
      </section>
      <ProgressBar currentCount={4} totalCount={4} width="6.4rem" />
    </>
  );
}
