import { DocumentData, getFirebaseTable, MemberEmail } from "@/lib/api";
import { verifyAdminToken, verifyAuthHeader } from "@/lib/auth";
import { FirebaseTablesEnum } from "@/lib/enums";
import { db } from "@/lib/firebase";
import { getEmails } from "@/lib/firebase-helpers/private/directory";
import { doc, getDoc } from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

interface getEmailsProps {
  /**
   * Required check if the user is admin via verifyAdminToken(token)
   *  - If the user is an admin, returns secured emails
   */
  token?: string;
}

async function getMemberEmails({
  token,
}: getEmailsProps): Promise<MemberEmail[]> {
  if (!token) {
    throw new Error("Missing token");
  }
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server");
  }

  const isAdmin = await verifyAdminToken(token);
  if (!isAdmin) {
    throw new Error("Unauthorized");
  }

  return await getEmails();
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
    const emails = await getMemberEmails({ token: token });
    return res.status(200).send({ emails });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}
