// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  // apiKey: "AIzaSyAc3AKKxNm61weAsjPZ5-B8fcvBQXii-6g",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-estate-d47d6.firebaseapp.com",
  projectId: "mern-estate-d47d6",
  storageBucket: "mern-estate-d47d6.appspot.com",
  messagingSenderId: "952032951122",
  appId: "1:952032951122:web:26efa2f464a02c465f588b"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);