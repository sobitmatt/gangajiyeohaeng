// firebase-config.js - 예약 페이지 전용 (Firestore만)
const firebaseConfig = {
  apiKey: "AIzaSyB-lEDGB_CkS2aJou791jEpmXkRPt6oEOU",
  authDomain: "dogtour-94fa7.firebaseapp.com",
  projectId: "dogtour-94fa7",
  storageBucket: "dogtour-94fa7.firebasestorage.app",
  messagingSenderId: "1094538155975",
  appId: "1:1094538155975:web:1a5e2f1a542a4dd47aebe2",
  measurementId: "G-F2LXF0BTQB"
};

// Firebase 초기화
const app = firebase.initializeApp(firebaseConfig);

// Firestore만 사용
const db = firebase.firestore();

console.log("✅ Firebase Firestore 연결 완료");
window.db = db;   // 전역으로 사용 가능