import { handleApiErrors } from "@/lib/api-helpers/errors";
import { checkBodyParams, checkMethods } from "@/lib/api-helpers/format";
import { NextApiRequest, NextApiResponse } from "next";

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  checkBodyParams(req, {
    "cf-turnstile-response": "string",
  });
  const token = req.body("cf-turnstile-response");
  const ip = req.headers["CF-Connecting-IP"];

  let formData = new FormData();
  formData.append("secret", process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  formData.append("remoteip", typeof ip === "string" ? ip : ip[0]);

  const result = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
    },
  );
  const outcome = await result.json();
  if (!outcome.success) {
    throw new Error("Turnstile verification failed");
  }
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
