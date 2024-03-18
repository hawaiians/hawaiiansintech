import { verifyAuthHeader, verifyEmailAuthToken } from "@/lib/auth";
import { getEmails } from "@/lib/firebase-helpers/private/directory";
import { NextApiRequest, NextApiResponse } from "next";

async function getMemberId({
  token,
  res,
}: {
  token?: string;
  res: NextApiResponse;
}): Promise<string> {
  if (!token) {
    throw new Error("Missing token");
  }
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server");
  }

  const memberEmail = await verifyEmailAuthToken(token);
  if (!memberEmail) {
    throw new Error("Unauthorized");
  }

  const getApprovedEmails = true; // Only get approved emails
  const emails = await getEmails(getApprovedEmails);

  const matchingMember = emails.find((email) => email.email === memberEmail);

  if (!matchingMember) {
    res.status(404).json({ error: "Member not found" });
    return;
  }
  return matchingMember.id;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Only GET requests allowed" });
  }

  try {
    const token = await verifyAuthHeader(req, res);
    if (!token) return;
    const memberId = await getMemberId({ token: token, res: res });
    if (!memberId) return;
    return res.status(200).send({ memberId });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}
