import { FirebaseTablesEnum, StatusEnum } from "@/lib/enums";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import { Member, memberConverter } from "../../firestore-converters/member";
import { DocumentData, MemberEmail, getFirebaseTable } from "@/lib/api";

export interface referencesToDelete {
  memberRef: DocumentReference;
  focuses: DocumentReference[];
  industries: DocumentReference[];
  regions: DocumentReference[];
  secureMemberData: DocumentReference;
}

const verifyServerSide = () => {
  if (typeof window !== "undefined") {
    throw new Error("This function can only be called on the server");
  }
};

export async function getAllMemberReferencesToDelete(
  uid: string,
): Promise<referencesToDelete> {
  verifyServerSide();
  const documentRef = doc(db, FirebaseTablesEnum.MEMBERS, uid).withConverter(
    memberConverter,
  );
  const documentSnapshot = await getDoc(documentRef);
  if (!documentSnapshot.exists()) {
    return null;
  }
  const data = documentSnapshot.data();
  const returnData = {
    memberRef: documentRef,
    focuses: data.focuses,
    industries: data.industries,
    regions: data.regions,
    secureMemberData: doc(db, FirebaseTablesEnum.SECURE_MEMBER_DATA, uid),
  };
  return returnData;
}

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
