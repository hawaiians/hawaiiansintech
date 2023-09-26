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
import { LoginTypeImgEnum, LoginTypeNameEnum, StorageEnum } from "./enums";

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
      if (!result.user.emailVerified) {
        sessionStorage.setItem(
          StorageEnum.LOGIN_ERROR_MESSAGE,
          "Your Google email is not verified. Please sign in with a verified account."
        );
      } else {
        sessionStorage.setItem(StorageEnum.USER_NAME, result.user.displayName);
        sessionStorage.setItem(StorageEnum.USER_ID, result.user.uid);
        sessionStorage.setItem(StorageEnum.USER_EMAIL, result.user.email);
        sessionStorage.setItem(
          StorageEnum.EMAIL_IS_VERIFIED,
          String(result.user.emailVerified)
        );
        sessionStorage.setItem(
          StorageEnum.LOGIN_TYPE_NAME,
          LoginTypeNameEnum.GOOGLE
        );
        sessionStorage.setItem(
          StorageEnum.LOGIN_TYPE_IMAGE,
          LoginTypeImgEnum.GOOGLE
        );
        sessionStorage.setItem(StorageEnum.LOGIN_ERROR_MESSAGE, "");
      }
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
      sessionStorage.setItem(StorageEnum.USER_NAME, name);
      sessionStorage.setItem(StorageEnum.USER_ID, linkedInData.token);
      sessionStorage.setItem(StorageEnum.USER_EMAIL, linkedInData.email);
      sessionStorage.setItem(
        StorageEnum.PROFILE_PICTURE,
        linkedInData.profilePicture
      );
      sessionStorage.setItem(
        StorageEnum.LOGIN_TYPE_NAME,
        LoginTypeNameEnum.LINKEDIN
      );
      sessionStorage.setItem(
        StorageEnum.LOGIN_TYPE_IMAGE,
        LoginTypeImgEnum.LINKEDIN
      );
      sessionStorage.setItem(StorageEnum.LOGIN_ERROR_MESSAGE, "");
    })
    .catch((error) => {
      console.error("Error signing in with linkedInData:", error);
    });
};
export const signOut = (reload: boolean) => {
  auth.signOut();
  sessionStorage.removeItem(StorageEnum.USER_NAME);
  sessionStorage.removeItem(StorageEnum.USER_ID);
  sessionStorage.removeItem(StorageEnum.USER_EMAIL);
  sessionStorage.removeItem(StorageEnum.PROFILE_PICTURE);
  sessionStorage.removeItem(StorageEnum.EMAIL_IS_VERIFIED);
  sessionStorage.removeItem(StorageEnum.LOGIN_TYPE_NAME);
  sessionStorage.removeItem(StorageEnum.LOGIN_TYPE_IMAGE);
  if (reload) location.reload();
};
