import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import "dotenv/config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function createCollections() {
  // Firestore はコレクションのみの作成は不可。ダミードキュメントを1件ずつ追加
  await setDoc(doc(collection(db, "customers")), { _init: true });
  await setDoc(doc(collection(db, "sizes")), { _init: true });
  await setDoc(doc(collection(db, "orders")), { _init: true });
  console.log("Collections created (with dummy docs)");
}

createCollections().then(() => process.exit(0)); 