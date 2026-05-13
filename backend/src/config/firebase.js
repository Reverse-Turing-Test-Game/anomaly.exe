// 1. 최상단에서 환경 변수를 먼저 로드합니다.
require("dotenv").config();
const admin = require("firebase-admin");

// 2. 환경 변수 존재 여부를 먼저 확인하여 에러를 방지합니다.
const rawKey = process.env.FIREBASE_PRIVATE_KEY;

if (!rawKey) {
  console.error("❌ 에러: .env 파일에서 FIREBASE_PRIVATE_KEY를 찾을 수 없습니다.");
}

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  // rawKey가 있을 때만 replace를 실행하도록 수정
  private_key: rawKey ? rawKey.replace(/\\n/g, '\n') : undefined,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("🔥 Firebase 연결 성공!");
  }
} catch (error) {
  console.error("❌ Firebase 연결 실패 상세 정보:", error.message);
}

const db = admin.firestore();

module.exports = { admin, db };