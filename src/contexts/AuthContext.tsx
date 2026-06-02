import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInAnonymously,
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, getDocFromServer } from 'firebase/firestore';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from '../firebase';

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
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  linkWithGithub: () => Promise<void>;
  linkWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  // Validate Firestore Connection on mount
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (err: any) {
        if (err instanceof Error && err.message.includes('offline')) {
          console.warn("Fallback offline mode: Firestore client offline check.");
        }
      }
    }
    testConnection();
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    // Listen to Firebase auth changes
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);

      // Clean up previous real-time snapshot listeners
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
        unsubscribeSnapshot = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);
        const userDocRef = doc(db, 'users', firebaseUser.uid);

        // Listen in real-time to user profile in Firestore
        unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
            setLoading(false);
          } else {
            // Document doesn't exist yet, provision a professional default config
            const newUserData: UserData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || null,
              isAnonymous: firebaseUser.isAnonymous,
              createdAt: new Date().toISOString(),
              role: 'user',
              xp: 0,
              level: 1,
              streak: 0,
              badges: [],
              displayName: firebaseUser.displayName || 'مستخدم جديد',
              photoURL: firebaseUser.photoURL || ''
            };

            try {
              await setDoc(userDocRef, newUserData);
              setUserData(newUserData);
            } catch (errSnap) {
              console.error("Error creating user document in Firestore on login:", errSnap);
              handleFirestoreError(errSnap, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }
            setLoading(false);
          }
        }, (errSnap) => {
          console.error("Firestore onSnapshot subscription failed:", errSnap);
          handleFirestoreError(errSnap, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });

      } else {
        // Handle local guest fallback
        const isLocalGuest = localStorage.getItem('isLocalGuest') === 'true';
        if (isLocalGuest) {
          setUser({
            uid: 'local_guest',
            email: null,
            displayName: 'زائر محلي',
            isAnonymous: true,
            photoURL: ''
          } as any);
          setUserData({
            uid: 'local_guest',
            email: null,
            isAnonymous: true,
            createdAt: new Date().toISOString(),
            role: 'user',
            xp: 0,
            level: 1,
            streak: 1,
            badges: [],
            displayName: 'زائر محلي'
          });
        } else {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, []);

  const signIn = async (email: string, pass: string) => {
    localStorage.removeItem('hasLoggedOut');
    localStorage.removeItem('isLocalGuest');
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      console.error("Sign in error:", err);
      let arabicError = 'فشل تسجيل الدخول. يرجى التحقق من البريد الإلكتروني وكلمة المرور.';
      if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        arabicError = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      } else if (err?.code === 'auth/invalid-email') {
        arabicError = 'صيغة البريد الإلكتروني غير صالحة.';
      }
      setError(arabicError);
      throw err;
    }
  };

  const signUp = async (email: string, pass: string, name: string) => {
    localStorage.removeItem('hasLoggedOut');
    localStorage.removeItem('isLocalGuest');
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // Set document explicitly to trigger the snapshot
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const newUserData: UserData = {
          uid: userCredential.user.uid,
          email: email,
          isAnonymous: false,
          createdAt: new Date().toISOString(),
          role: 'user',
          xp: 20, // bonus on signup
          level: 1,
          streak: 1,
          badges: ['welcome'],
          displayName: name,
        };
        await setDoc(userDocRef, newUserData);
      }
      return userCredential;
    } catch (err: any) {
      console.error("Sign up error:", err);
      let arabicError = 'فشل إنشاء الحساب. قد يكون هذا الحساب مسجلاً مسبقاً أو كلمة المرور ضعيفة.';
      if (err?.code === 'auth/email-already-in-use') {
        arabicError = 'هذا البريد الإلكتروني مستخدم بالفعل.';
      } else if (err?.code === 'auth/weak-password') {
        arabicError = 'كلمة المرور ضعيفة جداً. يجب أن تتكون من 6 أحرف على الأقل.';
      }
      setError(arabicError);
      throw err;
    }
  };

  const signInWithGoogle = async () => {
    localStorage.removeItem('hasLoggedOut');
    localStorage.removeItem('isLocalGuest');
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError('فشلت عملية تسجيل الدخول بواسطة حساب Google.');
      throw err;
    }
  };

  // Unsupported OAuth handlers formatted neatly with simple client guidelines
  const signInWithGithub = async () => {
    setError('تسجيل الدخول عبر GitHub غير مفعل حالياً. يرجى استخدام Google أو البريد الإلكتروني.');
  };

  const signInWithFacebook = async () => {
    setError('تسجيل الدخول عبر Facebook غير مفعل حالياً. يرجى استخدام Google أو البريد الإلكتروني.');
  };

  const signInWithTwitter = async () => {
    setError('تسجيل الدخول عبر Twitter غير مفعل حالياً. يرجى استخدام Google أو البريد الإلكتروني.');
  };

  const signInAsGuest = async () => {
    localStorage.removeItem('hasLoggedOut');
    localStorage.removeItem('isLocalGuest');
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.warn("Firebase anonymous auth failed on project, launching secure local guest mode:", err);
      localStorage.setItem('isLocalGuest', 'true');
      setUser({
        uid: 'local_guest',
        email: null,
        displayName: 'زائر محلي',
        isAnonymous: true,
        photoURL: ''
      } as any);
      setUserData({
        uid: 'local_guest',
        email: null,
        isAnonymous: true,
        createdAt: new Date().toISOString(),
        role: 'user',
        xp: 0,
        level: 1,
        streak: 1,
        badges: [],
        displayName: 'زائر محلي'
      });
    }
  };

  const linkWithGoogle = async () => {
    setError('ربط الحساب التفصيلي يتم تلقائياً عند تسجيل الدخول باستخدام حساب Google الموحد.');
  };

  const linkWithGithub = async () => {
    setError('ربط حساب GitHub غير مفعل في المنصة الحالية.');
  };

  const linkWithEmail = async (email: string, pass: string, name: string) => {
    setError('التسجيل بالبريد وربطه متاح بشكل كامل عبر واجهة الدخول.');
  };

  const logout = async () => {
    localStorage.setItem('hasLoggedOut', 'true');
    localStorage.removeItem('isLocalGuest');
    setUserData(null);
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError('فشل إرسال بريد إعادة التعيين. يرجى التحقق من البريد مجدداً.');
      throw err;
    }
  };

  const value = {
    user,
    userData,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    signInWithFacebook,
    signInWithTwitter,
    signInAsGuest,
    linkWithGoogle,
    linkWithGithub,
    linkWithEmail,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
