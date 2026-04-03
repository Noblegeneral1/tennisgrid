// Firebase Configuration for ATP Grid
// To enable real-time rarity scoring:
// 1. Go to https://console.firebase.google.com
// 2. Create a new project (e.g., "atpgrid")
// 3. Go to Build > Realtime Database > Create Database
// 4. Start in TEST mode (we'll secure it later)
// 5. Go to Project Settings > General > Your apps > Add web app
// 6. Copy the config values below

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAiZAJWvqBXsxBGcctTr0UFAgthCo45WMA",
  authDomain: "atp-grid.firebaseapp.com",
  databaseURL: "https://atp-grid-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "atp-grid",
  storageBucket: "atp-grid.firebasestorage.app",
  appId: "1:660725616117:web:02f49fa3ffdf525c8fe4bc"
};

// Set to true once you've filled in the config above
const FIREBASE_ENABLED = FIREBASE_CONFIG.apiKey !== "" && FIREBASE_CONFIG.databaseURL !== "";
