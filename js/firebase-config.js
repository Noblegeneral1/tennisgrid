// Firebase Configuration for ATP Grid
// To enable real-time rarity scoring:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (e.g., "atpgrid")
// 3. Go to Build > Realtime Database > Create Database
// 4. Start in TEST mode (we'll secure it later)
// 5. Go to Project Settings > General > Your apps > Add web app
// 6. Copy the config values below

const FIREBASE_CONFIG = {
  // REPLACE these with your Firebase project values:
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  appId: ""
};

// Set to true once you've filled in the config above
const FIREBASE_ENABLED = FIREBASE_CONFIG.apiKey !== "" && FIREBASE_CONFIG.databaseURL !== "";
