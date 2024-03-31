import { FirebaseTablesEnum, StatusEnum } from "@/lib/enums";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import {
  DocumentData,
  MemberEmail,
  getFirebaseTable,
} from "@/lib/firebase-helpers/api";
import { verifyServerSide } from "./general";

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
          console.log("Error getting document:", secM.id);
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
