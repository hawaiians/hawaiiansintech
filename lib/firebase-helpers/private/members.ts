import { initializeAdmin } from "@/lib/firebase-helpers/private/initializeAdmin";
import * as admin from "firebase-admin";
import {
  FirebaseMemberFieldsEnum,
  StatusEnum,
  FirebaseTablesEnum,
} from "@/lib/enums";
import { updatePublicFilterReferences } from "@/lib/firebase-helpers/public/filters";
import {
  addNewLabel,
  updateAdminFilterReferences,
} from "@/lib/firebase-helpers/private/filters";
import { verifyServerSide } from "./general";
import { memberConverter } from "../../firestore-converters/member";
import {
  DocumentData,
  focusLookup,
  getFirebaseData,
  getFirebaseTable,
  industryLookup,
  regionLookup,
  MemberPublic,
} from "@/lib/firebase-helpers/api";
import { verifyAdminToken, verifyEmailAuthToken } from "@/lib/api-helpers/auth";

export async function getMembers(token?: string): Promise<{
  members: MemberPublic[];
  regions: DocumentData[];
  industries: DocumentData[];
  focuses: DocumentData[];
}> {
  verifyServerSide();
  const members = await getFirebaseData(
    FirebaseTablesEnum.MEMBERS,
    memberConverter,
  );

  let isAdmin = false;
  let userEmail = "";
  if (token) {
    isAdmin = await verifyAdminToken(token, false);
    if (!isAdmin) {
      console.warn("Token provided is not authorized");
    }
    userEmail = await verifyEmailAuthToken(token);
  }

  const focusesData = await getFirebaseTable(FirebaseTablesEnum.FOCUSES);
  const industriesData = await getFirebaseTable(FirebaseTablesEnum.INDUSTRIES);
  const regionsData = await getFirebaseTable(FirebaseTablesEnum.REGIONS);

  return {
    members: members
      .filter((member) => isAdmin || member.status === StatusEnum.APPROVED)
      .map((member) => {
        const {
          regions,
          industries,
          focuses,
          lastModifiedBy,
          maskedEmail,
          lastModified,
          emailAbbr,
          requests,
          unsubscribed,
          ...rest
        } = member;

        let memberObject = {
          ...rest,
          region: regionLookup(regionsData, regions),
          industry: industryLookup(industriesData, industries),
          focus: focusLookup(focusesData, focuses),
        };

        if (isAdmin || userEmail === member.email) {
          memberObject = {
            ...memberObject,
            lastModified: lastModified.toDate().toLocaleString(),
            emailAbbr: maskedEmail,
            requests: requests,
            unsubscribed: unsubscribed,
          };
        }

        return memberObject;
      })
      .filter((value) => value !== null)
      .sort((a, b) => a.name.localeCompare(b.name)),
    focuses: focusesData,
    industries: industriesData,
    regions: regionsData,
  };
}

export const updateMember = async (
  memberData: MemberPublic,
  currentUser: string,
  currentUserIsAdmin: boolean,
) => {
  verifyServerSide();
  await initializeAdmin();
  const docRef = admin
    .firestore()
    .collection(FirebaseTablesEnum.MEMBERS)
    .doc(memberData.id);
  const doc = await docRef.get();

  if (!doc.exists) {
    throw new Error(`Member with uid ${memberData.id} does not exist`);
  }

  const data = doc.data();

  // Handle filter references
  const fields = [
    FirebaseMemberFieldsEnum.FOCUSES.toString(),
    FirebaseMemberFieldsEnum.INDUSTRIES.toString(),
    FirebaseMemberFieldsEnum.REGIONS.toString(),
  ];
  const fieldSingular = {
    // TODO: Update fields to plural in MemberPublic
    [FirebaseMemberFieldsEnum.FOCUSES.toString()]: "focus",
    [FirebaseMemberFieldsEnum.INDUSTRIES.toString()]: "industry",
    [FirebaseMemberFieldsEnum.REGIONS.toString()]: "region",
  };
  for (const field of fields) {
    const oldReferenceIds = data[field] ? data[field].map((ref) => ref.id) : [];
    const newReferenceIds =
      // TODO: Update region to regions
      field === FirebaseMemberFieldsEnum.REGIONS.toString() &&
      memberData[fieldSingular[field]]
        ? [memberData[fieldSingular[field]]]
        : memberData[fieldSingular[field]]
        ? memberData[fieldSingular[field]].map((ref) => ref.id)
        : [];
    const [referencesToAdd, referencesToDelete] =
      await updatePublicFilterReferences(
        memberData.id,
        oldReferenceIds,
        newReferenceIds,
        field,
        currentUser,
      );
    updateAdminFilterReferences(
      referencesToAdd,
      referencesToDelete,
      docRef,
      field,
      currentUser,
    );
  }

  // Handle new filter suggestions
  const suggested = [
    FirebaseMemberFieldsEnum.FOCUSES.toString(),
    FirebaseMemberFieldsEnum.INDUSTRIES.toString(),
  ];
  for (const field of suggested) {
    const suggestedField = memberData[fieldSingular[field] + "Suggested"];
    if (suggestedField) {
      await addNewLabel(
        memberData.id,
        suggestedField,
        field,
        currentUser,
        docRef,
      );
    }
  }

  // Have to drop the fields that are not in the database or are handled above
  const {
    emailAbbr,
    yearsExperience,
    region,
    companySize,
    focus,
    industry,
    lastModified,
    focusSuggested,
    industrySuggested,
    ...droppedMemberData
  } = memberData;

  // If currentUser is not an admin, don't allow them to change the status
  if (!currentUserIsAdmin) {
    droppedMemberData.status = data.status;
  }

  const writeResult = await docRef.update({
    ...droppedMemberData,
    company_size: companySize,
    last_modified: admin.firestore.FieldValue.serverTimestamp(),
    last_modified_by: currentUser || "admin edit",
    masked_email: emailAbbr,
    years_experience: yearsExperience,
  });

  console.log(
    `Updated member ${memberData.id} with ${JSON.stringify(
      memberData,
    )}: ${writeResult}`,
  );
};
