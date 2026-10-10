import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import type { DocumentData } from 'firebase/firestore';

// ============================================================================
// Firebase Configuration (for storage only)
// ============================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID,
};

// ============================================================================
 // Firebase Authentication + Firestore Configuration
 // ============================================================================
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;
export let auth: Auth | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
} else {
  console.warn('[Odyseus] Firebase is not configured. Set the VITE_FIREBASE_* environment variables to enable authentication and Firestore.');
}

// ============================================================================
// Unified User Types
// ============================================================================
// Supabase user type from @supabase/supabase-js
export interface AuthUser {
  id: string;
  email: string | null;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
  email_confirmed_at: string | null;
  aud: string;
  role: string;
}

// Firebase-style user for compatibility layer
interface FirebaseCompatibleUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  providerData: { providerId: string; displayName: string | null; email: string | null; photoURL: string | null }[];
}

let currentSessionUser: FirebaseCompatibleUser | null = null;

const toFirebaseCompatibleUser = (user: User | null): FirebaseCompatibleUser | null => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName,
    photoURL: user.photoURL,
    providerData: user.providerData.map((provider) => ({
      providerId: provider.providerId,
      displayName: provider.displayName,
      email: provider.email,
      photoURL: provider.photoURL,
    })),
  };
};

const toAuthUser = (user: User | null): AuthUser | null => {
  if (!user) return null;
  return {
    id: user.uid,
    email: user.email,
    user_metadata: {
      full_name: user.displayName ?? undefined,
      avatar_url: user.photoURL ?? undefined,
    },
    created_at: user.metadata.creationTime ?? new Date().toISOString(),
    updated_at: user.metadata.lastSignInTime ?? user.metadata.creationTime ?? new Date().toISOString(),
    email_confirmed_at: user.emailVerified ? (user.metadata.creationTime ?? new Date().toISOString()) : null,
    aud: 'authenticated',
    role: 'authenticated',
  };
};

export interface AuthSession {
  user: AuthUser | null;
  access_token: string | null;
  refresh_token: string | null;
}

// ============================================================================
 // Firebase Authentication Helpers
 // ============================================================================
const requireFirebaseAuth = (): Auth => {
  if (!auth) throw new Error('Firebase Authentication is not configured for this deployment. Set the VITE_FIREBASE_* environment variables.');
  return auth;
};

export const signInWithPopup = async (provider: 'google' | 'github') => {
  const firebaseAuth = requireFirebaseAuth();
  const oauthProvider = provider === 'google'
    ? new GoogleAuthProvider()
    : new GithubAuthProvider();
  if (provider === 'google') oauthProvider.setCustomParameters({ prompt: 'select_account' });
  return firebaseSignInWithPopup(firebaseAuth, oauthProvider);
};

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  return firebaseSignInWithEmailAndPassword(requireFirebaseAuth(), email.trim(), password);
};

export const createUserWithEmailAndPassword = async (email: string, password: string, displayName?: string) => {
  const credential = await firebaseCreateUserWithEmailAndPassword(requireFirebaseAuth(), email.trim(), password);
  if (displayName?.trim()) {
    await firebaseUpdateProfile(credential.user, { displayName: displayName.trim() });
  }
  await firebaseSendEmailVerification(credential.user);
  return credential;
};

export const getAuthUser = (result: any): AuthUser | null => {
  return toAuthUser(result?.user ?? null);
};

export const sendEmailVerification = async (user: User | null) => {
  if (!user) throw new Error('Sign in before requesting email verification.');
  await firebaseSendEmailVerification(user);
};

export const sendPasswordResetEmail = async (email: string) => {
  await firebaseSendPasswordResetEmail(requireFirebaseAuth(), email.trim());
};

export const signOut = async () => {
  await firebaseSignOut(requireFirebaseAuth());
};

export const onAuthStateChanged = (callback: (user: AuthUser | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return firebaseOnAuthStateChanged(auth, (user) => {
    currentSessionUser = toFirebaseCompatibleUser(user);
    callback(toAuthUser(user));
  });
};

export const updateProfile = async (
  user: { id: string },
  metadata: { displayName?: string; photoURL?: string | null }
) => {
  const currentUser = requireFirebaseAuth().currentUser;
  if (!currentUser || currentUser.uid !== user.id) {
    throw new Error('The signed-in Firebase user does not match the profile being updated.');
  }
  await firebaseUpdateProfile(currentUser, {
    displayName: metadata.displayName,
    photoURL: metadata.photoURL ?? null,
  });
};

// ============================================================================
// Firebase Storage exports (keep for database operations)
// ============================================================================
export { db, doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where, orderBy, limit, getDocs };

export type { DocumentData };

// ============================================================================
// Error handling
// ============================================================================
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
      userId: currentSessionUser?.uid,
      email: currentSessionUser?.email ?? null,
      emailVerified: currentSessionUser?.emailVerified,
      isAnonymous: false,
      tenantId: null,
      providerInfo: currentSessionUser?.providerData?.map(p => ({
        providerId: p.providerId,
        displayName: p.displayName,
        email: p.email,
        photoUrl: p.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ============================================================================
// User Profile (Firestore)
// ============================================================================
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

export const syncUserProfile = (user: AuthUser, callback: (profile: UserProfile | null) => void) => {
  if (!db) {
    callback(null);
    return () => {};
  }
  const uid = user.id;
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snapshot: any) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as UserProfile);
    } else {
      callback(null);
    }
  }, (error: unknown) => {
    handleFirestoreError(error, OperationType.GET, `users/${uid}`);
  });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  if (!db) {
    console.warn('Firestore not configured');
    return;
  }
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

// ============================================================================
// API Keys (Firestore)
// ============================================================================
export interface UserApiKey {
  uid: string;
  key: string;
  lastGeneratedAt: any;
}

export const syncApiKey = (uid: string, callback: (apiKey: UserApiKey | null) => void) => {
  if (!db) {
    callback(null);
    return () => {};
  }
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
  if (!db) {
    console.warn('Firestore not configured');
    return null;
  }
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
    return null;
  }
};

// ============================================================================
// Project Persistence (Firestore)
// ============================================================================
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
  if (!db) {
    console.warn('Firestore not configured');
    return;
  }
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
  if (!db) {
    console.warn('Firestore not configured');
    return;
  }
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
  if (!db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, 'projects'), where('ownerId', '==', ownerId), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot: any) => {
    const projects = snapshot.docs.map((doc: any) => doc.data() as ProjectMetadata);
    callback(projects);
  }, (error: unknown) => {
    handleFirestoreError(error, OperationType.LIST, 'projects');
  });
};

export const loadProjectFiles = async (projectId: string) => {
  if (!db) {
    console.warn('Firestore not configured');
    return [];
  }
  const filesRef = collection(db, 'projects', projectId, 'files');
  try {
    const snapshot = await getDocs(filesRef);
    return snapshot.docs.map((doc: any) => doc.data() as { path: string; content: string; language: string });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `projects/${projectId}/files`);
    return [];
  }
};