import type { NextApiRequest, NextApiResponse } from "next";
import { generateRecommendationCopy } from "@/lib/ai/recommendationCopy";
import type { MemberPublic } from "@/lib/firebase-helpers/interfaces";

type NewMemberData = {
  yearsExperience?: string;
  focusesSelected?: string[] | string;
  industriesSelected?: string[] | string;
};

type RequestBody = {
  member?: MemberPublic;
  newMemberData?: NewMemberData;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body as RequestBody;
  const member = body?.member;
  const newMemberData = body?.newMemberData;

  if (!member || !member.id) {
    return res.status(400).json({ error: "Missing or invalid member" });
  }

  try {
    const message = await generateRecommendationCopy(
      member,
      newMemberData || {},
    );

    return res.status(200).json({ message });
  } catch (error) {
    console.error("Error generating recommendation copy:", error);
    return res.status(500).json({
      error: "Failed to generate recommendation copy",
    });
  }
}
