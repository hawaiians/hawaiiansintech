import { FirebaseTablesEnum } from "@/lib/enums";
import { initializeAdmin } from "@/lib/firebase-helpers/initializeAdmin";
import { NextApiRequest, NextApiResponse } from "next";
import * as admin from "firebase-admin";
import {
  handleApiErrors,
  InvalidBodyParamTypeError,
  ItemNotFoundError,
  KeyVerificationError,
} from "@/lib/api-helpers/errors";
import {
  checkMethods,
  checkBodyParams,
  checkQueryParams,
} from "@/lib/api-helpers/format";
import crypto from "crypto";
import { DocumentReference } from "firebase-admin/firestore";

async function generateUnsubKey(docRef: DocumentReference): Promise<string> {
  const unsubKey = crypto.randomBytes(32).toString("hex");
  const writeResult = await docRef.update({
    unsubscribe_key: unsubKey,
    last_modified: admin.firestore.FieldValue.serverTimestamp(),
    last_modified_by: "hit-unsub-key",
  });
  if (!writeResult.writeTime) {
    throw new Error("Failed to write unsubKey to database");
  }
  return unsubKey;
}

async function getSecureMemberData(uid: string): Promise<DocumentReference> {
  await initializeAdmin();
  const docRef = admin
    .firestore()
    .collection(FirebaseTablesEnum.SECURE_MEMBER_DATA)
    .doc(uid);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new ItemNotFoundError(`Member with uid ${uid} does not exist`);
  }
  return docRef;
}

async function getUnsubKey(uid: string): Promise<string> {
  const docRef = await getSecureMemberData(uid);
  const doc = await docRef.get();
  return doc.get("unsubscribe_key") || (await generateUnsubKey(docRef));
}

async function updateUnsub(uid: string, unsubKey: string) {
  const docRef = await getSecureMemberData(uid);
  const doc = await docRef.get();
  if (doc.get("unsubscribe_key") !== unsubKey) {
    throw new KeyVerificationError("Unauthorized key");
  }
  if (doc.get("unsubscribed") !== true) {
    const memberDocRef = admin
      .firestore()
      .collection(FirebaseTablesEnum.MEMBERS)
      .doc(uid);
    const memberDoc = await memberDocRef.get();
    if (!memberDoc.exists) {
      throw new ItemNotFoundError(`Member with uid ${uid} does not exist`);
    }
    const writeResult = await memberDocRef.update({
      unsubscribed: true,
      last_modified: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (!writeResult.writeTime) {
      throw new Error("Failed to write unsubscribed to database");
    }
  }
}

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  checkQueryParams(req, { uid: "string" });
  if (Array.isArray(req.query.uid)) {
    throw new InvalidBodyParamTypeError("id", "string");
  }
  const unsubKey = await getUnsubKey(req.query.uid);
  return res.status(200).send({ unsubKey });
}

async function patchHandler(req: NextApiRequest, res: NextApiResponse) {
  checkBodyParams(req, {
    uid: "string",
    unsubKey: "string",
  });
  await updateUnsub(req.body.uid, req.body.unsubKey);
  res.status(200).json({
    message: `Successfully unsubscribed member with uid ${req.body.uid}`,
  });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    checkMethods(req.method, ["GET", "PATCH"]);
    if (req.method === "GET") {
      await getHandler(req, res);
    } else if (req.method === "PATCH") {
      await patchHandler(req, res);
    } else {
      res.status(405).json({ message: "Only GET and PATCH requests allowed" });
    }
  } catch (error) {
    return handleApiErrors(error, res);
  }
}
