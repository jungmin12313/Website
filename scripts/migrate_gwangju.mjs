import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateGwangju() {
  console.log("Starting migration: '광주' -> '광주광역시'...");
  const snapshot = await getDocs(collection(db, 'festivals'));
  let count = 0;

  for (const d of snapshot.docs) {
    const data = d.data();
    if (data.location && data.location.includes("광주") && !data.location.includes("광주광역시")) {
      const newLocation = data.location.replace("광주", "광주광역시");
      await updateDoc(doc(db, 'festivals', d.id), { location: newLocation });
      console.log(`Updated [${data.name}]: ${data.location} -> ${newLocation}`);
      count++;
    }
  }

  console.log(`Migration finished. ${count} records updated.`);
  process.exit(0);
}

migrateGwangju().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
