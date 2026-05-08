import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp({
  ...firebaseConfig,
  authDomain: 'locobook.vercel.app'
});
export const auth = getAuth(app);

// Use initializeFirestore with long polling to improve connectivity in restricted environments
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
