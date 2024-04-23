import { Text, Link, Section } from "@react-email/components";
import * as React from "react";
import Base from "./ui/base";
import Logo from "./ui/logo";
import Layout from "./ui/layout";
import List from "./ui/list";

export default function _Newsletter() {
  return (
    <Base
      preview="Our little hui grows by one (yeah, you)"
      title="Welcome to Hawaiians in Tech"
      align="left"
    >
      <Layout border={false}>
        <Logo align="left" />
        <Text>
          <span className="block text-lg font-semibold leading-loose">
            <em>Huuui!</em> Hawaiians in Tech
          </span>
          <strong className="text-5xl font-semibold">Newsletter</strong>
        </Text>
        <Text>Aloha e gangie,</Text>
        <Text>
          We&rsquo;re excited to extand an invite to all members of our
          Hawaiians in Tech hui to our very first community event we&rsquo;re
          co-hosting in the Bay Area! Mahalo to our friends at both the Amazon
          and Google Pasifika chapters for their kokua in getting us all
          together and for their generous support of this event.
        </Text>
      </Layout>
      <Layout accentColor="violet">
        <Text className="my-0 inline-block rounded-full bg-violet-100 px-2 py-1 text-xs font-semibold tracking-wide text-violet-800">
          BAY AREA COMMUNITY EVENT
        </Text>
        <Text className="mb-2 text-base">
          Wednesday, May 29th, 2024, 5:30 – 8PM
        </Text>
        <Text className="mb-2 mt-0 text-2xl font-semibold">
          Pasifika in Tech Happy Hour @ Twitch HQ
        </Text>
        <Link
          href="https://maps.app.goo.gl/grtUs962CMPEkXaP9"
          className="mb-12 text-inherit"
        >
          <Text className="inline font-bold text-violet-700">Twitch</Text>
          <Text className="inline font-normal text-inherit">
            350 Bush St., SF, CA 94104
          </Text>
        </Link>
      </Layout>
      <Layout border={false}>
        <Section className="text-center">
          <Text className="m-0 mb-4 inline-block rounded-full bg-stone-800 px-4 py-1 text-center text-sm font-semibold tracking-wider text-white">
            RSVP to this email
          </Text>
        </Section>
        <List
          nodes={[
            {
              icon: "✅",
              label: (
                <>
                  <strong>... if you can make it!</strong> A loose headcount
                  will help us make sure there&rsquo;s enough food and drinks
                  for everyone. We also plan to send out a calendar invite with
                  more details as the event approaches.
                </>
              ),
            },
            {
              icon: "🌺",
              label: (
                <>
                  <strong>
                    ... want to send your aloha but will miss this one.
                  </strong>{" "}
                  It&rsquo;d be great to figure out your situation so we can
                  make sure you&rsquo;d be able to join us next time (like, a
                  weekend potluck at Golden Gate Park, anyone?)
                </>
              ),
            },
            {
              icon: "💼",
              label: (
                <>
                  <strong>
                    ... have a Pasifika-focused group or hui at your work.
                  </strong>{" "}
                  Drop us a line—we&rsquo;d love to expand our network and build
                  pilina with more of our Pacific Islander ʻohana across the
                  tech industry!
                </>
              ),
            },
            // {
            //   icon: "🌺",
            //   label: (
            //     <>
            //       <strong>Want to help support our lei-making workshop.</strong>{" "}
            //       The day will really be about hanging out and talking story,
            //       but we&rsquo;d love to have an activity to give everyone
            //       something fun to do.
            //     </>
            //   ),
            // },
            {
              icon: "💡",
              label: (
                <>
                  <strong>
                    ... have any questions or ideas for the event.
                  </strong>{" "}
                  The day will really be about hanging out and talking story,
                  but if you have any questions, thoughts, or concerns, please
                  feel free to let us know.
                </>
              ),
            },
          ]}
        />
        <Text>
          Can&rsquo;t wait to catch up with everyone, old friends and new, at
          this casual pau hana. We are hoping to make this a regular thing, so
          come out and help us kick it off right!
        </Text>
        <Text className="mb-0">E mālama,</Text>
        <Text className="mt-0">Taylor Kekai Ho</Text>
      </Layout>
      <Text className="my-0 text-center text-stone-500">
        <Link
          href="https://hawaiiansintech.org/about?utm_source=confirmation-email-footer"
          className="text-xs text-inherit"
        >
          About
        </Link>
        <span className="mx-1">·</span>
        <Link
          href="https://hawaiiansintech.org/privacy-policy?utm_source=confirmation-email-footer"
          className="text-xs text-inherit"
        >
          Privacy Policy
        </Link>
      </Text>
    </Base>
  );
}
