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
  getMembers,
  updateMember,
} from "@/lib/firebase-helpers/private/members";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    checkMethods(req.method, ["GET", "PUT"]);
    if (req.method === "GET") {
      getHandler(req, res);
    } else if (req.method === "PUT") {
      putHandler(req, res);
    } else {
      res.status(405).json({ message: "Only GET and PUT requests allowed" });
    }
  } catch (error) {
    return handleApiErrors(error, res);
  }
}
