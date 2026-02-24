import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDHlG2e8gQJDyyRsyzAUDATku7DXY42ono",
    authDomain: "ssn01-74a81.firebaseapp.com",
    databaseURL: "https://ssn01-74a81-default-rtdb.firebaseio.com",
    projectId: "ssn01-74a81",
    storageBucket: "ssn01-74a81.firebasestorage.app",
    messagingSenderId: "852402540837",
    appId: "1:852402540837:web:9b59ef6eb30216b9afcacc",
    measurementId: "G-W0K2BR61RQ"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
