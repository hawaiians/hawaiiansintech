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
      sessionStorage.setItem("user", result.user.displayName);
      sessionStorage.setItem("uid", result.user.uid);
      sessionStorage.setItem("email", result.user.email);
      sessionStorage.setItem(
        "emailIsVerified",
        String(result.user.emailVerified)
      );
    })
    .catch((error) => {
      console.log("Error signing in with popup:", error);
    });
};
export const signInWithLinkedInData = (linkedInData: LinkedInData) => {
  signInWithCustomToken(auth, linkedInData.token)
    .then((result) => {
      const name = linkedInData.firstName + " " + linkedInData.lastName;
      sessionStorage.setItem("user", name);
      sessionStorage.setItem("email", linkedInData.email);
      sessionStorage.setItem("profilePicture", linkedInData.profilePicture);
    })
    .catch((error) => {
      console.log("Error signing in with linkedInData:", error);
    });
};
export const signOutWithGoogle = () => {
  auth.signOut();
  sessionStorage.removeItem("user");
  location.reload();
};
