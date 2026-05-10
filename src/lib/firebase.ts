import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, initializeFirestore, enableNetwork } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// iOS PWA는 WebSocket을 aggressive하게 끊음
// experimentalForceLongPolling으로 HTTP long-polling 강제 → 훨씬 안정적
function createDb() {
  try {
    return initializeFirestore(app, { experimentalForceLongPolling: true });
  } catch {
    return getFirestore(app);
  }
}
export const db = createDb();

if (typeof window !== 'undefined') {
  const reconnect = () => enableNetwork(db).catch(() => null);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') reconnect();
  });
  window.addEventListener('online', reconnect);
}
