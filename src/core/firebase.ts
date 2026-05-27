import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signInWithPopup, 
  onAuthStateChanged, 
  User,
  sendEmailVerification,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where, orderBy, limit, getDocFromServer } from 'firebase/firestore';
import type { DocumentSnapshot, QuerySnapshot, DocumentData } from 'firebase/firestore';

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json' assert { type: 'json' };

// Initialize Firebase SDK
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firestore connection successful");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firestore Error: The client is offline. Please check your Firebase configuration.");
    } else {
      console.error("Firestore Connection Test Error:", error);
    }
  }
}
testConnection();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export {
  signInWithPopup,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit
};

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string | null;
  email: string;
  updatedAt: any;
  githubConnected?: boolean;
  githubUser?: string | null;
  avatar?: string | null;
  bio?: string;
  location?: string;
  website?: string;
}

export const syncUserProfile = (user: User, callback: (profile: UserProfile | null) => void) => {
  const userRef = doc(db, 'users', user.uid);
  return onSnapshot(userRef, (snapshot: any) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (error: unknown) => {
    handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
  });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, 'users', uid);
  try {
    await setDoc(userRef, {
      ...data,
      uid,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${uid}`);
  }
};

export interface UserApiKey {
  uid: string;
  key: string;
  lastGeneratedAt: any;
}

export const syncApiKey = (uid: string, callback: (apiKey: UserApiKey | null) => void) => {
  const keyRef = doc(db, 'api_keys', uid);
  return onSnapshot(keyRef, (snapshot: any) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserApiKey);
    } else {
      callback(null);
    }
  }, (error: unknown) => {
    handleFirestoreError(error, OperationType.GET, `api_keys/${uid}`);
  });
};

export const generateUserApiKey = async (uid: string) => {
  const keyRef = doc(db, 'api_keys', uid);
  const newKey = `od_live_${Math.random().toString(36).substr(2, 16)}_${Math.random().toString(36).substr(2, 16)}`;
  try {
    await setDoc(keyRef, {
      uid,
      key: newKey,
      lastGeneratedAt: serverTimestamp()
    }, { merge: true });
    return newKey;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `api_keys/${uid}`);
  }
};

// --- Project Persistence ---

export interface ProjectMetadata {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  framework: string;
  language: string;
  createdAt: any;
  updatedAt: any;
}

export const saveProject = async (metadata: ProjectMetadata) => {
  const projectRef = doc(db, 'projects', metadata.id);
  try {
    await setDoc(projectRef, {
      ...metadata,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `projects/${metadata.id}`);
  }
};

export const saveProjectFile = async (projectId: string, file: { path: string; content: string; language: string }) => {
  // Use a hash or encoded path as document ID to avoid issues with slashes in paths
  const fileId = btoa(file.path).replace(/\//g, '_').replace(/\+/g, '-');
  const fileRef = doc(db, 'projects', projectId, 'files', fileId);
  try {
    await setDoc(fileRef, {
      ...file,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `projects/${projectId}/files/${fileId}`);
  }
};

export const syncProjects = (ownerId: string, callback: (projects: ProjectMetadata[]) => void) => {
  const q = query(collection(db, 'projects'), where('ownerId', '==', ownerId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot: any) => {
    const projects = snapshot.docs.map((doc: any) => doc.data() as ProjectMetadata);
    callback(projects);
  }, (error: unknown) => {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  });
};

export const loadProjectFiles = async (projectId: string) => {
  const { getDocs } = await import('firebase/firestore');
  const filesRef = collection(db, 'projects', projectId, 'files');
  try {
    const snapshot = await getDocs(filesRef);
    return snapshot.docs.map((doc: any) => doc.data() as { path: string; content: string; language: string });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `projects/${projectId}/files`);
    return [];
  }
};
