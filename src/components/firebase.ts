import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCnK4MFnYjgFPs_i9w2L1fKB0WL9oXKtys",
  authDomain: "sherlock-escape-game.firebaseapp.com",
  databaseURL: "https://sherlock-escape-game-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sherlock-escape-game",
  storageBucket: "sherlock-escape-game.firebasestorage.app",
  messagingSenderId: "292871740168",
  appId: "1:292871740168:web:1e47158a404fb7d1946abd"
};

// Inizializza l'app e il database
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);