import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  startAfter,
  updateDoc,
  addDoc,
  query,
  where,
  limit,
  deleteDoc,
  DocumentSnapshot,
  DocumentData,
  CollectionReference,
  DocumentReference,
  Query,
  WhereFilterOp,
  QueryDocumentSnapshot,
  QueryConstraint,
  Firestore,
  getCountFromServer,
  setDoc,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import { app } from "@/app/_providers/FirebaseProvider";

const db: Firestore = getFirestore(app);

let lastApiCall = "";

// Type for documents with id and path
type DocumentWithMetadata = {
  id: string;
  path: string;
} & DocumentData;

/// FONCTIONS PRIVEES UTILITAIRES ===============================

// check for duplicate API calls in development mode
function checkDuplicateApiCall(apiCall: string) {
  if (lastApiCall === apiCall) {
    if (process.env.NEXT_PUBLIC_IS_PROD != "true" && typeof window !== "undefined") {
      alert("Duplicate Firestore API call detected (see console for details)");
      console.warn(`Duplicate Firestore API call detected: ${apiCall}`);
    }
    // TODO : si on est en production notifier via discord
  }
  lastApiCall = apiCall;
}

/**
 * Convertit un DocumentSnapshot en objet avec id, path et data
 */
function convertDocumentSnapshot(doc: DocumentSnapshot<DocumentData>): DocumentWithMetadata | null {
  if (!doc.exists()) return null;

  return {
    id: doc.id,
    path: doc.ref.path,
    ...doc.data(),
  };
}

/**
 * Remove undefined values from an object recursively
 */
function removeUndefinedValues<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Ne pas traiter si c'est un DocumentReference Firestore
  if (
    obj &&
    typeof obj === "object" &&
    typeof (obj as Record<string, unknown>).path === "string" &&
    typeof (obj as Record<string, unknown>).firestore === "object" &&
    typeof (obj as Record<string, unknown>).id === "string"
  ) {
    return obj;
  }

  // Check if this is a Firestore special field value (arrayUnion, arrayRemove, deleteField, etc.)
  if (obj && typeof obj === "object" && (obj as Record<string, unknown>)._methodName) {
    return obj; // Return special field values as-is
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => removeUndefinedValues(item)) as T;
  }

  if (typeof obj === "object" && obj !== null) {
    const cleaned: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = removeUndefinedValues(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

/**
 * Convertit un tableau de QueryDocumentSnapshot en objets avec id, path et data
 */
function convertQueryDocumentSnapshots(docs: QueryDocumentSnapshot<DocumentData>[]): DocumentWithMetadata[] {
  return docs.map((doc) => ({
    id: doc.id,
    path: doc.ref.path,
    ...doc.data(),
  }));
}

/// FONCTIONS DE CALL API FIREBASE ===============================

export async function getDocumentsInCollection(
  collectionName: string,
  start?: DocumentSnapshot,
  docsLimit: number = 10,
): Promise<DocumentWithMetadata[]> {
  checkDuplicateApiCall(`getDocumentsInCollection(${collectionName}, ${start ? start.id : "null"}, ${docsLimit})`);
  return new Promise(async (resolve, reject) => {
    try {
      const additionalQueryParams: QueryConstraint[] = [];
      if (docsLimit) additionalQueryParams.push(limit(docsLimit));
      if (start) additionalQueryParams.push(startAfter(start));
      const q = query(collection(db, collectionName), ...additionalQueryParams);

      const res = await getDocs(q);
      resolve(convertQueryDocumentSnapshots(res.docs));
    } catch (error) {
      reject(error);
    }
  });
}

export async function getDocumentsByQuery(queryObj: Query<DocumentData>): Promise<DocumentWithMetadata[]> {
  checkDuplicateApiCall(`getDocumentsByQuery(${queryObj})`);
  return new Promise(async (resolve, reject) => {
    try {
      const res = await getDocs(queryObj);
      resolve(convertQueryDocumentSnapshots(res.docs));
    } catch (error) {
      reject(error);
    }
  });
}

export async function getDocumentsWhere(
  collectionName: string,
  field: string,
  operator: WhereFilterOp,
  value: unknown,
  docsLimit: number | null = null,
  startAfterDoc?: QueryDocumentSnapshot<DocumentData>,
): Promise<DocumentWithMetadata[]> {
  checkDuplicateApiCall(
    `getDocumentsWhere(${collectionName}, ${field}, ${operator}, ${value}, ${docsLimit}, ${
      startAfterDoc ? startAfterDoc.id : "null"
    })`,
  );
  return new Promise(async (resolve, reject) => {
    try {
      const add: QueryConstraint[] = [];
      if (docsLimit) add.push(limit(docsLimit));
      if (startAfterDoc) add.push(startAfter(startAfterDoc));

      const q = query(collection(db, collectionName), where(field, operator, value), ...add);

      const res = await getDocs(q);
      resolve(convertQueryDocumentSnapshots(res.docs));
    } catch (error) {
      reject(error);
    }
  });
}

export async function countDocumentsWhere(
  collectionName: string,
  field: string,
  operator: WhereFilterOp,
  value: unknown,
): Promise<number> {
  checkDuplicateApiCall(`countDocumentsWhere(${collectionName}, ${field}, ${operator}, ${value})`);
  return new Promise(async (resolve, reject) => {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const res = await getCountFromServer(q);
      resolve(res.data().count);
    } catch (error) {
      reject(error);
    }
  });
}

export async function getDocument(
  path: string,
  ref?: DocumentReference<DocumentData>,
): Promise<DocumentWithMetadata | null> {
  checkDuplicateApiCall(`getDocument(${path}, ${ref ? ref.id : "null"})`);
  const docSnapshot = await getDoc(ref ? ref : getDocumentReference(path));
  return convertDocumentSnapshot(docSnapshot);
}

export async function createDocument(
  path: string,
  data: DocumentData,
  merge: boolean = true,
): Promise<DocumentReference<DocumentData>> {
  checkDuplicateApiCall(`createDocument(${path}, data, ${merge})`);
  const cleanedData = removeUndefinedValues(data);

  if (path[0] === "/") {
    path = path.slice(1); // Remove leading slash for Firestore paths
  }

  const segments = path.split("/");

  if (segments.length % 2 === 0) {
    // Odd number of segments = document path, use setDoc with specific ID
    const docRef = doc(db, path);
    await setDoc(docRef, cleanedData, { merge });
    return docRef;
  } else {
    // Even number of segments = collection path, use addDoc to auto-generate ID
    return addDoc(collection(db, path), cleanedData);
  }
}

export async function UpdateDocument(path: string, data: Partial<DocumentData>): Promise<void> {
  checkDuplicateApiCall(`UpdateDocument(${path}, data)`);
  const ref = getDocumentReference(path);
  const cleanedData = removeUndefinedValues(data);
  return updateDoc(ref, cleanedData);
}

export async function deleteDocument(path: string, ref?: DocumentReference<DocumentData>): Promise<void> {
  checkDuplicateApiCall(`deleteDocument(${path}, ${ref ? ref.id : "null"})`);
  return deleteDoc(ref ? ref : getDocumentReference(path));
}

/// FONCTIONS AVEC CACHE LOCALE ===============================

export function getDocumentReference(path: string): DocumentReference<DocumentData> {
  if (typeof window === "undefined") return doc(db, path); // fallback for SSR
  checkDuplicateApiCall(`getDocumentReference(${path})`);
  if (path[0] !== "/") path = "/" + path;

  // Try to get from localStorage cache
  const cacheKey = `firestore_doc_ref_${path}`;
  let cached = null;
  try {
    cached = localStorage.getItem(cacheKey);
  } catch (e) {
    // Ignore localStorage errors in case it's not available
    if (process.env.NEXT_PUBLIC_IS_PROD != "true" && typeof window !== "undefined") {
      console.error("Erreur lors de la lecture de la référence de document Firestore depuis le cache localStorage:", e);
    }
  }

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Optionally, you can add cache expiration logic here
      // Return a new doc ref from cached path (Firestore doc() is idempotent)
      return doc(db, parsed.path);
    } catch (e) {
      // If cache is corrupted, ignore and continue
      if (process.env.NEXT_PUBLIC_IS_PROD != "true" && typeof window !== "undefined") {
        console.error(
          "Erreur lors de la lecture de la référence de document Firestore depuis le cache localStorage:",
          e,
        );
      }
    }
  }

  // Not cached, create and cache
  const ref = doc(db, path);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ path }));
    } catch (e) {
      // Ignore storage errors (e.g., quota exceeded)
      if (process.env.NEXT_PUBLIC_IS_PROD != "true" && typeof window !== "undefined")
        console.error("Erreur lors de la mise en cache de la référence de document Firestore:", e);
    }
  }
  return ref;
}

export function getCollectionReference(collectionName: string): CollectionReference<DocumentData> {
  if (typeof window === "undefined") return collection(db, collectionName); // fallback for SSR

  checkDuplicateApiCall(`getCollectionReference(${collectionName})`);

  const cacheKey = `firestore_col_ref_${collectionName}`;
  let cached = null;
  try {
    cached = localStorage.getItem(cacheKey);
  } catch (e) {
    // Ignore localStorage errors in case it's not available
    if (process.env.NEXT_PUBLIC_IS_PROD != "true" && typeof window !== "undefined") {
      console.error(
        "Erreur lors de la lecture de la référence de collection Firestore depuis le cache localStorage:",
        e,
      );
    }
  }

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      // Return a new collection ref from cached path
      return collection(db, parsed.path);
    } catch (e) {
      // If cache is corrupted, ignore and continue
      if (process.env.NEXT_PUBLIC_IS_PROD != "true" && typeof window !== "undefined") {
        console.error(
          "Erreur lors de la lecture de la référence de collection Firestore depuis le cache localStorage:",
          e,
        );
      }
    }
  }
  // Not cached, create and cache
  const colRef = collection(db, collectionName);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ path: collectionName }));
    } catch (e) {
      // Ignore storage errors
      if (process.env.NEXT_PUBLIC_IS_PROD != "true" && typeof window !== "undefined")
        console.error("Erreur lors de la mise en cache de la référence de collection Firestore:", e);
    }
  }
  return colRef;
}

export function subscribeToDocument(
  path: string,
  onData: (data: DocumentWithMetadata | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe {
  const ref = doc(db, path);
  return onSnapshot(
    ref,
    (snapshot) => {
      onData(convertDocumentSnapshot(snapshot));
    },
    (error) => {
      onError?.(error);
    },
  );
}
