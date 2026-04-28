import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCiPelRZTRtzXr6OK_Rr7o3D359wHj2neE",
  authDomain: "dani-7cd57.firebaseapp.com",
  projectId: "dani-7cd57",
  storageBucket: "dani-7cd57.firebasestorage.app",
  messagingSenderId: "446900903819",
  appId: "1:446900903819:web:0786846482b15327a5d98e",
  measurementId: "G-R6HE1JR02M"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
