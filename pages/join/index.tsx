import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import MetaTags from "../../components/Metatags.js";
import { Heading, Subheading } from "../../components/Heading";
import Button from "../../components/Button";
import Pill from "../../components/Pill.js";
import RadioBox from "../../components/form/RadioBox";

export default function Join() {
  const [urlOnSubmit, setUrlOnSubmit] = useState("/join/step-02");

  return (
    <div className="container">
      <Head>
        <title>Hawaiians in Technology | Join</title>
        <link rel="icon" href="/favicon.ico" />
        <MetaTags />
      </Head>

      <Link href="/" shallow={true}>
        <a className="auxNav arrowback">←</a>
      </Link>

      <img src="/images/shaka.gif" className="shaka" />
      <Heading>Huuuui, Aloha e.</Heading>
      <Subheading centered>
        Drop your in the hat to be added to the list. We just ask that you /
        they are <strong>Native Hawaiian</strong> &amp; work or research in the{" "}
        <strong>technology sector</strong>. Or if you’re not yet working in the
        space, and curious to get started, let us know who you are.
      </Subheading>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        <div style={{ maxWidth: "20rem", marginRight: "1rem" }}>
          <RadioBox
            defaultChecked
            label="Join the list on the homepage"
            onChange={() => {
              setUrlOnSubmit("/join/step-02");
            }}
            description="Current professional or researcher in the technology sector"
            seriesOf="add-or-nominate"
          />
        </div>
        <div style={{ maxWidth: "20rem" }}>
          <RadioBox
            label="Join  apprentice program"
            onChange={() => {
              setUrlOnSubmit("/join/apprentice");
            }}
            description={
              <>
                <div style={{ margin: "0.5rem 0 0.25rem" }}>
                  <Pill>COMING SOON</Pill>
                </div>
                Student or someone transitioning careers
              </>
            }
            seriesOf="add-or-nominate"
          />
        </div>
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Button linkTo={urlOnSubmit}>Continue</Button>
      </div>

      <style jsx>{`
        .shaka {
          display: block;
          height: 5.2rem;
          width: auto;
          margin: 0 auto 2rem;
        }
      `}</style>
    </div>
  );
}