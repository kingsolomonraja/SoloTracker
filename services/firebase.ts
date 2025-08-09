// services/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';  // ✅ Avoid getReactNativePersistence unless you're using modular setup
// import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBPbpbSo7XVRqXXdn6LChrJcrrQKqL5-PU",
  authDomain: "studentpunchapp.firebaseapp.com",
  projectId: "studentpunchapp",
  storageBucket: "studentpunchapp.appspot.com",
  messagingSenderId: "1097095993421",
  appId: "1:1097095993421:android:e9b9b4bf38330e5e5ee404"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const firestore = getFirestore(app);
const FieldValue = { serverTimestamp };

export { auth, firestore, FieldValue };
