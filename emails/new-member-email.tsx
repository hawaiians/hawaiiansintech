import { DISCORD_URL, GITHUB_URL } from "@/pages/about";
import {
  Button,
  Text,
  Row,
  Column,
  Section,
  Link,
} from "@react-email/components";
import * as React from "react";
import CTABlock from "./ui/cta-block";
import Base from "./ui/base";

export default function NewMemberEmail({
  memberName = "Name Inoa",
  location = "SF, CA",
  firebaseId = "id-placeholder",
  email = "placeholder@hawaiiansintech.org",
  title = "Software Engineer",
  suggested = ["Focus", "Industry"],
  url = "https://hawaiiansintech.org",
}: {
  memberName: string;
  location: string;
  title: string;
  url: string;
  firebaseId: string;
  email: string;
  suggested?: string[];
}) {
  const FIREBASE_URL = `https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/data/~2Fmembers~2F${firebaseId}`;

  const name = memberName ?? `Name Inoa`;

  return (
    <Base
      preview="Our little hui grows by one (yeah, you)"
      title={`New Member Submission from ${name}`}
    >
      <Text className="text-xl text-center">
        New Submission: <strong>{name}</strong>
      </Text>

      <CTABlock
        nodes={[
          <Text className="text-center text-stone-600 text-xs pr-4 my-0">
            You are receiving this because you are a community manager for their
            region
          </Text>,
          <Button
            href={FIREBASE_URL}
            className="border-stone-200 text-sm tracking-wide border border-solid text-stone-600 px-2 py-1 rounded text-center"
          >
            Review {name}
          </Button>,
        ]}
      />
      <Text>
        A new member <strong className="font-semibold">{name}</strong> submitted
        their information.
      </Text>
      <Section className="text-sm">
        <Row>
          <Column className="w-12 text-4xl">🔗</Column>
          <Column>
            Check that their URL works.{" "}
            <Link href={url} className="text-stone-500 underline">
              {url}
            </Link>
          </Column>
        </Row>
        <Row className="my-2">
          <Column className="w-12 text-4xl">💬</Column>
          <Column>
            Check freeform field &ldquo;
            <strong className="font-semibold">{title}</strong>
            &rdquo; for misspelling and/or appropriateness.{" "}
            {suggested && (
              <>
                They also suggested{" "}
                {suggested.map((s, i) => (
                  <>
                    &ldquo;<strong className="font-semibold">{s}</strong>&rdquo;
                    {(i < suggested.length - 2 && ", ") ||
                      (i === suggested.length - 2 && " and ")}
                  </>
                ))}
                .
              </>
            )}
          </Column>
        </Row>
        <Row className="m-0">
          <Column className="w-12 text-4xl">🌏</Column>
          <Column>
            Parse &ldquo;
            <strong className="font-semibold">{location}</strong>&rdquo; for the
            Location and indexed/searchable Region. Always try to merge, when
            appropriate. Seek the use of proper diacriticals, where{" "}
            <Link
              href="https://wehewehe.org"
              className="text-stone-500 underline"
            >
              wehewehe.org
            </Link>{" "}
            is your friend!
          </Column>
        </Row>
      </Section>
      {firebaseId && (
        <Text className="text-xs mt-2 mb-0 italic text-stone-400 text-center">
          {firebaseId}
        </Text>
      )}
      {/* //   const firebaseUrl = `https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/data/~2Fmembers~2F${firebaseId}`;
  //   const MESSAGE_BODY_2 = `
  //     <p>Get started by opening up the pending <a href="${firebaseUrl}">Submission</a> on Firebase.</p>
  //     <p><strong>1. Review the submission.</strong></p><ul><li>For Location, we'll need to manually look over and connect the relevant Region (which is a separate, indexed/searchable field).</li><li>If any freeform fields (location/title/suggested/etc.) were used, check for misspelling and/or appropriateness. Remember to try use proper diacriticals (wehewehe.org is your friend).</li><li>Check that their URL works.</li></ul>
  //     <p><strong>2. Reach out to ${name} at ${email} about their new submission.</strong> Be concise/clear about intention of suggestions.</p>
  //     <p><strong>3. If all goes well,</strong> double-check all fields and move their Status to Approved!</p>
  //     ${
  //       firebaseId
  //         ? `<p><em><strong>Member ID:</strong> ${firebaseId}</em></p>`
  //         : ""
  //     }
  //   `;
  //   const emailTemplate2 = getEmailTemplate({
  //     body: MESSAGE_BODY_2,
  //     prependMessage: name,
  //     title: `New Member Submission from ${name}`,
  //   });
  //   await SendGrid.sendMultiple({
  //     to: ADMIN_EMAILS,
  //     from: {
  //       email: REPLY_EMAIL,
  //       name: "Hawaiians in Tech",
  //     },
  //     subject: `New Submission: ${name}`,
  //     html: emailTemplate2,
  //   }); */}
    </Base>
  );
}
