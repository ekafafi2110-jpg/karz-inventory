import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCla9_BwOTFEOurzxAVwlbFPMVCtPM19_8",
  authDomain: "karz-inventory.firebaseapp.com",
  projectId: "karz-inventory",
  storageBucket: "karz-inventory.firebasestorage.app",
  messagingSenderId: "111646556696",
  appId: "1:111646556696:web:6523e3b805af443484f96d",
  measurementId: "G-W6PE5KWVQL"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
