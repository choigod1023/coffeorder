import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, enableNetwork } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

// iOS PWA는 백그라운드 복귀 시 WebSocket이 끊겨 실시간 수신이 중단됨
// visibilitychange / online 이벤트에서 Firebase 네트워크를 강제 재연결한다
if (typeof window !== 'undefined') {
  const reconnect = () => enableNetwork(db).catch(() => null);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') reconnect();
  });
  window.addEventListener('online', reconnect);
}
