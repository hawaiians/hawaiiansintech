import {
  FirebaseDefaultValuesEnum,
  FirebaseTablesEnum,
  StatusEnum,
} from "@/lib/enums";
import { DocumentReference, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  DocumentData,
  MemberEmail,
  getFirebaseTable,
} from "@/lib/firebase-helpers/api";
import { verifyServerSide } from "./general";
import { initializeAdmin } from "./initializeAdmin";
import * as admin from "firebase-admin";

export async function getEmails(
  approved: boolean = false,
): Promise<MemberEmail[]> {
  verifyServerSide();
  const secureMemberData: DocumentData[] = await getFirebaseTable(
    FirebaseTablesEnum.SECURE_MEMBER_DATA,
  );
  const emails = await Promise.all(
    secureMemberData
      .filter((secM) => secM.fields.email !== "")
      .map(async (secM) => {
        const docRef = doc(db, FirebaseTablesEnum.MEMBERS, secM.id);
        try {
          const docSnapshot = await getDoc(docRef);
          if (docSnapshot.exists()) {
            return {
              id: secM.id,
              email: secM.fields.email,
              name: docSnapshot.data().name || null,
              emailAbbr: docSnapshot.data().masked_email || null,
              status: docSnapshot.data().status || null,
              unsubscribed: docSnapshot.data().unsubscribed || false,
            };
          }
        } catch (error) {
          console.error(error);
        }
      }),
  );
  const existingEmails = emails.filter(
    (email) => email !== null && email !== undefined,
  );
  const approvedEmails = existingEmails.filter(
    (email) => email.status && email.status === StatusEnum.APPROVED,
  );
  return approved ? approvedEmails : existingEmails;
}

export async function getEmailById(userId: string): Promise<MemberEmail> {
  verifyServerSide();
  const emails = await getEmails();
  const email = emails.find((e) => e && e.id === userId);
  return email;
}

export const getIdByEmail = async (email: string): Promise<string> => {
  verifyServerSide();
  const emails = await getEmails();
  const emailObj = emails.find((e) => e && e.email === email);
  return emailObj ? emailObj.id : null;
};

export const emailExists = async (email: string): Promise<boolean> => {
  verifyServerSide();
  const secureMemberData: DocumentData[] = await getFirebaseTable(
    FirebaseTablesEnum.SECURE_MEMBER_DATA,
  );
  const emailExists = secureMemberData.some(
    (secM) => secM.fields.email === email,
  );
  return emailExists;
};

export const addSecureEmail = async (
  email: string,
  memberDocRef: DocumentReference,
) => {
  await initializeAdmin();
  const collectionRef = admin
    .firestore()
    .collection(FirebaseTablesEnum.SECURE_MEMBER_DATA);
  const docRef = collectionRef.doc(memberDocRef.id); // Use memberDocRef ID as new doc ID
  const data = {
    last_modified: admin.firestore.FieldValue.serverTimestamp(),
    last_modified_by: FirebaseDefaultValuesEnum.LAST_MODIFIED_BY,
    email: email,
    member: memberDocRef.path,
  };
  await docRef.set(data);
  return docRef;
};
