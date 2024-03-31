import {
  getMemberRef,
  deleteReferences,
  addMemberToReferences,
  getReferences,
  addLabelRef,
  addMemberToLabels,
} from "@/lib/firebase-helpers/public/directory";
import { FirebaseMemberFieldsEnum, FirebaseTablesEnum } from "@/lib/enums";
import { DocumentReference } from "@firebase/firestore";

export const fieldNameToTable = {
  [FirebaseMemberFieldsEnum.INDUSTRIES]: FirebaseTablesEnum.INDUSTRIES,
  [FirebaseMemberFieldsEnum.FOCUSES]: FirebaseTablesEnum.FOCUSES,
  [FirebaseMemberFieldsEnum.REGIONS]: FirebaseTablesEnum.REGIONS,
};

export const updatePublicFilterReferences = async (
  id: string,
  oldReferenceIds: string[],
  newReferenceIds: string[],
  filterName: string,
  currentUser: string,
): Promise<[DocumentReference[], DocumentReference[]]> => {
  const newReferences: DocumentReference[] = await getReferences(
    newReferenceIds,
    fieldNameToTable[filterName],
  );
  const oldReferences = await getReferences(
    oldReferenceIds,
    fieldNameToTable[filterName],
  );
  const referencesToDelete: DocumentReference[] = oldReferences.filter(
    (ref) => !newReferences.includes(ref),
  );
  const referencesToAdd: DocumentReference[] = newReferences.filter(
    (ref) => !oldReferences.includes(ref),
  );
  const memberRefPublic = await getMemberRef(id);
  await deleteReferences(memberRefPublic, referencesToDelete);
  await addMemberToReferences(memberRefPublic, referencesToAdd, currentUser);
  return [referencesToAdd, referencesToDelete];
};
