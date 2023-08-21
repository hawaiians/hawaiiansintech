import { LinkedInData } from "@/pages/api/linkedin-data";
import { getFirestore } from "@firebase/firestore";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithCustomToken,
  signInWithPopup,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import {
  SessionStorageEnum,
  SignInTypeImgEnum,
  SignInTypeNameEnum,
} from "./enums";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SEND,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
const app = initializeApp(firebaseConfig);
const provider = new GoogleAuthProvider();
export const auth = getAuth(app);
export const db = getFirestore();
export const storage = getStorage(app);
export const signInWithGoogle = () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      sessionStorage.setItem(
        SessionStorageEnum.USER_NAME,
        result.user.displayName
      );
      sessionStorage.setItem(SessionStorageEnum.USER_ID, result.user.uid);
      sessionStorage.setItem(SessionStorageEnum.USER_EMAIL, result.user.email);
      sessionStorage.setItem(
        SessionStorageEnum.EMAIL_IS_VERIFIED,
        String(result.user.emailVerified)
      );
      sessionStorage.setItem(
        SessionStorageEnum.SIGN_IN_TYPE_NAME,
        SignInTypeNameEnum.GOOGLE
      );
      sessionStorage.setItem(
        SessionStorageEnum.SIGN_IN_TYPE_IMAGE,
        SignInTypeImgEnum.GOOGLE
      );
      location.reload();
    })
    .catch((error) => {
      console.error("Error signing in with popup:", error);
    });
};
export const signInWithLinkedInData = (linkedInData: LinkedInData) => {
  signInWithCustomToken(auth, linkedInData.token)
    .then((result) => {
      const name = linkedInData.firstName + " " + linkedInData.lastName;
      sessionStorage.setItem(SessionStorageEnum.USER_NAME, name);
      sessionStorage.setItem(SessionStorageEnum.USER_ID, linkedInData.token);
      sessionStorage.setItem(SessionStorageEnum.USER_EMAIL, linkedInData.email);
      sessionStorage.setItem(
        SessionStorageEnum.PROFILE_PICTURE,
        linkedInData.profilePicture
      );
      sessionStorage.setItem(
        SessionStorageEnum.SIGN_IN_TYPE_NAME,
        SignInTypeNameEnum.LINKEDIN
      );
      sessionStorage.setItem(
        SessionStorageEnum.SIGN_IN_TYPE_IMAGE,
        SignInTypeImgEnum.LINKEDIN
      );
    })
    .catch((error) => {
      console.error("Error signing in with linkedInData:", error);
    });
};
export const signOut = () => {
  auth.signOut();
  sessionStorage.removeItem(SessionStorageEnum.USER_NAME);
  sessionStorage.removeItem(SessionStorageEnum.USER_ID);
  sessionStorage.removeItem(SessionStorageEnum.USER_EMAIL);
  sessionStorage.removeItem(SessionStorageEnum.PROFILE_PICTURE);
  sessionStorage.removeItem(SessionStorageEnum.EMAIL_IS_VERIFIED);
  sessionStorage.removeItem(SessionStorageEnum.SIGN_IN_TYPE_NAME);
  sessionStorage.removeItem(SessionStorageEnum.SIGN_IN_TYPE_IMAGE);
  location.reload();
};
