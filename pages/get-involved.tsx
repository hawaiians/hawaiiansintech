import CheckBox from "@/components/form/CheckBox";
import { Heading, Subheading } from "@/components/Heading";
import MetaTags from "@/components/Metatags";
import Nav from "@/components/Nav";
import { DISCORD_URL, HIT_URL, LINKEDIN_URL, PM_URL } from "@/lib/links";
import Head from "next/head";
import theme from "styles/theme";

export default function newMember({ pageTitle }) {
  return (
    <>
      <Head>
        <MetaTags title={pageTitle} />
        <title>{pageTitle}</title>
      </Head>
      <Nav backUrl="/" />
      <Heading>Howzit! Come get involved!</Heading>
      <Subheading centered>
        Take a look at our checklist of ways you can get involved with us:
      </Subheading>
      <div className="checkbox-list">
        <CheckBox big fadeOnCheck marginBottom="2rem">
          <div className="checkbox-content">
            <h2>
              Join our <a href={DISCORD_URL}>Discord server</a>
            </h2>
            <h3>
              Here, members and allies are able to talk story about upcoming
              events, career opportunities, side projects, etc...
            </h3>
          </div>
        </CheckBox>
        <CheckBox big fadeOnCheck marginBottom="2rem">
          <div className="checkbox-content">
            <h2>
              Connect with our members on <a href={LINKEDIN_URL}>LinkedIn</a>
            </h2>
            <h3>
              Whether you're a veteran in the technology industry, or someone
              trying to get started in it, many of our members on the list have
              a link to their LinkedIn. So go ahead, click on some members on{" "}
              <a href={HIT_URL}>our list</a> and connect with them!
            </h3>
          </div>
        </CheckBox>
        <div>
          <h2>Check out some other resources:</h2>
          <h3>
            Here are some organizations or groups we've either been involved
            with or came across that may help you get even more involved with
            Hawaiians and/or the technology industry:
          </h3>
        </div>
        <div className="checkbox-orgs">
          <CheckBox fadeOnCheck>
            <div className="checkbox-content">
              <h2>
                <a href={PM_URL}>Purple Maiʻa </a>
              </h2>
            </div>
          </CheckBox>
        </div>
      </div>
      <style jsx>{`
        a {
          text-decoration: underline;
        }
        h2 {
          font-size: 2rem;
          margin: 0;
          font-weight: 500;
        }
        h3 {
          font-weight: 400;
          color: ${theme.color.text.alt};
          margin-left: 2rem;
          margin-top: 0.7rem;
          margin-bottom: 0;
        }
        .checkbox-list {
          margin: 3rem auto 0;
          padding: 0 4rem;
          max-width: ${theme.layout.breakPoints.medium};
        }
        .checkbox-content {
          padding-left: 1.5rem;
        }
        .checkbox-orgs {
          padding-left: 3rem;
          margin-top: 2rem;
        }
      `}</style>
    </>
  );
}
