# 👑 Reverse Turing Test Game (king-king)

> **리버스 튜링 테스트 게임**의 전체 프로젝트 저장소입니다.  
> 본 프로젝트는 AI(Gemini API) 판별 기능을 포함한 층별 미션 게임으로, 유저 데이터 관리 및 랭킹 시스템을 지원합니다.

---

## 📂 프로젝트 구조 (Repository Structure)

이 저장소는 프론트엔드와 백엔드가 각각 독립된 폴더로 분리되어 관리됩니다.

```text
/ (Repository Root)
├── king-king-backend/     # Node.js + Express + Firebase Admin 백엔드 서버
└── cyberpunkgame/         # React + Vite + Tailwind CSS 프론트엔드 앱

🚀 시작하기 (Getting Started)
두 환경 모두 패키지 매니저로 npm을 사용하며, 실행을 위해 두 개의 터미널 창이 필요합니다.

📋 공통 요구 사항 (Prerequisites)
Node.js (최신 LTS 버전 권장)

npm (Node.js 설치 시 기본 포함)

💻 1. Backend 설치 및 실행 (king-king-backend)
Firebase 어드민 권한 및 Gemini API를 통해 게임 로직과 랭킹을 처리하는 서버입니다.

⚙️ 설정 및 설치
cd king-king-backend
npm install

🔒 환경 변수 설정
king-king-backend 폴더 루트에 .env 파일을 생성하고 아래 내용을 입력합니다.

PORT=your_desired_port_number_here
GEMINI_API_KEY=your_gemini_api_key_here
# Firebase Admin SDK 인증 정보 및 기타 환경 변수 추가

🏃‍♂️ 서버 실행 명령어
npm run dev
# 또는 프로덕션 모드: npm start

🌐 2. Frontend 설치 및 실행 (cyberpunkgame)
Vite와 React, Tailwind CSS 4.0 및 대화형 UI 요소로 구성된 사이버펑크 스타일의 게임 클라이언트입니다.

⚙️ 설정 및 설치
# 백엔드 폴더에서 빠져나와 프론트엔드로 이동 시
cd ../cyberpunkgame
npm install

🔒 환경 변수 설정
cyberpunkgame 폴더 루트에 .env 파일을 생성하고 아래 내용을 입력합니다.

VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

🏃‍♂️ 클라이언트 실행 명령어
npm run dev
# 또는 빌드: npm run build / 미리보기: npm run preview

🛠️ 기술 스택 (Tech Stack Summary)
🖥️ Backend
Runtime & Framework: Node.js, Express (v5.x)

Database & Auth: Firebase Admin SDK

AI Integration: Google Generative AI (Gemini API)

Middleware: Cors, Morgan, Dotenv

🎨 Frontend
Core: React (v18.3), Vite (v6.3)

Styling: Tailwind CSS (v4.0), Material UI (MUI v7), Radix UI

Interaction: Motion (Framer Motion v12), React DnD (Drag and Drop)

Charts & Utilities: Recharts, Date-fns, React Hook Form
