import {
  SendConfirmationEmailProps,
  sendConfirmationEmails,
} from "@/lib/email/confirmation-email";
import {
  FirebaseDefaultValuesEnum,
  FirebaseTablesEnum,
  LoginTypeNameEnum,
  StatusEnum,
} from "@/lib/enums";
import { db } from "@/lib/firebase";
import { initializeAdmin } from "@/lib/firebase-admin";
import Client from "@sendgrid/client";
import SendGrid from "@sendgrid/mail";
import admin from "firebase-admin";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  DocumentReference,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEmailCloaker } from "helpers";

SendGrid.setApiKey(process.env.SENDGRID_API_KEY);
Client.setApiKey(process.env.SENDGRID_API_KEY);

const addLabelRef = async (
  label: string,
  collectionName: string
): Promise<DocumentReference> => {
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where("name", "==", label));
  const querySnapshot = await getDocs(q);
  let docRef: DocumentReference;
  if (!querySnapshot.empty) {
    // Catches the case where the label already exists but it's pending review
    docRef = querySnapshot.docs[0].ref;
  } else {
    docRef = await addDoc(collectionRef, {
      name: label,
      status: StatusEnum.PENDING,
      last_modified: serverTimestamp(),
      members: [],
    });
  }
  return docRef;
};

const addMemberToLabels = async (
  labelReferences: DocumentReference[],
  memberRef: DocumentReference
) => {
  for (const labelRef of labelReferences) {
    await updateDoc(labelRef, {
      members: arrayUnion(memberRef),
      last_modified: serverTimestamp(),
    });
  }
};

const addSecureEmailAndAuth = async (
  email: string,
  memberDocRef: DocumentReference,
  authType: LoginTypeNameEnum,
  uid: string
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
    linkedin_uid: authType === LoginTypeNameEnum.LINKEDIN ? uid : "",
    google_uid: authType === LoginTypeNameEnum.GOOGLE ? uid : "",
  };
  await docRef.set(data);
  return docRef;
};

const addMember = async (
  member: MemberFieldsEgressFirebase
): Promise<DocumentReference> => {
  const collectionRef = collection(db, FirebaseTablesEnum.MEMBERS);
  const maskedEmail = useEmailCloaker(member.email);
  const maskedEmailString = `${maskedEmail[0]}...${maskedEmail[1]}${maskedEmail[2]}`;
  const data = {
    ...member,
    last_modified: serverTimestamp(),
    last_modified_by: FirebaseDefaultValuesEnum.LAST_MODIFIED_BY,
    masked_email: maskedEmailString,
    requests: "",
    status: StatusEnum.PENDING,
    unsubscribed: member.unsubscribed,
    linkedin_picture: member.linkedin_picture ? member.linkedin_picture : "",
  };
  // Don't store email, uid, auth_type in the general member record
  delete data.email;
  delete data.auth_type;
  delete data.uid;
  const docRef = await addDoc(collectionRef, data);
  addSecureEmailAndAuth(member.email, docRef, member.auth_type, member.uid);
  return docRef;
};

const emailExists = async (email: string): Promise<boolean> => {
  const collectionRef = collection(db, FirebaseTablesEnum.MEMBERS);
  const q = query(collectionRef, where("email", "==", email));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return false;
  }
  return true;
};

const idToRef = async (
  labelId: string,
  collectionName: string
): Promise<DocumentReference> => {
  const collectionRef = collection(db, collectionName);
  const docRef = doc(collectionRef, labelId);
  return docRef;
};

const idsToRefs = async (
  labelIds: string | string[],
  collectionName: string
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

interface MemberFieldsApiBody {
  name: string;
  email: string;
  location: string;
  verifiedUserId: string;
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
  linkedInPicture?: string;
  authType?: LoginTypeNameEnum;
}

interface MemberFieldsEgressFirebase {
  name: string;
  email: string;
  location: string;
  link: string;
  company_size: string;
  focuses: DocumentReference[];
  industries: DocumentReference[];
  regions: DocumentReference[];
  title: string;
  years_experience: string;
  unsubscribed: boolean;
  linkedin_picture: string;
  uid: string;
  auth_type: LoginTypeNameEnum;
}

const addToFirebase = async (
  fields: MemberFieldsApiBody
): Promise<DocumentReference> => {
  let member = {
    name: fields.name,
    email: fields.email,
    location: fields.location,
    link: fields.website, //TODO: Remove "website" input param and replace with "link"
    company_size: fields.companySize,
    focuses: [],
    industries: [],
    regions: [],
    title: fields.title,
    years_experience: fields.yearsExperience,
    unsubscribed: fields.unsubscribed,
    linkedin_picture: fields.linkedInPicture,
    uid: fields.verifiedUserId,
    auth_type: fields.authType,
  } as MemberFieldsEgressFirebase;

  // Handle focuses
  let focuses: DocumentReference[] = [];
  if (fields.focusesSelected) {
    const selectedFocusesRefs = await idsToRefs(
      fields.focusesSelected,
      "focuses"
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
      "industries"
    );
    industries = [...industries, ...selectedIndustriesRefs];
  }
  if (fields.industrySuggested) {
    const industryRef = await addLabelRef(
      fields.industrySuggested,
      "industries"
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

const sendSgEmail = async ({
  email,
  firebaseId,
  name,
}: SendConfirmationEmailProps) => {
  return new Promise((resolve, reject) => {
    sendConfirmationEmails({
      email: email,
      firebaseId: firebaseId,
      name: name,
    })
      .then((response) => {
        resolve(response);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

class TokenVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TokenVerificationError";
  }
}

const verifyToken = async (token: string): Promise<string> => {
  try {
    await initializeAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;

    // Check if the token has expired
    const now = Math.floor(Date.now() / 1000); // Convert to Unix timestamp (in seconds)
    if (decodedToken.exp < now) {
      throw new TokenVerificationError("Authentication token has expired");
    }

    return uid;
  } catch (error) {
    if (error.code === "auth/argument-error") {
      throw new TokenVerificationError("Invalid authentication token");
    }
    const error_msg = "Error verifying token: " + error.message;
    throw new TokenVerificationError(error_msg);
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }
  try {
    const verifiedUserId = await verifyToken(req.body.token);
    const isEmailUsed = await emailExists(req.body.email);
    if (!isEmailUsed) {
      const docRef: DocumentReference = await addToFirebase({
        ...req.body,
        verifiedUserId: verifiedUserId,
      }).then((body) => {
        console.log("✅ added member to firebase");
        return body;
      });
      await sendSgEmail({
        email: req.body.email,
        firebaseId: docRef.id,
        name: req.body.name,
      }).then(() => {
        console.log("✅ sent member email via sendgrid");
      });
      return res.status(200).json({ message: "Successfully added member." });
    } else {
      return res.status(422).json({
        error: "This email is associated with another member.",
        body: "We only allow one member per email address.",
      });
    }
  } catch (error) {
    if (error instanceof TokenVerificationError) {
      return res.status(401).json({ error: error.message });
    }
    return res.status(error.statusCode || 500).json({
      error: "Gonfunnit, looks like something went wrong!",
      body: "Please try again later.",
    });
  }
}
