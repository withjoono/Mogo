/**
 * Firebase 설정 및 초기화
 *
 * Firebase Auth를 중앙 IDP로 사용하여 모든 앱에서 SSO 지원
 */
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  Auth,
} from 'firebase/auth';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAo3YfEVPqRE5Pm7OUCByadZ3Yg56y4zHI',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'geobukschool.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'geobukschool',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'geobukschool.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '69298836213',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:69298836213:web:15f6ef87bf5b9f0aadebbc',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-DNKPV8QPCK',
};

// Firebase 앱 초기화 (중복 초기화 방지)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Firebase Auth 인스턴스
const auth: Auth = getAuth(app);

// Google OAuth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

// 한국어 설정
auth.languageCode = 'ko';

export { app, auth, googleProvider };
export default app;
