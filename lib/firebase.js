import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDDA3-E7NNs1f4t-UsAJL2blqNLmBcr0no',
  authDomain: 'like-foto.firebaseapp.com',
  projectId: 'like-foto',
  storageBucket: 'like-foto.firebasestorage.app',
  messagingSenderId: '648624814093',
  appId: '1:648624814093:web:66cfae71ec70181544bd44',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
