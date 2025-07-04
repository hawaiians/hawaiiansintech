import {
  DocumentReference,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { FirebaseTablesEnum, StatusEnum } from "../enums";
import { db } from "../firebase";
import { DocumentData } from "./interfaces";
import { PickerFilter } from "@/components/filters/FilterPicker";

export default function serverSideOnly(moduleObject) {
  if (typeof window !== "undefined") {
    throw new Error("This module can only be used on the server-side.");
  }
  return moduleObject;
}

export async function getReferences(
  referenceIds: string[],
  table: FirebaseTablesEnum,
): Promise<DocumentReference[]> {
  const references = [];
  for (const referenceId of referenceIds) {
    const reference = doc(db, table, referenceId);
    references.push(reference);
  }
  return references;
}

export async function deleteDocument(docRef: DocumentReference) {
  const documentSnapshot = await getDoc(docRef);
  if (documentSnapshot.exists()) {
    try {
      await deleteDoc(docRef);
      console.log("Document successfully deleted:", docRef.id);
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  }
}

export async function getFirebaseTable(
  table: FirebaseTablesEnum,
  approved: boolean = false,
): Promise<DocumentData[]> {
  const documentsCollection = collection(db, table);
  let q = query(documentsCollection);
  if (approved === true) {
    q = query(documentsCollection, where("status", "==", StatusEnum.APPROVED));
  }
  const documentsSnapshot = await getDocs(q);
  const documentsData = documentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    fields: doc.data(),
  }));
  return documentsData;
}

export function filterLookup(
  items: PickerFilter[],
  memberData?: string[],
  returnFirstName: boolean = false,
) {
  if (memberData && Array.isArray(memberData) && memberData.length !== 0) {
    const results = memberData.map((item) => {
      return (
        items
          .filter((thisItem) => item === thisItem.id)
          .map((item) => {
            return {
              name: item.name || null,
              id: item.id || null,
              status: "approved",
            };
          })[0] || null
      );
    });
    return returnFirstName ? results[0].name : results;
  }
  return null;
}
