import { handleApiErrors } from "@/lib/api-helpers/errors";
import { checkBodyParams, checkMethods } from "@/lib/api-helpers/format";
import { sendVerificationEmail } from "@/lib/firebase-helpers/emails";
import { NextApiRequest, NextApiResponse } from "next";

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  checkBodyParams(req, {
    email: "string",
    url: "string",
  });
  sendVerificationEmail(req.body.email, req.body.url);
  res.status(200).json({
    message: `Successfully sent verification email to ${req.body.email}`,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    checkMethods(req.method, ["POST"]);
    if (req.method === "POST") {
      await postHandler(req, res);
    } else {
      res.status(405).json({ message: "Only POST requests allowed" });
    }
  } catch (error) {
    return handleApiErrors(error, res);
  }
}
