import FocusPicker, { FocusPickerFocus } from "@/components/FocusPicker";
import MemberDirectory, { DirectoryMember } from "@/components/MemberDirectory";
import MetaTags from "@/components/Metatags.js";
import Nav from "@/components/Nav";
import { Title } from "@/components/Title.js";
import { Focus, getFocuses, getMembers, MemberPublic } from "@/lib/api";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import theme from "styles/theme";

export async function getStaticProps() {
  const members: MemberPublic[] = await getMembers();
  const focuses: Focus[] = await getFocuses();
  return {
    props: {
      allMembers: members.map((mem) => ({
        ...mem,
        // mutate & add active prop
        focus: mem.focus
          ? mem.focus.map((foc) => ({ ...foc, active: false }))
          : [],
      })),
      allFocuses: focuses
        .filter((focus) => focus.count > 0)
        .sort((a, b) => b.count - a.count),
    },
    revalidate: 60,
  };
}

export default function HomePage({ allMembers, allFocuses }) {
  const [members, setMembers] = useState<DirectoryMember[]>(allMembers);
  const [focuses, setFocuses] = useState<FocusPickerFocus[]>(allFocuses);

  const handleFilterByFocuses = (id?: string) => {
    setFocuses(
      focuses.map((foc) => ({
        ...foc,
        // add false active prop
        active: id ? (id === foc.id ? !foc.active : foc.active) : false,
      }))
    );
  };

  useEffect(() => {
    const activeFocuses = focuses.filter((foc) => foc.active);
    const membersWithFocuses = members
      .map((mem) => ({
        ...mem,
        focus: mem.focus.map((foc) => ({
          ...foc,
          // update member focuses if filtered
          active: activeFocuses.map((foc) => foc.id).includes(foc.id),
        })),
      }))
      // sort by number of focuses set
      .sort((a, b) => {
        const firstActive = a.focus
          .map((foc) => foc.active)
          .filter((foc) => foc).length;
        const nextActive = b.focus
          .map((foc) => foc.active)
          .filter((foc) => foc).length;
        // if same count, randomize
        if (nextActive === firstActive) return 0.5 - Math.random();
        // or sort by
        return nextActive > firstActive ? 1 : -1;
      });

    setMembers(membersWithFocuses);
  }, [focuses]);

  return (
    <>
      <Head>
        <title>Hawaiians in Technology</title>
        <link id="favicon" rel="alternate icon" href="/favicon.ico" />
        <MetaTags />
      </Head>
      <Nav primaryNav={{ show: true }} />
      <div className="home-splash">
        <Title className="m0 p0" text="Hawaiians*in&nbsp;Technology" />
      </div>
      <div>
        <aside>
          {focuses && (
            <FocusPicker
              focuses={focuses}
              onFilterClick={handleFilterByFocuses}
            />
          )}
          <h5>
            <strong>{members.length}</strong> kanaka
          </h5>
        </aside>
        <main>{members && <MemberDirectory members={members} />}</main>
      </div>
      <style jsx>{`
        .home-splash {
          margin: 0 1rem;
          padding-top: 26vh;
        }
        @media screen and (min-width: ${theme.layout.breakPoints.small}) {
          .home-splash {
            margin: 0 2rem;
          }
        }
        main {
          padding: 0 1rem;
        }
        @media screen and (min-width: ${theme.layout.breakPoints.medium}) {
          main {
            padding: 0 1rem;
          }
        }
        aside {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin: 8rem 0 2rem;
          padding: 0 1rem;
        }
        h5 {
          margin: 0;
          text-align: right;
          font-size: 1.125rem;
          color: ${theme.color.text.alt2};
          font-weight: 400;
        }
        h5 strong {
          color: ${theme.color.text.alt};
          font-weight: 500;
        }
        @media screen and (min-width: ${theme.layout.breakPoints.small}) {
          aside {
            padding: 0 2rem;
          }
        }
      `}</style>
    </>
  );
}
