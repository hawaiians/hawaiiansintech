import { DocumentReference } from "firebase/firestore";
import {
  addLabelRef,
  addMemberToLabels,
  getMemberRef,
} from "../public/directory";
import { fieldNameToTable } from "../public/filters";
import * as admin from "firebase-admin";
import { verifyServerSide } from "./general";

export const addNewLabel = async (
  id: string,
  newFitler: string,
  filterName: string,
  currentUser: string,
  docRef: admin.firestore.DocumentReference,
) => {
  verifyServerSide();
  const memberRefPublic = await getMemberRef(id);
  const newLabelRef = await addLabelRef(
    newFitler,
    fieldNameToTable[filterName],
  );
  await addMemberToLabels([newLabelRef], memberRefPublic);
  const writeResult = await docRef.update({
    [filterName]: admin.firestore.FieldValue.arrayUnion(
      ...[admin.firestore().doc(newLabelRef.path)],
    ),
    last_modified: admin.firestore.FieldValue.serverTimestamp(),
    last_modified_by: currentUser || "admin edit",
  });
  console.log(`Added new label ${newFitler} : ${writeResult}`);
};

export const updateAdminFilterReferences = async (
  referencesToAdd: DocumentReference[],
  referencesToDelete: DocumentReference[],
  docRef: admin.firestore.DocumentReference,
  filterName: string,
  currentUser: string,
) => {
  verifyServerSide();
  const adminReferencesToAdd = referencesToAdd.map((ref) =>
    admin.firestore().doc(ref.path),
  );
  const adminReferencesToDelete = referencesToDelete.map((ref) =>
    admin.firestore().doc(ref.path),
  );
  if (adminReferencesToDelete.length !== 0) {
    await docRef.update({
      [filterName]: admin.firestore.FieldValue.arrayRemove(
        ...adminReferencesToDelete,
      ),
      last_modified: admin.firestore.FieldValue.serverTimestamp(),
      last_modified_by: currentUser || "admin edit",
    });
  }
  if (adminReferencesToAdd.length !== 0) {
    await docRef.update({
      [filterName]: admin.firestore.FieldValue.arrayUnion(
        ...adminReferencesToAdd,
      ),
      last_modified: admin.firestore.FieldValue.serverTimestamp(),
      last_modified_by: currentUser || "admin edit",
    });
  }
};
