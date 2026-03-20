import { initializeApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore,collection, addDoc } from "firebase/firestore";

const{getReactNativePersistence} = require("firebase/auth") as any

const firebaseConfig = {
  apiKey: "AIzaSyC_YZzuoTtDsoxaDzR6PAB8t0kXA6C-j1w",
  authDomain: "projetofirebase-6c114.firebaseapp.com",
  projectId: "projetofirebase-6c114",
  storageBucket: "projetofirebase-6c114.firebasestorage.app",
  messagingSenderId: "906386466543",
  appId: "1:906386466543:web:9b20f4a6d1fa99bb729d1a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = initializeAuth(app,{
  persistence:getReactNativePersistence(AsyncStorage)
});

// Config Firestore
const db = getFirestore(app)

export {db,collection,addDoc}


