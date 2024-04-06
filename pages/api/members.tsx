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
import {
  SendConfirmationEmailProps,
  sendConfirmationEmails,
} from "@/lib/email/confirmation-email";

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

const sendSgEmail = async ({
  email,
  firebaseId,
  name,
}: SendConfirmationEmailProps) => {
  return new Promise((resolve, reject) => {
    sendConfirmationEmails({
      email: email,
      firebaseId: firebaseId,
      name: name,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const isEmailUsed = await emailExists(req.body.email);
  if (!isEmailUsed) {
    const docRef: DocumentReference = await addMemberToFirebase({
      ...req.body,
    }).then((body) => {
      console.log("✅ added member to firebase");
      return body;
    });
    await sendSgEmail({
      email: req.body.email,
      firebaseId: docRef.id,
      name: req.body.name,
    }).then(() => {
      console.log("✅ sent member email via sendgrid");
    });
    return res.status(200).json({ message: "Successfully added member." });
  } else {
    return res.status(422).json({
      error: "This email is associated with another member.",
      body: "We only allow one member per email address.",
    });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    checkMethods(req.method, ["GET", "PUT", "POST"]);
    if (req.method === "GET") {
      getHandler(req, res);
    } else if (req.method === "PUT") {
      putHandler(req, res);
    } else if (req.method === "POST") {
      postHandler(req, res);
    } else {
      res.status(405).json({ message: "Only GET and PUT requests allowed" });
    }
  } catch (error) {
    return handleApiErrors(error, res);
  }
}
