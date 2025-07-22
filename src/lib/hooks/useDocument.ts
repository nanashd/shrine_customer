import { useEffect, useState } from "react";
import { doc, onSnapshot, DocumentData, getFirestore } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useDocument<T = DocumentData>(collectionPath: string, docId: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!docId) return;
    setLoading(true);
    const unsubscribe = onSnapshot(
      doc(db, collectionPath, docId),
      (snapshot) => {
        setData(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as T) : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [collectionPath, docId]);

  return { data, loading, error };
} 