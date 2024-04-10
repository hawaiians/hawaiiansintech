import {
  verifyAdminOrEmailAuthToken,
  verifyAdminToken,
  verifyAuthHeader,
} from "@/lib/api-helpers/auth";
import { NextApiRequest, NextApiResponse } from "next";
import { memberPublicValidator } from "@/lib/validators/memberPublicValidator";
import { handleApiErrors } from "@/lib/api-helpers/errors";
import { checkMethods, checkBodyParams } from "@/lib/api-helpers/format";
import {
  addMemberToFirebase,
  getMembers,
  updateMember,
} from "@/lib/firebase-helpers/private/members";
import { emailExists } from "@/lib/firebase-helpers/private/emails";
import { DocumentReference } from "firebase/firestore";
import { sendConfirmationEmails } from "@/lib/email";

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  checkMethods(req.method, ["GET"]);
  const authHeader = req.headers.authorization;
  let data;

  if (authHeader) {
    const token = authHeader.split(" ")[1];
    data = await getMembers(token);
  } else {
    console.log({ message: "No authorization header included" });
    data = await getMembers();
  }

  return res.status(200).json({
    message: "Successfully fetched members and supporting data.",
    members: data.members,
    focuses: data.focuses,
    industries: data.industries,
    regions: data.regions,
  });
}

async function putHandler(req: NextApiRequest, res: NextApiResponse) {
  checkBodyParams(req, {
    memberPublic: "object",
    currentUser: "string",
  });
  try {
    await memberPublicValidator.validate(req.body.memberPublic);
  } catch (error) {
    return res.status(422).json({ message: error.message });
  }
  const token = await verifyAuthHeader(req);
  const isAdmin = await verifyAdminToken(token, false);
  await verifyAdminOrEmailAuthToken(req.body.memberPublic.id, token);

  await updateMember(req.body.memberPublic, req.body.currentUser, isAdmin).then(
    (writeResult) => {
      console.debug("writeResult for /update-member:", writeResult);
    },
  );
  return res.status(200).json({
    message: `Successfully updated ${req.body.memberPublic.id}`,
  });
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const {
    email,
    name,
    location,
    title,
    website, // TODO: Remove "website" input param and replace with "link"
  } = req.body;

  const isEmailUsed = await emailExists(email);
  if (isEmailUsed) {
    console.log("🚫 email already exists");
    return res.status(409).json({
      error: "409",
      body: "Sorry, please use a different email.",
    });
  }
  const docRef: DocumentReference = await addMemberToFirebase({
    ...req.body,
  }).then((body) => {
    console.log("✅ added member to firebase");
    return body;
  });
  const { id } = docRef;

  await sendConfirmationEmails({
    email: email,
    recordID: id,
    name: name,
    location: location,
    title: title,
    link: website, // TODO: Remove "website" input param and replace with "link"
  })
    .then(() => {
      console.log("✅ sent 2 emails via sendgrid");
    })
    .catch((error) => {
      console.error("🚫 Error sending email:", error);
      throw error;
    });

  return res.status(200).json({ message: "Successfully added member." });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    checkMethods(req.method, ["GET", "PUT", "POST"]);
    if (req.method === "GET") {
      await getHandler(req, res);
    } else if (req.method === "PUT") {
      await putHandler(req, res);
    } else if (req.method === "POST") {
      await postHandler(req, res);
    } else {
      res.status(405).json({ message: "Only GET and PUT requests allowed" });
    }
  } catch (error) {
    console.log("🚫 Error in /members:", error);
    return handleApiErrors(error, res);
  }
}
