import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAdLTLVNqvIp9Na0-_MSlgimrIjxvKODI4",
  authDomain: "naeil-b568d.firebaseapp.com",
  projectId: "naeil-b568d",
  storageBucket: "naeil-b568d.firebasestorage.app",
  messagingSenderId: "874697359011",
  appId: "1:874697359011:web:00cd13f249a26965830916"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore (Database)
export const db = getFirestore(app);
