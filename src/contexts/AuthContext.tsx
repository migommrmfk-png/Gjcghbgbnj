import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabase';

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
  error: string | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  linkWithGoogle: () => Promise<void>;
  linkWithGithub: () => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for OAuth errors in the URL hash or search params
    const hashParams = new URLSearchParams(window.location.hash.substring(window.location.hash.indexOf('#') + 1));
    const searchParams = new URLSearchParams(window.location.search);
    
    const errorParam = hashParams.get('error') || searchParams.get('error');
    const errorDesc = hashParams.get('error_description') || searchParams.get('error_description');
    
    if (errorParam || errorDesc) {
      if (errorDesc) {
        let desc = decodeURIComponent(errorDesc.replace(/\+/g, ' '));
        if (desc.includes('Database error saving new user')) {
          desc = 'هذا البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول بحسابك القديم (جوجل مثلاً) ثم ربط هذا الحساب من الإعدادات.';
        }
        setError(desc);
      } else {
        setError(errorParam || 'Authentication failed');
      }
      window.history.replaceState(null, '', window.location.pathname);
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Supabase getSession error:", error);
        setError(error.message);
      }
      handleSession(session);
    }).catch(err => {
      console.error("Unhandled error in getSession:", err);
      handleSession(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSession = async (session: Session | null) => {
    if (session?.user) {
      setUser(session.user);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('uid', session.user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn("Failed to get user data:", error);
          // Fallback user data
          setUserData({
            uid: session.user.id,
            email: session.user.email || null,
            isAnonymous: session.user.is_anonymous || false,
            createdAt: new Date().toISOString(),
            role: 'user',
            xp: 0,
            level: 1,
            streak: 0,
            badges: []
          });
          return setLoading(false);
        }

        if (!data) {
          const newUserData: UserData = {
            uid: session.user.id,
            email: session.user.email || null,
            isAnonymous: session.user.is_anonymous || false,
            createdAt: new Date().toISOString(),
            role: 'user',
            xp: 0,
            level: 1,
            streak: 0,
            badges: []
          };
          if (session.user.user_metadata?.full_name) {
             newUserData.displayName = session.user.user_metadata.full_name;
          }
          if (session.user.user_metadata?.avatar_url) {
             newUserData.photoURL = session.user.user_metadata.avatar_url;
          }

          const { error: insertError } = await supabase.from('users').insert([newUserData]);
          if (insertError) {
             console.error("Error creating user profile", insertError);
          }
          setUserData(newUserData);
        } else {
          // Device ID check
          const currentDeviceId = getDeviceId();
          if (data.plan && data.plan !== 'free' && data.licenseDevice && data.licenseDevice !== currentDeviceId) {
            setUserData({ ...data, plan: 'free', licenseKey: undefined });
          } else {
            setUserData(data);
          }
        }
      } catch (err) {
        console.error("Error fetching or creating user profile:", err);
      }
    } else {
      setUser(null);
      setUserData(null);
    }
    setLoading(false);
  };

  const signUp = async (email: string, pass: string, name: string) => {
    localStorage.removeItem('hasLoggedOut');
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: { data: { full_name: name } }
    });
    if (error) throw error;
  };

  const signIn = async (email: string, pass: string) => {
    localStorage.removeItem('hasLoggedOut');
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    localStorage.removeItem('hasLoggedOut');
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signInWithGithub = async () => {
    localStorage.removeItem('hasLoggedOut');
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signInWithFacebook = async () => {
    localStorage.removeItem('hasLoggedOut');
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signInWithTwitter = async () => {
    localStorage.removeItem('hasLoggedOut');
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'twitter',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) throw error;
  };

  const signInAsGuest = async () => {
    localStorage.removeItem('hasLoggedOut');
    const { error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
  };

  const linkWithGoogle = async () => {
    const { error } = await supabase.auth.linkIdentity({ provider: 'google' });
    if (error) throw error;
  };

  const linkWithGithub = async () => {
    const { error } = await supabase.auth.linkIdentity({ provider: 'github' });
    if (error) throw error;
  };

  const linkWithEmail = async (email: string, pass: string, name: string) => {
    const { error } = await supabase.auth.updateUser({ email, password: pass, data: { full_name: name }});
    if (error) throw error;
  };

  const logout = async () => {
    localStorage.setItem('hasLoggedOut', 'true');
    setUserData(null);
    await supabase.auth.signOut();
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
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
