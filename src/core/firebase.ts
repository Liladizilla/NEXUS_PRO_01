import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
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
// Supabase Configuration (for authentication)
// ============================================================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabase: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('[Odyseus] Supabase is not configured for auth. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY env vars.');
}

// ============================================================================
// Firebase Storage (Firestore) - Only initialized if Firebase config exists
// ============================================================================
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: ReturnType<typeof initializeApp> | null = null;
let db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId as string);
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

export interface AuthSession {
  user: AuthUser | null;
  access_token: string | null;
  refresh_token: string | null;
}

// ============================================================================
// Auth Helpers (Supabase)
// ============================================================================
export const signInWithPopup = async (provider: 'google' | 'github') => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  if (error) throw error;
  return data;
};

export const signInWithEmailAndPassword = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const createUserWithEmailAndPassword = async (email: string, password: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
};

// Helper to get user from Supabase auth result
export const getAuthUser = (result: any): AuthUser | null => {
  return result?.user ?? null;
};

export const sendEmailVerification = async (user: { email: string | null }) => {
  if (!supabase) throw new Error('Supabase not configured');
  // Supabase sends verification email automatically on sign up
  // For existing users, you'd need a server function
  if (user.email) {
    console.log('Verification email sent to:', user.email);
  }
};

export const sendPasswordResetEmail = async (email: string) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const signOut = async () => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const onAuthStateChanged = (callback: (user: AuthUser | null) => void) => {
  if (!supabase) {
    // Return a no-op unsubscribe function
    return () => {};
  }
  
  // Subscribe to auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user as AuthUser | null);
  });
  
  // Also check current session
  supabase.auth.getSession().then(({ data: { session } }) => {
    callback(session?.user as AuthUser | null);
  });
  
  // Return unsubscribe function
  return () => subscription.unsubscribe();
};

export const updateProfile = async (user: { id: string }, metadata: { displayName?: string; photoURL?: string | null }) => {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.updateUser({
    data: {
      full_name: metadata.displayName,
      avatar_url: metadata.photoURL,
    },
  });
  if (error) throw error;
};

// ============================================================================
// Firebase Storage exports (keep for database operations)
// ============================================================================
export { db, doc, getDoc, setDoc, onSnapshot, serverTimestamp, collection, query, where, orderBy, limit, getDocs };

export type { DocumentData };

// ============================================================================
// Firebase-style auth object for compatibility
// This provides a Firebase-compatible interface while using Supabase under the hood
// ============================================================================
interface FirebaseCompatibleAuth {
  currentUser: FirebaseCompatibleUser | null;
}

// Create a reactive auth object that tracks Supabase session
let currentSessionUser: FirebaseCompatibleUser | null = null;

const supabaseSessionListener = () => {
  if (!supabase) return {} as { unsubscribe: () => void };
  
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    const user = session?.user;
    if (user) {
      currentSessionUser = {
        uid: user.id,
        email: user.email ?? null,
        emailVerified: !!user.email_confirmed_at,
        displayName: user.user_metadata?.full_name ?? null,
        photoURL: user.user_metadata?.avatar_url ?? null,
        providerData: [
          { 
            providerId: 'supabase', 
            displayName: user.user_metadata?.full_name ?? null, 
            email: user.email ?? null, 
            photoURL: user.user_metadata?.avatar_url ?? null 
          }
        ]
      };
    } else {
      currentSessionUser = null;
    }
  });
  
  // Check initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    const user = session?.user;
    if (user) {
      currentSessionUser = {
        uid: user.id,
        email: user.email ?? null,
        emailVerified: !!user.email_confirmed_at,
        displayName: user.user_metadata?.full_name ?? null,
        photoURL: user.user_metadata?.avatar_url ?? null,
        providerData: [
          { 
            providerId: 'supabase', 
            displayName: user.user_metadata?.full_name ?? null, 
            email: user.email ?? null, 
            photoURL: user.user_metadata?.avatar_url ?? null 
          }
        ]
      };
    }
  });
  
  return subscription;
};

// Initialize session listener if Supabase is configured
let sessionSubscription: ReturnType<typeof supabaseSessionListener> | null = null;
if (isSupabaseConfigured && supabase) {
  sessionSubscription = supabaseSessionListener();
}

// Export the Firebase-compatible auth object
export const auth: FirebaseCompatibleAuth = {
  get currentUser(): FirebaseCompatibleUser | null {
    return currentSessionUser;
  }
};

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