import { initializeAdmin } from "@/lib/firebase-helpers/private/initializeAdmin";
import * as admin from "firebase-admin";
import {
  FirebaseMemberFieldsEnum,
  StatusEnum,
  FirebaseTablesEnum,
  FirebaseDefaultValuesEnum,
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
import {
  DocumentReference,
  addDoc,
  collection,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { useEmailCloaker } from "@/helpers";
import {
  addLabelRef,
  addMemberToLabels,
  addPendingReviewRecord,
} from "../public/directory";
import { addSecureEmail, getIdByEmail } from "./emails";
import { db } from "@/lib/firebase";

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
  let userId = "";
  if (token) {
    isAdmin = await verifyAdminToken(token, false);
    if (!isAdmin) {
      console.warn("Token provided is not authorized");
    }
    userEmail = await verifyEmailAuthToken(token);
    userId = await getIdByEmail(userEmail);
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

        if (isAdmin || userId === member.id) {
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

interface CreateMemberFields {
  name: string;
  email: string;
  location: string;
  website?: string;
  link?: string;
  focusesSelected?: string | string[];
  focusSuggested?: string;
  title?: string;
  yearsExperience?: string;
  industriesSelected?: string | string[];
  industrySuggested?: string;
  companySize?: string;
  recordID?: string;
  unsubscribed?: boolean;
}

const idToRef = async (
  labelId: string,
  collectionName: string,
): Promise<DocumentReference> => {
  const collectionRef = collection(db, collectionName);
  const docRef = doc(collectionRef, labelId);
  return docRef;
};

const idsToRefs = async (
  labelIds: string | string[],
  collectionName: string,
): Promise<DocumentReference[]> => {
  if (typeof labelIds === "string") {
    labelIds = [labelIds];
  }
  const refs = [];
  for (const labelId of labelIds) {
    const labelRef = await idToRef(labelId, collectionName);
    refs.push(labelRef);
  }
  return refs;
};

const addMember = async (
  member: CreateMemberFields,
): Promise<DocumentReference> => {
  try {
    const collectionRef = collection(db, FirebaseTablesEnum.MEMBERS);
    const maskedEmail = useEmailCloaker(member.email);
    const data = {
      ...member,
      last_modified: serverTimestamp(),
      last_modified_by: FirebaseDefaultValuesEnum.LAST_MODIFIED_BY,
      masked_email: maskedEmail,
      requests: "",
      status: StatusEnum.PENDING,
      unsubscribed: member.unsubscribed,
    };
    delete data.email; // Don't store email in the member record
    const docRef = await addDoc(collectionRef, data);
    addPendingReviewRecord(docRef, FirebaseTablesEnum.MEMBERS);
    addSecureEmail(member.email, docRef);
    return docRef;
  } catch (error) {
    console.error("Error adding member: ", error);
    throw error;
  }
};

export const addMemberToFirebase = async (
  fields: CreateMemberFields,
): Promise<DocumentReference> => {
  let member = {
    company_size: fields.companySize,
    email: fields.email,
    focuses: [],
    industries: [],
    link: fields.website, //TODO: Remove "website" input param and replace with "link"
    location: fields.location,
    name: fields.name,
    regions: [],
    title: fields.title,
    years_experience: fields.yearsExperience,
    unsubscribed: fields.unsubscribed,
  };

  // Handle focuses
  let focuses: DocumentReference[] = [];
  if (fields.focusesSelected) {
    const selectedFocusesRefs = await idsToRefs(
      fields.focusesSelected,
      "focuses",
    );
    focuses = [...focuses, ...selectedFocusesRefs];
  }
  if (fields.focusSuggested) {
    const focusRef = await addLabelRef(fields.focusSuggested, "focuses");
    focuses = [...focuses, focusRef];
  }
  if (focuses) member.focuses = focuses;

  // Handle industries
  let industries: DocumentReference[] = [];
  if (fields.industriesSelected) {
    const selectedIndustriesRefs = await idsToRefs(
      fields.industriesSelected,
      "industries",
    );
    industries = [...industries, ...selectedIndustriesRefs];
  }
  if (fields.industrySuggested) {
    const industryRef = await addLabelRef(
      fields.industrySuggested,
      "industries",
    );
    industries = [...industries, industryRef];
  }
  if (industries) member.industries = industries;

  return new Promise(async (resolve, reject) => {
    try {
      const docRef = await addMember(member);
      await addMemberToLabels(focuses, docRef);
      await addMemberToLabels(industries, docRef);
      resolve(docRef);
    } catch (error) {
      console.error("Error adding member:", error);
      reject(error);
    }
  });
};
