import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInAnonymously,
  linkWithPopup,
  linkWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
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

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
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

interface UserData {
  uid: string;
  email: string | null;
  isAnonymous: boolean;
  createdAt: string;
  role: string;
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  displayName?: string;
  photoURL?: string;
  plan?: 'free' | 'plus' | 'pro';
  licenseKey?: string;
  licenseDevice?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  linkWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function getDeviceId() {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Create or update user profile in Firestore
          const userRef = doc(db, 'users', currentUser.uid);
          let userSnap;
          try {
            userSnap = await getDoc(userRef);
          } catch (e) {
            handleFirestoreError(e, OperationType.GET, `users/${currentUser.uid}`);
            return;
          }
          
          if (!userSnap.exists()) {
            const newUserData: UserData = {
              uid: currentUser.uid,
              email: currentUser.email || null,
              isAnonymous: currentUser.isAnonymous,
              createdAt: new Date().toISOString(),
              role: 'user',
              xp: 0,
              level: 1,
              streak: 0,
              badges: []
            };
            if (currentUser.displayName) newUserData.displayName = currentUser.displayName;
            if (currentUser.photoURL) newUserData.photoURL = currentUser.photoURL;

            try {
              await setDoc(userRef, newUserData);
              setUserData(newUserData);
            } catch (e) {
              handleFirestoreError(e, OperationType.CREATE, `users/${currentUser.uid}`);
            }
          } else {
            const data = userSnap.data() as UserData;
            // Device ID check to prevent account sharing
            const currentDeviceId = getDeviceId();
            if (data.plan && data.plan !== 'free' && data.licenseDevice && data.licenseDevice !== currentDeviceId) {
              // The plan was activated on another device. Treat this device as free.
              // Note: We don't overwrite the Firestore document so the original device keeps its access,
              // we just set the local state to free to force this device to buy its own key or use a new account.
              setUserData({ ...data, plan: 'free', licenseKey: undefined });
            } else {
              setUserData(data);
            }
          }
        } catch (error) {
          console.error("Error fetching or creating user profile:", error);
        }
      } else {
        // Auto sign in as guest if no user and no explicit logout flag
        const hasLoggedOut = localStorage.getItem('hasLoggedOut');
        if (!hasLoggedOut) {
          try {
            await signInAnonymously(auth);
            // The onAuthStateChanged will fire again with the new user
            return;
          } catch (e: any) {
            if (e?.code === 'auth/admin-restricted-operation') {
              console.warn("Firebase Anonymous Auth is not enabled. To use guest mode, please go to your Firebase Console -> Authentication -> Sign-in method, and enable 'Anonymous'.");
            } else {
              console.error("Error auto-signing in as guest:", e);
            }
          }
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, pass: string, name: string) => {
    try {
      localStorage.removeItem('hasLoggedOut');
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Ensure the Firestore document gets the correct displayName
      const userRef = doc(db, 'users', userCredential.user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `users/${userCredential.user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        const userData: any = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          createdAt: new Date().toISOString(),
          role: 'user',
          xp: 0,
          level: 1,
          streak: 0,
          badges: []
        };
        if (name) userData.displayName = name;
        if (userCredential.user.photoURL) userData.photoURL = userCredential.user.photoURL;
        try {
          await setDoc(userRef, userData);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
      } else {
        if (name) {
          try {
            await setDoc(userRef, { displayName: name }, { merge: true });
          } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, `users/${userCredential.user.uid}`);
          }
        }
      }

      // Force a state update to reflect the new display name immediately
      setUser({ ...userCredential.user, displayName: name } as User);
    } catch (error) {
      console.error("Error signing up", error);
      throw error;
    }
  };

  const signIn = async (email: string, pass: string) => {
    try {
      localStorage.removeItem('hasLoggedOut');
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error("Error signing in", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      localStorage.removeItem('hasLoggedOut');
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      // Ensure the Firestore document gets the correct displayName
      const userRef = doc(db, 'users', userCredential.user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `users/${userCredential.user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        const userData: any = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          createdAt: new Date().toISOString(),
          role: 'user',
          xp: 0,
          level: 1,
          streak: 0,
          badges: []
        };
        if (userCredential.user.displayName) userData.displayName = userCredential.user.displayName;
        if (userCredential.user.photoURL) userData.photoURL = userCredential.user.photoURL;
        try {
          await setDoc(userRef, userData);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    try {
      localStorage.removeItem('hasLoggedOut');
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `users/${userCredential.user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        const userData: any = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          createdAt: new Date().toISOString(),
          role: 'user',
          xp: 0,
          level: 1,
          streak: 0,
          badges: []
        };
        if (userCredential.user.displayName) userData.displayName = userCredential.user.displayName;
        if (userCredential.user.photoURL) userData.photoURL = userCredential.user.photoURL;
        try {
          await setDoc(userRef, userData);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
      }
    } catch (error) {
      console.error("Error signing in with Facebook", error);
      throw error;
    }
  };

  const signInWithTwitter = async () => {
    try {
      localStorage.removeItem('hasLoggedOut');
      const provider = new TwitterAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `users/${userCredential.user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        const userData: any = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          createdAt: new Date().toISOString(),
          role: 'user',
          xp: 0,
          level: 1,
          streak: 0,
          badges: []
        };
        if (userCredential.user.displayName) userData.displayName = userCredential.user.displayName;
        if (userCredential.user.photoURL) userData.photoURL = userCredential.user.photoURL;
        try {
          await setDoc(userRef, userData);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
      }
    } catch (error) {
      console.error("Error signing in with Twitter", error);
      throw error;
    }
  };

  const signInAsGuest = async () => {
    try {
      localStorage.removeItem('hasLoggedOut');
      const userCredential = await signInAnonymously(auth);
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, `users/${userCredential.user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        const userData: any = {
          uid: userCredential.user.uid,
          isAnonymous: true,
          createdAt: new Date().toISOString(),
          role: 'user',
          xp: 0,
          level: 1,
          streak: 0,
          badges: []
        };

        try {
          await setDoc(userRef, userData);
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
      }
    } catch (error: any) {
      if (error?.code === 'auth/admin-restricted-operation') {
        const errorMsg = "Firebase Anonymous Auth is not enabled. Please go to your Firebase Console -> Authentication -> Sign-in method, and enable 'Anonymous'.";
        console.warn(errorMsg);
        throw new Error(errorMsg);
      }
      console.error("Error signing in anonymously", error);
      throw error;
    }
  };

  const linkWithGoogle = async () => {
    if (!auth.currentUser) return;
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await linkWithPopup(auth.currentUser, provider);
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userData: any = {
        isAnonymous: false,
      };
      if (userCredential.user.displayName) userData.displayName = userCredential.user.displayName;
      if (userCredential.user.email) userData.email = userCredential.user.email;
      if (userCredential.user.photoURL) userData.photoURL = userCredential.user.photoURL;
      
      try {
        await setDoc(userRef, userData, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${userCredential.user.uid}`);
      }
      
      setUser({ ...userCredential.user } as User);
    } catch (error) {
      console.error("Error linking with Google", error);
      throw error;
    }
  };

  const linkWithEmail = async (email: string, pass: string, name: string) => {
    if (!auth.currentUser) return;
    try {
      const credential = EmailAuthProvider.credential(email, pass);
      const userCredential = await linkWithCredential(auth.currentUser, credential);
      await updateProfile(userCredential.user, { displayName: name });
      
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userData: any = {
        isAnonymous: false,
        email: userCredential.user.email,
        displayName: name
      };
      
      try {
        await setDoc(userRef, userData, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `users/${userCredential.user.uid}`);
      }
      
      setUser({ ...userCredential.user, displayName: name } as User);
    } catch (error) {
      console.error("Error linking with Email", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.setItem('hasLoggedOut', 'true');
      setUserData(null);
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signInAsGuest,
    linkWithGoogle,
    linkWithEmail,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
